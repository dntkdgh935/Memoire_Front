// src/components/atelier/common/MemoryList.js

import React from "react";
import styles from "./MemoryList.module.css";

function MemoryList({
  collections,
  memories,
  selectedCollectionId,
  selectedMemoryId,
  onSelectCollection,
  onSelectMemory,
}) {
  return (
    <div className={styles.memoryListContainer}>
      {/* 컬렉션 셀렉트 박스 */}
      <select
        className={styles.selectBox}
        value={selectedCollectionId}
        onChange={(e) => onSelectCollection(e.target.value)}
      >
        {collections.map((col) => (
          <option key={col.id} value={col.id}>
            {col.title}
          </option>
        ))}
      </select>

      {/* 메모리 목록 타이틀 */}
      <div className={styles.memoryListTitle}>원본 메모리 목록</div>
      <div className={styles.memoryCount}>{memories.length}개</div>

      {/* 메모리 리스트 */}
      <div className={styles.memoryList}>
        {memories.map((mem) => (
          <div
            key={mem.memoryid}
            className={`${styles.memoryItem} ${
              selectedMemoryId === mem.memoryid ? styles.selected : ""
            }`}
            onClick={() => onSelectMemory(mem.memoryid)}
          >
            {mem.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryList;