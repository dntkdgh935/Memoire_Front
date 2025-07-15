// src/pages/user/OAuth2CallbackSuccess.js

import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";

function OAuth2CallbackSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateTokens } = useContext(AuthContext);

  // 상태 변수 추가: 이펙트가 이미 실행되었는지 추적
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // 이미 처리된 경우 다시 실행하지 않음
    if (hasProcessed) {
      console.log("OAuth2CallbackSuccess: 이미 처리되었으므로 useEffect 종료.");
      return;
    }

    console.log("OAuth2CallbackSuccess 컴포넌트 마운트됨. URL:", location.href);

    const queryParams = new URLSearchParams(location.search);
    const accessToken = queryParams.get("accessToken");
    const refreshToken = queryParams.get("refreshToken");
    const userId = queryParams.get("userId");

    console.log("추출된 accessToken:", accessToken ? "있음" : "없음");
    console.log("추출된 refreshToken:", refreshToken ? "있음" : "없음");
    console.log("추출된 userId (예시):", userId);

    if (accessToken && refreshToken) {
      updateTokens(accessToken, refreshToken);
      console.log(
        "updateTokens 호출 완료. 토큰이 localStorage에 저장되었을 것입니다."
      );

      // 처리 완료 플래그 설정
      setHasProcessed(true);

      // 알림 대신 콘솔 로그를 사용하고 즉시 메인 페이지로 이동
      console.log("소셜 로그인 성공! 메인 페이지로 이동합니다.");
      navigate("/");
    } else {
      console.error(
        "소셜 로그인 실패: URL에서 accessToken 또는 refreshToken을 찾을 수 없습니다."
      );

      // 처리 완료 플래그 설정 (실패 시에도)
      setHasProcessed(true);

      // 알림 대신 콘솔 로그를 사용하고 로그인 페이지로 이동
      console.log(
        "소셜 로그인 실패: 토큰을 받지 못했습니다. 로그인 페이지로 이동합니다."
      );
      navigate("/user/login");
    }
  }, [location, navigate, updateTokens, hasProcessed]);

  return (
    <div>
      <p>소셜 로그인 처리 중...</p>
    </div>
  );
}

export default OAuth2CallbackSuccess;
