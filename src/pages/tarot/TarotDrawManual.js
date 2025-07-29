import React, { useEffect, useState, useContext } from "react";
import styles from "./TarotDrawManual.module.css";
import { AuthContext } from "../../AuthProvider";

const secureFastApiRequest = (path, options = {}, retry = true, authContext) => {
  const fastapiBaseUrl = "http://127.0.0.1:8000";
  return authContext.secureApiRequest(`${fastapiBaseUrl}${path}`, options, retry);
};

export default function TarotDrawManual({ count, onCompleted }) {
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    secureFastApiRequest(`/tarot/draw/30`, { method: "GET" }, true, authContext)
      .then((res) => {
        const data = res.data;
        console.log("🔮 받은 카드 목록:", data.cards);
        if (!data.cards || !Array.isArray(data.cards)) {
          throw new Error("카드 목록이 올바르지 않습니다.");
        }
        setDeck(data.cards);
        setFlipped(Array(data.cards.length).fill(false));
        setSelected([]);
      })
      .catch((err) => {
        console.error("카드 덱 불러오기 실패:", err);
      });
  }, [count]);

  const handleClick = (i) => {
    if (flipped[i] || selected.length >= count) return;

    const newFlipped = [...flipped];
    newFlipped[i] = true;
    setFlipped(newFlipped);

    const newSelected = [...selected, deck[i]];
    setSelected(newSelected);

    if (newSelected.length === count) {
      setLoading(true);
      secureFastApiRequest(
        `/tarot/read/${count}`,
        {
          method: "POST",
          data: JSON.stringify({ cards: newSelected }),
          headers: { "Content-Type": "application/json" },
        },
        true,
        authContext
      )
        .then((res) => {
          const data = res.data;
          if (!data.reading) throw new Error("리딩 결과가 없습니다.");
          onCompleted(newSelected, data.reading);
        })
        .catch((err) => {
          console.error("타로 리딩 실패:", err);
        })
        .finally(() => setLoading(false));
    }
  };

  return (
    <div className={styles.container}>
      {/* 🎥 마법사 영상 */}
      <div className={styles.videoBox}>
        <video
          src={require("../../assets/videos/tarot_wizard.mp4")}
          autoPlay
          muted
          loop
          playsInline
          className={styles.wizardVideo}
        />
      </div>

      {/* 💬 안내 문구 */}
      <p className={styles.message}>아래에서 카드를 선택해주세요.</p>

      {/* 🃏 카드 뿌리기 */}
      <div className={styles.cardContainer}>
        <div
          className={styles.cardSpread}
          style={{ width: `${deck.length * 30 + 100}px` }}
        >
          {deck.map((card, i) => (
            <div
              key={i}
              className={`${styles.cardWrapper} ${flipped[i] ? styles.flipped : ""}`}
              style={{ left: `${i * 30}px`, zIndex: i }}
              onClick={() => handleClick(i)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardBack}>
                  <img src="/cards/CardBacks.png" alt="카드 뒷면" />
                </div>
                <div className={styles.cardFront}>
                  <img
                    src={card.image.startsWith("/cards/") ? card.image : `/cards/${card.image}`}
                    alt={card.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading && (
  <div className={styles.loadingOverlay}>
    <video
      src={require("../../assets/videos/tarot_reading.mp4")}
      autoPlay
      muted
      loop
      playsInline
      className={styles.fullscreenVideo}
    />
    <div className={styles.loadingMessage}>
      카드 리딩 중입니다. 잠시 기다려주세요.
    </div>
  </div>
)}
    </div>
  );
}