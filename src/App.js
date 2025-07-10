// src/App.js
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import AppRouter from "./routers/AppRouter";

import "./App.css";

// color system import
import "./assets/styles/variables-light.css";
import "./assets/styles/variables-dark.css";

function App() {
  return (
    <Router>
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
  );
}

export default App;
