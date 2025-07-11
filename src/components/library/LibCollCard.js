// src/components/library/LibCollCard.js
import React, { useEffect } from "react";
import styles from "./LibCollCard.module.css";
import MemoryList from "../../components/common/MemoryList";
import CollActionBtn from "../../components/common/CollActionBtn";
import AvatarWName from "../common/AvatarWName";

function LibCollCard({ coll, memoryList, onMemoryClick, onActionChange }) {
  if (!coll) {
    return <div>로딩 중...</div>; // 컬렉션 데이터가 없을 때 로딩 화면을 표시합니다.
  }
  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <div className={styles.collectionTitle}>{coll.collectionTitle}</div>
        <AvatarWName
          type="inCollLabel"
          user={{
            username: coll.authorname,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
          }}
        />

        {/* authorid로 loginId 조회해 와야서 출력하는 걸로 고쳐야 함~~~*/}
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
        <MemoryList memoryList={memoryList} onMemoryClick={onMemoryClick} />
      </div>
    </div>
  );
}

export default LibCollCard;
