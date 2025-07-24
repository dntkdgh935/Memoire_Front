// src/pages/tarot/TarotPage.js

import React, { useState } from "react";
import styles from "./TarotPage.module.css";

export default function TarotPage() {
  const [count, setCount]     = useState(3);
  const [cards, setCards]     = useState([]);
  const [reading, setReading] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleDraw = async () => {
    setLoading(true);
    setError("");

    const accessToken  = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!accessToken || !refreshToken) {
      alert("타로 리딩을 보려면 먼저 로그인하세요.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/tarot/read/${count}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
            "RefreshToken": `Bearer ${refreshToken}`,
          },
          credentials: "include",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setCards(Array.isArray(data.cards) ? data.cards : []);
      setReading(typeof data.reading === "string" ? data.reading : "");
    } catch (err) {
      console.error("Tarot fetch error:", err);
      setCards([]);
      setReading("");
      setError("카드를 불러오는 중 오류가 발생했습니다.");
    }

    setLoading(false);
  };

   return (
    
    <div className={styles.container}>
      <h1 className={styles.header}>AI 타로 리딩</h1>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={count}
          onChange={(e) => setCount(+e.target.value)}
        >
          <option value={1}>1장</option>
          <option value={3}>3장</option>
          <option value={10}>켈틱 크로스 (10장)</option>
        </select>
        <button
          className={styles.button}
          onClick={handleDraw}
          disabled={loading}
        >
          {loading ? "뽑는 중…" : "카드 뽑기 & 리딩"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.spread}>
        {cards.length > 0 ? (
          cards.map((c) => (
            <div key={c.id} className={styles.card}>
              <img src={c.image} alt={c.name} />
              <div className={styles.cardName}>{c.name}</div>
            </div>
          ))
        ) : (
          !loading && (
            <p className={styles.emptyMessage}>
              아직 카드를 뽑지 않았습니다.
            </p>
          )
        )}
      </div>

      {reading && (
        <div className={styles.reading}>
          <h2>리딩 결과</h2>
          {reading
      .split("\n\n")                // 빈 줄 단락 구분자
      .map((para, i) => (
        <p key={i} style={{ marginBottom: "1rem" }}>
          {para}
        </p>
      ))
    }
        </div>
      )}
    </div>
  );
}