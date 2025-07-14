import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./VisitProfileCard.module.css";

/*<VisitProfileCard
        ownerid={ownerid}
        onFollowBtnClick={handleToggleFollow}
      /> */
function VisitProfileCard({ ownerid, onFollowBtnClick }) {
  // 방문자 id
  //   const { userid } = useContext(AuthContext);

  const [owner, setOwner] = useState({
    loginid: "",
    nickname: "",
    profileImage: "",
  });

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
    if (!ownerid) return;

    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const fetchStuff = async () => {
      try {
        const userInfo = await apiClient.get("/archive/userinfo", {
          params: { userid: ownerid },
        });
        console.log(userInfo.data);

        setOwner({
          loginid: userInfo.data.loginId,
          nickname: userInfo.data.nickname,
          profileImage: userInfo.data.profileImagePath,
        });
        console.log("[프로필 이미지]", owner.profileImage);

        setStatusMessage(userInfo.data.statusMessage || "");

        const collectionNum = await apiClient.get(`/archive/numCollections`, {
          params: { userid: ownerid },
        });

        const memoriesNum = await apiClient.get(`/archive/numMemory`, {
          params: { userid: ownerid },
        });
        const followingNum = await apiClient.get(`/archive/numFollowing`, {
          params: { userid: ownerid },
        });
        const followerNum = await apiClient.get(`/archive/numFollowers`, {
          params: { userid: ownerid },
        });
        console.log(collectionNum.data);
        console.log(memoriesNum.data);
        console.log(followingNum.data);
        console.log(followerNum.data);

        setStats({
          collections: collectionNum.data,
          memories: memoriesNum.data,
          following: followingNum.data,
          followers: followerNum.data,
        });
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };
    fetchStuff();
  }, [ownerid]);

  //   const handleEditProfile = () => {
  //     alert("프로필 수정 기능이 실행됩니다!");
  //   };

  const handleStatClick = (statType, value) => {
    alert(`${statType}: ${value}개`);
  };

  //   const handleStatusClick = () => {
  //     setEditStatusMessage(statusMessage);
  //     setIsEditingStatus(true);
  //   };

  const handleAvatarClick = () => {
    setAvatarClicked(true);
    setTimeout(() => setAvatarClicked(false), 200);
  };

  console.log("[프로필 이미지]", owner.profileImage);
  return (
    <div
      className={`${styles["profile-card"]} ${isVisible ? styles.visible : ""}`}
    >
      <div className={styles["profile-header"]}>
        <div className={styles["profile-avatar"]}>
          <img
            src={
              owner.profileImage
                ? `http://localhost:8080${owner.profileImage}`
                : "https://static.mothership.sg/1/2021/07/cat.jpg"
            }
            alt="Profile"
            className={`${styles["avatar-img"]} ${avatarClicked ? styles["avatar-clicked"] : ""}`}
            onClick={handleAvatarClick}
          />
        </div>
        <div className={styles["profile-info"]}>
          <h2 className={styles["username"]}>
            {owner.nickname ? owner.nickname : ownerid}
          </h2>
          <p className={styles["handle"]}>@{owner.loginid}</p>
        </div>
      </div>

      <div className={styles["status-bubble"]}>
        <p>{statusMessage || "상태메시지를 입력하세요."}</p>
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

      <button className={styles["follow-btn"]} onClick={onFollowBtnClick}>
        팔로우
      </button>
      <span>차단하기</span>
    </div>
  );
}

export default VisitProfileCard;
