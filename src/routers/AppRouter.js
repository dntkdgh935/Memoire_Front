// src/routers/AppRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

//sidebar를 통한 메인 이동
import LibraryMain from "../pages/library/LibraryMain";
import ArchiveMain from "../pages/archive/ArchiveMain";
// import Atelier from "../pages/Atelier";

//각 서비스별 페이지 이동
import LibraryRouter from "./LibraryRouter";
import UserRouter from "./UserRouter";

function AppRouter() {
  return (
    <Routes>
      {/* <Route path="/" element={<LibraryMain />} /> */}
      <Route path="/library/*" element={<LibraryRouter />} />
      <Route path="/archive" element={<ArchiveMain />} />
      <Route path="/user/*" element={<UserRouter />} />
    </Routes>
  );
}

export default AppRouter;
