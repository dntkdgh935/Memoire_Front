import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./ProfileCard.module.css";

const ProfileCard = () => {
  const { userid } = useContext(AuthContext);

  const [stats, setStats] = useState({
    collections: 0,
    memories: 0,
    following: 0,
    followers: 0,
  });

  const [statusMessage, setStatusMessage] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);

  useEffect(() => {
    if (!userid) return;

    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const fetchStats = async () => {
      try {
        const collectionNum = await apiClient.get(`/archive/numCollections`, {
          // TODO: Add a method to call user info and add it to params
          params: { userid: userid },
        });

        const memoriesNum = await apiClient.get(`/archive/numMemory`, {
          // TODO: Add a method to call user info and add it to params
          params: { userid: userid },
        });
        const followingNum = await apiClient.get(`/archive/numFollowing`, {
          // TODO: Add a method to call user info and add it to params
          params: { userid: userid },
        });
        const followerNum = await apiClient.get(`/archive/numFollowers`, {
          // TODO: Add a method to call user info and add it to params
          params: { userid: userid },
        });
        console.log(collectionNum.data);
        console.log(memoriesNum.data);
        console.log(followingNum.data);
        console.log(followerNum.data);

        setStats({
          collections: collectionNum.data.count,
          memories: memoriesNum.data.count,
          following: followingNum.data.count,
          followers: followerNum.data.count,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setStatusMessage("사용자 정보를 불러오는 데 실패했습니다.");
      }
    };
    if (userid) {
      fetchStats();
    }
  }, [userid]);

  const handleEditProfile = () => {
    alert("프로필 수정 기능이 실행됩니다!");
  };

  const handleStatClick = (statType, value) => {
    alert(`${statType}: ${value}개`);
  };

  const handleStatusClick = () => {
    const originalMessage = [...statusMessage];
    setStatusMessage(["상태 메시지를 클릭했습니다!"]);
    setTimeout(() => {
      setStatusMessage(originalMessage);
    }, 2000);
  };

  const handleAvatarClick = () => {
    setAvatarClicked(true);
    setTimeout(() => setAvatarClicked(false), 200);
  };

  return (
    <div
      className={`${styles["profile-card"]} ${isVisible ? styles.visible : ""}`}
    >
      <div className={styles["profile-header"]}>
        <div className={styles["profile-avatar"]}>
          <img
            src="https://static.mothership.sg/1/2021/07/cat.jpg"
            alt="Profile"
            className={`${styles["avatar-img"]} ${avatarClicked ? styles["avatar-clicked"] : ""}`}
            onClick={handleAvatarClick}
          />
        </div>
        <div className={styles["profile-info"]}>
          <h2 className={styles["username"]}>username</h2>
          <p className={styles["handle"]}>@memo_jeong</p>
        </div>
      </div>

      <div className={styles["status-bubble"]} onClick={handleStatusClick}>
        <p>{statusMessage}</p>
      </div>

      <div className={styles["stats-container"]}>
        <div
          className={styles["stat-item"]}
          onClick={() => handleStatClick("컬렉션 수", stats.collections)}
        >
          <span className={styles["stat-number"]}>{stats.collections}</span>
          <span className={styles["stat-label"]}>컬렉션 수</span>
        </div>
        <div
          className={styles["stat-item"]}
          onClick={() => handleStatClick("메모리 수", stats.memories)}
        >
          <span className={styles["stat-number"]}>{stats.memories}</span>
          <span className={styles["stat-label"]}>메모리 수</span>
        </div>
        <div
          className={styles["stat-item"]}
          onClick={() => handleStatClick("팔로잉", stats.following)}
        >
          <span className={styles["stat-number"]}>{stats.following}</span>
          <span className={styles["stat-label"]}>팔로잉</span>
        </div>
        <div
          className={styles["stat-item"]}
          onClick={() => handleStatClick("팔로워", stats.followers)}
        >
          <span className={styles["stat-number"]}>{stats.followers}</span>
          <span className={styles["stat-label"]}>팔로워</span>
        </div>
      </div>

      <button
        className={styles["edit-profile-btn"]}
        onClick={handleEditProfile}
      >
        프로필 수정
      </button>
    </div>
  );
};

export default ProfileCard;
