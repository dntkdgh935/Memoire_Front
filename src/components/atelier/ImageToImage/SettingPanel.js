import React, { useState, useEffect, useContext } from "react";
import styles from "./SettingPanel.module.css";
import { AuthContext } from "../../../AuthProvider";

export default function SettingPanel({ selectedMemory, onGenerate }) {
  const [stylePrompt, setStylePrompt] = useState("");
  const { secureApiRequest } = useContext(AuthContext);

  useEffect(() => {
    setStylePrompt("");
  }, [selectedMemory]);

  const handleGenerate = async () => {
    if (!selectedMemory || !stylePrompt) return;
    console.log("selectedMemory:", selectedMemory);

    const payload = {
      prompt: stylePrompt,
      image_url: `http://localhost:8080/upload_files/memory_img/${selectedMemory.filename}`,
    };

    console.log("payload ▶", payload);

    try {
      const res = await secureApiRequest("/atelier/imtim/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      console.error("❌ 변환 요청 오류:", err);
    }
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
          value={selectedMemory.title}
          readOnly
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
