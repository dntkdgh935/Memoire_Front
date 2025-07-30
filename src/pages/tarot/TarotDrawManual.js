import React, { useEffect, useState, useContext } from "react";
import styles from "./TarotDrawManual.module.css";
import { AuthContext } from "../../AuthProvider";
import axios from "axios";

export default function TarotDrawManual({ count, onCompleted }) {
  const [deck, setDeck] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const res = await authContext.secureApiRequest("http://127.0.0.1:8000/tarot/draw/30", {
          method: "GET"
        });
        const data = res.data;
        if (!data.cards || !Array.isArray(data.cards)) {
          throw new Error("카드 목록이 올바르지 않습니다.");
        }
        setDeck(data.cards);
        setFlipped(Array(data.cards.length).fill(false));
        setSelected([]);
      } catch (err) {
        console.error("카드 덱 불러오기 실패:", err);
      }
    };
    fetchDeck();
  }, [count]);

  const handleClick = async (i) => {
    if (flipped[i] || selected.length >= count) return;

    const newFlipped = [...flipped];
    newFlipped[i] = true;
    setFlipped(newFlipped);

    const newSelected = [...selected, deck[i]];
    setSelected(newSelected);

    if (newSelected.length === count) {
      setLoading(true);

      // ✅ 카드 구조 변환 (불필요 필드 제거 + meaning 보장)
      const convertedCards = newSelected.map((card) => ({
        name: card.name || "",
        image: card.image || "",
        meaning: Array.isArray(card.keywords)
          ? card.keywords.join(", ")
          : (typeof card.meaning === "string" ? card.meaning : "의미 없음"),
      }));

      console.log("🃏 보내는 카드 목록", convertedCards);

      if (!convertedCards.length) {
        alert("카드 데이터가 비어 있습니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.post(
          `http://127.0.0.1:8000/tarot/read/${count}`,
          { cards: convertedCards },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        );

        const data = response.data;
        if (!data.reading) throw new Error("리딩 결과가 없습니다.");
        onCompleted(newSelected, data.reading);
      } catch (err) {
        console.error("❌ 타로 리딩 실패:", err);
        if (err.response) {
          console.error("🔍 상태 코드:", err.response.status);
          console.error("🔍 에러 메시지:", err.response.statusText);
          console.error("🔍 에러 응답 데이터:", err.response.data);
        } else {
          console.error("❌ 네트워크 또는 요청 설정 문제:", err.message);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className={styles.container}>
      {/* 🎥 상단 마법사 영상 */}
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
                    src={
                      card.image.startsWith("/cards/")
                        ? card.image
                        : `/cards/${card.image}`
                    }
                    alt={card.name}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔮 리딩 중 오버레이 */}
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