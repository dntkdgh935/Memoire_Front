// src/routers/AppRouter.js
import React, { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

//sidebar를 통한 메인 이동

import OAuth2CallbackSuccess from "../pages/user/OAuth2CallbackSuccess";
import SocialSignUp from "../pages/user/SocialSignUp";
import TarotHome from "../pages/tarot/TarotHome";
import TarotPage from "../pages/tarot/TarotPage";
import TarotDeckPage from "../pages/tarot/TarotDeckPage";

//각 서비스별 페이지 이동
import LibraryRouter from "./LibraryRouter";
import ArchiveRouter from "./ArchiveRouter";
import AtelierRouter from "./AtelierRouter";
import UserRouter from "./UserRouter";
import ChatRouter from "./ChatRouter";
import AdminRouter from "./AdminRouter";

import { AuthContext } from "../AuthProvider";
import { useContext } from "react";

function AppRouter() {
  const { isLoggedIn, role } = useContext(AuthContext);
  useEffect(() => {
    if (isLoggedIn === null) {
      return; // 로그인 상태가 아직 결정되지 않은 경우
    }
  }, [isLoggedIn]);
  console.log("AppRouter isLoggedIn:", isLoggedIn);

  return (
    <Routes>
      {/* 라이브러리 */}
      <Route path="/" element={<Navigate to="/library" />} />
      <Route path="/library/*" element={<LibraryRouter />} />

      {/* 아카이브 */}
      <Route
        path="/archive/*"
        element={
          isLoggedIn ? <ArchiveRouter /> : <Navigate to="/user/login" replace />
        }
      />
      {/* 유저 */}
      <Route path="/user/*" element={<UserRouter />} />
      {/* 채팅 */}
      <Route
        path="/chat/*"
        element={
          isLoggedIn ? <ChatRouter /> : <Navigate to="/user/login" replace />
        }
      />
      {/* 관리자 */}
      <Route
        path="/admin/*"
        element={
          isLoggedIn && role === "ADMIN" ? (
            <AdminRouter />
          ) : isLoggedIn ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/user/login" replace />
          )
        }
      />

      <Route
        path="/oauth2/callback/success"
        element={<OAuth2CallbackSuccess />}
      />
      <Route path="/social-signup" element={<SocialSignUp />} />

      {/* Tarot 중첩 선언 */}
      <Route path="/tarot" element={<Outlet />}>
        {/* 정확히 /tarot */}
        <Route index element={<TarotHome />} />
        {/* /tarot/read/:count */}
        <Route path="read/:count" element={<TarotPage />} />
      </Route>

      <Route path="/tarot/deck" element={<TarotDeckPage />} />

      {/* 아틀리에 */}
      <Route
        path="/atelier/*"
        element={
          isLoggedIn ? <AtelierRouter /> : <Navigate to="/user/login" replace />
        }
      />
    </Routes>
  );
}

export default AppRouter;
