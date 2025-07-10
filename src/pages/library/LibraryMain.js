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

  // (로그인 가정)user001에 모든 collection 목록 가져오기
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/library/discover/all"
        );
        console.log("📦 Collections:", res.data);
        setRecColls(res.data);
      } catch (err) {
        console.error("🚨 컬렉션 불러오기 실패", err);
      }
    };

    fetchCollections();
  }, []);

  // Collection 목록 states
  // 하드코딩된 추천 컬렉션 데이터
  const [recColls, setRecColls] = useState([]);
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
