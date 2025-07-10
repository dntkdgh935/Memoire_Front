import React from "react";
import styles from "./CollActionBtn.module.css";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";

function CollActionBtn({ type, count, onClick, isClicked }) {
  const iconStyle = {
    color: isClicked ? "var(--color-main)" : "var(--color-normal-text)",
  };

  const IconComponent =
    type === "like"
      ? isClicked
        ? FaHeart
        : FaRegHeart
      : isClicked
        ? FaBookmark
        : FaRegBookmark;

  return (
    <div
      className={`${styles.button} ${type === "like" ? styles.like : styles.bookmark}`}
      onClick={onClick}
    >
      <IconComponent className={styles.icon} style={iconStyle} />
      <span>{type === "like" ? `좋아요 ${count}` : `북마크 ${count}`}</span>
    </div>
  );
}

export default CollActionBtn;
