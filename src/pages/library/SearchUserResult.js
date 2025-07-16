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

  useEffect(() => {
    if (!searchQuery) return;

    const fetchSearchedUsers = async () => {
      try {
        setLoading(true);
        // API 요청 (검색어를 기반으로)
        const response = await apiClient.get(
          `/api/user/search?query=${searchQuery}&userid=${userid}`
        );
        setSearchedUsers(response.data); // 검색 결과 저장
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

  //TODO: UserView DTO 만들고(팔로우 정보 포함), UserGrid 내에 표시하기

  //   // 팔로우 상태 변경 (수정요망)
  //   const handleToggleFollow = async (authorid) => {
  //     try {
  //       // 0: 요청됨
  //       // 1: 팔로우중
  //       // 2: 차단
  //       // 3: 관계 없음 표시
  //       let nextStatus = null;
  //       switch (relStatus) {
  //         case "0":
  //           nextStatus = "3";

  //           break;
  //         case "1": //팔로잉 상태인 경우 버튼 누르면 -> 관계 삭제(3)
  //           nextStatus = "3";
  //           break;
  //         case "2": // 차단된 경우 버튼 누르면 -> 차단 해제
  //           nextStatus = "3";
  //           break;
  //         case "3": // 관계 없었던 경우 버튼(팔로우 요청) 누르면 -> 요청됨(0)
  //           nextStatus = "0";
  //           break;
  //         default:
  //           console.log("알 수 없는 상태");
  //           return; // 기본값을 처리하지 않음
  //       }

  //       await apiClient.post(`api/library/toggleFollow`, null, {
  //         params: {
  //           userid: myid,
  //           targetid: ownerid,
  //           nextRel: nextStatus,
  //         },
  //       });
  //       setRelStatus(nextStatus);
  //     } catch (e) {
  //       console.error("팔로우 토글 실패", e);
  //     }
  //   };
  //   console.log("방문한 아카이브 주인: " + ownerid);
  //   useEffect(() => {
  //     //console.log("방문한 아카이브 주인: " + userid);
  //   });

  //   // 차단 버튼
  //   const handleBlockClick = async () => {
  //     let nextStatus = null;
  //     switch (relStatus) {
  //       case "0": // 0: 요청됨/ 1: 팔로잉/ 2: 차단 / 3: 없음
  //         setRelStatus("2"); // 차단 상태로 변경
  //         nextStatus = "2";
  //         break;
  //       case "1": // 팔로잉 상태에서 '차단하기' 버튼 누를시..차단
  //         setRelStatus("2"); // 차단 상태로 변경
  //         nextStatus = "2";
  //         break;
  //       case "2":
  //         alert("이미 차단되었습니다");
  //         setRelStatus("2");
  //         nextStatus = "2";
  //         break; // <- 이 경우 apiclient로 요청 안보내게 하려면?
  //       case "3": // 아무 관계 없는 상태에서 '차단하기' 버튼 누를시..
  //         setRelStatus("2");
  //         nextStatus = "2";
  //     }
  //     if (nextStatus !== null) {
  //       await apiClient.post(`api/library/toggleFollow`, null, {
  //         params: {
  //           userid: myid,
  //           targetid: ownerid,
  //           nextRel: nextStatus,
  //         },
  //       });
  //     }
  //     setRelStatus(nextStatus);
  //   };

  const handleUserClick = (userId) => {
    navigate(`/user/profile/${userId}`);
  };

  return (
    <div>
      <PageHeader pagename={`${searchQuery} 검색 결과`} userid={userid} />
      <UserGrid
      // users={searchedUsers}
      // onFollowChange={handleFollowChange}
      // onUserClick={handleUserClick}
      />
    </div>
  );
}

export default SearchUserResult;
