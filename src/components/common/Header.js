// // src/components/common/Header.js

// import React from "react";
// import {
//   FaThLarge,
//   FaUserCircle,
//   FaBell,
//   FaChevronDown,
//   FaMoon,
// } from "react-icons/fa";
// import styles from "./Header.module.css";

// function Header() {
//   return (
//     <header className={styles.header}>
//       {/* 왼쪽: 로고 및 메뉴 아이콘 */}
//       <div className={styles.leftSection}>
//         <FaThLarge className={styles.logoIcon} />
//         <span className={styles.logoText}>MÉMOIRE</span>
//       </div>

//       {/* 중앙: 검색/선택 박스 */}
//       <div className={styles.centerSection}>
//         <div className={styles.searchBox}>
//           <span className={styles.searchLeft}>관심 카테고리 추가</span>
//           <span className={styles.searchRight}>
//             메모리 제목 <FaChevronDown />
//           </span>
//         </div>
//       </div>

//       {/* 오른쪽: 아이콘들 */}
//       <div className={styles.rightSection}>
//         <FaMoon className={styles.iconButton} />
//         <FaUserCircle className={styles.iconButton} />
//         <FaBell className={styles.iconButton} />
//       </div>
//     </header>
//   );
// }

// export default Header;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaThLarge, FaUserCircle, FaBell, FaMoon } from "react-icons/fa";
import styles from "./Header.module.css";

function Header() {
  const [searchType, setSearchType] = useState("collection");
  const [searchKeyword, setSearchKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    console.log(`검색 실행: 타입=${searchType}, 키워드=${searchKeyword}`);
    // 검색 처리 로직 여기에 추가
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  // 유저 아이콘 클릭 시 로그인 페이지로 이동
  const handleUserIconClick = () => {
    navigate("/login");
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
            placeholder="관심 카테고리 추가"
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
            <option value="collection">메모리 제목</option>
            <option value="user">유저명</option>
          </select>
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
      </div>
    </header>
  );
}

export default Header;
