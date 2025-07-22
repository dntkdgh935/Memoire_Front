// src/pages/user/FindPwd.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider"; // AuthContext 임포트
import UserVerification from "../../components/user/UserVerification"; // 휴대폰 인증 컴포넌트 임포트
import styles from "./FindPwd.module.css"; // CSS 모듈 임포트

function FindPwd() {
  const [formData, setFormData] = useState({
    loginId: "", // 로그인 ID 상태 추가
    phone: "",
  });
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // API 호출 중 상태
  const navigate = useNavigate();
  const { updateTokens } = useContext(AuthContext); // AuthContext에서 updateTokens 가져오기

  // 휴대폰 인증 완료 시 호출될 콜백 함수
  const handlePhoneVerificationComplete = (verified) => {
    setIsPhoneVerified(verified);
  };

  // 입력 필드 값 변경을 처리하는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 폼 제출 전 유효성 검사
  const validate = () => {
    if (!formData.loginId.trim()) {
      alert("아이디를 입력해주세요.");
      return false;
    }
    if (!isPhoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return false;
    }
    return true; // 모든 유효성 검사 통과
  };

  // 폼 제출 처리 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    if (!validate()) {
      return; // 유효성 검사 실패 시 함수 종료
    }

    if (isProcessing) return; // 중복 제출 방지
    setIsProcessing(true);

    try {
      // 1. 백엔드 API 호출: loginId와 phone을 전송하여 임시 비밀번호 발급 요청
      console.log("Sending formData for password reset:", formData);
      const findPwdResponse = await apiClient.post("/user/findpwd", formData);

      // HTTP 상태 코드가 200 OK인 경우 (임시 비밀번호 발급 성공)
      if (findPwdResponse.status === 200) {
        const responseData = findPwdResponse.data;
        const message =
          responseData.message ||
          "임시 비밀번호가 발급되었습니다. 자동으로 로그인합니다.";
        const temporaryPassword = responseData.temporaryPassword; // 임시 비밀번호 추출

        alert(message);

        console.log(
          "Received temporaryPassword from /user/findpwd:",
          temporaryPassword
        );
        console.log(
          "Attempting auto-login with loginId:",
          formData.loginId,
          "and password:",
          temporaryPassword
        );

        // 2. 발급받은 임시 비밀번호와 loginId로 자동 로그인 시도
        try {
          console.log("Sending login request with:");
          console.log("   loginId:", formData.loginId);
          console.log("   password:", temporaryPassword);

          const loginResponse = await apiClient.post("/login", {
            loginId: formData.loginId,
            password: temporaryPassword, // 추출한 임시 비밀번호 사용
            autoLoginFlag: "N", // 자동 로그인 여부는 필요에 따라 설정
          });

          if (loginResponse.status === 200) {
            const { accessToken, refreshToken } = loginResponse.data;
            updateTokens(accessToken, refreshToken); // AuthContext를 통해 토큰 업데이트
            alert("임시 비밀번호로 자동 로그인되었습니다.");
            // MyInfo 페이지로 이동하면서 임시 비밀번호를 state로 전달
            navigate("/user/myinfo", { state: { tempPwd: temporaryPassword } });
          } else {
            // 자동 로그인 실패 (예: 백엔드에서 200 외 다른 상태 코드 반환 시)
            alert("자동 로그인에 실패했습니다. 로그인 페이지로 이동합니다.");
            navigate("/user/Login");
          }
        } catch (loginError) {
          console.error("자동 로그인 실패 : ", loginError);
          let loginErrorMessage =
            "자동 로그인 중 오류가 발생했습니다. 로그인 페이지로 이동합니다.";
          if (
            loginError.response &&
            typeof loginError.response.data === "string"
          ) {
            loginErrorMessage = `자동 로그인 실패: ${loginError.response.data}`;
          } else if (
            loginError.response &&
            loginError.response.data &&
            loginError.response.data.error
          ) {
            loginErrorMessage = `자동 로그인 실패: ${loginError.response.data.error}`;
          }
          alert(loginErrorMessage);
          navigate("/user/Login"); // 자동 로그인 실패 시 로그인 페이지로 이동
        }
      }
    } catch (error) {
      console.error("비밀번호 찾기 요청 실패 : ", error); // 초기 비밀번호 찾기 요청 오류 로깅

      // 백엔드에서 오류 응답 (예: 404 Not Found, 400 Bad Request, 500 Internal Server Error)을 보낸 경우
      if (error.response) {
        console.error("Backend Error Response:", error.response);
        console.error("Backend Error Data:", error.response.data);

        let errorMessage = "비밀번호 찾기에 실패했습니다. 다시 시도해 주세요.";
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (
          typeof error.response.data === "object" &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "object") {
          errorMessage = JSON.stringify(error.response.data);
        }
        alert(errorMessage);
        navigate("/user/Login"); // 초기 비밀번호 찾기 실패 시 로그인 페이지로 이동
      } else {
        // 네트워크 오류 등 백엔드 응답 자체가 없는 경우
        alert(
          "네트워크 오류 또는 서버 응답이 없습니다. 잠시 후 다시 시도해 주세요."
        );
        navigate("/user/Login"); // 네트워크 오류 시 로그인 페이지로 이동
      }
    } finally {
      setIsProcessing(false); // 처리 완료
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.findPwdBox}>
        <h2 className={styles.title}>비밀번호 찾기</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="loginId"
              className={styles.input}
              placeholder="아이디"
              value={formData.loginId}
              onChange={handleChange}
              required
              maxLength={50} // 아이디 최대 길이에 맞게 조정
            />
          </div>
          <div className={styles.inputGroup}>
            {/* UserVerification 컴포넌트를 사용하여 휴대폰 인증 처리 */}
            <UserVerification
              phone={formData.phone}
              setPhone={(val) => setFormData({ ...formData, phone: val })}
              onVerificationComplete={handlePhoneVerificationComplete} // 인증 완료 콜백 함수 전달
            />
          </div>
          {/* 비밀번호 찾기 제출 버튼 */}
          <button
            type="submit"
            className={styles.findPwdButton}
            disabled={isProcessing}
          >
            {isProcessing ? "처리 중..." : "비밀번호 찾기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default FindPwd;
