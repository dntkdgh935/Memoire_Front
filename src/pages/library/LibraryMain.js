import React, { useState, useEffect } from "react";
import axios from "axios";
import TagBar from "../../components/library/TagBar";
import CollGrid from "../../components/common/CollGrid";
import CollCard from "../../components/common/CollCard";
import styles from "./LibraryMain.module.css"; // ✅

// src/pages/library/LibraryMain.js
function LibraryMain() {
  //tag bar 관련 states
  const [selectedTag, setSelectedTag] = useState("전체");
  const [topTags, setTopTags] = useState([]);

  // top 5 태그 가져오기
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/library/top5tags"
        );
        console.log("📦 tags:", res.data);
        setTopTags(res.data.map((tag) => tag.tagName));
      } catch (err) {
        console.error("🚨 태그 불러오기 실패", err);
      }
    };

    fetchTags();
  }, []);

  // Collection 목록 states
  // 하드코딩된 추천 컬렉션 데이터
  const [recColls, setRecColls] = useState([
    {
      collectionid: 1,
      authorid: "user1",
      collectionTitle: "자동차 여행",
      readCount: "1500",
      visibility: 1,
      createdDate: new Date(),
      titleEmbedding: "자동차 여행 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s1.jpg", // 절대경로로 수정
      textContent: "자동차 여행은 모험과 자유를 뜻합니다.",
      userlike: false,
      userbookmark: true,
    },
    {
      collectionid: 10,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s10.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 2,
      authorid: "user2",
      collectionTitle: "바닷가 여행",
      readCount: "2000",
      visibility: 1,
      createdDate: new Date(),
      titleEmbedding: "바닷가 여행 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s2.jpg", // 절대경로로 수정
      textContent: "바닷가는 여유로움과 평온함을 제공합니다.",
      userlike: true,
      userbookmark: false,
    },
    ,
    {
      collectionid: 9,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s9.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 3,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s3.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 4,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s4.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 5,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s5.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 6,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s6.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 7,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s7.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
    {
      collectionid: 8,
      authorid: "user3",
      collectionTitle: "연꽃이 예쁜 날",
      readCount: "800",
      visibility: 2,
      createdDate: new Date(),
      titleEmbedding: "연꽃 관련 임베딩 정보",
      viewType: "img",
      thumbnailPath: "/temp_imgs/s8.jpg", // 절대경로로 수정
      textContent: "연꽃은 깨끗함과 자연의 아름다움을 상징합니다.",
      userlike: true,
      userbookmark: true,
    },
  ]);
  const [recPage, setRecPage] = useState(0); // 현재 페이지 (스크롤용)
  const [hasMore, setHasMore] = useState(true); // 더 불러올 게 있는지
  const [loading, setLoading] = useState(false); // 중복 호출 방지

  return (
    <>
      {/* <h2>hello</h2> */}
      <TagBar
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        savedTags={topTags}
      />
      <CollGrid colls={recColls} />
      {/* <CollCard /> */}
    </>
  );
}

export default LibraryMain;
