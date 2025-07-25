import React from "react";
import styles from "./CollCard.module.css";
import LibCollLabel from "../library/LibCollLabel";

function CollCard({ collection, onLikeChange, onBookmarkChange, onCollClick }) {
  const cover = collection.thumbnailPath; // collection에서 동적으로 이미지/ 비디오 경로 받기
  // console.log(cover);
  const isImage = collection.thumbType == "image";
  const isText = collection.thumbType === "text";
  const isVideo = collection.thumbType == "video";
  // console.log(collection.thumbType);

  return (
    <div
      className={styles.card}
      onClick={() => onCollClick(collection.collectionid)}
    >
      {isImage ? (
        <img
          src={`http://localhost:8080${cover}`}
          alt={collection.collectionTitle}
          className={styles.image}
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
      ) : isText ? (
        <div className={styles.textContent}>
          <p>{collection.textContent}</p>
        </div>
      ) : isVideo ? (
        // 비디오인 경우
        <video
          className={styles.video}
          src={`http://localhost:8080${cover}`}
          autoPlay
          muted
          loop
          playsInline // 모바일에서 자동재생 허용
          style={{ width: "100%", height: "auto", objectFit: "cover" }}
        />
      ) : (
        <p></p>
        // <span>메모리 없음</span>
      )}
      <div className={styles.darkOverlay}></div>
      <div className={styles.labelOverlay} onClick={(e) => e.stopPropagation()}>
        <LibCollLabel
          coll={collection}
          onLikeChange={onLikeChange}
          onBookmarkChange={onBookmarkChange}
        />
      </div>
    </div>
  );
}

export default CollCard;
