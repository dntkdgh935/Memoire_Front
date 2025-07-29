import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TarotDrawManual from "./TarotDrawManual";
import TarotDrawResult from "./TarotDrawResult";
import PageHeader from "../../components/common/PageHeader"; // ✅ 추가
import styles from "./TarotPage.module.css";

export default function TarotPage() {
  const navigate = useNavigate();
  const { count: countParam } = useParams(); // ✅ URL에서 count 파라미터 읽기
  const initialCount = parseInt(countParam || "3", 10); // fallback: 3장

  const [count, setCount] = useState(initialCount);
  const [selectedCards, setSelectedCards] = useState([]);
  const [reading, setReading] = useState("");

  // ✅ URL이 바뀔 때 count도 동기화
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  const goToMain = () => {
    navigate("/tarot");
  };

  return (
    <div className={styles.container}>
      <PageHeader pagename="타로 리딩" /> {/* ✅ 추가 */}
      {/* <h1 className={styles.header}>AI 타로 리딩</h1> */}

      <div className={styles.controls}>
        {!reading ? (
          <select
            className={styles.select}
            value={count}
            onChange={(e) => setCount(+e.target.value)}
          >
            <option value={1}>1장</option>
            <option value={3}>3장</option>
            <option value={10}>켈틱 크로스 (10장)</option>
          </select>
        ) : (
          <button className={styles.button} onClick={goToMain}>
            타로 메인페이지로
          </button>
        )}
      </div>

      {!reading && (
        <TarotDrawManual
          count={count}
          onCompleted={(cards, result) => {
            setSelectedCards(cards);
            setReading(result);
          }}
        />
      )}

      {reading && (
        <TarotDrawResult
          cards={selectedCards}
          reading={reading}
        />
      )}
    </div>
  );
}