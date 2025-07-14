import React from "react";
import styles from "./WorkResultPanel.module.css";

function WorkResultPanel({ result, originalMemoryId, originalMemoryTitle }) {
  console.log("✅ 전달되는 originalMemoryId:", originalMemoryId);
  console.log("✅ 전달되는 originalMemoryTitle:", originalMemoryTitle);

  if (!result || !result.content) {
    return (
      <div className={styles.panel}>
        <p className={styles.placeholder}>결과가 없습니다.</p>
      </div>
    );
  }

  const { date, content, memoryOrder, collectionId } = result;

  // ✅ GPT 결과와 상관없이 기존 제목 유지
  const title = originalMemoryTitle;

  // 새 메모리로 저장
  const handleSaveAsNewMemory = async () => {
    try {
      const response = await fetch("/api/atelier/text/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          collectionId,
          memoryType: "text",
          memoryOrder,
        }),
      });
      if (!response.ok) throw new Error("저장 실패");
      alert("새 메모리로 저장되었습니다!");
      window.location.reload(); // ✅ 저장 후 새로고침
    } catch (error) {
      console.error(error);
      alert("저장 중 오류 발생");
    }
  };

  // 원본 덮어쓰기
  const handleOverwriteMemory = async () => {
    if (!originalMemoryId) {
      alert("원본 메모리 ID가 없습니다.");
      return;
    }
    try {
      const response = await fetch(`/api/atelier/text/update/${originalMemoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });
      if (!response.ok) throw new Error("덮어쓰기 실패");
      alert("원본 메모리가 덮어쓰기 되었습니다!");
      window.location.reload(); // ✅ 덮어쓰기 후 새로고침
    } catch (error) {
      console.error(error);
      alert("업데이트 중 오류 발생");
    }
  };

  return (
    <div className={styles.panel}>
      {date && <div className={styles.date}>{date}</div>}
      <div className={styles.title}>{title}</div>
      <div className={styles.contentBox}>
        {content
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
      </div>

      <div className={styles.buttonGroup}>
        <button className={styles.secondaryBtn} onClick={handleOverwriteMemory}>
          원본 메모리 덮어쓰기
        </button>
        <button className={styles.primaryBtn} onClick={handleSaveAsNewMemory}>
          새 메모리로 저장
        </button>
      </div>
    </div>
  );
}

export default WorkResultPanel