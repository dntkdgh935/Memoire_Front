import React, { useState } from "react";
import styles from "./SettingPanel.module.css";

function SettingPanel({ selectedMemory, onGenerate }) {
  const [style, setStyle] = useState("");
  const [prompt, setPrompt] = useState(""); // 실제로는 option 필드로 사용

  const handleGenerate = () => {
    if (!selectedMemory) return;

    fetch("/api/atelier/text/generate", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    inputText: selectedMemory.content,
        content: selectedMemory.content,
        style: style,
        memoryType: "text",
        collectionId: selectedMemory.collectionid,
        memoryOrder: 0,
        saveToMemory: true,
        // 선택적으로 추가 가능
        title: selectedMemory.title,
        option: prompt,
        memoryId: selectedMemory.memoryid,
        userId: selectedMemory.userId || "demo"
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error("응답 실패");
        return res.json();
      })
      .then(data => {
        console.log("✅ FastAPI 응답 성공:", data);
        onGenerate(data);
      })
      .catch(err => {
        console.error("❌ GPT generate error", err);
      });
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
              <button className={styles.option}>이대로 저장</button>
              <button className={styles.optionActive}>AI 텍스트 변환</button>
              <button className={styles.option}>AI 이미지 변환</button>
            </div>
          </div>

          <div className={styles.field}>
            <label>스타일</label>
            <input
              type="text"
              value={style}
              onChange={e => setStyle(e.target.value)}
              className={styles.input}
              placeholder="예: 노래 스타일"
            />
          </div>

          <div className={styles.field}>
            <label>기타 요청</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className={styles.textarea}
              rows={3}
              placeholder="예: 슬픈 발라드 가사 형식으로 작성"
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