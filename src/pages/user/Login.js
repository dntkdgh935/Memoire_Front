import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider";
import styles from "./Login.module.css";

// 1. 로그인 타입 상수 정의 (별도 파일로 분리하는 것이 더 좋음)
const LOGIN_TYPE = {
  NORMAL: "normal",
  NAVER: "naver",
  GOOGLE: "google",
  KAKAO: "kakao",
  FACE_ID: "faceId",
};

function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [isSocialLoginProcessing, setIsSocialLoginProcessing] = useState(false);
  const [lastLoginType, setLastLoginType] = useState(null); // ✅ 마지막 로그인 방식 상태
  const location = useLocation();

  const { updateTokens } = useContext(AuthContext);

  useEffect(() => {
    // FindId 페이지에서 전달받은 아이디 처리
    if (location.state && location.state.foundId) {
      const foundId = location.state.foundId;
      console.log("전달받은 아이디:", foundId);
      setLoginId(foundId);
    }

    // 기존 자동 로그인 처리 로직 (로그인 완료된 상태라면 메인으로 이동)
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      navigate("/");
    }

    // ✅ 로컬 스토리지에서 마지막 로그인 방식 불러오기
    const storedLoginType = localStorage.getItem("lastLoginType");
    if (storedLoginType) {
      setLastLoginType(storedLoginType);
    }
  }, [navigate, location.state?.foundId]);

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
  const handleFindId = () => {
    navigate("/user/findId");
  };
  const handleFindPWD = () => {
    navigate("/user/findPWD");
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

      const { accessToken, refreshToken } = response.data;

      updateTokens(accessToken, refreshToken);
      // ✅ 일반 로그인 성공 시 lastLoginType 저장
      localStorage.setItem("lastLoginType", LOGIN_TYPE.NORMAL);
      if (onLoginSuccess) onLoginSuccess();
      navigate("/");
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

  // ✅ 소셜 로그인 핸들러 수정: 로그인 방식 저장 로직 추가
  const handleSocialLogin = async (socialType) => {
    if (isSocialLoginProcessing) return;

    setIsSocialLoginProcessing(true);
    try {
      const response = await apiClient.post("/user/social", { socialType });
      const { authorizationUrl } = response.data;

      if (authorizationUrl) {
        console.log(`Redirecting to: ${authorizationUrl}`);
        // ✅ 소셜 로그인 시작 전 lastLoginType 저장 (선호되는 방식)
        // 백엔드에서 소셜 로그인 성공 후 리다이렉트될 때, 이 값을 활용하여
        // 로그인 성공 처리 부분에서 토큰과 함께 다시 lastLoginType을 저장하는 것이 더 견고합니다.
        // 여기서는 임시로 저장하며, 실제 성공 시 다시 업데이트한다고 가정합니다.
        localStorage.setItem("lastLoginType", socialType); // socialType 자체가 상수와 일치한다고 가정

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
      // 실패 시 저장했던 lastLoginType 제거 또는 초기화
      localStorage.removeItem("lastLoginType");
    } finally {
      setIsSocialLoginProcessing(false);
    }
  };

  // ✅ Face ID 로그인 페이지로 이동하는 핸들러 추가
  const handleFaceLoginNavigation = () => {
    // ✅ Face ID 로그인 페이지로 이동 시 lastLoginType 저장 (실제 로그인 성공은 해당 페이지에서 처리)
    localStorage.setItem("lastLoginType", LOGIN_TYPE.FACE_ID);
    navigate("/user/face-login");
  };

  // ✅ 마지막 로그인 방식 텍스트를 반환하는 헬퍼 함수
  const getLastLoginTypeText = () => {
    switch (lastLoginType) {
      case LOGIN_TYPE.NORMAL:
        return "일반 로그인";
      case LOGIN_TYPE.NAVER:
        return "네이버 로그인";
      case LOGIN_TYPE.GOOGLE:
        return "구글 로그인";
      case LOGIN_TYPE.KAKAO:
        return "카카오 로그인";
      case LOGIN_TYPE.FACE_ID:
        return "Face ID 로그인";
      default:
        return null;
    }
  };

  const lastLoginMessage = getLastLoginTypeText();

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>로그인</h2>
        {/* ✅ 마지막 로그인 방식 표시 */}
        {lastLoginMessage && (
          <p className={styles.lastLoginMessage}>
            마지막 로그인 방식: <strong>{lastLoginMessage}</strong>
          </p>
        )}
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
              maxlength="12"
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
              maxlength="16"
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
            disabled={isLoggedIn || isSocialLoginProcessing}
            type="button"
          >
            {isLoggedIn ? "로그인 중..." : "로그인"}
          </button>
          <button
            className={styles.faceIdButton}
            onClick={handleFaceLoginNavigation}
            type="button"
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            Face ID
          </button>
        </form>
        <div className={styles.socialLogin}>
          <button
            className={styles.socialButton}
            aria-label="Login with Naver"
            onClick={() => handleSocialLogin(LOGIN_TYPE.NAVER)} // ✅ 상수 사용
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            <span className={styles.naverIcon}></span>
          </button>
          <button
            className={styles.socialButton}
            aria-label="Login with Google"
            onClick={() => handleSocialLogin(LOGIN_TYPE.GOOGLE)} // ✅ 상수 사용
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            <span className={styles.googleIcon}></span>
          </button>
          <button
            className={styles.socialButton}
            aria-label="Login with Kakao"
            onClick={() => handleSocialLogin(LOGIN_TYPE.KAKAO)} // ✅ 상수 사용
            disabled={isLoggedIn || isSocialLoginProcessing}
          >
            <span className={styles.kakaoIcon}></span>
          </button>
        </div>
        <div className={styles.additionalText}>
          <span
            onClick={handleFindId}
            role="button"
            tabIndex={0}
            className={styles.findGroup}
          >
            아이디
          </span>{" "}
          또는{" "}
          <span
            onClick={handleFindPWD}
            role="button"
            tabIndex={0}
            className={styles.findGroup}
          >
            비밀번호
          </span>
          를 잊으셨나요?
        </div>
        <div className={styles.signUpLink}>
          <span onClick={handleSignUp} role="button" tabIndex={0}>
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
