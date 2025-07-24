// // src/components/common/Header.js

import React, { useState, useContext, useEffect } from "react";
import apiClient from "../../utils/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaThLarge, FaUserCircle, FaBell, FaMoon, FaSun, } from "react-icons/fa";
import { IoLogoAngular } from "react-icons/io";
import { IoIosSearch } from "react-icons/io";
import styles from "./Header.module.css";
import { AuthContext } from "../../AuthProvider";
import NotificationDropdown from "./NotificationDropdown";
import { useTheme } from "../../ThemeContext";

function Header() {
  const [searchType, setSearchType] = useState("collection");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [showNotifications, setShowNotifications] = useState(false); // 알림 목록 토글 상태
  const [followReqs, setfollowReqs] = useState([]); // 팔로우 요청 목록
  const [hasNotifications, setHasNotifications] = useState(false); // 알림 배지 표시 여부

  const navigate = useNavigate();
  const { isLoggedIn, logout, userid, role } = useContext(AuthContext);

  const { useVideo, setUseVideo } = useTheme();
  const goAdmin = () => {
    navigate("/admin/main");
  };

  useEffect(() => {
    if (userid) {
      // 팔로우 요청 목록 가져오기
      apiClient
        .get(`/api/library/followreqs?userid=${userid}`)
        .then((response) => {
          console.log("🧜‍♀️ 받아온 팔로우 요청: ", response.data);
          setfollowReqs(response.data);
          setHasNotifications(response.data.length > 0); // 알림이 있으면 배지 표시
        })
        .catch((error) => {
          console.error("팔로우 요청 불러오기 실패", error);
        });
    }
  }, [userid]);

  // followReqs가 변경될 때마다 알림 배지 갱신
  useEffect(() => {
    setHasNotifications(followReqs.length > 0); // 요청이 남아 있으면 알림 배지 표시
  }, [followReqs]); // followReqs가 변경될 때마다 실행

  // 팔로우 요청 배지 클릭 시
  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  // useEffect(() => {
  //   if (searchType === "tag") {
  //     setSearchKeyword((prev) => {
  //       // 이미 #로 시작하면 그대로 두고, 아니면 # 추가
  //       return prev.startsWith("#") ? prev : `#${prev}`;
  //     });
  //   }
  // }, [searchType]);

  // 팔로우 요청 승인
  const handleFollowRequestApproval = (requesterid, targetid) => {
    // DB 에 입력
    console.log("🍑 팔로우 승인 진행 시작");
    apiClient
      .post(
        `/api/library/followapproval?requesterid=${requesterid}&targetid=${targetid}`
      ) // Query string으로 전달
      .then((response) => {
        // 승인 후 처리 (상태 갱신, 요청 목록 재조회 등)
        setfollowReqs((prev) =>
          prev.filter(
            (request) =>
              request.requesterid !== requesterid ||
              request.targetid !== targetid
          )
        );
        setHasNotifications((prev) => prev && prev.length > 0); // 요청이 남아 있으면 알림 배지 표시
      })
      .catch((error) => {
        console.error("팔로우 요청 승인 실패", error);
      });
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    console.log(`검색 실행: 타입=${searchType}, 키워드=${searchKeyword}`);
    // TODO: 검색 키워드 관련 조건 있으면 추가

    // 검색 처리 로직 여기에 추가

    try {
      if (searchType == "collection") {
        navigate(
          `library/searchCollection?query=${searchKeyword}&type=${searchType}`
        );
      } else if (searchType == "user") {
        navigate(
          `library/searchUser?query=${searchKeyword}&type=${searchType}`
        );
      } else if (searchType == "tag") {
        //TODO: 오류시 수정
        navigate(
          `library/searchCollection?query=${searchKeyword}&type=${searchType}`
        );
      }
    } catch (error) {
      console.error("검색 요청 실패 : ", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  // 유저 아이콘 클릭 시 로그인 페이지로 이동
  const handleUserIconClick = () => {
    if (isLoggedIn) {
      navigate("/user/myinfo");
    } else {
      // 로그아웃 상태이면 로그인 페이지로 이동
      navigate("/user/login");
    }
  };

  const handleAuthButtonClick = () => {
    if (isLoggedIn) {
      // 로그인 상태이면 로그아웃 처리
      logout();
      navigate("/"); // 로그아웃 후 메인 페이지 또는 로그인 페이지로 리다이렉트
    } else {
      // 로그아웃 상태이면 로그인 페이지로 이동
      navigate("/user/login");
    }
  };

  return (
    <header className={styles.header}>
      {/* 왼쪽: 로고  */}
      <div className={styles.leftSection}>
        <FaThLarge className={styles.logoIcon} />
        <span className={styles.logoText}>MÉMOIRE</span>
      </div>

      {/* 중앙: 검색 박스 */}
      <div className={styles.centerSection}>
        <div className={styles.searchBox}>
          {searchType === "tag" ? (
            <span className={styles.prefix}>#</span>
          ) : (
            <></>
          )}
          <input
            type="text"
            placeholder="키워드 입력 후 엔터"
            className={styles.searchInput}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className={styles.searchSelect}
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="collection">컬렉션 검색</option>
            <option value="user">유저 검색</option>
            <option value="tag">태그 검색</option>
          </select>
          <button className={styles.searchButton} onClick={handleSearch}>
            <IoIosSearch />
          </button>
        </div>
      </div>

      {/* 오른쪽: 아이콘 */}
      <div className={styles.rightSection}>
        {/* 테마 토글 아이콘 */}
        <button
          className={styles.themeButton}
          onClick={() => setUseVideo((v) => !v)}
          aria-label="Toggle background theme"
        >
          {useVideo ? (
            <FaSun className={styles.iconButton} />
          ) : (
            <FaMoon className={styles.iconButton} />
          )}
        </button>
        {/* 관리자 아이콘 */}
        {isLoggedIn && role === "ADMIN" && (
        <IoLogoAngular
          className={styles.iconButton}
          onClick={goAdmin}
          aria-label="관리자 페이지로 이동"
        />
      )}
        <FaUserCircle
          className={styles.iconButton}
          onClick={handleUserIconClick}
        />
        {/* 팔로우 요청 배지 */}
        <div className={styles.bellWrapper} onClick={handleBellClick}>
          <FaBell className={styles.iconButton} />
          {hasNotifications && (
            <div className={styles.notificationBadge}>!</div>
          )}
        </div>
        {/* 알림 드롭다운 */}
        {showNotifications && (
          <NotificationDropdown
            followReqs={followReqs}
            onFollowRequestApproval={handleFollowRequestApproval}
            closeDropdown={handleBellClick} // 드롭다운 닫기
          />
        )}

        <button
          className={styles.authButton} // 스타일 클래스 추가
          onClick={handleAuthButtonClick}
        >
          {isLoggedIn ? "로그아웃" : "로그인"}
        </button>
      </div>
    </header>
  );
}

export default Header;
