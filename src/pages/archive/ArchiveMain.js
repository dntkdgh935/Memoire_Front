import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import ProfileCard from "../../components/archive/ProfileCard";
import FollowingFollower from "../../components/archive/FollowingFollower";
import CollGrid from "../../components/common/CollGrid";
import PageHeader from "../../components/common/PageHeader";
import Modal from "../../components/common/Modal";

import { useNavigate } from "react-router-dom";

import styles from "./ArchiveMain.module.css";

function ArchiveMain() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("myColl");
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/");
      return;
    }

    if (isLoggedIn && userid) {
      const fetchStuff = async () => {
        try {
          const collectionsInfo = await secureApiRequest(
            `/archive/collections?userid=${userid}`,
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

      fetchStuff();
    }
  }, [isLoggedIn, userid, navigate]);

  if (isLoggedIn === null || isLoggedIn === undefined || !userid) {
    return <div>로딩중...</div>;
  }

  const handleMyCollClick = async () => {
    setActiveTab("myColl");
    try {
      const collectionsInfo = await secureApiRequest(
        `/archive/collections?userid=${userid}`,
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

  const handleBookmarkCollClick = async () => {
    setActiveTab("bookmarkColl");
    try {
      const bookmarksInfo = await secureApiRequest(
        `/archive/bookmarkCollections?userid=${userid}`,
        {
          method: "GET",
        }
      );
      console.log(bookmarksInfo.data);
      setCollections(bookmarksInfo.data);
    } catch (error) {
      console.error("Error fetching user bookmarks:", error);
    }
  };

  // 좋아요/ 북마크 DB 변경 + 상태 변경 함수
  const handleActionChange = async (collectionId, actionType) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      const isLiked =
        actionType === "userlike"
          ? !collections.find((coll) => coll.collectionid === collectionId)
              .userlike
          : undefined;
      const isBookmarked =
        actionType === "userbookmark"
          ? !collections.find((coll) => coll.collectionid === collectionId)
              .userbookmark
          : undefined;

      try {
        const formData = new FormData();
        formData.append("userid", userid);
        formData.append("collectionId", collectionId);
        if (actionType === "userlike") {
          formData.append("isLiked", isLiked);
          await secureApiRequest("/api/library/togglelike", {
            method: "POST",
            body: formData,
          });
        } else if (actionType === "userbookmark") {
          formData.append("isBookmarked", isBookmarked);
          await secureApiRequest("/api/library/togglebm", {
            method: "POST",
            body: formData,
          });
        }
      } catch (error) {
        console.error("Error performing action:", error);
      }

      // UI 상태 변경
      setCollections((prevState) =>
        prevState.map((coll) =>
          coll.collectionid === collectionId
            ? {
                ...coll,
                [actionType]: !coll[actionType], // 상태 토글
                // 좋아요/북마크 카운트 업데이트
                [actionType === "userlike" ? "likeCount" : "bookmarkCount"]:
                  coll[actionType] === true
                    ? coll[
                        actionType === "userlike"
                          ? "likeCount"
                          : "bookmarkCount"
                      ] - 1
                    : coll[
                        actionType === "userlike"
                          ? "likeCount"
                          : "bookmarkCount"
                      ] + 1,
              }
            : coll
        )
      );
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleCollClick = (collectionId) => {
    navigate(`/library/detail/${collectionId}`);
  };

  const handleNewCollection = () => {
    navigate("/archive/newcoll");
  };

  const handleBlockedUsersClick = async () => {
    try {
      const response = await secureApiRequest(
        `/archive/blocked?userid=${userid}`,
        {
          method: "GET",
        }
      );
      setBlockedUsers(response.data);
      setShowBlockedModal(true);
    } catch (error) {
      console.error("차단 유저 목록을 불러오는 데 실패했습니다:", error);
    }
  };

  const handleUnblock = async (blockedUserId) => {
    if (!window.confirm("정말로 이 유저를 차단 해제하시겠습니까?")) return;
    try {
      const formData = new FormData();
      formData.append("userid", userid);
      formData.append("blockedUserId", blockedUserId);
      await secureApiRequest("/archive/unblock", {
        method: "POST",
        body: formData,
      });

      setBlockedUsers((prev) =>
        prev.map((user) =>
          user.targetid === blockedUserId ? { ...user, status: "-1" } : user
        )
      );
    } catch (error) {
      console.error("차단 해제 실패:", error);
    }
  };

  const handleFollow = async (targetid) => {
    if (!window.confirm("정말로 이 유저에게 팔로우 요청을 하시겠습니까?"))
      return;
    try {
      const formData = new FormData();
      formData.append("userid", userid);
      formData.append("targetid", targetid);
      await secureApiRequest("/archive/followRequest", {
        method: "POST",
        body: formData,
      });

      setBlockedUsers((prev) =>
        prev.map((user) =>
          user.targetid === targetid ? { ...user, status: "0" } : user
        )
      );
    } catch (error) {
      console.error("팔로우 요청 실패:", error);
    }
  };

  return (
    <>
      <PageHeader pagename={`내 아카이브`} />
      <div className={styles.profileContainer}>
        <div className={styles.sidebar}>
          <ProfileCard />
          <FollowingFollower />
          <button
            className={styles.blockedUsersButton}
            onClick={handleBlockedUsersClick}
          >
            차단한 유저
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.tabsRow}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === "myColl" ? styles.active : ""}`}
                onClick={handleMyCollClick}
              >
                내 컬렉션
              </button>
              <button
                className={`${styles.tab} ${activeTab === "bookmarkColl" ? styles.active : ""}`}
                onClick={handleBookmarkCollClick}
              >
                북마크한 컬렉션
              </button>
            </div>
            <button
              className={styles.newCollButton}
              onClick={handleNewCollection}
            >
              새 컬렉션
            </button>
          </div>
          <CollGrid
            colls={collections}
            onActionChange={handleActionChange}
            onCollClick={handleCollClick}
          />
        </div>
      </div>
      {showBlockedModal && (
        <Modal onClose={() => setShowBlockedModal(false)}>
          <h2>차단한 유저 목록</h2>
          {blockedUsers.length === 0 ? (
            <p>차단한 유저가 없습니다.</p>
          ) : (
            <table className={styles.blockedTable}>
              <thead>
                <tr>
                  <th>닉네임</th>
                  <th>차단 해제</th>
                </tr>
              </thead>
              <tbody>
                {blockedUsers.map((user, i) => (
                  <tr key={i}>
                    <td>{user.userid}</td>
                    <td>
                      {user.status === "2" ? (
                        <button
                          className={styles.unblockButton}
                          onClick={() => handleUnblock(user.targetid)}
                        >
                          차단 해제
                        </button>
                      ) : user.status === "-1" ? (
                        <button
                          className={styles.unblockButton}
                          onClick={() => handleFollow(user.targetid)}
                        >
                          팔로우 요청
                        </button>
                      ) : (
                        <span>팔로우 요청 대기중</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </>
  );
}

export default ArchiveMain;
