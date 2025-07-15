import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider";
import styles from "./Login.module.css";

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 진행 중 상태
  const [autoLogin, setAutoLogin] = useState(false); // 체크박스 상태로 변경
  const [isSocialLoginProcessing, setIsSocialLoginProcessing] = useState(false); // 소셜 로그인 진행 중 상태

  const { updateTokens } = useContext(AuthContext);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) navigate("/");
  }, [navigate]);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  const handleSignUp = () => {
    navigate("/user/signUp");
  };

  const handleLogin = async () => {
    if (isLoggedIn) return;

    setIsLoggedIn(true);
    try {
      const response = await apiClient.post("/login", {
        loginId,
        password,
        autoLoginFlag: autoLogin ? "Y" : "N",
      });

      const { accessToken, refreshToken } = response.data; // userId, role, autoLoginFlag는 AuthProvider에서 처리
      // const tokenPayload = base64DecodeUnicode(accessToken.split(".")[1]); // AuthProvider에서 처리

      updateTokens(accessToken, refreshToken);
      if (onLoginSuccess) onLoginSuccess();
      navigate("/"); // 로그인 성공 시 메인 페이지로 이동
    } catch (error) {
      console.error("로그인 실패 : ", error);
      if (error.response) {
        alert(error.response.data.error || "서버 오류로 인해 로그인 실패!");
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("알 수 없는 오류 발생.");
      }
    } finally {
      setIsLoggedIn(false);
    }
  };

  // ✅ 소셜 로그인 핸들러 추가
  const handleSocialLogin = async (socialType) => {
    if (isSocialLoginProcessing) return;

    setIsSocialLoginProcessing(true);
    try {
      const response = await apiClient.post("/user/social", { socialType });
      const { authorizationUrl } = response.data; // 백엔드에서 받은 인가 URL

      if (authorizationUrl) {
        // ✅ authorizationUrl이 이제 'http://localhost:8080/oauth2/authorization/naver' 와 같은
        //    절대 경로이므로, 브라우저가 올바르게 리다이렉션합니다.
        console.log(`Redirecting to: ${authorizationUrl}`);
        window.location.href = authorizationUrl;
      } else {
        alert("소셜 로그인 URL을 가져오는 데 실패했습니다.");
      }
    } catch (error) {
      console.error(`Error initiating ${socialType} login:`, error);
      if (error.response) {
        alert(
          error.response.data.error ||
            `소셜 로그인 (${socialType}) 시작 중 오류 발생!`
        );
      } else {
        alert(`소셜 로그인 (${socialType}) 시작 중 알 수 없는 오류 발생.`);
      }
    } finally {
      setIsSocialLoginProcessing(false);
    }
  };

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
              onChange={(e) => setLoginId(e.target.value)}
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
            disabled={isLoggedIn || isSocialLoginProcessing} // 소셜 로그인 중에도 비활성화
            type="button"
          >
            {isLoggedIn ? "로그인 중..." : "로그인"}
          </button>
          <button
            className={styles.faceIdButton}
            type="button"
            disabled={isSocialLoginProcessing} // 소셜 로그인 중에도 비활성화
          >
            Face ID
          </button>
        </form>
        <div className={styles.socialLogin}>
          <button
            className={styles.socialButton}
            aria-label="Login with Naver"
            onClick={() => handleSocialLogin("naver")} // ✅ 네이버 소셜 로그인
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            <span className={styles.naverIcon}></span>
          </button>
          <button
            className={styles.socialButton}
            aria-label="Login with Google"
            onClick={() => handleSocialLogin("google")} // ✅ 구글 소셜 로그인
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            <span className={styles.googleIcon}></span>
          </button>
          <button
            className={styles.socialButton}
            aria-label="Login with Kakao"
            onClick={() => handleSocialLogin("kakao")} // ✅ 카카오 소셜 로그인
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            <span className={styles.kakaoIcon}></span>
          </button>
        </div>
        <div className={styles.additionalText}>
          아이디 또는 비밀번호를 잊으셨나요?
        </div>
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
