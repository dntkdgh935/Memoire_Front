// src/pages/atelier/TextToImageMain.js
import React, { useEffect, useState, useContext } from "react";
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/TextToImage/SettingPanel";
import WorkResultPanel from "../../components/atelier/TextToImage/WorkResultPanel";
import styles from "./TextToImageMain.module.css";
import PageHeader from "../../components/common/PageHeader";
import { AuthContext } from "../../AuthProvider";

function TextToImageMain() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext); // ✅ secureApiRequest 포함
  const userId = userid;

  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [memories, setMemories] = useState([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [result, setResult] = useState(null);

  const selectedMemory =
    selectedMemoryId && memories.length > 0
      ? memories.find((m) => m.memoryid?.toString() === selectedMemoryId.toString())
      : null;

  // ✅ 1) 컬렉션 목록 조회
  useEffect(() => {
    if (!isLoggedIn || !userId) return;

    const fetchCollections = async () => {
      try {
        const res = await secureApiRequest(`/api/collections/${userId}`);
        if (res.status !== 200) throw new Error("컬렉션 조회 실패");

        const data = res.data;
        const formatted = Array.isArray(data)
          ? data.map((c) => ({ id: c.collectionid.toString(), title: c.collectionTitle }))
          : [];

        setCollections(formatted);
        if (formatted.length > 0) {
          setSelectedCollectionId(formatted[0].id);
        }
      } catch (err) {
        console.error("컬렉션 가져오기 오류:", err);
      }
    };

    fetchCollections();
  }, [isLoggedIn, userId, secureApiRequest]);

  // ✅ 2) 메모리 목록 조회
  useEffect(() => {
    if (!selectedCollectionId) return;

    const fetchMemories = async () => {
      try {
        const res = await secureApiRequest(`/api/atelier/text/memories/${selectedCollectionId}`);
        if (res.status !== 200) throw new Error("메모리 목록 조회 실패");

        const data = res.data;
        const textMemories = Array.isArray(data)
          ? data.filter((m) => m.memoryType?.toLowerCase() === "text")
          : [];

        setMemories(textMemories);
        setSelectedMemoryId(null);
        setResult(null);
      } catch (err) {
        console.error("메모리 가져오기 실패:", err);
        setMemories([]);
      }
    };

    fetchMemories();
  }, [selectedCollectionId, secureApiRequest]);

  return (
    <>
      <PageHeader pagename="Atelier" />
      <div className={styles.container}>
        {/* 왼쪽 + 중앙 패널을 combinedPanel으로 완전히 묶음 */}
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

        {/* combinedPanel 바깥에 있어야 하는 오른쪽 패널 */}
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

export default TextToImageMain;