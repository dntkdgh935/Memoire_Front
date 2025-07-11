// src/components/atelier/TextToText/SettingPanel.js
import React, { useState, useEffect } from "react";

function SettingPanel({ selectedMemoryId, onGenerate }) {
  const [memory, setMemory] = useState(null);
  const [style, setStyle] = useState("");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (selectedMemoryId) {
      fetch(`/api/atelier/text/memory/${selectedMemoryId}`)
        .then(res => res.json())
        .then(data => setMemory(data))
        .catch(err => console.error("Memory load error", err));
    }
  }, [selectedMemoryId]);

  const handleGenerate = () => {
    if (!memory) return;
    fetch("/api/atelier/text/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memoryId: memory.memoryId,
        collectionId: memory.collectionid,
        style: style,
        prompt: prompt,
        originalText: memory.content,
        title: memory.title,
        userId: memory.userId, // 필드명 확인 필요
      }),
    })
      .then(res => res.json())
      .then(data => onGenerate(data))
      .catch(err => console.error("GPT generate error", err));
  };

  return (
    <div>
      {memory ? (
        <>
          <h3>{memory.title}</h3>
          <p>{memory.content}</p>
        </>
      ) : (
        <p>메모리를 선택해주세요</p>
      )}

      <div>
        <label>스타일 선택</label>
        <select value={style} onChange={e => setStyle(e.target.value)}>
          <option value="">선택</option>
          <option value="감성적">감성적</option>
          <option value="사실적">사실적</option>
        </select>
      </div>

      <textarea
        placeholder="예: 이 기억을 시적으로 표현해줘"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <button onClick={handleGenerate}>생성하기</button>
    </div>
  );
}

export default SettingPanel;