// src/pages/user/Login.js : 로그인 페이지
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider";
import styles from "./Login.module.css";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loginId, setloginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [autoLogin, setAutoLogin] = useState("");

  // AuthProvider 에서 가져온 updateTokens 함수 사용 선언함
  const { updateTokens } = useContext(AuthContext);

  // 로그인 상태일 시 메인페이지로
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) navigate("/");
  }, [navigate]);

  // Base64 디코딩 함수 추가
  const base64DecodeUnicode = (base64Url) => {
    try {
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("JWT 디코딩 실패 : ", error);
      return null;
    }
  };

  // enter 키 누르면 로그인 실행 처리 함수 추가
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleSignUp = () => {
    navigate("/user/signUp");
  };

  //로그인 처리
  const handleLogin = async () => {
    if (isLoggedIn) return;

    setIsLoggedIn(true);
    try {
      const response = await apiClient.post("/login", {
        loginId: loginId,
        password: password,
        autoLoginFlag: autoLogin ? "Y" : "N",
      });

      console.log("서버 응답 데이터 : ", response);

      const { accessToken, refreshToken, userId, role, autoLoginFlag } =
        response.data;

      const tokenPayload = base64DecodeUnicode(accessToken.split(".")[1]);
      if (!tokenPayload) {
        console.error("JWT 페이로드 디코딩 실패.");
        throw new Error("JWT 페이로드 디코딩 실패"); //catch 로 넘어가게 함
      }
      console.log("JWT 페이로드 : ", tokenPayload);

      try {
        updateTokens(accessToken, refreshToken); // 전역 상태 관리 업데이트
        console.log("로컬스토리지 저장 성공.");
        console.log("AuthContext 에 로그인 상태 정보 업데이트 성공.");
      } catch (storageError) {
        console.error(
          "로컬 스토리지 저장 실패 또는 전역 상태 업데이트 실패.",
          storageError
        );
        throw storageError; // 바깥 catch 로 넘김
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (error) {
      console.error("로그인 실패 : ", error);

      if (error.response) {
        console.error("서버측 에러 응답 데이터 : ", error.response.data);
        alert(error.response.data.error || "서버 오류로 인해 로그인 실패!");
      } else if (error instanceof Error) {
        console.error("에러 메세지 :", error.message);
        alert(error.message);
      } else {
        console.error("예상치 못한 오류 : ", error);
        alert("알 수 없는 오류 발생.");
      }
    } finally {
      setIsLoggedIn(false);
    }
    navigate("/");
  };

  // TODO: Add your JSX for the login form here, using loginId, password, handleLogin, handleKeyDown, etc.
  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>로그인</h2>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="text"
              value={loginId}
              onChange={(e) => setloginId(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="아이디"
              aria-label="User ID"
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="비밀번호"
              aria-label="Password"
            />
          </div>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className={styles.checkbox}
              />
              자동 로그인
            </label>
          </div>
          <button
            className={styles.loginButton}
            onClick={handleLogin}
            disabled={isLoggedIn}
            type="button"
          >
            로그인
          </button>
        </form>
        <div className={styles.signUpLink}>
          <span
            onClick={handleSignUp}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
