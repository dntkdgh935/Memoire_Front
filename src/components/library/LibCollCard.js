// src/components/library/LibCollCard.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./LibCollCard.module.css";
import MemoryList from "../../components/common/MemoryList";
import CollActionBtn from "../../components/common/CollActionBtn";
import AvatarWName from "../common/AvatarWName";

/*<LibCollCard
        coll={collection}
        memoryList={memoryList}
        onMemoryClick={handleMemoryClick}
        onActionChange={handleActionChange}
        selectedMemory={selectedMemory}
      /> */
function LibCollCard({
  coll,
  memoryList,
  onMemoryClick,
  onActionChange,
  selectedMemoryId,
}) {
  const { isLoggedIn, userid, role } = useContext(AuthContext);

  console.log("collection 주인: ", coll.authorid);

  const handleEditClick = () => {
    alert("수정버튼을 클릭했습니다");
  };

  const handleDeleteClick = () => {
    alert("삭제버튼을 클릭했습니다");
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <div className={styles.collectionTitle}>{coll.collectionTitle}</div>
        {/* 여기에 로그인상태이고 관리자이거나 해당 게시물 작성자이면 편집 버튼을 넣음 */}
        {isLoggedIn && (role === "ADMIN" || userid === coll.authorid) && (
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleEditClick}>
              수정
            </button>
            <button className={styles.button} onClick={handleDeleteClick}>
              삭제
            </button>
          </div>
        )}
        <AvatarWName
          type="inCollLabel"
          user={{
            username: coll.authorname,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
            userid: coll.authorid,
          }}
        />

        <div className={styles.userName}>{coll.authorid}</div>
        <div className={styles.collectionDate}>{coll.createdDate}</div>
      </div>

      <div className={styles.cardFooter}>
        <CollActionBtn
          btnType="like"
          coll={coll}
          onActionChange={onActionChange}
        />
        <CollActionBtn
          btnType="bookmark"
          coll={coll}
          onActionChange={onActionChange}
        />
      </div>

      <div className={styles.cardTags}>
        {/* {coll.tags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))} */}
      </div>

      <div className={styles.memoryList}>
        <MemoryList
          memoryList={memoryList}
          onMemoryClick={onMemoryClick}
          selectedMemoryId={selectedMemoryId}
        />
      </div>
    </div>
  );
}

export default LibCollCard;
