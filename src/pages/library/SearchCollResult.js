import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // URL 파라미터 사용
import apiClient from "../../utils/axios"; // API 클라이언트
import { AuthContext } from "../../AuthProvider";
import axios from "axios";

import CollGrid from "../../components/common/CollGrid";
import PageHeader from "../../components/common/PageHeader";

function SearchCollResult() {
  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/");
      return;
    }
  });

  // URL에서 검색어를 추출 (쿼리 파라미터)
  const location = useLocation(); // 현재 URL 정보
  const searchQuery = new URLSearchParams(location.search).get("query");
  const searchType = new URLSearchParams(location.search).get("type");
  const navigate = useNavigate();
  const [searchedColls, setSearchedColls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  useEffect(() => {
    console.log("💬 URL Params - query:", searchQuery);
    console.log("💬 URL Params - type:", searchType);
  }, [searchQuery, searchType]);

  //검색어에 따른 컬렉션 불러오기
  useEffect(() => {
    // 태그 검색
    if (searchType === "tag") {
      if (!searchQuery) return;

      const fetchSearchedColls = async () => {
        try {
          setLoading(true);
          const response = await secureApiRequest(
            `/api/library/search/tag?query=${searchQuery}&userid=${userid}`,
            { method: "GET" }
          );
          setSearchedColls(response.data); // 검색 결과 저장
        } catch (error) {
          console.error("검색 요청 실패 : ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSearchedColls();
    } else if (searchType === "collection") {
      console.log("컬렉션 검색 수행");
      if (!searchQuery) return;

      const fetchSearchedColls = async () => {
        try {
          setLoading(true);
          const response = await secureApiRequest(
            `/api/library/search/collection?query=${searchQuery}&userid=${userid}`,
            { method: "GET" }
          );
          setSearchedColls(response.data); // 검색 결과 저장
        } catch (error) {
          console.error("검색 요청 실패 : ", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSearchedColls();
    }
  }, [searchQuery, searchType]);

  if (loading) {
    return <div>검색 중...</div>;
  }

  const handleLikeChange = async (updatedColl) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      await secureApiRequest(
        `/api/library/togglelike?userid=${userid}&collectionId=${updatedColl.collectionid}&isLiked=${updatedColl.userlike}`,
        { method: "POST" }
      );

      // UI 상태 변경 (setSearchedColls)
      setSearchedColls((prevState) =>
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

  const handleCollClick = (collectionId) => {
    navigate(`/library/detail/${collectionId}`);
  };

  return (
    <div>
      <PageHeader pagename={`${searchQuery} 검색 결과`} userid={userid} />
      <CollGrid
        colls={searchedColls}
        onCollClick={handleCollClick}
        onLikeChange={handleLikeChange}
      />
    </div>
  );
}
export default SearchCollResult;
