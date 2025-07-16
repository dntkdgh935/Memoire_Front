// src/pages/library/LibraryMain.js
import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";

import { AuthContext } from "../../AuthProvider";
import axios from "axios";
import TagBar from "../../components/library/TagBar";
import CollGrid from "../../components/common/CollGrid";
import PageHeader from "../../components/common/PageHeader";

function LibraryMain() {
  // 페이지 이동용
  const navigate = useNavigate();

  // 유저 관련 states
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  //tag bar 관련 states
  const [selectedTag, setSelectedTag] = useState("전체");
  const [topTags, setTopTags] = useState([]);

  // Collection 목록 states
  const [recColls, setRecColls] = useState([]);

  // 1. 로그인 상태에 따라 - selectedTag 탭에 해당하는 추천 요청
  useEffect(() => {
    if (isLoggedIn) {
      //로그인됐을 경우, 로그인 아이디 보내기
      console.log("로그인 회원 추천");
      const fetchCollections = async () => {
        // TODO: 전체/ 팔로잉 <-- 이런 태그는 만들 수 없게 하기
        try {
          const res = await apiClient.get(
            `api/library/discover/${selectedTag}/${userid}`
          );
          setRecColls(res.data);
        } catch (err) {
          console.error("🚨 컬렉션 불러오기 실패", err);
        }
      };
      fetchCollections();
    }

    //로그인되지 않았을 경우, 전체 컬렉션 불러오기
    else {
      console.log("비회원 추천");
      const fetchCollections = async () => {
        try {
          const res = await apiClient(`api/library/discover/${selectedTag}`);
          setRecColls(res.data);
          console.log("비회원 추천 내용:", res.data);
        } catch (err) {
          console.error("🚨 컬렉션 불러오기 실패", err);
        }
      };
      fetchCollections();
    }
  }, [isLoggedIn, userid, selectedTag]);

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

  // 좋아요/ 북마크 DB 변경 + 상태 변경 함수
  const handleActionChange = async (collectionId, actionType) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      const isLiked =
        actionType === "userlike"
          ? !recColls.find((coll) => coll.collectionid === collectionId)
              .userlike
          : undefined;
      const isBookmarked =
        actionType === "userbookmark"
          ? !recColls.find((coll) => coll.collectionid === collectionId)
              .userbookmark
          : undefined;

      if (actionType === "userlike") {
        await axios.post(
          `http://localhost:8080/api/library/togglelike?userid=${userid}&collectionId=${collectionId}&isLiked=${isLiked}`
        );
      }
      if (actionType === "userbookmark") {
        await axios.post(
          `http://localhost:8080/api/library/togglebm?userid=${userid}&collectionId=${collectionId}&isBookmarked=${isBookmarked}`
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
                        actionType === "userlike"
                          ? "likeCount"
                          : "bookmarkCount"
                      ] - 1
                    : coll[
                        actionType === "userlike"
                          ? "likeCount"
                          : "bookmarkCount"
                      ] + 1,
              }
            : coll
        )
      );
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleCollClick = (collectionId) => {
    navigate(`detail/${collectionId}`);
  };

  //TODO: 페이지별로 PageHeader 넣기
  return (
    <>
      {/* <h2>hello</h2> */}
      {/* function PageHeader({ pagename, username }) { */}
      <PageHeader pagename="Discover" userid={userid} />
      <TagBar
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        savedTags={topTags}
      />
      <CollGrid
        colls={recColls}
        onActionChange={handleActionChange}
        onCollClick={handleCollClick}
      />
      {/* <CollCard /> */}
    </>
  );
}

export default LibraryMain;
