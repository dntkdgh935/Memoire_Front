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

  // 팔로우 대상에 대해 요청/ 해제
  const handleToggleFollow = async (targetid, relStatus) => {
    try {
      // 0: 요청됨
      // 1: 팔로우중
      // 2: 차단
      // 3: 관계 없음 표시
      let nextStatus = null;
      switch (relStatus) {
        case "0":
          nextStatus = "3";
          break;
        case "1": //팔로잉 상태인 경우 버튼 누르면 -> 관계 삭제(3)
          nextStatus = "3";
          break;
        case "2": // 차단된 경우 버튼 누르면 -> 차단 해제
          nextStatus = "3";
          break;
        case "3": // 관계 없었던 경우 버튼(팔로우 요청) 누르면 -> 요청됨(0)
          nextStatus = "0";
          break;
        default:
          console.log("알 수 없는 상태");
          return; // 기본값을 처리하지 않음
      }

      // await apiClient.post(`api/library/toggleFollow`, null, {
      //   params: {
      //     userid: userid,
      //     targetid: targetid,
      //     nextRel: nextStatus,
      //   },
      // });
      await secureApiRequest(
        `/api/library/toggleFollow?userid=${userid}&targetid=${targetid}&nextRel=${nextStatus}`,
        {
          method: "POST",
        }
      );
      // ⭐️ searchedUsers 배열에서 해당 유저의 relStatus 값만 바꿔줌
      setSearchedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.userId === targetid
            ? { ...user, relStatusWLoginUser: nextStatus }
            : user
        )
      );
    } catch (e) {
      console.error("팔로우 토글 실패", e);
    }
  };

  const handleUserInfoCardClick = async (targetid) => {
    if (!isLoggedIn) {
      alert("로그인 후 아카이브 방문 가능합니다.");
    } else {
      try {
        if (userid == targetid) {
          console.log("내 아카이브로 이동");
          navigate(`/archive`);
        } else {
          navigate(`/library/archive/${targetid}`); // 이 URL로 이동
        }
      } catch (error) {
        alert("이동 실패!");
      }
    }
  };

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

  return (
    <div>
      <PageHeader pagename={`${searchQuery} 검색 결과`} userid={userid} />
      <UserGrid
        users={searchedUsers}
        onFollowBtnClick={handleToggleFollow}
        onInfoCardClick={handleUserInfoCardClick}
      />
    </div>
  );
}

export default SearchUserResult;
