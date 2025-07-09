import React from "react";
import styles from "./CollCard.module.css";

function CollCard({ collection }) {
  const cover = collection.thumbnailPath; // collection에서 동적으로 이미지 경로 받기
  console.log(cover);
  const isImage = collection.thumbType == "image";
  console.log(collection.thumbType);
  return (
    <div className={styles.card}>
      {/* 동적으로 경로를 받아서 이미지를 출력 */}
      {/* <img
        src={cover} // src에 dynamic하게 경로 사용
        alt={collection.collectionTitle}
        className={styles.image}
      /> */}
      {/* 동적으로 경로를 받아서 이미지를 출력 (thumbType이 img인 경우) */}
      {/* {collection.thumbType == "img" && (
        <img
          src={`http://localhost:8080${cover}`} // 예: /upload_files/memory_img/abc.jpg
          alt={collection.collectionTitle}
          className={styles.image}
          //style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
      )} */}
      {isImage ? (
        <img
          src={`http://localhost:8080${cover}`}
          alt={collection.collectionTitle}
          className={styles.image}
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
      ) : (
        <div className={styles.placeholder}>
          {/* 필요 시 썸네일 아이콘 / 타입 텍스트 */}
          <p className={styles.typeText}>
            {collection.thumbType?.toUpperCase() || "NO IMAGE"}
          </p>
        </div>
      )}

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
