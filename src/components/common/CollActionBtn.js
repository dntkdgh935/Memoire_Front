import React from "react";
import styles from "./CollActionBtn.module.css";
import { FaHeart, FaBookmark } from "react-icons/fa"; // 아이콘을 사용하려면 React-icons 패키지를 사용

function CollActionBtn({ type, count, onClick }) {
  return (
    <div
      className={`${styles.button} ${type === "like" ? styles.like : styles.bookmark}`}
      onClick={onClick}
    >
      {type === "like" ? (
        <>
          <FaHeart className={styles.icon} />
          <span>좋아요 {count}</span>
        </>
      ) : (
        <>
          <FaBookmark className={styles.icon} />
          <span>북마크 {count}</span>
        </>
      )}
    </div>
  );
}

export default CollActionBtn;
