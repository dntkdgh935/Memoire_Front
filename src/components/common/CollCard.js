import React from "react";
import styles from "./CollCard.module.css";
import LibCollLabel from "../library/LibCollLabel";

function CollCard({ collection }) {
  const cover = collection.thumbnailPath; // collection에서 동적으로 이미지 경로 받기
  console.log(cover);
  const isImage = collection.thumbType == "image";
  const isText = collection.thumbType === "text";
  console.log(collection.thumbType);
  return (
    <div className={styles.card}>
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
      ) : (
        <div className={styles.placeholder}>
          <p className={styles.typeText}>
            {collection.thumbType?.toUpperCase() || "NO IMAGE"}
          </p>
        </div>
      )}

      <LibCollLabel coll={collection} />
    </div>
  );
}

export default CollCard;
