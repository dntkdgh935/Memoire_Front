import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // URL 파라미터 사용
import apiClient from "../../utils/axios"; // API 클라이언트
import { AuthContext } from "../../AuthProvider";
import axios from "axios";

import UserGrid from "../../components/library/UserGrid"; // 사용자 그리드 컴포넌트
import PageHeader from "../../components/common/PageHeader";

function SearchUserResult() {
  // URL에서 검색어를 추출 (쿼리 파라미터)
  const location = useLocation(); // 현재 URL 정보
  const searchQuery = new URLSearchParams(location.search).get("query");
  const navigate = useNavigate();
  const [searchedUsers, setSearchedUsers] = useState([]); // 검색된 사용자 목록
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  const handleFollowChange = async () => {};
  useEffect(() => {
    if (!searchQuery) return;

    const fetchSearchedUsers = async () => {
      try {
        setLoading(true);
        // API 요청 (검색어를 기반으로)
        //TODO: 수정
        const response = await secureApiRequest(
          `/api/library/search/user?query=${searchQuery}&loginUserid=${userid}`,
          { method: "GET" }
        );
        setSearchedUsers(response.data); // 검색 결과 저장
        console.log("검색된 사용자: ");
        console.log(response.data);
      } catch (error) {
        console.error("사용자 검색 요청 실패 : ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchedUsers();
  }, [searchQuery]);

  if (loading) {
    return <div>검색 중...</div>;
  }
  const handleUserClick = (userId) => {
    navigate(`/user/profile/${userId}`);
  };

  return (
    <div>
      <PageHeader pagename={`${searchQuery} 검색 결과`} userid={userid} />
      <UserGrid users={searchedUsers} />
    </div>
  );
}

export default SearchUserResult;
