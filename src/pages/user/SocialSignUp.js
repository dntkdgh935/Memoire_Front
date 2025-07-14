import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // API 호출을 위해 axios 사용

function SocialSignUp() {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 URL 정보 가져오기

  // URL 쿼리 파라미터에서 정보 추출
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");
  const socialType = queryParams.get("socialType");
  const socialId = queryParams.get("socialId");
  const initialName = queryParams.get("name") || ""; // 이름 초기값 (없으면 빈 문자열)
  const initialNickname = queryParams.get("nickname") || ""; // 닉네임 초기값
  const loginId = queryParams.get("loginId"); // 임시 loginId

  // 폼 상태 관리
  const [name, setName] = useState(initialName);
  const [nickname, setNickname] = useState(initialNickname);
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState(""); // YYYY-MM-DD 형식으로 입력받을 예정
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // userId가 없으면 비정상적인 접근이므로 홈으로 리다이렉트
    if (!userId || !socialType || !socialId) {
      alert("잘못된 접근입니다.");
      navigate("/");
    }
  }, [userId, socialType, socialId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // 에러 메시지 초기화

    // 필수 필드 유효성 검사 (예시)
    if (!name.trim()) {
      setErrorMessage("이름을 입력해주세요.");
      return;
    }
    // 전화번호 유효성 검사 (간단 예시: 숫자만, 10-11자리)
    if (!phone.trim() || !/^\d{10,11}$/.test(phone)) {
      setErrorMessage("유효한 전화번호 (숫자 10-11자리)를 입력해주세요.");
      return;
    }
    // 생년월일 유효성 검사 (간단 예시: YYYY-MM-DD 형식)
    if (!birthday.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      setErrorMessage("생년월일을 YYYY-MM-DD 형식으로 입력해주세요.");
      return;
    }
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post("/api/user/social/complete-signup", {
        userId, // 백엔드에서 생성된 우리 서비스 userId
        socialType, // 소셜 로그인 타입 (google, naver, kakao)
        socialId, // 각 소셜 서비스의 고유 ID
        name, // 사용자가 입력/확인한 이름
        nickname, // 사용자가 입력/확인한 닉네임
        phone, // 사용자가 입력한 전화번호
        birthday, // 사용자가 입력한 생년월일 (YYYY-MM-DD)
        loginId, // 임시로 백엔드에서 생성된 loginId (카카오 경우)
      });

      if (response.status === 200) {
        // 회원가입 완료 및 로그인 성공 처리
        // 백엔드에서 JWT 토큰을 응답으로 보냈을 것이므로, 이를 저장하고 메인 페이지로 리다이렉트
        const {
          accessToken,
          refreshToken,
          userId,
          name,
          role,
          autoLoginFlag,
          nickname: userNickname,
        } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        localStorage.setItem("userRole", role);
        localStorage.setItem("autoLoginFlag", autoLoginFlag);
        localStorage.setItem("userNickname", userNickname);

        alert("회원가입이 완료되었습니다!");
        navigate("/"); // 메인 페이지로 이동
      } else {
        setErrorMessage(
          response.data.message || "회원가입 중 오류가 발생했습니다."
        );
      }
    } catch (error) {
      console.error("회원가입 API 호출 오류:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("서버와 통신 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>추가 정보 입력</h2>
      <p>소셜 로그인으로 회원가입을 완료하시려면 추가 정보를 입력해주세요.</p>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="name"
            style={{ display: "block", marginBottom: "5px" }}
          >
            이름:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="nickname"
            style={{ display: "block", marginBottom: "5px" }}
          >
            닉네임:
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="phone"
            style={{ display: "block", marginBottom: "5px" }}
          >
            전화번호:
          </label>
          <input
            type="tel" // tel 타입으로 변경
            id="phone"
            placeholder="예: 01012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label
            htmlFor="birthday"
            style={{ display: "block", marginBottom: "5px" }}
          >
            생년월일 (YYYY-MM-DD):
          </label>
          <input
            type="date" // date 타입으로 변경
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "8px",
              boxSizing: "border-box",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          회원가입 완료
        </button>
      </form>
    </div>
  );
}

export default SocialSignUp;
