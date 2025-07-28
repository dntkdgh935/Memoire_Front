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
  const [selectedTag, setSelectedTag] = useState("추천");
  const [topTags, setTopTags] = useState([]);
  const [recColls, setRecColls] = useState([]);
  const loaderRef = useRef(null);
  const scrollContainerRef = useRef(null); // CollGrid 내부 스크롤 영역
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);

  const recColls4LoginUser = async () => {
    if (isLoading) return;
    if (selectedTag === "") return;
    setIsLoading(true); // 🚩 요청 시작
    console.log("recColls4LoginUser 수행중, page:" + page);
    try {
      console.log("출력 페이지:" + page);
      const res = await secureApiRequest(
        `/api/library/discover/loginUser/${selectedTag}/${userid}`,
        {
          method: "GET",
          params: { page },
        }
      );
      if (res.data.content.length == 0) {
        // <== 지금 부모 프로세스를 다시 수행하게 하도록
        console.log("하나도 못받음");
        setPage(0);
        return;
      }
      setRecColls((prev) => [...prev, ...res.data.content]);
      return res.data;
    } catch (err) {
      console.error("요청중 실패");
      return [];
    } finally {
      setIsLoading(false); // ✅ 요청 완료
    }
  };

  // 비로그인 유저 - page에 대해 요청/ 못받을 경우, 0으로 페이지 변경, 받을 때까지 loading정보 가짐
  const fetchCollections4Anon = async () => {
    if (isLoading) return;
    if (selectedTag === "") return;
    setIsLoading(true); // 🚩 요청 시작
    console.log("fetchCollections4Anon 수행중, page: " + page);
    try {
      const res = await apiClient.get(
        `/api/library/discover/guest/${selectedTag}?page=${page}`
      );
      // 다 떨어진 경우 새로운 페이지로 변경
      if (res.data.content.length == 0) {
        console.log("하나도 못받음");
        setPage(0);
        return;
      }
      setRecColls((prev) => [...prev, ...res.data.content]);
      return res.data;
    } catch (err) {
      console.error("요청중 실패");
      return [];
    } finally {
      setIsLoading(false); // ✅ 요청 완료
    }
  };

  //1. 탭 변경시 setPage(-1)
  useEffect(() => {
    console.log("탭 선택: " + selectedTag);
    setRecColls([]);
    setPage(-1); // 탭이 변경되었음을 표현.
    // setIsLoading(false);
  }, [selectedTag, userid, isLoggedIn]);

  //2. 페이지 변경시 추천 ...
  useEffect(() => {
    console.log("페이지 변경됨:" + page);
    if (isLoggedIn) {
      if (page >= 0) {
        recColls4LoginUser();
      }
    } else if (!isLoggedIn) {
      // if (page == -1) {
      //   // 새 탭의 새 페이지로 도달한 경우
      //   setPage(0);
      // }
      if (page >= 0) {
        console.log("새 페이지:" + page);
        fetchCollections4Anon();
      }
    }
  }, [page, isLoggedIn]); // selectedTag

  //3. 기존 fetchCollections4Anon()완료 후 페이지 하단 감지
  useEffect(() => {
    if (!loaderRef.current || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("⏬ 하단 도달 → setPage to:");
          console.log(page + 1);
          setPage((prev) => prev + 1);
        }
      },
      {
        threshold: 0.5, // 컨테이너의 끝에 완전히 도달했을 때만 감지
      }
    );
    observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [selectedTag, recColls]);

  // //TODO: fetch후에도 추가 요청 가능한 경우 진행하도록 코드 추가 (현재 0->2로 가는 문제)
  // useEffect(() => {
  //   if (!isLoading && loaderRef.current) {
  //     const rect = loaderRef.current.getBoundingClientRect();
  //     const isVisible = rect.top < window.innerHeight;

  //     if (isVisible) {
  //       console.log("🔥 fetch 후에도 loader가 보이므로 page 추가 요청");
  //       setPage((prev) => prev + 1);
  //     }
  //   }
  // }, [recColls]);

  const handleLikeChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglelike?userid=${userid}&collectionId=${updatedColl.collectionid}&isLiked=${updatedColl.userlike}`,
        { method: "POST" }
      );

      // UI 상태 변경 (setSearchedColls)
      setRecColls((prevState) =>
        prevState.map((coll) => {
          //변경 신청된 coll을 찾아 updated coll로 대체
          if (coll.collectionid === updatedColl.collectionid) {
            // 새로운 객체로 기존 coll을 복사
            const updated = { ...coll };
            updated.userlike = !updated.userlike;
            updated.likeCount = updated.userlike
              ? updated.likeCount + 1 // 좋아요가 true이면 카운트 증가
              : updated.likeCount - 1; // 좋아요가 false이면 카운트 감소
            return updated;
          }
          return coll; // 조건에 맞지 않으면 그대로 반환
        })
      );
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleBookmarkChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglebm?userid=${userid}&collectionId=${updatedColl.collectionid}&isBookmarked=${updatedColl.userbookmark}`,
        { method: "POST" }
      );

      // UI 상태 변경 (setSearchedColls)
      setRecColls((prevState) =>
        prevState.map((coll) => {
          //변경 신청된 coll을 찾아 updated coll로 대체
          if (coll.collectionid === updatedColl.collectionid) {
            // 새로운 객체로 기존 coll을 복사
            const updated = { ...coll };
            updated.userbookmark = !updated.userbookmark; // 토글됨
            updated.bookmarkCount = updated.userbookmark
              ? updated.bookmarkCount + 1 // 토글 후 북마크가 true이면 카운트 증가
              : updated.bookmarkCount - 1; // 토글 후 북마크가 false이면 카운트 감소
            return updated;
          }
          return coll; // 조건에 맞지 않으면 그대로 반환
        })
      );
    } else {
      alert("로그인 후 사용 가능합니다.");
    }
  };

  const handleCollClick = (collectionId) => {
    navigate(`detail/${collectionId}`);
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await apiClient.get(
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

  //TODO: 페이지별로 PageHeader 넣기
  return (
    <>
      <PageHeader pagename="Discover" userid={userid} />
      <TagBar
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        savedTags={topTags}
      />

      {(recColls && recColls.length === 0) || !recColls ? (
        <p>컬렉션이 없습니다.</p> // recColls가 빈 배열일 경우 메시지 표시
      ) : (
        <CollGrid
          colls={recColls}
          onLikeChange={handleLikeChange}
          onBookmarkChange={handleBookmarkChange}
          onCollClick={handleCollClick}
          ref={scrollContainerRef}
        />
      )}
      <div ref={loaderRef} style={{ height: "40px" }} />
    </>
  );
}

export default LibraryMain;
