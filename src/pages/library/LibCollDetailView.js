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
import default_profile from "../../assets/images/default_profile.jpg";
import AvatarWName from "../../components/common/AvatarWName";

function LibCollDetailView() {
  // useEffect(() => {
  //   if (isLoggedIn === false) {
  //     alert("로그인을 하세요!");
  //     navigate("/");
  //     return;
  //   }
  // });

  const { id } = useParams(); // URL 파라미터로 컬렉션 ID를 받음
  const navigate = useNavigate();

  const { isLoggedIn, userid, role, secureApiRequest } =
    useContext(AuthContext);
  //userid가 새로고침 후에도 정상적으로 유지되도록
  //localStorage 또는 sessionStorage에 userid를 저장하고, 컴포넌트가 로드될 때 이를 읽어와서 사용
  const storedUserid = localStorage.getItem("userid");
  const currentUserid = userid || storedUserid;

  const [collection, setCollection] = useState(null); // 컬렉션 정보 상태
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null); // 메모리 리스트에서 선택된 메모리(view에 나타날 메모리)
  const [memoryList, setMemoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isLikedUserModalOpen, setIsLikedUserModalOpen] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);

  const [isBMUserModalOpen, setIsBMMUserodalOpen] = useState(false);
  const [bmUsers, setBMUsers] = useState([]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState("");

  const handleOpenLilkedUsers = () => {
    setIsLikedUserModalOpen(true);
  };
  const handleOpenBookmarkedUsers = () => {
    setIsBMMUserodalOpen(true);
  };

  const handleOpenReportModal = () => {
    if (!isLoggedIn) {
      alert("로그인 후 사용 가능합니다.");
      return;
    }
    if (!selectedMemory || !currentUserid) return;
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async () => {
    console.log("선택된 메모리:");
    console.log(selectedMemory);

    try {
      await secureApiRequest(
        `/api/library/report/${selectedMemory.memoryid}/${userid}`,
        {
          method: "POST",
          //data가 아니라 body로 해야함(현재 secureRequest 설정상)
          body: {
            content: reportContent,
          },
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

  const handleLikeChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglelike?userid=${userid}&collectionId=${updatedColl.collectionid}&isLiked=${updatedColl.userlike}`,
        { method: "POST" }
      );
      // UI 상태 변경
      // 단일 컬렉션을 업데이트할 때
      setCollection((coll) => {
        const updated = { ...coll }; // 기존 컬렉션 객체 복사
        updated.userlike = !updated.userlike; // 좋아요 상태 반전
        updated.likeCount = updated.userlike
          ? updated.likeCount + 1 // 좋아요가 true이면 카운트 증가
          : updated.likeCount - 1; // 좋아요가 false이면 카운트 감소
        return updated; // 업데이트된 객체 반환
      });
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleBookmarkChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglebm?userid=${userid}&collectionId=${updatedColl.collectionid}&isBookmarked=${updatedColl.userbookmark}`,
        { method: "POST" }
      );

      // UI 상태 변경 (setSearchedColls)
      // UI 상태 변경
      // 단일 컬렉션을 업데이트할 때
      setCollection((coll) => {
        const updated = { ...coll }; // 기존 컬렉션 객체 복사
        updated.userbookmark = !updated.userbookmark; // 좋아요 상태 반전
        updated.bookmarkCount = updated.userbookmark
          ? updated.bookmarkCount + 1 // 좋아요가 true이면 카운트 증가
          : updated.bookmarkCount - 1; // 좋아요가 false이면 카운트 감소
        return updated; // 업데이트된 객체 반환
      });
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  //컬렉션 fetch되면, 좋아요한 유저와 북마크한 유저를 불러옴
  useEffect(() => {
    const fetchLikedUsers = async () => {
      if (!collection || !collection.collectionid || !userid) return;

      try {
        const res = await secureApiRequest("/api/library/whoLiked", {
          method: "GET",
          params: {
            collectionid: collection.collectionid,
            userid: userid,
          },
        });

        console.log("✅ 좋아요한 유저 리스트:", res.data);
        setLikedUsers(res.data);
      } catch (error) {
        console.error("🚨 좋아요한 유저 조회 실패:", error);
      }
    };

    fetchLikedUsers();
  }, [collection, userid]);

  useEffect(() => {
    const fetchBookmarkedUsers = async () => {
      if (!collection || !collection.collectionid || !userid) return;

      try {
        const res = await secureApiRequest("/api/library/whoBookmarked", {
          method: "GET",
          params: {
            collectionid: collection.collectionid,
            userid: userid,
          },
        });

        console.log("✅ 북마크한 유저 리스트:", res.data);
        setBMUsers(res.data);
      } catch (error) {
        console.error("🚨 북마크한 유저 조회 실패:", error);
      }
    };

    fetchBookmarkedUsers();
  }, [collection, userid]);

  useEffect(() => {
    console.log("안녕!!");
    const fetchCollectionDetail = async () => {
      setLoading(true);

      //로그인 유저일 경우의, 디테일 확인할 컬렉션 정보와 메모리 가져오기
      if (currentUserid != null) {
        try {
          const res = await secureApiRequest(
            `/api/library/collection/${id}/${currentUserid}`,
            {
              method: "GET",
            }
          );

          console.log("컬렉션 태그 확인해!!!" + res.data);
          setCollection(res.data);
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
          const res = await apiClient.get(
            `http://localhost:8080/api/library/collection/guest/${id}`
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
      const res = await apiClient.get(
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
      const res = await apiClient.get(
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

  //

  return (
    <>
      <PageHeader pagename={`컬렉션 상세보기`} />
      <div className={styles.detailContainer}>
        <div className={styles.libCardWrapper}>
          {collection ? (
            <LibCollCard
              coll={collection}
              memoryList={memoryList}
              onMemoryClick={handleMemoryClick}
              onLikeChange={handleLikeChange}
              onBookmarkChange={handleBookmarkChange}
              selectedMemoryId={selectedMemoryId}
              onOpenLilkedUsers={handleOpenLilkedUsers}
              onOpenBookmarkedUsers={handleOpenBookmarkedUsers}
            />
          ) : (
            <div>컬렉션 정보를 불러올 수 없습니다.</div>
          )}
        </div>

        <div className={styles.memoryViewWrapper}>
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
      {/**like modal */}
      {isLikedUserModalOpen && (
        <Modal onClose={() => setIsLikedUserModalOpen(false)}>
          <h3>좋아요한 유저 목록</h3>
          {likedUsers.length === 0 ? (
            <p>아직 좋아요한 유저가 없습니다.</p>
          ) : (
            likedUsers.map((user, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={
                    user.profileImagePath
                      ? `http://localhost:8080${user.profileImagePath}`
                      : default_profile
                  }
                  alt={user.nickname}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover", // 이미지 비율을 유지하면서 동그라미 안에 꽉 차게 표시
                  }}
                />
                <span style={{ marginLeft: "0.5rem" }}>{user.nickname}</span>
              </div>
            ))
          )}
        </Modal>
      )}

      {/**BM modal */}
      {isBMUserModalOpen && (
        <Modal onClose={() => setIsBMMUserodalOpen(false)}>
          <h3>북마크한 유저 목록</h3>
          {bmUsers.length === 0 ? (
            <p>아직 북마크한 유저가 없습니다.</p>
          ) : (
            bmUsers.map((user, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <img
                  src={
                    user.profileImagePath
                      ? `http://localhost:8080${user.profileImagePath}`
                      : default_profile
                  }
                  alt={user.nickname}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    objectFit: "cover", // 이미지 비율을 유지하면서 동그라미 안에 꽉 차게 표시
                  }}
                />
                <span style={{ marginLeft: "0.5rem" }}>{user.nickname}</span>
              </div>
            ))
          )}
        </Modal>
      )}
    </>
  );
}

export default LibCollDetailView;
