// src/pages/atelier/TextToTextMain.js
import React, { useEffect, useState, useContext } from "react";
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/TextToText/SettingPanel";
import WorkResultPanel from "../../components/atelier/TextToText/WorkResultPanel";
import styles from "./TextToTextMain.module.css";
import PageHeader from "../../components/common/PageHeader";
import { AuthContext } from "../../AuthProvider";

function TextToTextMain() {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [memories, setMemories] = useState([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [result, setResult] = useState(null);

  // AuthContext에서 userid 사용
  const { isLoggedIn, userid } = useContext(AuthContext);
  const userId = userid;

  const selectedMemory =
    selectedMemoryId && memories.length > 0
      ? memories.find((m) => m.memoryid?.toString() === selectedMemoryId.toString())
      : null;

  // 1) 컬렉션 목록 조회
  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    fetch(`/api/collections/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("컬렉션 조회 실패: " + res.status);
        return res.json();
      })
      .then((data) => {
        const formatted = Array.isArray(data)
          ? data.map((c) => ({
              id: c.collectionid.toString(),
              title: c.collectionTitle,
            }))
          : [];
        setCollections(formatted);
        if (formatted.length > 0) setSelectedCollectionId(formatted[0].id);
      })
      .catch((err) => console.error("컬렉션 가져오기 오류:", err));
  }, [isLoggedIn, userId]);

  // 2) 메모리 목록 조회
  useEffect(() => {
    if (!selectedCollectionId) return;
    fetch(`/api/atelier/text/memories/${selectedCollectionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("메모리 목록 조회 실패: " + res.status);
        return res.json();
      })
      .then((data) => {
        const textMemories = Array.isArray(data)
          ? data.filter((m) => m.memoryType?.toLowerCase() === "text")
          : [];
        setMemories(textMemories);
        setSelectedMemoryId(null);
      })
      .catch((err) => {
        console.error("메모리 가져오기 실패:", err);
        setMemories([]);
      });
  }, [selectedCollectionId]);

  return (
    <>
      <PageHeader pagename="Atelier" />
      <div className={styles.container}>
        {/* 왼쪽 + 중앙 패널을 하나의 큰 박스로 묶음 */}
        <div className={styles.combinedPanel}>
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
        </div>
        {/* 오른쪽 패널 */}
        <div className={styles.rightPanel}>
          <WorkResultPanel
            result={result}
            originalMemoryId={selectedMemory?.memoryid}
            originalMemoryTitle={selectedMemory?.title}
          />
        </div>
      </div>
    </>
  );
}

export default TextToTextMain;