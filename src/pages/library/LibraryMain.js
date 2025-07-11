// src/pages/library/LibraryMain.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import axios from "axios";
import TagBar from "../../components/library/TagBar";
import CollGrid from "../../components/common/CollGrid";
import styles from "./LibraryMain.module.css"; // ✅

function LibraryMain() {
  // 유저 관련 states
  const { isLoggedIn, userid } = useContext(AuthContext);

  //tag bar 관련 states
  const [selectedTag, setSelectedTag] = useState("전체");
  const [topTags, setTopTags] = useState([]);

  // Collection 목록 states
  const [recColls, setRecColls] = useState([]);

  // TagBar: top 5 태그 가져오기
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

  // 좋아요/ 북마크 DB 변경 + 상태 변경 함수
  const handleActionChange = async (collectionId, actionType) => {
    // Spring에 DB 변경 요청
    const isLiked =
      actionType === "userlike"
        ? !recColls.find((coll) => coll.collectionid === collectionId).userlike
        : undefined;
    const isBookmarked =
      actionType === "userbookmark"
        ? !recColls.find((coll) => coll.collectionid === collectionId)
            .userbookmark
        : undefined;

    if (actionType === "userlike") {
      await axios.post(
        `http://localhost:8080/api/library/togglelike?collectionId=${collectionId}&isLiked=${isLiked}`
      );
    }
    if (actionType === "userbookmark") {
      await axios.post(
        `http://localhost:8080/api/library/togglebm?collectionId=${collectionId}&isBookmarked=${isBookmarked}`
      );
    }

    // UI 상태 변경
    setRecColls((prevState) =>
      prevState.map((coll) =>
        coll.collectionid === collectionId
          ? {
              ...coll,
              [actionType]: !coll[actionType], // 상태 토글
              // 좋아요/북마크 카운트 업데이트
              [actionType === "userlike" ? "likeCount" : "bookmarkCount"]:
                coll[actionType] === true
                  ? coll[
                      actionType === "userlike" ? "likeCount" : "bookmarkCount"
                    ] - 1
                  : coll[
                      actionType === "userlike" ? "likeCount" : "bookmarkCount"
                    ] + 1,
            }
          : coll
      )
    );
  };

  return (
    <>
      {/* <h2>hello</h2> */}
      <TagBar
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        savedTags={topTags}
      />
      <CollGrid colls={recColls} onActionChange={handleActionChange} />
      {/* <CollCard /> */}
    </>
  );
}

export default LibraryMain;
