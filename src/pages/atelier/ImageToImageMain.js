import React, { useState, useEffect, useContext } from "react";
import MemoryList from "../../components/atelier/common/MemoryList";
import SettingPanel from "../../components/atelier/ImageToImage/SettingPanel";
import WorkResultPanel from "../../components/atelier/ImageToImage/WorkResultPanel";
import styles from "./ImageToImageMain.module.css";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

export default function ImageToImageMain() {
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
    fetch(`/atelier/imtim/collections/${userid}`)
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
        if (formatted.length > 0) {
          setSelectedCollectionId(formatted[0].id.toString());
        }
      })
      .catch((err) => console.error("컬렉션 가져오기 오류:", err));
  }, []);

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
        setResult(null);
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
    <>
      <PageHeader pagename={`Atelier`} />
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
            onGenerate={(dto) => {
              console.log("imagetoimagemain got dto", dto);
              const image = `http://localhost:8080/upload_files/memory_img/${dto.filename}`;
              setResult({
                status: "success",
                resultDto: dto,
                imageUrl: image,
              });
            }}
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
    </>
  );
}
