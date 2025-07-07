// src/components/TagBar.js
import React from "react";
import styles from "./TagBar.module.css";

function TagBar({ selectedTag, onTagSelect, savedTags = [] }) {
  const defaultTags = ["전체", "팔로잉"];

  return (
    <div className={styles.tagBar}>
      {[...defaultTags, ...savedTags].map((tag) => (
        <button
          key={tag}
          className={`${styles.tagButton} ${selectedTag === tag ? styles.active : ""}`}
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}

export default TagBar;
