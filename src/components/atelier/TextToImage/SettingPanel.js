import React, { useState } from "react";
import styles from "./SettingPanel.module.css";

function SettingPanel({ selectedMemory, onGenerate }) {
  const [style, setStyle] = useState("");
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (!selectedMemory) return;

    fetch("/api/atelier/image/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memoryId: selectedMemory.memoryid,
        collectionId: selectedMemory.collectionid,
        originalText: selectedMemory.content,
        title: selectedMemory.title,
        userId: selectedMemory.userId || "demo",

        // 이미지 전용 필드
        style: style,
        prompt: prompt,
        memoryType: "image",
        memoryOrder: 0,
        saveToMemory: true,
      }),
    })
      .then((res) => res.json())
      .then((data) => onGenerate(data))
      .catch((err) => console.error("DALL·E generate error", err));
  };

  return (
    <div className={styles.settingPanel}>
      {selectedMemory ? (
        <>
          <div className={styles.field}>
            <label>제목</label>
            <input
              type="text"
              value={selectedMemory.title}
              readOnly
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label>내용</label>
            <textarea
              value={selectedMemory.content}
              readOnly
              className={styles.textarea}
              rows={8}
            />
          </div>

          <div className={styles.field}>
            <label>메모리 변환 옵션</label>
            <div className={styles.optionButtons}>
              <button className={styles.option}>AI 텍스트 변환</button>
              <button className={styles.optionActive}>AI 이미지 변환</button>
            </div>
          </div>

          <div className={styles.field}>
            <label>스타일</label>
            <input
              type="text"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className={styles.input}
              placeholder="예: 실사풍, 음식 광고 스타일"
            />
          </div>

          <div className={styles.field}>
            <label>기타 요청</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="예: 따뜻하고 먹음직스러운 분위기, 약간의 광택 강조"
            />
          </div>

          <div className={styles.footer}>
            <button className={styles.generateBtn} onClick={handleGenerate}>
              적용 →
            </button>
          </div>
        </>
      ) : (
        <p className={styles.placeholder}>왼쪽에서 메모리를 선택해주세요</p>
      )}
    </div>
  );
}

export default SettingPanel;