import React, { useState, useEffect, useContext } from "react";
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/ImageToVideo/SettingPanel";
import WorkResultPanel from "../../components/atelier/ImageToVideo/WorkResultPanel";
import styles from "./ImageToVideoMain.module.css";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";

export default function ImageToVideoMain() {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [memories, setMemories] = useState([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [result, setResult] = useState(null);
  const { isLoggedIn, userid } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/");
      return;
    }
  }, [isLoggedIn, navigate]);

  // 컬렉션 목록 조회
  useEffect(() => {
    fetch(`/atelier/video/collections/${userid}`)
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
  }, []);

  // 2) 선택된 컬렉션의 메모리 목록 가져오기
  useEffect(() => {
    fetch(`/atelier/video/collections/${selectedCollectionId}/memories`)
      .then((res) => {
        if (!res.ok) throw new Error("메모리 조회 실패");
        return res.json();
      })
      .then((data) => {
        setMemories(data);
        setSelectedMemoryId(null);
        setResult(null); // 컬렉션 바뀌면 이전 결과 초기화
      })
      .catch((err) => {
        console.error("메모리 가져오기 오류:", err);
        setMemories([]);
      });
  }, [selectedCollectionId]);

  // 선택된 메모리 객체
  const selectedMemory =
    selectedMemoryId && memories.length > 0
      ? memories.find(
          (m) => m.memoryid?.toString() === selectedMemoryId.toString()
        )
      : null;

  return (
    <div className={styles.container}>
      {/* 좌측 패널: 컬렉션 & 메모리 리스트 */}
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

      {/* 중앙 패널: TTS → 비디오 설정 */}
      <div className={styles.centerPanel}>
        <SettingPanel
          selectedMemory={selectedMemory}
          onGenerate={(dto) =>
            setResult({
              status: "success",
              resultDto: dto,
              videoUrl: dto.getVideoUrl?.() ?? dto.videoUrl,
            })
          }
        />
      </div>

      {/* 우측 패널: 생성 결과 (로딩·에러·영상) */}
      <div className={styles.rightPanel}>
        <WorkResultPanel
          result={result}
          originalMemoryId={selectedMemoryId}
          originalMemoryTitle={selectedMemory?.title}
          selectedCollectionId={selectedCollectionId}
        />
      </div>
    </div>
  );
}
