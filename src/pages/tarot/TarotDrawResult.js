import React from "react";
import styles from "./TarotPage.module.css";

export default function TarotDrawResult({ cards, reading }) {
  return (
    <>
      <div className={styles.spread}>
        {cards.map((c) => (
          <div key={c.id} className={styles.card}>
            <img src={c.image} alt={c.name} />
            <div className={styles.cardName}>{c.name}</div>
          </div>
        ))}
      </div>

      <div className={styles.reading}>
        <h2>리딩 결과</h2>
        {reading.split("\n\n").map((para, i) => (
          <p key={i} style={{ marginBottom: "1rem" }}>
            {para}
          </p>
        ))}
      </div>
    </>
  );
}