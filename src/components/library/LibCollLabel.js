import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./LibCollLabel.module.css";
import AvatarWName from "../common/AvatarWName"; // 이 import도 필요합니다
import CollActionButton from "../common/CollActionBtn";
import ActionBtn_like from "../common/ActionBtn_like";
import ActionBtn_bm from "../common/ActionBtn_bm";

function LibCollLabel({ coll, onBookmarkChange, onLikeChange }) {
  const { isLoggedIn, userid: myid, role } = useContext(AuthContext);
  // useEffect(() => {
  //   // coll
  //   console.log("LibCollLabel coll:", coll);
  // });

  return (
    <div className={styles.overlay}>
      <div className={styles.label}>
        <AvatarWName
          type="inCollLabel"
          user={{
            username: coll.authorname,
            userid: coll.authorid,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
          }}
        />
        <h3>{coll.collectionTitle}</h3>
        <p>{coll.createdDate}</p>
        {/* action buttons가 필요한 경우에만 렌더링 */}
        <div className={styles.actionButtons}>
          <ActionBtn_like coll={coll} onLikeChange={onLikeChange} />
          <ActionBtn_bm coll={coll} onBookmarkChange={onBookmarkChange} />
        </div>
      </div>
    </div>
  );
}

export default LibCollLabel;
