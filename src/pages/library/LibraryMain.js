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
  // const hasFetchedInitial = useRef(false);
  const [isRep, setIsRep] = useState(false);

  const [page, setPage] = useState(0);

  const fetchCollections4LoginUser = async () => {
    console.log("fetchCollections4LoginUser 수행중");
    try {
      const res = await secureApiRequest(
        `/api/library/discover/${selectedTag}/${userid}`,
        {
          method: "GET",
        }
      );
      console.log("받은 데이터");
      console.log(res.data);
      setRecColls(res.data);
    } catch (err) {
      console.error("요청중 실패");
    }
  };

  const fetchCollections4Anon = async () => {
    console.log("fetchCollections4Anon 수행중, page: " + page);
    console.log("isRep:" + isRep);
    try {
      const res = await apiClient.get(
        `/api/library/discover/guest/${selectedTag}?page=${page}`
      );
      console.log("받은 데이터");
      console.log(res.data);
      if (res.data.content.length == 0) {
        // <== 지금 부모 프로세스를 다시 수행하게 하도록
        console.log("하나도 못받음");

        setPage(0);
        setIsRep(true);
        return;
      }
      setRecColls((prev) => [...prev, ...res.data.content]);
      return res.data;
    } catch (err) {
      console.error("요청중 실패");
      return [];
    }
  };

  const recColls4LoginUser = async () => {
    console.log("recColls4LoginUser 수행중");
    try {
      // const res = await apiClient.get(`/api/library/recommend/${userid}`, {
      //   params: { page },
      // });
      console.log("출력 페이지:" + page);
      const res = await secureApiRequest(`/api/library/recommend/${userid}`, {
        method: "GET",
        params: { page },
      });
      console.log("받은 데이터");
      console.log(res.data.content);

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
    }
  };

  // 1. 탭 클릭 지정 완료시, coll및 page 0으로 초기화
  // 하고 첫 추천(X)
  useEffect(() => {
    //로그인시
    setIsRep(false);
    setRecColls([]); // 💥 추천 결과 초기화
    setPage(0); // 💥 페이지 초기화
    // if (isLoggedIn) {
    //   setRecColls([]); // 💥 추천 결과 초기화
    //   setPage(0); // 💥 페이지 초기화

    //   switch (selectedTag) {
    //     case "추천":
    //       recColls4LoginUser();
    //       console.log(recColls);
    //       break;
    //     default: //팔로잉, 기타 태그 처리
    //       console.log("선택 탭에 따라 처리:" + selectedTag);
    //       fetchCollections4LoginUser();
    //       break;
    //   }
    // }
    // //비로그인시
    // else {
    //   setRecColls([]); // 💥 추천 결과 초기화
    //   setPage(0); // 💥 페이지 초기화
    // }
  }, [selectedTag, userid, isLoggedIn]);

  //페이지 변화 => 다음 페이지 요청 (-1~0도)
  useEffect(() => {
    //로그인+추천
    if (selectedTag === "추천" && isLoggedIn) {
      //&& page !== 0) {
      recColls4LoginUser();
    }
    //로그인 + 기타
    //비로그인
    else if (!isLoggedIn) {
      fetchCollections4Anon();
    }
  }, [page]);

  // //page ==0로 다시 변한 경우(무한추천용) 호출
  // useEffect(() => {
  //   if (!isRep) return; // 첫 호출은 이미 되었을 것이므로 다시 추천 x

  //   if (page === 0 && isLoggedIn && selectedTag == "추천") {
  //     recColls4LoginUser();
  //   } else if (page === 0 && !isLoggedIn) {
  //     fetchCollections4Anon();
  //   }
  // }, [page, isRep]);

  // top tag들 가져오기
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

  //페이지 하단 감지 => 감지해 페이지 증가(setPage)
  useEffect(() => {
    // if (!loaderRef.current || selectedTag !== "추천") return;
    if (!loaderRef.current) return;

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
  }, [selectedTag]);

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
