// src/pages/atelier/AtelierHome.js
import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AtelierHome.module.css";
import PageHeader from "../../components/common/PageHeader";
import { AuthContext } from "../../AuthProvider";

// 이미지 import
import text2textImg from "../../assets/images/feature-text2text.png";
import text2imageImg from "../../assets/images/feature-text2image.png";
import image2imageImg from "../../assets/images/feature-image2image.png";
import image2videoImg from "../../assets/images/feature-image2video.png";
// 무음 반복 배경 비디오
import atelierIntroVideo from "../../assets/videos/atelier_intro.mp4";

function AtelierHome() {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/user/login");
      return;
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    navigate("/");
    return null;
  }

  const features = [
    {
      title: "Text to Text",
      description: "기억을 새롭게 써내려갑니다.",
      route: "/atelier/text2text",
      imageUrl: text2textImg,
    },
    {
      title: "Text to Image",
      description: "기억을 이미지로 그려드립니다.",
      route: "/atelier/text2image",
      imageUrl: text2imageImg,
    },
    {
      title: "Image to Image",
      description: "이미지를 감성적으로 재탄생시킵니다.",
      route: "/atelier/image2image",
      imageUrl: image2imageImg,
    },
    {
      title: "Image to Video",
      description: "기억을 살아움직이게 합니다.",
      route: "/atelier/image2video",
      imageUrl: image2videoImg,
    },
  ];

  return (
    <>
      <PageHeader pagename="Atelier" />

      <div className={styles.container}>
        {/* <h2 className={styles.title}>Atelier</h2>  제거 */}

        {/* ① 소개 섹션: 배경 비디오 + 텍스트 */}
        <div className={styles.intro}>
          <video
            src={atelierIntroVideo}
            className={styles.introVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <p className={styles.introText}>
            Atelier는 여러분의 소중한 기억을 다양한 형태로 재탄생시키는
            공간입니다. <br /> 텍스트부터 이미지, 영상까지 AI와 함께 새로운
            감성으로 그려보세요.
          </p>
        </div>

        {/* ② 카드 그리드 */}
        <div className={styles.cardGrid}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className={styles.card}
              onClick={() => navigate(feature.route)}
            >
              <div className={styles.cardImageWrapper}>
                <img
                  src={feature.imageUrl}
                  alt={feature.title}
                  className={styles.cardImage}
                />
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AtelierHome;
