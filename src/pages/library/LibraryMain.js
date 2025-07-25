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
      return res.data;
    } catch (err) {
      console.error("요청중 실패");
      return [];
    }
  };

  const fetchCollections4Anon = async () => {
    console.log("fetchCollections4Anon 수행중");
    try {
      const res = await apiClient.get(`/api/library/discover/${selectedTag}`);
      console.log("받은 데이터");
      console.log(res.data);
      setRecColls(res.data);
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
      const res = await secureApiRequest(`/api/library/recommend/${userid}`, {
        method: "GET",
        params: { page },
      });
      console.log("받은 데이터");
      console.log(res.data.content);
      //누적: rec4Anon에도 적용할 것
      setRecColls((prev) => [...prev, ...res.data.content]);
      return res.data;
    } catch (err) {
      console.error("요청중 실패");
      return [];
    }
  };

  const recColls4Anon = async () => {
    console.log("recColls4Anon 수행중");
    try {
      const res = await apiClient.get(`/api/library/recommend/guest`, {
        params: { page },
      });
      console.log("받은 데이터");
      console.log(res.data.content);
      setRecColls(res.data.content);
      return res.data;
    } catch (err) {
      console.error("요청중 실패");
      return [];
    }
  };

  // 탭 클릭 지정 완료시 수행
  useEffect(() => {
    //로그인시
    if (isLoggedIn) {
      setRecColls([]); // 💥 추천 결과 초기화
      setPage(0); // 💥 페이지 초기화

      switch (selectedTag) {
        case "추천":
          recColls4LoginUser();
          console.log(recColls);
          break;
        default: //팔로잉, 기타 태그 처리
          console.log("선택 탭에 따라 처리:" + selectedTag);
          fetchCollections4LoginUser();
          break;
      }
    }

    //비로그인시
    else {
      fetchCollections4Anon();
    }
  }, [selectedTag, userid, isLoggedIn]);

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
        await secureApiRequest(
          `/api/library/togglelike?userid=${userid}&collectionId=${collectionId}&isLiked=${isLiked}`,
          {
            method: "POST",
          }
        );
      }
      if (actionType === "userbookmark") {
        await secureApiRequest(
          `/api/library/togglebm?userid=${userid}&collectionId=${collectionId}&isBookmarked=${isBookmarked}`,
          {
            method: "POST",
          }
        );
      }

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

  //페이지 하단 감지해 페이지 증가(setPage)
  useEffect(() => {
    if (!loaderRef.current || selectedTag !== "추천") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          console.log("⏬ 하단 도달 → 다음 페이지 요청");
          setPage((prev) => prev + 1);
        }
      },
      //{ threshold: 1.0 } ***********안되면 쿰백 **************
      {
        threshold: 1.0, // 컨테이너의 끝에 완전히 도달했을 때만 감지
      }
    );

    observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [selectedTag]);

  useEffect(() => {
    if (selectedTag === "추천" && isLoggedIn && page !== 0) {
      recColls4LoginUser();
    }
  }, [page]);

  //TODO: 페이지별로 PageHeader 넣기
  return (
    <>
      <PageHeader pagename="Discover" userid={userid} />
      <TagBar
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        savedTags={topTags}
      />
      <div
        ref={scrollContainerRef}
        style={{
          height: "80vh",
          overflowY: "auto",
        }}
      >
        {(recColls && recColls.length === 0) || !recColls ? (
          <p>컬렉션이 없습니다.</p> // recColls가 빈 배열일 경우 메시지 표시
        ) : (
          <CollGrid
            colls={recColls}
            onActionChange={handleActionChange}
            onCollClick={handleCollClick}
          />
        )}
      </div>
      <div ref={loaderRef} style={{ height: "40px" }} />
    </>
  );
}

export default LibraryMain;
