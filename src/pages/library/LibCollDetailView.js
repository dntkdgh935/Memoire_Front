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

  // // collection 상태 변경시 재렌더링
  // useEffect(() => {
  //   if (collection) {
  //     console.log("✅ [변경됨] collection 상태 업데이트:", collection);
  //   }
  // }, [collection]); // collection이 변경될 때마다 호출

  //1.  컬렉션 정보 및 내부 메모리 목록 가져오기
  useEffect(() => {
    console.log("안녕!!");
    const fetchCollectionDetail = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:8080/api/library/collection/${id}/${currentUserid}`
        );
        console.log(res.data);
        setCollection(res.data);
        // // 컬렉션에 속한 메모리 리스트 불러오기
        // console.log("** id는: " + collection.collectionid);
        console.log(collection);
        await fetchMemoryList(res.data.collectionid); // 컬렉션에서 collectionId를 받아 메모리 리스트 불러오기
      } catch (err) {
        console.error("🚨 컬렉션 정보 불러오기 실패", err);
        console.log("✅로그인 실패한 유저: ", userid);
        alert("이 컬렉션에 접근할 수 없습니다.");
        navigate("library/main"); // 이전 페이지로 돌아가기
      } finally {
        setLoading(false);
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

      // // // 2. 서버에서 최신 데이터를 받아와 상태 업데이트
      // const res = await axios.get(
      //   `http://localhost:8080/api/library/collection/${collectionId}/${currentUserid}`
      // );
      // setCollection(res.data); // 최신 상태로 갱신

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
    <div className={styles.detailContainer}>
      <LibCollCard
        coll={collection}
        memoryList={memoryList}
        onMemoryClick={handleMemoryClick}
        onActionChange={handleActionChange}
        selectedMemoryId={selectedMemoryId}
      />
      <MemoryView
        selectedMemory={selectedMemory}
        authorid={collection.authorid}
      />
    </div>
  );
}

export default LibCollDetailView;
