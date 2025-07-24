// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import AppRouter from "./routers/AppRouter";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider, useTheme } from "./ThemeContext";

import "./App.css";

// color system import
import "./assets/styles/variables-light.css";
import "./assets/styles/variables-dark.css";

// 전체 배경 비디오 import (MP4)
import backgroundLibVideoMp4 from "./assets/videos/library_loop.mp4";

function InnerApp() {
  const { useVideo } = useTheme();

  return (
    <>
      {/* 비디오 테마일 때만 렌더 */}
      {useVideo && (
        <video
          className="backgroundVideo"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={backgroundLibVideoMp4} type="video/mp4" />
        </video>
      )}

      <div className="app-container">
        <Sidebar />
        <div className="main-area">
          <Header />
          <div className="page-content">
            <AppRouter />
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <InnerApp />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}
