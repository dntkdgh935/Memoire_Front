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
          console.error("Error fetching user stats:", error);
        }
      };

      fetchStuff();
    }
  }, [isLoggedIn, userid, navigate]);
  if (isLoggedIn === null || isLoggedIn === undefined || !userid) {
    return <div>로딩중...</div>;
  }
  return (
    <div className={styles.profileContainer}>
      <div className={styles.sidebar}>
        <ProfileCard />
        <FollowingFollower />
      </div>
      <div className={styles.content}>
        <CollGrid colls={collections} />
      </div>
    </div>
  );
}

export default ArchiveMain;
