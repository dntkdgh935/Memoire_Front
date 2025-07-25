// App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import AppRouter from "./routers/AppRouter";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider, useTheme } from "./ThemeContext";

import "./App.css";
import "./assets/styles/variables-light.css";
import "./assets/styles/variables-dark.css";

import backgroundImage from "./assets/images/library_4k_background2.png"; // 4K 이미지 경로 (직접 넣어둔 이미지로 변경)

function InnerApp() {
  const { useVideo } = useTheme(); // 기존 테마 상태 유지 (true일 경우 배경 출력)

  return (
    <>
      {useVideo && (
        <div
          className="backgroundVideo"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: -1,
          }}
        />
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