// src/components/common/MemoryView.js
import React, { useEffect } from "react";
import styles from "./MemoryView.module.css";

function MemoryView({ selectedMemory }) {
  console.log("🧪 [MemoryView] selectedMemory:", selectedMemory); // ✅ 정확한 확인용
  // useEffect(() => {
  //   console.log("메모리 뷰: " + selectedMemory); // ✅ 여긴 string + object니까 그냥 "[object Object]" 찍힘
  //   if (selectedMemory) {
  //     setisLoading(false);
  //   }
  // }, [selectedMemory]);

  if (!selectedMemory) {
    return <div className={styles.loading}>로딩중...</div>;
  }

  const { createdDate, title, memoryType, content, filepath } = selectedMemory;

  return (
    <div className={styles.memoryContainer}>
      <div className={styles.metaInfo}>
        <span className={styles.date}>
          {new Date(createdDate).toLocaleDateString("ko-KR")}
        </span>
        <h2 className={styles.title}>{title}</h2>
        <hr className={styles.divider} />
      </div>

      {memoryType === "text" && (
        <div className={styles.textContent}>{content}</div>
      )}

      {memoryType === "image" && (
        <div className={styles.imageWrapper}>
          <img src={filepath} alt={title} className={styles.imageContent} />
        </div>
      )}

      {memoryType === "video" && (
        <div className={styles.videoWrapper}>
          <video controls className={styles.videoContent}>
            <source src={filepath} type="video/mp4" />
            브라우저가 비디오를 지원하지 않습니다.
          </video>
        </div>
      )}
    </div>
  );
}

export default MemoryView;
