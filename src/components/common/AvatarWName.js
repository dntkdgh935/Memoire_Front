import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./AvatarWName.module.css";
import { useNavigate } from "react-router-dom";

function AvatarWName({ user, type }) {
  const navigate = useNavigate();

  // 현재 로그인한 유저
  const { isLoggedIn, userid: loginUserId } = useContext(AuthContext);

  // 출력할 아바타 유저
  const { username, displayId, profileImageUrl, userid } = user;

  console.log("username: " + username + ", userid: " + userid);
  // const { userid } = useContext(AuthContext);
  console.log("[AvatarWName]:" + userid);

  const handleAvatarClick = () => {
    console.log("heyyy 로그인 유저: " + loginUserId + ", authorid:" + userid);

    if (!isLoggedIn) {
      alert("로그인 후 아카이브 방문 가능합니다.");
    } else {
      try {
        if (loginUserId == userid) {
          console.log("내 아카이브로 이동");
          navigate(`/archive`);
        } else {
          navigate(`/library/archive/${userid}`); // 이 URL로 이동
        }
      } catch (error) {
        alert("이동 실패!");
      }
    }
  };

  if (type === "inCollLabel") {
    return (
      <div
        className={styles.inCollLabel}
        onClick={handleAvatarClick}
        style={{ cursor: "pointer" }}
      >
        <img
          src={profileImageUrl}
          alt="profile"
          className={styles.avatarSmall}
        />
        <span className={styles.usernameSmall}>{username}</span>
      </div>
    );
  } else if (type === "inUserCard") {
    return (
      <div
        className={styles.inUserCard}
        onClick={handleAvatarClick}
        style={{ cursor: "pointer" }}
      >
        <img
          src={profileImageUrl}
          alt="profile"
          className={styles.avatarLarge}
        />
        <div className={styles.userTextBlock}>
          <div className={styles.usernameLarge}>{username}</div>
          <div className={styles.displayId}>@{displayId}</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
}

export default AvatarWName;
