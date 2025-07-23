// src/pages/admin/AdminMain.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext"; // AuthContext 경로 확인
import { useContext } from "react";
import AdminNewUserChart from "../../components/admin/AdminNewUserChart"; // 새로 만든 차트 컴포넌트 임포트

const AdminMain = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useContext(AuthContext);

  useEffect(() => {
    if (isLoggedIn !== null) {
      if (!isLoggedIn || role !== "ADMIN") {
        alert("관리자 권한이 필요합니다.");
        navigate("/");
      }
    }
  }, [isLoggedIn, role, navigate]);

  if (!isLoggedIn || role !== "ADMIN") {
    return null;
  }

  return (
    <div>
      <h1>관리자 메인 페이지</h1>
      <p>환영합니다, 관리자님!</p>
      {/* 여기에 관리자 전용 콘텐츠를 추가하세요 */}
      {/* 신규 유저 가입 통계 그래프 추가 */}
      <hr /> {/* 구분을 위한 선 */}
      <AdminNewUserChart />
    </div>
  );
};

export default AdminMain;
