// src/components/atelier/common/MemoryList.js
import React from "react";
import styles from "./MemoryList.module.css"; // 있으면 유지

function MemoryList({
  collections,
  memories,
  selectedCollectionId,
  selectedMemoryId,
  onSelectCollection,
  onSelectMemory,
}) {
  return (
    <div className={styles.wrapper}>
      {/* 컬렉션 선택 드롭다운 */}
      <select
        className={styles.dropdown}
        value={selectedCollectionId}
        onChange={(e) => onSelectCollection(e.target.value)}
      >
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}
          </option>
        ))}
      </select>

      {/* 메모리 목록 */}
      <div className={styles.memoryList}>
        <strong>원본 메모리 목록</strong>
        <p>{memories.length}개</p>
        <ul className={styles.list}>
          {memories.map((m) => (
            <li
              key={m.memoryid}
              className={
                m.memoryid === selectedMemoryId
                  ? styles.selectedItem
                  : styles.listItem
              }
              onClick={() => onSelectMemory(m.memoryid)}
            >
              {m.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MemoryList;