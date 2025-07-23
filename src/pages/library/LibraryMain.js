// src/pages/library/LibraryMain.js
import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";

import { AuthContext } from "../../AuthProvider";
import axios from "axios";
import TagBar from "../../components/library/TagBar";
import CollGrid from "../../components/common/CollGrid";
import PageHeader from "../../components/common/PageHeader";

function LibraryMain() {
  const navigate = useNavigate();
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);
  const [selectedTag, setSelectedTag] = useState("전체");
  const [topTags, setTopTags] = useState([]);
  const [recColls, setRecColls] = useState([]);
  const loaderRef = useRef(null);
  const scrollContainerRef = useRef(null); // CollGrid 내부 스크롤 영역
  const MAX_ITEMS = 50; // 프론트 리셋 기준
  const [loading, setLoading] = useState(false);

  // **** '추천' 상태에서 recColl이 0개가 되면 30개씩 가져옴
  useEffect(() => {
    if (recColls.length === 0 && selectedTag === "추천") {
      console.log("🌀 비어 있어서 추천 요청");
      fetchMoreCollections();
    }
  }, [recColls.length, selectedTag]);

  // **** 추천된 컬렉션이 변할 때마다 observer 업데이트? (0이 될 때도 변하나?)
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMoreCollections();
      },
      {
        root: scrollContainerRef.current,
        threshold: 1.0,
      }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [loading]); //[recColls]); //[recColls]);

  // selectedTag / 로그인 상태 달라지면 수행됨.
  // 전체/ 팔로잉/ 태그 선택 모두 처리
  useEffect(() => {
    setRecColls([]); // 항상 초기화
    console.log("추천 리스트 초기화됨");

    if (selectedTag === "추천") return; // 추천은 위의 useEffect에서 처리

    const fetchCollections = async () => {
      try {
        if (isLoggedIn) {
          console.log("👤 로그인 사용자 태그 fetch:", selectedTag);
          const res = await apiClient.get(
            `api/library/discover/${selectedTag}/${userid}`
          );
          setRecColls(res.data);
        } else {
          if (selectedTag === "팔로잉") {
            alert("로그인 후 사용 가능합니다.");
          } else {
            console.log("👤 비회원 사용자 태그 fetch:", selectedTag);
            const res = await apiClient.get(
              `api/library/discover/${selectedTag}`
            );
            setRecColls(res.data);
          }
        }
      } catch (err) {
        console.error("🚨 컬렉션 불러오기 실패", err);
      }
    };

    fetchCollections();
  }, [selectedTag, isLoggedIn, userid]);

  // top tag들 가져오기
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

  // Collection을 top 30개씩 리턴하는 fetch 함수
  const fetchMoreCollections = async () => {
    console.log("fetchMoreCollection 실행!");
    if (loading) return;

    if (recColls.length >= MAX_ITEMS) {
      console.log("현재 총 컬렉션 수: " + recColls.length);
      console.log("🔄 프론트 리셋 실행");

      setRecColls([]); // 상태만 초기화
      window.scrollTo({ top: 0, behavior: "smooth" });

      return; // fetch는 하지 않음
    }

    setLoading(true);
    try {
      const res = await apiClient.get(
        isLoggedIn
          ? `/api/library/recommend/${userid}`
          : `/api/library/recommend/guest`
      );
      console.log("추천 컨트롤러 요청 완료");
      console.log("컨틀ㄹ러 반환:" + res.data.length);
      setRecColls((prev) => [...prev, ...res.data]);
    } catch (err) {
      console.error("🚨 추천 컬렉션 불러오기 실패", err);
    } finally {
      setLoading(false);
    }
  };

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
      // setRecColls((prevState) =>
      //   prevState.map((coll) =>
      //     coll.collectionid === collectionId
      //       ? {
      //           ...coll,
      //           [actionType]: !coll[actionType], // 상태 토글
      //           // 좋아요/북마크 카운트 업데이트
      //           [actionType === "userlike" ? "likeCount" : "bookmarkCount"]:
      //             coll[actionType] === true
      //               ? coll[
      //                   actionType === "userlike"
      //                     ? "likeCount"
      //                     : "bookmarkCount"
      //                 ] - 1
      //               : coll[
      //                   actionType === "userlike"
      //                     ? "likeCount"
      //                     : "bookmarkCount"
      //                 ] + 1,
      //         }
      //       : coll
      //   )
      // );
      setRecColls((prevState) =>
        prevState.map((coll) => {
          if (coll.collectionid !== collectionId) return coll;

          const updated = {
            ...coll,
            [actionType]: !coll[actionType],
            [actionType === "userlike" ? "likeCount" : "bookmarkCount"]:
              coll[actionType] === true
                ? coll[
                    actionType === "userlike" ? "likeCount" : "bookmarkCount"
                  ] - 1
                : coll[
                    actionType === "userlike" ? "likeCount" : "bookmarkCount"
                  ] + 1,
          };

          return updated;
        })
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
        scrollRef={scrollContainerRef}
        loaderRef={loaderRef}
      />
      {/* <CollCard /> */}
    </>
  );
}

export default LibraryMain;
