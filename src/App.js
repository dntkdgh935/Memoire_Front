// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import AppRouter from "./routers/AppRouter";
import { AuthProvider } from "./AuthProvider";

import "./App.css";

// color system import
import "./assets/styles/variables-light.css";
import "./assets/styles/variables-dark.css";

// 전체 배경 비디오 import (MP4)
import backgroundLibVideoMp4 from "./assets/videos/library_loop.mp4";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* ─── 배경 비디오 ─── */}
        <video
          className="backgroundVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={backgroundLibVideoMp4} type="video/mp4" />
          {/* 필요 시 아래 주석 해제 후 WebM 폴백 추가 가능 */}
          {/*
          <source
            src={require("./assets/videos/library_loop.webm")}
            type="video/webm"
          />
          */}
        </video>
        
        <div className="app-container">
          <Sidebar />
          <div className="main-area">
            <Header />
            <div className="page-content">
              <AppRouter />
            </div>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;