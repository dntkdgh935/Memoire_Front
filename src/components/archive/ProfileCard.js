import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./ProfileCard.module.css";

function ProfileCard() {
  const { userid, secureApiRequest, profileImagePath, nickname, loginId } =
    useContext(AuthContext);

  const [user, setUser] = useState({
    loginId: "",
    nickname: "",
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
        const userInfo = await secureApiRequest(
          `/archive/userinfo?userid=${userid}`,
          {
            method: "GET",
          }
        );
        console.log(userInfo.data);

        setUser((prevUser) => ({
          ...prevUser,
          loginId: userInfo.data.loginId,
          nickname: userInfo.data.nickname,
        }));
        setStatusMessage(userInfo.data.statusMessage || "");

        const collectionNum = await secureApiRequest(
          `/archive/numCollections?userid=${userid}`,
          {
            method: "GET",
          }
        );

        const memoriesNum = await secureApiRequest(
          `/archive/numMemory?userid=${userid}`,
          {
            method: "GET",
          }
        );

        const followingNum = await secureApiRequest(
          `/archive/numFollowing?userid=${userid}`,
          {
            method: "GET",
          }
        );

        const followerNum = await secureApiRequest(
          `/archive/numFollowers?userid=${userid}`,
          {
            method: "GET",
          }
        );

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
  }, [userid, secureApiRequest]);

  const handleEditProfile = () => {
    alert("프로필 수정 기능이 실행됩니다!");
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
      await secureApiRequest("/archive/updateStatusMessage", {
        method: "POST",
        body: JSON.stringify({
          userid: userid,
          statusMessage: editStatusMessage,
        }),
        headers: {
          "Content-Type": "application/json",
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
      className={`${styles["profilecard"]} ${isVisible ? styles.visible : ""}`}
    >
      <div className={styles["profileheader"]}>
        <div className={styles["profileavatar"]}>
          <img
            src={
              profileImagePath // AuthContext에서 가져온 profileImagePath 사용
                ? `http://localhost:8080${profileImagePath}` // <-- 이 부분을 수정: /upload_files/user_profile/user_xxx.jpg
                : "https://static.mothership.sg/1/2021/07/cat.jpg"
            }
            alt="Profile"
            className={`${styles.avatarimg} ${avatarClicked ? styles.avatarclicked : ""}`}
            onClick={handleAvatarClick}
          />
        </div>
        <div className={styles.profileinfo}>
          <h2 className={styles.username}>{nickname || "닉네임이 없습니다"}</h2>
          <p className={styles.handle}>@{user.loginId || "소셜로그인"}</p>
        </div>
      </div>

      <div className={styles.statusbubble}>
        {isEditingStatus ? (
          <>
            <textarea
              value={editStatusMessage}
              onChange={(e) => setEditStatusMessage(e.target.value)}
              rows={3}
              className={styles.statustextarea}
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

      <div className={styles.statscontainer}>
        <div className={styles.statitem}>
          <span className={styles.statnumber}>{stats.collections}</span>
          <span className={styles.statlabel}>컬렉션 수</span>
        </div>
        <div className={styles.statitem}>
          <span className={styles.statnumber}>{stats.memories}</span>
          <span className={styles.statlabel}>메모리 수</span>
        </div>
        <div className={styles.statitem}>
          <span className={styles.statnumber}>{stats.following}</span>
          <span className={styles.statlabel}>팔로잉</span>
        </div>
        <div className={styles.statitem}>
          <span className={styles.statnumber}>{stats.followers}</span>
          <span className={styles.statlabel}>팔로워</span>
        </div>
      </div>

      <button className={styles.editprofilebtn} onClick={handleEditProfile}>
        프로필 수정
      </button>
    </div>
  );
}

export default ProfileCard;
