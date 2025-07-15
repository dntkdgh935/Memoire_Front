import React, { useState, useEffect, useContext } from "react";
import axios from "axios";

import { useNavigate, useLocation } from "react-router-dom";
import styles from "./LibCollLabel.module.css";
import AvatarWName from "../common/AvatarWName"; // 이 import도 필요합니다
import CollActionButton from "../common/CollActionBtn";
// 좋아요 클릭 시 처리 함수

function LibCollLabel({ coll, onActionChange }) {
  useEffect(() => {
    // coll
  });
  return (
    <div className={styles.overlay}>
      <div className={styles.label}>
        <AvatarWName
          type="inCollLabel"
          user={{
            // TODO: 여기에 name이 아니라 authorname을 가진 id를 보내야 함
            username: coll.authorname,
            userid: coll.authorid,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
          }}
        />
        <h3>{coll.collectionTitle}</h3>
        <p>{coll.createdDate}</p>
        <div className={styles.actionButtons}>
          <CollActionButton
            coll={coll}
            btnType="like"
            onActionChange={onActionChange}
          />
          <CollActionButton
            coll={coll}
            btnType="bookmark"
            onActionChange={onActionChange}
          />
        </div>
      </div>
    </div>
  );
}

export default LibCollLabel;
