import React, { useEffect, useState } from "react";
import styles from "./MemoryList.module.css";

function MemoryList({ memoryList, onMemoryClick, selectedMemoryId }) {
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    console.log("🧪 memoryList:", memoryList);
    console.log(selectedMemoryId);
    if (memoryList) {
      setisLoading(false);
    }
  }, [memoryList]);

  if (isLoading || !memoryList) {
    return <div className={styles.loading}>로딩중...</div>;
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.titleBar}>
        <span>📝 메모리 목록</span>
        <span>{memoryList.length}개</span>
      </div>

      <div className={styles.memoryList}>
        {memoryList.map((memory, index) => (
          <div
            key={index}
            className={`${styles.memoryItem} ${
              selectedMemoryId === memory.memoryid ? styles.selected : ""
            }`}
            onClick={() => onMemoryClick(memory.memoryid)} // memory가 아니라 memory.memoryid
          >
            {memory.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryList;
