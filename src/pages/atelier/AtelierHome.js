// src/pages/atelier/AtelierHome.js

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AtelierHome.module.css";
import PageHeader from "../../components/common/PageHeader";

function AtelierHome() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Text to Text",
      description: "기억을 글로 다시 써보세요.",
      route: "/atelier/text2text",
    },
    {
      title: "Text to Image",
      description: "기억을 이미지로 그려보세요.",
      route: "/atelier/text2image",
    },
    {
      title: "Image to Image",
      description: "이미지를 감성적으로 변환해보세요.",
      route: "/atelier/image2image",
    },
    {
      title: "Image to Video",
      description: "기억을 영상으로 만들어보세요.",
      route: "/atelier/image2video",
    },
  ];

  return (
    <>
      <PageHeader pagename={`Atelier`} />
      <div className={styles.container}>
        <h2 className={styles.title}>Atelier</h2>
        <div className={styles.cardGrid}>
          {features.map((feature) => (
            <div
              key={feature.title}
              className={styles.card}
              onClick={() => navigate(feature.route)}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default AtelierHome;
