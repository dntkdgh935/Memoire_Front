//src/AuthProvider.js
import { createContext, useState, useEffect } from "react";
import apiClient from "./utils/axios";

export const AuthContext = createContext();

const parseAccessToken = (token) => {
  if (!token) return null;
  try {
    //전달받은 토큰에서 payload 부분 추출
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);

    const now = Date.now() / 1000;
    if (parsed.exp < now) {
      console.warn("AccessToken이 이미 만료되었습니다.");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("AccessToken 파싱오류 : ", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [authInfo, setAuthInfo] = useState({
    isLoggedIn: null,
    role: "",
    name: "",
    userid: "",
    autoLoginFlag: "",
    nickname: "",
  });

  const logout = () => {
    console.log("로그아웃 실행: 로컬 스토리지 비우기 및 인증 정보 초기화");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("autoLoginFlag"); // 자동 로그인 플래그도 함께 삭제하는 것이 좋습니다.
    setAuthInfo({
      isLoggedIn: false,
      role: "",
      name: "",
      userid: "",
      autoLoginFlag: "",
      nickname: "",
    });
    // window.location.href = "/"; // 필요한 경우, 로그아웃 후 리다이렉트
  };

  // 기존 logoutAndRedirect 함수는 logout 함수를 활용
  const logoutAndRedirect = () => {
    if (!authInfo.isLoggedIn && !localStorage.getItem("accessToken")) return; // 불필요한 호출 방지
    logout();
    window.location.href = "/"; // 메인 페이지나 로그인 페이지로 리다이렉트
  };

  const updateTokens = (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      const parsedToken = parseAccessToken(accessToken);

      if (parsedToken) {
        setAuthInfo({
          isLoggedIn: true,
          role: parsedToken.role,
          name: parsedToken.name, // 페이로드에 name이 있다면
          userid: parsedToken.userid,
          autoLoginFlag: parsedToken.autoLoginFlag, // 서버에서 받은 autoLoginFlag 값을 여기에 저장
          nickname: parsedToken.nickname,
        });
        // ✅ 서버에서 받은 autoLoginFlag 값을 localStorage에 저장
        localStorage.setItem("autoLoginFlag", parsedToken.autoLoginFlag);
      } else {
        logoutAndRedirect();
      }
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    // ✅ localStorage에서 autoLoginFlag 값을 가져옵니다.
    const storedAutoLoginFlag = localStorage.getItem("autoLoginFlag");

    console.log(
      "useEffect 실행: storedAccessToken=",
      storedAccessToken,
      "storedRefreshToken=",
      storedRefreshToken,
      "storedAutoLoginFlag=",
      storedAutoLoginFlag
    );

    // ✅ 자동 로그인 플래그가 'N'이고, 토큰이 존재한다면 즉시 로그아웃 처리
    if (
      storedAutoLoginFlag === "N" &&
      (storedAccessToken || storedRefreshToken)
    ) {
      console.log(
        "자동 로그인 아님 (N) -> 로컬 스토리지 토큰 삭제 및 로그아웃 처리"
      );
      logout(); // 토큰을 지우고 상태를 초기화합니다.
      return; // 이후 로직 실행하지 않음
    }

    // ✅ 'Y'이거나 autoLoginFlag가 없거나 토큰이 없는 경우에만 아래 로직 실행
    if (storedAccessToken && storedRefreshToken) {
      const parsedToken = parseAccessToken(storedAccessToken);
      console.log("useEffect: parsedAccessToken=", parsedToken);

      if (parsedToken) {
        setAuthInfo({
          isLoggedIn: true,
          role: parsedToken.role,
          name: parsedToken.name,
          userid: parsedToken.userid,
          autoLoginFlag: storedAutoLoginFlag || "N", // 저장된 플래그 사용
          nickname: parsedToken.nickname,
        });
        console.log("AuthInfo 업데이트 성공: ", parsedToken);
      } else {
        // AccessToken이 만료되었거나 파싱 실패한 경우
        // RefreshToken으로 재발급 시도 또는 바로 로그아웃
        console.log("AccessToken 유효하지 않음. 재발급 시도 또는 로그아웃");
        handleReissueTokens(storedAutoLoginFlag === "Y") // storedAutoLoginFlag 값에 따라 extendLogin 전달
          .catch(() => {
            console.log("토큰 재발급 실패. 로그아웃 처리.");
            logoutAndRedirect();
          });
      }
    } else {
      // 토큰이 아예 없는 경우 (처음 방문했거나 이미 로그아웃된 상태)
      console.log("토큰 없음. 로그인 상태 아님.");
      logout();
    }
  }, []); // 의존성 배열 비워두어 컴포넌트 마운트 시 한 번만 실행

  // 공통으로 사용할 서버측 API 요청 처리용 함수 (로그인 상태에서 요청하는 서비스들)
  // 요청 전에 토큰만요 확인, accessToken 만료시 refreshToken 으로 토큰 재발급 요청
  // refreshToken  만료시에는 로그인 연장 여부 확인하고, refreshToken 재발급 요청 (안할꺼임 유지)
  // 두 개의 토큰이 정상일 때 API 요청 처리에 대한 기능 구현
  const secureApiRequest = async (URL, options = {}, retry = true) => {
    console.log("AuthProvider.secureApiRequest 실행");

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      throw new Error("AccessToken 또는 RefreshToken 이 없습니다.");
    }

    try {
      const method = options.method || "GET";
      const data = options.body || null;

      //formData 인지 확인함
      const isFormData = data instanceof FormData;
      console.log("FormData 인가 : ", isFormData);

      if (isFormData) {
        for (let pair of data.entries()) {
          console.log(pair[0] + ":" + pair[1]);
        }
      }

      // 서버 측 서비스 요청 보내고 결과 받기
      const response = await apiClient({
        URL,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ...(isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" }),
        },
        data,
      });
      return response;
    } catch (error) {
      console.error("API 요청 실패 - 상태 코드 : ", error.response?.status);
      console.error("API 응답 해더 : ", error.response?.headers);
      console.error("API 응답 데이터 : ", error.response?.data);

      const tokenExpiredHeader = error.response?.headers["token-expired"];

      if (error.response?.status === 401 && retry) {
        // ststus.code : 401 (UnAuthrized 임)
        // RefreshToken 만료시 로그인 연장 여부 확인
        if (tokenExpiredHeader === "RefreshToken") {
          if (authInfo.autoLoginFlag === "Y") {
            // 자동 연장
            try {
              await handleReissueTokens(true);
              return secureApiRequest(URL, options, false); // 재시도 요청
            } catch (refreshError) {
              console.error(
                "자동 로그인 연장 실패 : ",
                refreshError.response?.data
              );
              alert("로그아웃 되었습니다. 다시 로그인하세요.");
              logoutAndRedirect();
            }
          } else {
            // N 또는 그 외: 기존처럼 confirm
            const confirmExtend = window.confirm(
              "로그인 세션이 만료되었습니다. 로그인 연장하시겠습니까?"
            );
            if (confirmExtend) {
              try {
                await handleReissueTokens(true);
                return secureApiRequest(URL, options, false); // 재시도 요청
              } catch (refreshError) {
                console.error(
                  "로그인 연장 실패 : ",
                  refreshError.response?.data
                );
                alert("로그아웃 되었습니다. 다시 로그인하세요.");
                logoutAndRedirect();
              }
            } else {
              alert("로그인이 연장되지 않았습니다. 다시 로그인하세요.");
              logoutAndRedirect();
            }
          }
        } // 리프레시토큰 만료되었을 때

        // AccessToken 만료시 RefreshToken 으로 AccessToken 재발급
        if (tokenExpiredHeader === "AccessToken") {
          console.warn("AccessToken 만료, RefreshToken 으로 재발급 시도중....");
          try {
            await handleReissueTokens();
            return secureApiRequest(URL, options, false); // API 재호출 시도
          } catch (accessError) {
            console.error(
              "AccessToken 재발급 실패...",
              accessError.response?.data
            );
            logoutAndRedirect();
          }
        }
      }

      throw error; // 다른 에러 처리
    }
  }; //secureApiRequest

  //AccessToken or RefreshToken 재발급 처리
  const handleReissueTokens = async (extendLogin = false) => {
    let accessToken = localStorage.getItem("accessToken")?.trim();
    let refreshToken = localStorage.getItem("refreshToken")?.trim();

    if (!accessToken || !refreshToken) {
      console.error("Reissue 요청 실패 : 토큰이 존재 하지 않습니다.");
      alert("로그아웃 되었습니다. 다시 로그인 하세요.");
      logoutAndRedirect();
      return;
    }

    try {
      console.log("Reissue 요청 - AccessToken : ", accessToken);
      console.log("Reissue 요청 - RefreshToken : ", refreshToken);

      // 토큰 재발급 -> 결과 받기
      const response = await apiClient.post("/reissue", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ExtendLogin: extendLogin ? "true" : "false",
        },
      });

      console.log("Reissue 성공 - 응답 헤더 : ", response.headers);
      // 새로 발급된 토큰으로 업데이트
      updateTokens(
        response.headers["Authorization"]?.split(" ")[1]?.trim(),
        response.headers["Refresh-Token"]?.split(" ")[1]?.trim()
      );
    } catch (error) {
      console.error("재발급 실패 상태 : ", error.response?.status);
      console.error("재발급 실패 응답 데이터 : ", error.response?.data);

      const expiredTokenType = error.response?.headers["token-expired"];
      if (
        expiredTokenType === "RefreshToken" ||
        error.response?.data === "Session Expired"
      ) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요");
        logoutAndRedirect();
      } else if (expiredTokenType === "AccessToken") {
        console.warn("AccessToken 만료됨. RefreshToken으로 재발급 시도 중..");
        return await handleReissueTokens();
      } else {
        console.error("Reissue 중 예상치 못한 오류 발생: ", error.message);
        logoutAndRedirect();
      }
    }
  };
  return (
    <AuthContext.Provider
      value={{
        ...authInfo,
        setAuthInfo,
        secureApiRequest,
        updateTokens,
        logout,
        logoutAndRedirect,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; //AuthProvider
