// src/routers/AppRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

//sidebar를 통한 메인 이동
import LibraryMain from "../pages/library/LibraryMain";
// import Archive from "../pages/Archive";
// import Atelier from "../pages/Atelier";

//각 서비스별 페이지 이동
import LibraryRouter from "./LibraryRouter";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LibraryMain />} />
      <Route path="/library/*" element={<LibraryRouter />} />
      {/* <Route path="/archive" element={<Archive />} />
      <Route path="/atelier" element={<Atelier />} /> */}
      {/* 추가 페이지도 여기에 등록 가능 */}
    </Routes>
  );
}

export default AppRouter;
