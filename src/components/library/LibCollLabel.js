import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./LibCollLabel.module.css";
import AvatarWName from "../common/AvatarWName"; // 이 import도 필요합니다

function LibCollLabel({ coll }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.label}>
        <AvatarWName
          type="inCollLabel"
          user={{
            username: coll.authorname,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
          }}
        />
        <h3>{coll.collectionTitle}</h3>
        <p>{coll.authorid}</p>
      </div>
    </div>
  );
}

export default LibCollLabel;
