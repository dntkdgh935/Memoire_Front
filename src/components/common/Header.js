// // src/components/common/Header.js

import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaThLarge, FaUserCircle, FaBell, FaMoon } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import styles from "./Header.module.css";
import { AuthContext } from "../../AuthProvider";

function Header() {
  const [searchType, setSearchType] = useState("collection");
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();

  const { isLoggedIn, logout } = useContext(AuthContext);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    console.log(`검색 실행: 타입=${searchType}, 키워드=${searchKeyword}`);
    // TODO: 검색 키워드 관련 조건 있으면 추가

    // 검색 처리 로직 여기에 추가

    try {
      if (searchType == "collection") {
        navigate(`library/searchCollection?query=${searchKeyword}`);
      } else if (searchType == "user") {
        navigate(`library/searchUser?query=${searchKeyword}`);
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
      {/* 왼쪽: 로고 */}
      <div className={styles.leftSection}>
        <FaThLarge className={styles.logoIcon} />
        <span className={styles.logoText}>MÉMOIRE</span>
      </div>

      {/* 중앙: 검색 박스 */}
      <div className={styles.centerSection}>
        <div className={styles.searchBox}>
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
          </select>
          <button className={styles.searchButton} onClick={handleSearch}>
            <IoIosSearch />
          </button>
        </div>
      </div>

      {/* 오른쪽: 아이콘 */}
      <div className={styles.rightSection}>
        <FaMoon className={styles.iconButton} />
        <FaUserCircle
          className={styles.iconButton}
          onClick={handleUserIconClick}
        />
        <FaBell className={styles.iconButton} />
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
