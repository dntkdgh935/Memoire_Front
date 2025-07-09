import React from "react";
import styles from "./AvatarWName.module.css";

function AvatarWName({ user, type }) {
  const { username, displayId, profileImageUrl } = user;

  if (type === "inCollLabel") {
    return (
      <div className={styles.inCollLabel}>
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
      <div className={styles.inUserCard}>
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
