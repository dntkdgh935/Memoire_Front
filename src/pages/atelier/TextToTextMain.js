import React, { useEffect, useState } from "react";
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/TextToText/SettingPanel";
import WorkResultPanel from "../../components/atelier/TextToText/WorkResultPanel";
import styles from "./TextToTextMain.module.css";

function TextToTextMain() {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [memories, setMemories] = useState([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [result, setResult] = useState(null);

  // ✅ 선택된 메모리 객체
  const selectedMemory =
    selectedMemoryId && memories.length > 0
      ? memories.find((m) => m.memoryid?.toString() === selectedMemoryId?.toString())
      : null;

  // ✅ 1) 컬렉션 목록 가져오기
  useEffect(() => {
    fetch("/api/collections")
      .then((res) => {
        if (!res.ok) throw new Error("컬렉션 목록 조회 실패");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((item) => ({
          id: item.collectionid,
          title: item.collectionTitle,
        }));
        setCollections(formatted);
        if (formatted.length > 0) {
          setSelectedCollectionId(formatted[0].id.toString());
        }
      })
      .catch((err) => {
        console.error("컬렉션 가져오기 실패:", err);
      });
  }, []);

  // ✅ 2) 선택된 컬렉션의 메모리 목록 가져오기
  useEffect(() => {
    if (!selectedCollectionId) return;

    fetch(`/api/atelier/text/memories/${selectedCollectionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("메모리 목록 조회 실패");
        return res.json();
      })
      .then((data) => {
        setMemories(data);
        setSelectedMemoryId(null);
      })
      .catch((err) => {
        console.error("메모리 가져오기 실패:", err);
        setMemories([]);
      });
  }, [selectedCollectionId]);

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <MemoryList
          collections={collections}
          memories={memories}
          selectedCollectionId={selectedCollectionId}
          selectedMemoryId={selectedMemoryId}
          onSelectCollection={setSelectedCollectionId}
          onSelectMemory={setSelectedMemoryId}
        />
      </div>

      <div className={styles.centerPanel}>
        <SettingPanel selectedMemory={selectedMemory} onGenerate={setResult} />
      </div>

      <div className={styles.rightPanel}>
        <WorkResultPanel
          result={result}
          originalMemoryId={selectedMemory?.memoryid}
          originalMemoryTitle={selectedMemory?.title}
        />
      </div>
    </div>
  );
}

export default TextToTextMain;