import Reac, { useState, useEffect } from "react";
import styles from "./AvatarWName.module.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";

function AvatarWName({ user, type }) {
  const navigate = useNavigate(); // 이 줄이 반드시 필요!

  const { username, displayId, profileImageUrl, userid } = user;
  console.log("username: " + username + ", userid: " + userid);
  // const { userid } = useContext(AuthContext);
  console.log("[AvatarWName]:" + userid);
  const handleClick = () => {
    navigate(`/library/archive/${userid}`); // 이 URL로 이동
  };

  if (type === "inCollLabel") {
    return (
      <div
        className={styles.inCollLabel}
        onClick={handleClick}
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
        onClick={handleClick}
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
