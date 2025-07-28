import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../AuthProvider";
import PageHeader from "../../components/common/PageHeader";
import styles from "./TarotDeckPage.module.css"; // CSS 따로 만들면 여기에 연결
import axios from "axios";

export default function TarotDeckPage() {
  const { isLoggedIn, secureApiRequest } = useContext(AuthContext);
  const [cards, setCards] = useState([]);

  useEffect(() => {
  if (!isLoggedIn) return;

  axios.get("http://localhost:8000/tarot/cards")
    .then((res) => {
      if (res.status !== 200) throw new Error("타로 카드 데이터를 불러오지 못했습니다.");
      return res.data;
    })
    .then((data) => {
      setCards(data.cards); // 🔥 여기도 'cards'로 감싸져 있음 주의!
    })
    .catch((err) => {
      console.error("Tarot 카드 불러오기 실패:", err);
    });
}, [isLoggedIn]);

  return (
    <>
      <PageHeader pagename="타로 카드 도감" />
      <div className={styles.deckContainer}>
        {cards.map((card) => (
          <div className={styles.card} key={card.id}>
            <img
              className={styles.cardImage}
              src={card.image}
              alt={card.name}
              loading="lazy"
            />
            <h3 className={styles.cardName}>{card.name}</h3>
            <ul className={styles.keywordList}>
              {card.keywords?.map((kw, idx) => (
                <li key={idx}>{kw}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}