import React from "react";
import { FaArrowLeft } from "react-icons/fa"; // 화살표 아이콘 사용
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./PageHeader.module.css"; // 스타일 파일

// PageHeader 컴포넌트
function PageHeader({ pagename, username }) {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 정보

  // 현재 경로에 따라 헤더 변경
  const isInMain = location.pathname.endsWith("/library");

  // 뒤로 가기 버튼 클릭 시 동작
  const handleGoBack = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  if (!isInMain) {
    //메인이 아닐 경우 뒤로 가기 버튼 포함
    return (
      <div className={styles.pageHeader}>
        <button onClick={handleGoBack} className={styles.goBackButton}>
          <FaArrowLeft /> {/* 왼쪽 화살표 아이콘 */}
        </button>
        <span className={styles.pageTitle}>{pagename}</span>
        {/* <span className={styles.pageTitle}>{username}님의 아카이브</span> */}
      </div>
    );
  }
  //메인은 페이지명만 출력
  else {
    return (
      <div className={styles.pageHeader}>
        <span className={styles.pageTitle}>{pagename}</span>
        {/* <span className={styles.pageTitle}>{username}님의 아카이브</span> */}
      </div>
    );
  }
}

export default PageHeader;
