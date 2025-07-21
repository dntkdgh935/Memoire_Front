import React, { useEffect, useState } from "react";
import axios from "axios"; // ✅ axios import
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/TextToText/SettingPanel";
import WorkResultPanel from "../../components/atelier/TextToText/WorkResultPanel";
import styles from "./TextToTextMain.module.css";
import PageHeader from "../../components/common/PageHeader";

function TextToTextMain() {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [memories, setMemories] = useState([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [result, setResult] = useState(null);

  const userId = sessionStorage.getItem("userId"); // ✅ 로그인된 유저 ID

  const selectedMemory =
    selectedMemoryId && memories.length > 0
      ? memories.find(
          (m) => m.memoryid?.toString() === selectedMemoryId?.toString()
        )
      : null;

  // ✅ 컬렉션 목록 불러오기
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await axios.get(`/api/collections/${userId}`);
        setCollections(response.data);
        if (response.data.length > 0) {
          setSelectedCollectionId(response.data[0].collectionid.toString());
        }
      } catch (error) {
        console.error("컬렉션 가져오기 실패:", error);
      }
    };

    if (userId) {
      fetchCollections();
    }
  }, [userId]);

  // ✅ 해당 컬렉션의 메모리 목록 불러오기
  useEffect(() => {
    if (!selectedCollectionId) return;

    fetch(`/api/atelier/text/memories/${selectedCollectionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("메모리 목록 조회 실패");
        return res.json();
      })
      .then((data) => {
        const textMemories = data.filter(
          (memory) => memory.memoryType?.toLowerCase() === "text"
        );
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
      <PageHeader pagename={"Atelier"} />
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
          <SettingPanel
            selectedMemory={selectedMemory}
            onGenerate={setResult}
          />
        </div>

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