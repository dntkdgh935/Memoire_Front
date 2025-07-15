import React, { useEffect, useState } from "react";
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/ImageToImage/SettingPanel";
import WorkResultPanel from "../../components/atelier/ImageToImage/WorkResultPanel";
import styles from "./ImageToImageMain.module.css";

export default function ImageToImageMain({ currentUserId }) {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [memories, setMemories] = useState([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [result, setResult] = useState(null);

  // 선택된 메모리 객체
  const selectedMemory =
    selectedMemoryId && memories.length > 0
      ? memories.find((m) => m.memoryid === selectedMemoryId)
      : null;

  // 컬렉션 목록 조회
  useEffect(() => {
    if (!currentUserId) return;
    fetch(`/atelier/imtim/collections/${currentUserId}`)
      .then((res) => {
        if (!res.ok) throw new Error("컬렉션 조회 실패");
        return res.json();
      })
      .then((data) => {
        const formatted = data.map((c) => ({
          id: c.collectionid,
          title: c.collectionTitle,
        }));
        setCollections(formatted);
        if (formatted.length > 0) setSelectedCollectionId(formatted[0].id);
      })
      .catch((err) => console.error("컬렉션 가져오기 오류:", err));
  }, [currentUserId]);

  // 해당 컬렉션 메모리 목록 조회
  useEffect(() => {
    if (!selectedCollectionId) return;
    fetch(`/atelier/imtim/collections/${selectedCollectionId}/memories`)
      .then((res) => {
        if (!res.ok) throw new Error("메모리 조회 실패");
        return res.json();
      })
      .then((data) => {
        setMemories(data);
        setSelectedMemoryId(null);
        setResult(null); // 새 컬렉션 선택 시 이전 결과 초기화
      })
      .catch((err) => {
        console.error("메모리 가져오기 오류:", err);
        setMemories([]);
      });
  }, [selectedCollectionId]);

  return (
    <div className={styles.container}>
      {/* 좌측: 컬렉션 / 메모리 리스트 */}
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

      {/* 중앙: 설정 패널 (원본 이미지, 스타일, 프롬프트) */}
      <div className={styles.centerPanel}>
        <SettingPanel
          selectedMemory={selectedMemory}
          currentUserId={currentUserId}
          onGenerate={(imageUrl) => setResult({ status: "success", imageUrl })}
        />
      </div>

      {/* 우측: 결과 패널 (로딩, 에러, 성공) */}
      <div className={styles.rightPanel}>
        <WorkResultPanel
          result={result}
          originalMemoryId={selectedMemoryId}
          selectedCollectionId={selectedCollectionId}
          originalMemoryTitle={selectedMemory?.title}
        />
      </div>
    </div>
  );
}
