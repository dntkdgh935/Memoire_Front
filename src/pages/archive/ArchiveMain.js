import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import ProfileCard from "../../components/archive/ProfileCard";
import FollowingFollower from "../../components/archive/FollowingFollower";
import CollGrid from "../../components/common/CollGrid";

import { useNavigate } from "react-router-dom";

import styles from "./ArchiveMain.module.css";

function ArchiveMain() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState("myColl");

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

  return (
    <div className={styles.profileContainer}>
      <div className={styles.sidebar}>
        <ProfileCard />
        <FollowingFollower />
      </div>
      <div className={styles.content}>
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
          <button className={styles.button} onClick={handleNewCollection}>
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
  );
}

export default ArchiveMain;
