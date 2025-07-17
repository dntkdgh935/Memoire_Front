import React, { useState, useEffect } from "react";
import styles from "./SettingPanel.module.css";

export default function SettingPanel({ selectedMemory, onGenerate }) {
  const [title, setTitle] = useState(selectedMemory?.title || "");
  const [stylePrompt, setStylePrompt] = useState("");
  const [extraPrompt, setExtraPrompt] = useState("");

  useEffect(() => {
    setTitle(selectedMemory?.title || "");
  }, [selectedMemory]);

  const handleGenerate = () => {
    if (!selectedMemory || !stylePrompt) return;

    const payload = {
      title,
      imageUrl: selectedMemory.imageUrl,
      stylePrompt,
      extraPrompt,
    };

    fetch("/atelier/imtim/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("이미지 변환 실패");
        return res.json();
      })
      .then((dto) => onGenerate(dto))
      .catch((err) => console.error("변환 요청 오류:", err));
  };

  if (!selectedMemory) {
    return (
      <div className={styles.placeholder}>왼쪽에서 메모리를 선택해주세요</div>
    );
  }

  return (
    <div className={styles.settingPanel}>
      {/* 미리보기 */}
      <div className={styles.field}>
        <label>원본 이미지</label>
        <img
          src={`http://localhost:8080/upload_files/memory_img/${selectedMemory.filename}`}
          alt={selectedMemory.title}
          className={styles.imagePreview}
        />
      </div>

      {/* 제목 */}
      <div className={styles.field}>
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* 스타일 프롬프트 */}
      <div className={styles.field}>
        <label>스타일 프롬프트</label>
        <input
          type="text"
          value={stylePrompt}
          onChange={(e) => setStylePrompt(e.target.value)}
          placeholder="예: 빈티지, 모던"
          className={styles.input}
        />
      </div>

      {/* 기타 요청 */}
      <div className={styles.field}>
        <label>기타 요청</label>
        <textarea
          value={extraPrompt}
          onChange={(e) => setExtraPrompt(e.target.value)}
          placeholder="추가로 원하는 효과나 설명"
          className={styles.textarea}
          rows={2}
        />
      </div>

      {/* 실행 버튼 */}
      <div className={styles.footer}>
        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={!stylePrompt}
        >
          AI 이미지 생성 →
        </button>
      </div>
    </div>
  );
}
