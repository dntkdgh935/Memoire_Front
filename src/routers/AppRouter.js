// src/routers/AppRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

//sidebar를 통한 메인 이동
import LibraryMain from "../pages/library/LibraryMain";
import ArchiveMain from "../pages/archive/ArchiveMain";
import AtelierHome from "../pages/atelier/AtelierHome";
import TextToTextMain from "../pages/atelier/TextToTextMain";
import TextToImageMain from "../pages/atelier/TextToImageMain";
import ImageToImageMain from "../pages/atelier/ImageToImageMain";
import ImageToVideoMain from "../pages/atelier/ImageToVideoMain";

//각 서비스별 페이지 이동
import LibraryRouter from "./LibraryRouter";
import ArchiveRouter from "./ArchiveRouter";
import UserRouter from "./UserRouter";

function AppRouter() {
  return (
    <Routes>
      {/* <Route path="/" element={<LibraryMain />} /> */}
      <Route path="/library/*" element={<LibraryRouter />} />
      <Route path="/archive/*" element={<ArchiveRouter />} />
      <Route path="/user/*" element={<UserRouter />} />
      {/* 아틀리에 홈 */}
      <Route path="/atelier" element={<AtelierHome />} />
      {/* 서브 기능 페이지 */}
      <Route path="/atelier/text2text" element={<TextToTextMain />} />
      <Route path="/atelier/text2image" element={<TextToImageMain />} />
      <Route path="/atelier/image2image" element={<ImageToImageMain />} />
      <Route path="/atelier/image2video" element={<ImageToVideoMain />} />
    </Routes>
  );
}

export default AppRouter;
