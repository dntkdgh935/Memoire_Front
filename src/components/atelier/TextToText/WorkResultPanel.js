// src/components/atelier/TextToText/WorkResultPanel.js
import React from "react";
import styles from "./WorkResultPanel.module.css";

function WorkResultPanel({ result }) {
  if (!result) {
    return <div className={styles.panel}>결과가 없습니다.</div>;
  }

  const { date, title, content } = result;

  return (
    <div className={styles.panel}>
      {/* 날짜 출력 */}
      {date && <div className={styles.date}>{date}</div>}

      {/* 제목 출력 */}
      <div className={styles.title}>{title}</div>

      {/* 본문 출력 */}
      <div className={styles.contentBox}>
        {content.split("\n").map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>

      {/* 버튼 그룹 */}
      <div className={styles.buttonGroup}>
        <button className={styles.secondaryBtn}>원본 메모리 덮어쓰기</button>
        <button className={styles.primaryBtn}>새 메모리로 저장</button>
      </div>
    </div>
  );
}

export default WorkResultPanel;