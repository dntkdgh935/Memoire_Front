import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // URL 파라미터 사용
import apiClient from "../../utils/axios"; // API 클라이언트
import { AuthContext } from "../../AuthProvider";
import axios from "axios";

import CollGrid from "../../components/common/CollGrid";
import PageHeader from "../../components/common/PageHeader";

function SearchCollResult() {
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

  // 좋아요/ 북마크 DB 변경 + 상태 변경 함수
  const handleActionChange = async (collectionId, actionType) => {
    if (isLoggedIn) {
      // Spring에 DB 변경 요청
      const isLiked =
        actionType === "userlike"
          ? !searchedColls.find((coll) => coll.collectionid === collectionId)
              .userlike
          : undefined;
      const isBookmarked =
        actionType === "userbookmark"
          ? !searchedColls.find((coll) => coll.collectionid === collectionId)
              .userbookmark
          : undefined;

      if (actionType === "userlike") {
        await secureApiRequest(
          `/api/library/togglelike?userid=${userid}&collectionId=${collectionId}&isLiked=${isLiked}`,
          { method: "POST" }
        );
      }
      if (actionType === "userbookmark") {
        await secureApiRequest(
          `/api/library/togglebm?userid=${userid}&collectionId=${collectionId}&isBookmarked=${isBookmarked}`,
          { method: "POST" }
        );
      }

      // UI 상태 변경
      setSearchedColls((prevState) =>
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
    navigate(`/library/detail/${collectionId}`);
  };

  return (
    <div>
      <PageHeader pagename={`${searchQuery} 검색 결과`} userid={userid} />
      <CollGrid
        colls={searchedColls}
        onActionChange={handleActionChange}
        onCollClick={handleCollClick}
      />
    </div>
  );
}
export default SearchCollResult;
