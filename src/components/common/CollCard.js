import React from "react";
import styles from "./CollCard.module.css";

function CollCard({ collection }) {
  const cover = collection.thumbnailPath; // collection에서 동적으로 이미지 경로 받기

  return (
    <div className={styles.card}>
      {/* 동적으로 경로를 받아서 이미지를 출력 */}
      <img
        src={cover} // src에 dynamic하게 경로 사용
        alt={collection.collectionTitle}
        className={styles.image}
      />

      <div className={styles.overlay}>
        <div className={styles.label}>
          <h3>{collection.collectionTitle}</h3>
          {/* collectionTitle 동적으로 사용 */}
          <p>{collection.authorid}</p> {/* authorid 동적으로 사용 */}
        </div>
      </div>
    </div>
  );
}

export default CollCard;
