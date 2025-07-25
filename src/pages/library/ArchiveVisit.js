// src/pages/library/ArchiveVisit.js
import React, { useState, useEffect, memo, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import axios from "axios";
import styles from "./ArchiveVisit.module.css";
import VisitProfileCard from "../../components/library/VisitProfileCard";
import CollGrid from "../../components/common/CollGrid";
import { useNavigate } from "react-router-dom";
import { useResetRecoilState } from "recoil";
import PageHeader from "../../components/common/PageHeader";

function ArchiveVisit() {
  const { userid: ownerid } = useParams();

  const [ownerNickname, setOwnerNickname] = useState("정보없음");
  const {
    isLoggedIn,
    userid: myid,
    secureApiRequest,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  // 방문한 아카이브 소유자 정보
  const [relStatus, setRelStatus] = useState("3");
  const [relBtnMsg, setRelBtnMsg] = useState(""); // 버튼에 나타날 텍스트
  const [userFreqTags, setUserFreqTags] = useState([]);

  // 아카이브 소유자 컬렉션 유형 선택 탭
  const [activeTab, setActiveTab] = useState("myColl");

  //아카이브 소유자 컬렉션 목록
  const [collections, setCollections] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);

  // 로그인 유저와 해당 아카이브 소유자에 대한 팔로우 상태 가져옴
  useEffect(() => {
    if (!myid || !ownerid) return; // ⭐ 유효한 경우만 진행
    const fetchRelStatus = async () => {
      console.log("**myid: " + myid);
      try {
        const res = await secureApiRequest(
          `api/library/getRelationshipStatus`,
          {
            method: "GET",
            params: { userid: myid, targetid: ownerid },
          }
        );
        setRelStatus(String(res.data));
        // 상태에 따라 relStatus, relBtnMsg 설정
      } catch (e) {
        console.error("팔로우 상태 확인 실패", e);
      }
    };
    fetchRelStatus();
  }, [ownerid, myid]); //[ownerid, myid]);

  // 차단 관계가 있으면 방문 불가
  useEffect(() => {
    if (relStatus === "2") {
      navigate(-1);
    }
  }, [relStatus]);

  useEffect(() => {
    const fetchOwnerNickname = async () => {
      try {
        const userInfo = await secureApiRequest(
          `/archive/userinfo?userid=${ownerid}`,
          {
            method: "GET",
          }
        );
        setOwnerNickname(userInfo.data.nickname);
      } catch (error) {
        console.error("닉네임 가져오기 실패");
      }
    };
    fetchOwnerNickname();
  }, [ownerid]);

  //relStatus바뀔 때 메세지 바꿈
  useEffect(() => {
    switch (relStatus) {
      case "0":
        setRelBtnMsg("팔로우 요청됨");
        break;
      case "1":
        setRelBtnMsg("팔로잉");
        break;
      case "2":
        setRelBtnMsg("차단 해제");
        break;
      case "3":
        setRelBtnMsg("팔로우 요청");
        break;
      default:
        setRelBtnMsg("상태 불명");
        break;
    }
  }, [relStatus]); // relStatus만 의존

  //아카이브 소유자의 컬렉션 목록 가져옴
  useEffect(() => {
    console.log("owner id: " + ownerid);
    console.log("login user id: " + myid);
    if (ownerid) {
      const fetchStuff = async () => {
        try {
          const collectionsInfo = await secureApiRequest(
            `/api/library/archiveVisit?userid=${myid}&ownerid=${ownerid}`,
            {
              method: "GET",
            }
          );

          console.log(collectionsInfo.data);
          setCollections(collectionsInfo.data);
        } catch (error) {
          if (error.response && error.response.status === 403) {
            // 차단된 경우 사용자에게 알림
            console.warn("접근이 차단된 사용자입니다.");
            alert("사용자가 존재하지 않습니다.");
          } else {
            console.error("Error fetching user collections: ", error);
          }
        }
        try {
          // const bookmarksInfo = await apiClient.get(
          //   "/archive/bookmarkCollections",
          //   {
          //     params: {
          //       userid: ownerid,
          //     },
          //   }
          // );
          const bookmarksInfo = await secureApiRequest(
            `/archive/bookmarkCollections?userid=${ownerid}`,
            {
              method: "GET",
            }
          );

          console.log(bookmarksInfo.data);
          setBookmarks(bookmarksInfo.data);
        } catch (error) {
          console.error("Error fetching user bookmarks:", error);
        }
      };
      fetchStuff();
    }
  }, [ownerid, myid]);

  const handleToggleFollow = async () => {
    try {
      // 0: 요청됨
      // 1: 팔로우중
      // 2: 차단
      // 3: 관계 없음 표시
      let nextStatus = null;
      switch (relStatus) {
        case "0":
          nextStatus = "3";

          break;
        case "1": //팔로잉 상태인 경우 버튼 누르면 -> 관계 삭제(3)
          nextStatus = "3";
          break;
        case "2": // 차단된 경우 버튼 누르면 -> 차단 해제
          nextStatus = "3";
          break;
        case "3": // 관계 없었던 경우 버튼(팔로우 요청) 누르면 -> 요청됨(0)
          nextStatus = "0";
          break;
        default:
          console.log("알 수 없는 상태");
          return; // 기본값을 처리하지 않음
      }

      // await apiClient.post(`api/library/toggleFollow`, null, {
      //   params: {
      //     userid: myid,
      //     targetid: ownerid,
      //     nextRel: nextStatus,
      //   },
      // });
      await secureApiRequest(
        `/api/library/toggleFollow?userid=${myid}&targetid=${ownerid}&nextRel=${nextStatus}`,
        {
          method: "POST",
        }
      );

      setRelStatus(nextStatus);
    } catch (e) {
      console.error("팔로우 토글 실패", e);
    }
  };
  console.log("방문한 아카이브 주인: " + ownerid);
  useEffect(() => {
    //console.log("방문한 아카이브 주인: " + userid);
  });

  // 차단 버튼
  const handleBlockClick = async () => {
    let nextStatus = null;
    switch (relStatus) {
      case "0": // 0: 요청됨/ 1: 팔로잉/ 2: 차단 / 3: 없음
        setRelStatus("2"); // 차단 상태로 변경
        nextStatus = "2";
        break;
      case "1": // 팔로잉 상태에서 '차단하기' 버튼 누를시..차단
        setRelStatus("2"); // 차단 상태로 변경
        nextStatus = "2";
        break;
      case "2":
        alert("이미 차단되었습니다");
        setRelStatus("2");
        nextStatus = "2";
        break; // <- 이 경우 apiclient로 요청 안보내게 하려면?
      case "3": // 아무 관계 없는 상태에서 '차단하기' 버튼 누를시..
        setRelStatus("2");
        nextStatus = "2";
    }
    if (nextStatus !== null) {
      await secureApiRequest(
        `/api/library/toggleFollow?userid=${myid}&targetid=${ownerid}&nextRel=${nextStatus}`,
        {
          method: "POST",
        }
      );
      alert("차단되었습니다");
    }
    setRelStatus(nextStatus);
  };

  //탭 클릭시 owner가 생성한 컬렉션을 가져오도록 함
  const handleMyCollClick = async () => {
    setActiveTab("myColl");
    try {
      // const collectionsInfo = await apiClient.get("/archive/collections", {
      //   params: {
      //     userid: ownerid,
      //   },
      // });
      const collectionsInfo = await secureApiRequest(
        `/archive/collections?userid=${ownerid}`,
        {
          method: "GET",
        }
      );

      console.log(collectionsInfo.data);
      setCollections(collectionsInfo.data);
    } catch (error) {
      console.error("Error fetching user collections:", error);
    }
  };

  // 탭 클릭시 owner가 북마크한 컬렉션을 가져오도록 함
  const handleBookmarkCollClick = async () => {
    setActiveTab("bookmarkColl");
    try {
      // const bookmarksInfo = await apiClient.get(
      //   "/archive/bookmarkCollections",
      //   {
      //     params: {
      //       userid: ownerid,
      //     },
      //   }
      // );
      const bookmarksInfo = await secureApiRequest(
        `/archive/bookmarkCollections?userid=${ownerid}`,
        {
          method: "GET",
        }
      );

      console.log(bookmarksInfo.data);
      setBookmarks(bookmarksInfo.data);
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
    }
  };

  // 컬렉션 좋아요/ 북마크 클릭시 처리
  const handleLikeChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglelike?userid=${myid}&collectionId=${updatedColl.collectionid}&isLiked=${updatedColl.userlike}`,
        { method: "POST" }
      );

      // UI 상태 변경 (setSearchedColls)
      setCollections((prevState) =>
        prevState.map((coll) => {
          //변경 신청된 coll을 찾아 updated coll로 대체
          if (coll.collectionid === updatedColl.collectionid) {
            // 새로운 객체로 기존 coll을 복사
            const updated = { ...coll };
            updated.userlike = !updated.userlike;
            updated.likeCount = updated.userlike
              ? updated.likeCount + 1 // 좋아요가 true이면 카운트 증가
              : updated.likeCount - 1; // 좋아요가 false이면 카운트 감소
            return updated;
          }
          return coll; // 조건에 맞지 않으면 그대로 반환
        })
      );
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleBookmarkChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglebm?userid=${myid}&collectionId=${updatedColl.collectionid}&isBookmarked=${updatedColl.userbookmark}`,
        { method: "POST" }
      );

      // UI 상태 변경 (setSearchedColls)
      setCollections((prevState) =>
        prevState.map((coll) => {
          //변경 신청된 coll을 찾아 updated coll로 대체
          if (coll.collectionid === updatedColl.collectionid) {
            // 새로운 객체로 기존 coll을 복사
            const updated = { ...coll };
            updated.userbookmark = !updated.userbookmark; // 토글됨
            updated.bookmarkCount = updated.userbookmark
              ? updated.bookmarkCount + 1 // 토글 후 북마크가 true이면 카운트 증가
              : updated.bookmarkCount - 1; // 토글 후 북마크가 false이면 카운트 감소
            return updated;
          }
          return coll; // 조건에 맞지 않으면 그대로 반환
        })
      );
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleCollClick = (collid) => {
    navigate(`/library/detail/${collid}`);
  };

  return (
    <>
      <PageHeader pagename={`${ownerNickname}님의 아카이브`} />
      <div className={styles.profileContainer}>
        <div className={styles.sidebar}>
          <VisitProfileCard
            ownerid={ownerid}
            relStatus={relStatus}
            relBtnMsg={relBtnMsg}
            onFollowBtnClick={handleToggleFollow}
            onBlockClick={handleBlockClick}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "myColl" ? styles.active : ""}`}
              onClick={handleMyCollClick}
            >
              유저의 컬렉션
            </button>
            <button
              className={`${styles.tab} ${activeTab === "bookmarkColl" ? styles.active : ""}`}
              onClick={handleBookmarkCollClick}
            >
              유저가 북마크한 컬렉션
            </button>
          </div>
          <CollGrid
            colls={activeTab == "myColl" ? collections : bookmarks}
            onBookmarkChange={handleBookmarkChange}
            onLikeChange={handleLikeChange}
            onCollClick={handleCollClick}
          />
        </div>
      </div>
    </>
  );
}

export default ArchiveVisit;
