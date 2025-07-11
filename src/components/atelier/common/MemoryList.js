import React, { useEffect, useState } from "react";
import styles from "./MemoryList.module.css";

function MemoryList({
  collections,
  selectedCollectionId,
  memories,
  selectedMemoryId,
  onSelectCollection,
  onSelectMemory,
}) {
  const [filteredMemories, setFilteredMemories] = useState([]);

  useEffect(() => {
    if (selectedCollectionId) {
      const filtered = memories.filter(
        (m) => m.collectionId === selectedCollectionId
      );
      setFilteredMemories(filtered);
    } else {
      setFilteredMemories([]);
    }
  }, [selectedCollectionId, memories]);

  return (
    <div className={styles.memoryListContainer}>
      <select
        className={styles.selectBox}
        value={selectedCollectionId}
        onChange={(e) => onSelectCollection(e.target.value)}
      >
        <option value="">컬렉션: 선택 없음</option>
        {collections.map((coll) => (
          <option key={coll.id} value={coll.id}>
            {coll.title}
          </option>
        ))}
      </select>

      <div className={styles.memoryListTitle}>원본 메모리 목록</div>
      <div className={styles.memoryCount}>{filteredMemories.length}개</div>
      <div className={styles.memoryList}>
        {filteredMemories.map((memory) => (
          <div
            key={memory.id}
            className={`${styles.memoryItem} ${
              selectedMemoryId === memory.id ? styles.selected : ""
            }`}
            onClick={() => onSelectMemory(memory.id)}
          >
            {memory.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemoryList;