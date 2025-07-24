// // src/components/TagBar.js
// import React, { useState, useEffect, useContext } from "react";
// import { AuthContext } from "../../AuthProvider";
// import styles from "./TagBar.module.css";

// function TagBar({ selectedTag, onTagSelect, savedTags = [] }) {
//   const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);
//   const defaultTags = ["전체", "팔로잉", "추천"];

//   return (
//     <div className={styles.tagBar}>
//       {[...defaultTags, ...savedTags].map((tag) => (
//         <button
//           key={tag}
//           className={`${styles.tagButton} ${selectedTag === tag ? styles.active : ""}`}
//           onClick={() => onTagSelect(tag)}
//         >
//           {tag}
//         </button>
//       ))}
//     </div>
//   );
// }

// export default TagBar;

// src/components/TagBar.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./TagBar.module.css";

function TagBar({ selectedTag, onTagSelect, savedTags = [] }) {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);
  const defaultTags = ["전체"];

  // 로그인 상태일 때만 "팔로잉"과 "추천" 추가
  if (isLoggedIn) {
    defaultTags.push("팔로잉", "추천");
  }

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
