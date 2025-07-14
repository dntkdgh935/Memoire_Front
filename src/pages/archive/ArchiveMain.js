import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import ProfileCard from "../../components/archive/ProfileCard";
import FollowingFollower from "../../components/archive/FollowingFollower";
import CollGrid from "../../components/common/CollGrid";

import { useNavigate } from "react-router-dom";

import styles from "./ArchiveMain.module.css";

function ArchiveMain() {
  const { isLoggedIn, userid } = useContext(AuthContext);

  const [collections, setCollections] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
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
          const collectionsInfo = await apiClient.get("/archive/collections", {
            params: {
              userid: userid,
            },
          });
          console.log(collectionsInfo.data);
          setCollections(collectionsInfo.data);
        } catch (error) {
          console.error("Error fetching user collections:", error);
        }
        try {
          const bookmarksInfo = await apiClient.get(
            "/archive/bookmarkCollections",
            {
              params: {
                userid: userid,
              },
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
  }, [isLoggedIn, userid, navigate]);

  if (isLoggedIn === null || isLoggedIn === undefined || !userid) {
    return <div>로딩중...</div>;
  }

  const handleActionChange = async (collectionId, actionType) => {
    const targetList = activeTab === "myColl" ? collections : bookmarks;
    const setTargetList =
      activeTab === "myColl" ? setCollections : setBookmarks;

    const targetItem = targetList.find(
      (coll) => coll.collectionid === collectionId
    );
    if (!targetItem) return;

    const isLiked =
      actionType === "userlike" ? !targetItem.userlike : undefined;
    const isBookmarked =
      actionType === "userbookmark" ? !targetItem.userbookmark : undefined;

    try {
      if (actionType === "userlike") {
        await apiClient.post(`/api/library/togglelike`, null, {
          params: { collectionId, isLiked },
        });
      } else if (actionType === "userbookmark") {
        await apiClient.post(`/api/library/togglebm`, null, {
          params: { collectionId, isBookmarked },
        });
      }

      // 상태 업데이트
      setTargetList((prevState) =>
        prevState.map((coll) =>
          coll.collectionid === collectionId
            ? {
                ...coll,
                [actionType]: !coll[actionType],
                [actionType === "userlike" ? "likeCount" : "bookmarkCount"]:
                  coll[actionType]
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
    } catch (error) {
      console.error("상태 변경 중 오류 발생:", error);
    }
  };

  const handleCollClick = (collectionid) => {
    alert(collectionid);
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
            onClick={() => setActiveTab("myColl")}
          >
            내 컬렉션
          </button>
          <button
            className={`${styles.tab} ${activeTab === "bookmarkColl" ? styles.active : ""}`}
            onClick={() => setActiveTab("bookmarkColl")}
          >
            북마크한 컬렉션
          </button>
        </div>
        <CollGrid
          colls={activeTab == "myColl" ? collections : bookmarks}
          onActionChange={handleActionChange}
          onCollClick={handleCollClick}
        />
      </div>
    </div>
  );
}

export default ArchiveMain;
