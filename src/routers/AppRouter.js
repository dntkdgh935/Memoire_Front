// src/routers/AppRouter.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

//sidebar를 통한 메인 이동
import LibraryMain from "../pages/library/LibraryMain";
import ArchiveMain from "../pages/archive/ArchiveMain";
import AtelierHome from "../pages/atelier/AtelierHome";
import TextToTextMain from "../pages/atelier/TextToTextMain";
import TextToImageMain from "../pages/atelier/TextToImageMain";
import ImageToImageMain from "../pages/atelier/ImageToImageMain";
import ImageToVideoMain from "../pages/atelier/ImageToVideoMain";
import OAuth2CallbackSuccess from "../pages/user/OAuth2CallbackSuccess";
import SocialSignUp from "../pages/user/SocialSignUp";

//각 서비스별 페이지 이동
import LibraryRouter from "./LibraryRouter";
import ArchiveRouter from "./ArchiveRouter";
import UserRouter from "./UserRouter";
import ChatRouter from "./ChatRouter";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/library" />} />

      <Route path="/library/*" element={<LibraryRouter />} />
      <Route path="/archive/*" element={<ArchiveRouter />} />
      <Route path="/user/*" element={<UserRouter />} />
      <Route path="/chat/*" element={<ChatRouter />} />
      <Route
        path="/oauth2/callback/success"
        element={<OAuth2CallbackSuccess />}
      />
      <Route path="/social-signup" element={<SocialSignUp />} />

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
