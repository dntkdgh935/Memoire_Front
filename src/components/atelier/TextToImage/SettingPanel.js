import React, { useState, useContext, useEffect } from "react";
import styles from "./SettingPanel.module.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../AuthProvider";

function SettingPanel({ selectedMemory, onGenerate }) {
  const [style, setStyle] = useState("");
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();
  const { secureApiRequest } = useContext(AuthContext);

  useEffect(() => {
    setStyle("");
    setPrompt("");
  }, [selectedMemory]);

  const handleGenerate = async () => {
    if (!selectedMemory) return;

    onGenerate({ status: "loading" });

    const requestBody = {
      memoryId: selectedMemory.memoryid,
      collectionId: selectedMemory.collectionid,
      title: selectedMemory.title || "",
      userId: selectedMemory.userId || "demo",
      style: style,
      prompt: prompt,
      memoryType: "image",
      memoryOrder: 0,
      saveToMemory: true,
      content: selectedMemory.content || ""
    };

    try {
      const res = await secureApiRequest("/api/atelier/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (res.status === 413) {
        alert("⚠️ 생성된 결과가 너무 커서 저장할 수 없습니다.");
        return;
      }

      if (res.status < 200 || res.status >= 300) {
        const errorText = res.data?.message || "이미지 변환 실패";
        throw new Error(errorText);
      }

      const dto = res.data;
      console.log("✅ received DTO in SettingPanel", dto);
      onGenerate(dto);
    } catch (err) {
      console.error("❌ 이미지 변환 요청 오류:", err);
      onGenerate({ status: "error", errorMessage: err.message });
    }
  };

  const handleNavigateToText = () => {
    navigate("/atelier/text2text");
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
              value={selectedMemory.content || ""}
              readOnly
              className={styles.textarea}
              rows={8}
            />
          </div>

          <div className={styles.field}>
            <label>메모리 변환 옵션</label>
            <div className={styles.optionButtons}>
              <button
                className={styles.option}
                onClick={handleNavigateToText}
              >
                AI 텍스트 변환
              </button>
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
            <button
              className={styles.generateBtn}
              onClick={handleGenerate}
              disabled={!style && !prompt}
            >
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