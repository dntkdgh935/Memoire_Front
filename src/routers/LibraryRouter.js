// src/routers/LibraryRouter.js
import { Routes, Route, Navigate } from "react-router-dom";
import React, { useEffect, useContext } from "react";

import LibraryMain from "../pages/library/LibraryMain";
import LibCollDetailView from "../pages/library/LibCollDetailView";
import ArchiveVisit from "../pages/library/ArchiveVisit";
import SearchCollResult from "../pages/library/SearchCollResult";
import SearchUserResult from "../pages/library/SearchUserResult";
import { AuthContext } from "../AuthProvider";

function LibraryRouter() {
  const { isLoggedIn, role } = useContext(AuthContext);
  useEffect(() => {
    if (isLoggedIn === null) {
      return; // 로그인 상태가 아직 결정되지 않은 경우
    }
  }, [isLoggedIn]);

  return (
    <Routes>
      <Route path="/" element={<LibraryMain />} />
      <Route path="/detail/:id" element={<LibCollDetailView />} />
      <Route
        path="/archive/:userid"
        element={
          isLoggedIn === null ? (
            <div>로딩 중...</div>
          ) : isLoggedIn ? (
            <ArchiveVisit />
          ) : (
            <Navigate to="/user/login" replace />
          )
        }
      />
      <Route
        path="/searchCollection"
        element={
          isLoggedIn === null ? (
            <div>로딩 중...</div>
          ) : isLoggedIn ? (
            <SearchCollResult />
          ) : (
            <Navigate to="/user/login" replace />
          )
        }
      />
      <Route
        path="/searchUser"
        element={
          isLoggedIn === null ? (
            <div>로딩 중...</div>
          ) : isLoggedIn ? (
            <SearchUserResult />
          ) : (
            <Navigate to="/user/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default LibraryRouter;
