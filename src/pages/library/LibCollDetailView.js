// src/pages/library/LibCollDetailView.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import axios from "axios";
import { useParams } from "react-router-dom";
import LibCollCard from "../../components/library/LibCollCard";
import MemoryView from "../../components/common/MemoryView";
import styles from "./LibCollDetailView.module.css"; // ✅
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";

function LibCollDetailView() {
  const { id } = useParams(); // URL 파라미터로 컬렉션 ID를 받음
  const navigate = useNavigate();

  const { isLoggedIn, userid, role } = useContext(AuthContext);
  //userid가 새로고침 후에도 정상적으로 유지되도록
  //localStorage 또는 sessionStorage에 userid를 저장하고, 컴포넌트가 로드될 때 이를 읽어와서 사용
  const storedUserid = localStorage.getItem("userid");
  const currentUserid = userid || storedUserid;

  const [collection, setCollection] = useState(null); // 컬렉션 정보 상태
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null); // 메모리 리스트에서 선택된 메모리(view에 나타날 메모리)
  const [memoryList, setMemoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState("");

  const handleOpenReportModal = () => {
    if (!selectedMemory || !currentUserid) return;
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    console.log("선택된 메모리:");
    console.log(selectedMemory);
    try {
      await apiClient.post(
        `/api/library/report/${selectedMemory.memoryid}/${userid}`,
        {
          content: reportContent,
        }
      );
      alert("신고가 접수되었습니다.");
      setIsReportModalOpen(false);
      setReportContent("");
    } catch (err) {
      console.error("🚨 신고 실패", err);
      alert("신고에 실패했습니다.");
    }
  };

  useEffect(() => {
    console.log("안녕!!");
    const fetchCollectionDetail = async () => {
      setLoading(true);

      //로그인 유저일 경우의, 디테일 확인할 컬렉션 정보와 메모리 가져오기
      if (currentUserid != null) {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/library/collection/${id}/${currentUserid}`
          );
          console.log("컬렉션 태그 확인해!!!" + res.data);
          setCollection(res.data);
          // // 컬렉션에 속한 메모리 리스트 불러오기
          // console.log("** id는: " + collection.collectionid);
          //console.log(collection);
          await fetchMemoryList(res.data.collectionid); // 컬렉션에서 collectionId를 받아 메모리 리스트 불러오기
        } catch (err) {
          console.error("🚨 컬렉션 정보 불러오기 실패", err);
          console.log("✅로그인 실패한 유저: ", userid);
          alert("이 컬렉션에 접근할 수 없습니다.");
          navigate("library/main"); // 이전 페이지로 돌아가기
        } finally {
          setLoading(false);
        }
      }
      //비로그인 유저일 경우디테일 확인할 컬렉션 정보와 메모리 가져오기
      else {
        try {
          const res = await axios.get(
            `http://localhost:8080/api/library/collection/${id}`
          );
          setCollection(res.data);
          await fetchMemoryList(res.data.collectionid);
        } catch (err) {
          alert("비로그인 - 이 컬렉션에 접근할 수 없습니다.");
          navigate("library/main"); // 이전 페이지로 돌아가기
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCollectionDetail();
  }, [id, currentUserid]);

  useEffect(() => {
    console.log("✅ [변경됨] selectedMemory updated:", selectedMemory);
  }, [selectedMemory]);

  // 2. coll 내부의 메모리 리스트 불러오기 함수
  const fetchMemoryList = async (collectionid) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/library/collection/memories/${collectionid}`
      );
      setMemoryList(res.data);
      console.log("1째 메모리 - " + res.data[0].title);
      if (res.data.length > 0) {
        setSelectedMemoryId(res.data[0].memoryid);
        setSelectedMemory(res.data[0]);
      }
    } catch (err) {
      console.error("🚨 메모리 리스트 불러오기 실패", err);
    }
  };

  // 메모리 선택 시 selectedMemory 상태를 업데이트하고, 해당 메모리를 axios로 불러와서 세팅
  const handleMemoryClick = async (memoryid) => {
    setLoading(true);
    setSelectedMemoryId(memoryid); // ✅ 스타일에 바로 반영됨

    try {
      const res = await axios.get(
        `http://localhost:8080/api/library/memory/${memoryid}` // 메모리 아이디로 메모리 상세 요청
      );
      setSelectedMemory(res.data); // 응답 데이터를 selectedMemory에 저장
      console.log("선택된 메모리 디테일:" + res.data);
      console.log("선택된 메모리 디테일:" + selectedMemory);
    } catch (err) {
      console.error("🚨 메모리 불러오기 실패", err); // 에러 핸들링
    } finally {
      setLoading(false);
    }
  };

  // 로딩중...
  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 좋아요/ 북마크 DB 변경 + 상태 변경 함수
  const handleActionChange = async (collectionId, actionType) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      const isLiked =
        actionType === "userlike" ? !collection.userlike : undefined;
      const isBookmarked =
        actionType === "userbookmark" ? !collection.userbookmark : undefined;

      if (actionType === "userlike") {
        await axios.post(
          `http://localhost:8080/api/library/togglelike?userid=${userid}&collectionId=${collectionId}&isLiked=${isLiked}`
        );
      }
      if (actionType === "userbookmark") {
        await axios.post(
          `http://localhost:8080/api/library/togglebm?userid=${userid}&collectionId=${collectionId}&isBookmarked=${isBookmarked}`
        );
      }

      //UI 상태 변경
      setCollection((prev) => {
        if (!prev) return prev;

        const updated = {
          ...prev,
          [actionType]: !prev[actionType], // userlike 또는 userbookmark 토글
          [actionType === "userlike" ? "likeCount" : "bookmarkCount"]:
            prev[actionType] === true
              ? prev[
                  actionType === "userlike" ? "likeCount" : "bookmarkCount"
                ] - 1
              : prev[
                  actionType === "userlike" ? "likeCount" : "bookmarkCount"
                ] + 1,
        };

        return updated;
      });
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  return (
    <>
      <PageHeader pagename={`컬렉션 상세보기`} />
      <div className={styles.detailContainer}>
        {collection ? (
          <LibCollCard
            coll={collection}
            memoryList={memoryList}
            onMemoryClick={handleMemoryClick}
            onActionChange={handleActionChange}
            selectedMemoryId={selectedMemoryId}
          />
        ) : (
          <div>컬렉션 정보를 불러올 수 없습니다.</div>
        )}
        {collection ? (
          <MemoryView
            selectedMemory={selectedMemory}
            authorid={collection.authorid}
            numMemories={memoryList.length}
            onReportClick={handleOpenReportModal}
          />
        ) : (
          <div>컬렉션 정보를 불러올 수 없습니다.</div>
        )}
      </div>
      {isReportModalOpen && (
        <Modal onClose={() => setIsReportModalOpen(false)}>
          <h3>신고 사유를 작성해주세요</h3>
          <textarea
            value={reportContent}
            onChange={(e) => setReportContent(e.target.value)}
            placeholder="신고 내용을 입력하세요..."
            rows={5}
            style={{ width: "100%", marginBottom: "1rem" }}
          />
          <button onClick={() => handleSubmitReport()}>신고 제출</button>
        </Modal>
      )}
    </>
  );
}

export default LibCollDetailView;
