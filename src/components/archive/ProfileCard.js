import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./ProfileCard.module.css";

function ProfileCard() {
  const { userid } = useContext(AuthContext);

  const [user, setUser] = useState({
    loginId: "",
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
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [editStatusMessage, setEditStatusMessage] = useState("");

  const [isVisible, setIsVisible] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);

  useEffect(() => {
    if (!userid) return;

    setTimeout(() => {
      setIsVisible(true);
    }, 100);

    const fetchStuff = async () => {
      try {
        const userInfo = await apiClient.get("/archive/userinfo", {
          params: { userid: userid },
        });
        console.log(userInfo.data);

        setUser({
          loginId: userInfo.data.loginId,
          nickname: userInfo.data.nickname,
          profileImage: userInfo.data.profileImagePath,
        });

        setStatusMessage(userInfo.data.statusMessage || "");

        const collectionNum = await apiClient.get(`/archive/numCollections`, {
          params: { userid: userid },
        });

        const memoriesNum = await apiClient.get(`/archive/numMemory`, {
          params: { userid: userid },
        });
        const followingNum = await apiClient.get(`/archive/numFollowing`, {
          params: { userid: userid },
        });
        const followerNum = await apiClient.get(`/archive/numFollowers`, {
          params: { userid: userid },
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
  }, [userid]);

  const handleEditProfile = () => {
    alert("프로필 수정 기능이 실행됩니다!");
  };

  const handleStatClick = (statType, value) => {
    alert(`${statType}: ${value}개`);
  };

  const handleStatusClick = () => {
    setEditStatusMessage(statusMessage);
    setIsEditingStatus(true);
  };

  const handleAvatarClick = () => {
    setAvatarClicked(true);
    setTimeout(() => setAvatarClicked(false), 200);
  };

  const handleStatusSave = async () => {
    try {
      await apiClient.post("/archive/updateStatusMessage", null, {
        params: {
          userid: userid,
          statusMessage: editStatusMessage,
        },
      });

      setStatusMessage(editStatusMessage);
      setIsEditingStatus(false);
    } catch (error) {
      console.error("상태 메시지 저장 실패", error);
      alert("상태 메시지 저장에 실패했습니다.");
    }
  };

  const handleStatusCancel = () => {
    setIsEditingStatus(false);
    setEditStatusMessage("");
  };

  const handleStatusKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const input = e.target.value;
      const byteLength = new Blob([input]).size;
      if (byteLength <= 200) {
        handleStatusSave();
      } else {
        alert("상태 메시지는 최대 200바이트까지만 입력 가능합니다.");
      }
    } else if (e.key === "Escape") {
      handleStatusCancel();
    }
  };

  return (
    <div
      className={`${styles["profile-card"]} ${isVisible ? styles.visible : ""}`}
    >
      <div className={styles["profile-header"]}>
        <div className={styles["profile-avatar"]}>
          <img
            src={
              user.profileImage
                ? `http://localhost:8080/upload_files/user_profile/${user.profileImage}`
                : "https://static.mothership.sg/1/2021/07/cat.jpg"
            }
            alt="Profile"
            className={`${styles["avatar-img"]} ${avatarClicked ? styles["avatar-clicked"] : ""}`}
            onClick={handleAvatarClick}
          />
        </div>
        <div className={styles["profile-info"]}>
          <h2 className={styles["username"]}>
            {user.nickname ? user.nickname : userid}
          </h2>
          <p className={styles["handle"]}>@{user.loginId}</p>
        </div>
      </div>

      <div className={styles["status-bubble"]}>
        {isEditingStatus ? (
          <>
            <textarea
              value={editStatusMessage}
              onChange={(e) => setEditStatusMessage(e.target.value)}
              rows={3}
              className={styles["status-textarea"]}
              autoFocus
              onKeyDown={handleStatusKeyDown}
            />
          </>
        ) : (
          <p onClick={handleStatusClick} style={{ cursor: "pointer" }}>
            {statusMessage || "상태메시지를 입력하세요."}
          </p>
        )}
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
}

export default ProfileCard;
