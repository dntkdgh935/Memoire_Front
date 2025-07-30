// src/components/TagBar.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./TagBar.module.css";

function TagBar({ selectedTag, onTagSelect, savedTags = [] }) {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);
  const defaultTags = ["탐색"];

  // 로그인 상태일 때만 "팔로잉"과 "추천" 추가
  if (isLoggedIn) {
    defaultTags.push("팔로잉");
  }

  return (
    <div className={styles.tagBar}>
      {[...defaultTags, ...savedTags].map((tag) => (
        <button
          key={tag}
          className={`${styles.tagButton} ${selectedTag === tag ? styles.active : ""}`}
          onClick={() => onTagSelect(tag)}
        >
          {tag === "탐색" || tag === "팔로잉" ? tag : `#${tag}`}
        </button>
      ))}
    </div>
  );
}

export default TagBar;
