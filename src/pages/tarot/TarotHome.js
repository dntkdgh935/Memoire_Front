// src/pages/tarot/TarotHome.js

import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import { AuthContext } from "../../AuthProvider";
import styles from "./TarotHome.module.css";

// assets/videos, assets/images 에 위치한 파일들
import tarotIntroVideo from "../../assets/videos/tarot_intro.mp4";
import oneCardImg    from "../../assets/images/tarot_1card.png";
import threeCardImg  from "../../assets/images/tarot_3card.png";
import crossCardImg  from "../../assets/images/tarot_celtic.png";

export default function TarotHome() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate("/");
    return null;
  }

  const spreads = [
    {
      key: 1,
      title: "원 카드 리딩",
      description: "한 장으로 핵심 메시지를 즉시 확인하세요.",
      route: "/tarot/read/1",
      imageUrl: oneCardImg,
    },
    {
      key: 3,
      title: "3장 스프레드",
      description: "과거·현재·미래를 한눈에 살펴봅니다.",
      route: "/tarot/read/3",
      imageUrl: threeCardImg,
    },
    {
      key: 10,
      title: "켈틱 크로스",
      description: "심층적인 10장 리딩으로 깊이 있는 통찰을 제공합니다.",
      route: "/tarot/read/10",
      imageUrl: crossCardImg,
    },
  ];

  return (
    <>
      <PageHeader pagename="Tarot" />

      <div className={styles.container}>
        {/* ① 소개 섹션 */}
        <div className={styles.intro}>
          <video
            src={tarotIntroVideo}
            className={styles.introVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <p className={styles.introText}>
            AI 타로 리딩에 오신 것을 환영합니다.
            <br />
            원하는 스프레드를 선택해 나만의 리딩을 경험해 보세요.
          </p>
        </div>

        {/* ② 체험하기 카드 그리드 */}
        <div className={styles.cardGrid}>
          {spreads.map((s) => (
            <div
              key={s.key}
              className={styles.card}
              onClick={() => navigate(s.route)}
            >
              <div className={styles.cardImageWrapper}>
                <img
                  src={s.imageUrl}
                  alt={s.title}
                  className={styles.cardImage}
                />
              </div>
              <h3 className={styles.cardTitle}>{s.title}</h3>
              <p className={styles.cardDesc}>{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}