import { createContext, useState, useEffect } from "react";
import apiClient from "./utils/axios";

export const AuthContext = createContext(null);

/**
 * JWT AccessToken을 파싱하여 페이로드(payload)를 반환합니다.
 * 토큰이 유효하지 않거나 만료된 경우 null을 반환합니다.
 * @param {string} token - 파싱할 AccessToken 문자열
 * @returns {object|null} 파싱된 JWT 페이로드 객체 또는 null
 */
const parseAccessToken = (token) => {
  if (!token) {
    console.error("parseAccessToken: 토큰이 제공되지 않았습니다.");
    return null;
  }
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);

    console.log(
      "parseAccessToken: 파싱된 페이로드:**********************",
      parsed
    );

    const now = Date.now() / 1000;
    if (parsed.exp < now) {
      console.warn("AccessToken이 이미 만료되었습니다.");
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("AccessToken 파싱 오류:", error);
    return null;
  }
};

/**
 * 애플리케이션의 인증 상태를 관리하고, 토큰 갱신 및 보안 API 요청 기능을 제공하는 프로바이더 컴포넌트입니다.
 * @param {object} props - React props
 * @param {React.ReactNode} props.children - 하위 컴포넌트들
 */
export const AuthProvider = ({ children }) => {
  // 인증 정보를 관리하는 상태
  const [authInfo, setAuthInfo] = useState({
    isLoggedIn: null, // 로그인 여부 (초기 null: 로딩 중)
    role: "", // 사용자 역할
    name: "", // 사용자 이름
    userid: "", // 사용자 ID
    autoLoginFlag: "", // 자동 로그인 플래그
    nickname: "", // 사용자 닉네임
    profileImagePath: "", // 프로필 이미지 경로
    loginType: "", // 로그인 방식 (예: 'original', 'kakao')
  });

  console.log("AuthProvider: 초기 authInfo 상태:", authInfo);

  /**
   * 사용자 로그아웃 처리. 로컬 스토리지의 토큰을 제거하고 인증 정보를 초기화합니다.
   */
  const logout = () => {
    console.log("로그아웃 실행: 로컬 스토리지 비우기 및 인증 정보 초기화");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("autoLoginFlag");
    setAuthInfo({
      isLoggedIn: false,
      role: "",
      name: "",
      userid: "",
      autoLoginFlag: "",
      nickname: "",
      profileImagePath: "",
      loginType: "",
    });
  };

  /**
   * 로그아웃 후 로그인 페이지로 리다이렉트합니다.
   * 이미 로그아웃 상태이거나 토큰이 없으면 아무것도 하지 않습니다.
   */
  const logoutAndRedirect = () => {
    if (!authInfo.isLoggedIn && !localStorage.getItem("accessToken")) return;
    logout();
    window.location.href = "/user/login";
  };

  /**
   * AccessToken과 RefreshToken을 로컬 스토리지에 저장하고, AccessToken을 파싱하여
   * authInfo 상태를 업데이트합니다.
   * @param {string} accessToken - 새 AccessToken
   * @param {string} refreshToken - 새 RefreshToken
   */
  const updateTokens = (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      const parsedToken = parseAccessToken(accessToken);

      if (parsedToken) {
        const newAuthInfo = {
          isLoggedIn: true,
          role: parsedToken.role || "",
          name: parsedToken.name || "",
          userid: parsedToken.userid || "",
          autoLoginFlag: parsedToken.autoLoginFlag || "N",
          nickname: parsedToken.nickname || "",
          profileImagePath: authInfo.profileImagePath, // 기존 값 유지
          loginType: parsedToken.loginType || "", // 'loginType' 키 사용
        };
        console.log("updateTokens: 새로운 authInfo:", newAuthInfo);
        setAuthInfo(newAuthInfo);
      } else {
        console.error("updateTokens: 유효하지 않은 토큰, 로그아웃 처리");
        logoutAndRedirect();
      }
    }
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  /**
   * 현재 사용자의 프로필 이미지 경로를 업데이트합니다.
   * @param {string} newPath - 새 프로필 이미지 경로
   */
  const updateProfileImagePath = (newPath) => {
    setAuthInfo((prev) => ({
      ...prev,
      profileImagePath: newPath,
    }));
    console.log("AuthContext: profileImagePath 업데이트됨:", newPath);
  };

  /**
   * 토큰 만료 시 자동으로 토큰을 재발급하고 API 요청을 재시도하는 보안 API 요청 래퍼 함수입니다.
   * 이 함수는 `handleReissueTokens`보다 먼저 정의되어야 합니다.
   * @param {string} URL - 요청할 API 엔드포인트
   * @param {object} [options={}] - 요청 옵션 (method, body, params 등)
   * @param {boolean} [retry=true] - 토큰 만료 시 재시도 여부
   * @returns {Promise<object>} API 응답 데이터
   * @throws {Error} AccessToken 또는 RefreshToken이 없거나 API 요청 실패 시
   */
  const secureApiRequest = async (URL, options = {}, retry = true) => {
    console.log("secureApiRequest 실행: URL=", URL, "options=", options);

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      console.error(
        "secureApiRequest: AccessToken 또는 RefreshToken이 없습니다."
      );
      throw new Error(
        "AccessToken 또는 RefreshToken이 없습니다. 다시 로그인해주세요."
      );
    }

    try {
      const method = options.method || "GET";
      const data = options.body || null;
      const isFormData = data instanceof FormData;
      console.log("FormData 여부:", isFormData);

      if (isFormData) {
        for (let pair of data.entries()) {
          console.log(pair[0] + ":" + pair[1]);
        }
      }
      const params = options.params || null;
      const response = await apiClient({
        url: URL,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ...(isFormData
            ? { "Content-Type": "multipart/form-data" }
            : { "Content-Type": "application/json" }),
        },
        data,
        params,
      });
      return response;
    } catch (error) {
      console.error("API 요청 실패 - 상태 코드:", error.response?.status);
      console.error("API 응답 헤더:", error.response?.headers);
      console.error("API 응답 데이터:", error.response?.data);

      const tokenExpiredHeader = error.response?.headers["token-expired"];

      if (error.response?.status === 401 && retry) {
        if (tokenExpiredHeader === "RefreshToken") {
          // RefreshToken 만료 시
          if (authInfo.autoLoginFlag === "Y") {
            try {
              console.log(
                "secureApiRequest: RefreshToken 만료 및 자동 로그인 연장 시도."
              );
              await handleReissueTokens(true); // 자동 로그인 연장 시도
              return secureApiRequest(URL, options, false); // 재시도 (재귀 호출 시에는 retry=false)
            } catch (refreshError) {
              console.error(
                "자동 로그인 연장 실패:",
                refreshError.response?.data
              );
              alert("로그아웃 되었습니다. 다시 로그인하세요.");
              logoutAndRedirect();
            }
          } else {
            const confirmExtend = window.confirm(
              "로그인 세션이 만료되었습니다. 로그인 연장하시겠습니까?"
            );
            if (confirmExtend) {
              try {
                console.log(
                  "secureApiRequest: RefreshToken 만료 및 수동 로그인 연장 시도."
                );
                await handleReissueTokens(true); // 수동 로그인 연장 시도
                return secureApiRequest(URL, options, false); // 재시도 (재귀 호출 시에는 retry=false)
              } catch (refreshError) {
                console.error("로그인 연장 실패:", refreshError.response?.data);
                alert("로그아웃 되었습니다. 다시 로그인하세요.");
                logoutAndRedirect();
              }
            } else {
              alert("로그인이 연장되지 않았습니다. 다시 로그인하세요.");
              logoutAndRedirect();
            }
          }
        } else if (tokenExpiredHeader === "AccessToken") {
          // AccessToken 만료 시 (RefreshToken은 유효)
          console.warn(
            "secureApiRequest: AccessToken 만료, RefreshToken으로 재발급 시도 중..."
          );
          try {
            await handleReissueTokens(); // AccessToken만 재발급 시도
            return secureApiRequest(URL, options, false); // 재시도 (재귀 호출 시에는 retry=false)
          } catch (accessError) {
            console.error(
              "AccessToken 재발급 실패:",
              accessError.response?.data
            );
            logoutAndRedirect();
          }
        }
      }
      throw error; // 재시도 후에도 실패하거나 다른 종류의 에러인 경우 에러 던지기
    }
  };

  /**
   * 토큰 만료 시 AccessToken 및 RefreshToken을 재발급받는 함수입니다.
   * @param {boolean} [extendLogin=false] - 자동 로그인 연장 여부
   * @returns {Promise<void>} 토큰 재발급이 완료되면 resolve되는 Promise
   */
  const handleReissueTokens = async (extendLogin = false) => {
    let accessToken = localStorage.getItem("accessToken")?.trim();
    let refreshToken = localStorage.getItem("refreshToken")?.trim();

    if (!accessToken || !refreshToken) {
      console.error("Reissue 요청 실패: 토큰이 존재하지 않습니다.");
      alert("로그아웃 되었습니다. 다시 로그인하세요.");
      logoutAndRedirect();
      return;
    }

    try {
      console.log(
        "Reissue 요청 - AccessToken:",
        accessToken ? "존재함" : "없음"
      );
      console.log(
        "Reissue 요청 - RefreshToken:",
        refreshToken ? "존재함" : "없음"
      );

      const response = await apiClient.post("/reissue", null, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          RefreshToken: `Bearer ${refreshToken}`,
          ExtendLogin: extendLogin ? "true" : "false",
        },
      });

      console.log("Reissue 성공 - 응답 헤더:", response.headers);
      updateTokens(
        response.headers["Authorization"]?.split(" ")[1]?.trim(),
        response.headers["Refresh-Token"]?.split(" ")[1]?.trim()
      );
    } catch (error) {
      console.error("재발급 실패 상태:", error.response?.status);
      console.error("재발급 실패 응답 데이터:", error.response?.data);

      const expiredTokenType = error.response?.headers["token-expired"];
      if (
        expiredTokenType === "RefreshToken" ||
        error.response?.data === "Session Expired"
      ) {
        alert("세션이 만료되었습니다. 다시 로그인해주세요");
        logoutAndRedirect();
      } else if (expiredTokenType === "AccessToken") {
        console.warn("AccessToken 만료됨. RefreshToken으로 재발급 시도 중...");
        // AccessToken만 만료된 경우, RefreshToken으로 재발급 시도 (자기 자신을 재귀 호출)
        return await handleReissueTokens();
      } else {
        console.error("Reissue 중 예상치 못한 오류 발생:", error.message);
        logoutAndRedirect();
      }
    }
  };

  // 컴포넌트 마운트 시 초기 인증 상태를 확인하고 설정
  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedAutoLoginFlag = localStorage.getItem("autoLoginFlag");

    console.log(
      "AuthProvider useEffect 실행: storedAccessToken=",
      storedAccessToken ? "존재함" : "없음",
      "storedRefreshToken=",
      storedRefreshToken ? "존재함" : "없음",
      "storedAutoLoginFlag=",
      storedAutoLoginFlag
    );

    if (storedAccessToken && storedRefreshToken) {
      const parsedToken = parseAccessToken(storedAccessToken);
      console.log("AuthProvider useEffect: parsedAccessToken=", parsedToken);

      if (parsedToken) {
        // 유효한 토큰이 있으면 사용자 정보를 로드
        const fetchUserProfileImage = async () => {
          try {
            // secureApiRequest를 사용하여 사용자 상세 정보 가져오기
            const userInfoResponse = await secureApiRequest(
              `/user/myinfo-detail`,
              { method: "GET" }
            );
            const profilePath = userInfoResponse.data.profileImagePath || "";
            setAuthInfo({
              isLoggedIn: true,
              role: parsedToken.role || "",
              name: parsedToken.name || "",
              userid: parsedToken.userid || "",
              autoLoginFlag: storedAutoLoginFlag || "N",
              nickname: parsedToken.nickname || "",
              profileImagePath: profilePath,
              loginType: parsedToken.loginType || "", // 'loginType' 키 사용
            });
            console.log(
              "AuthProvider useEffect: authInfo 설정 (프로필 이미지 포함) ->",
              { isLoggedIn: true, loginType: parsedToken.loginType }
            );
          } catch (error) {
            console.error("프로필 이미지 로드 실패:", error);
            // 실패 시에도 기본 정보로 설정 (프로필 이미지 경로만 빈 값으로)
            setAuthInfo({
              isLoggedIn: true,
              role: parsedToken.role || "",
              name: parsedToken.name || "",
              userid: parsedToken.userid || "",
              autoLoginFlag: storedAutoLoginFlag || "N",
              nickname: parsedToken.nickname || "",
              profileImagePath: "", // 실패 시 빈 값
              loginType: parsedToken.loginType || "", // 'loginType' 키 사용
            });
            console.log(
              "AuthProvider useEffect: 프로필 이미지 로드 실패 후 authInfo 설정 ->",
              { isLoggedIn: true, loginType: parsedToken.loginType }
            );
          }
        };
        fetchUserProfileImage();
      } else {
        // AccessToken이 유효하지 않으면 재발급 시도 또는 로그아웃
        console.log("AccessToken 유효하지 않음. 재발급 시도 또는 로그아웃");
        handleReissueTokens(storedAutoLoginFlag === "Y").catch(() => {
          console.log("토큰 재발급 실패. 로그아웃 처리.");
          logoutAndRedirect();
        });
      }
    } else {
      // 토큰이 없으면 로그인 상태가 아님으로 설정
      console.log("토큰 없음. 로그인 상태 아님.");
      setAuthInfo({
        isLoggedIn: false,
        role: "",
        name: "",
        userid: "",
        autoLoginFlag: "",
        nickname: "",
        profileImagePath: "",
        loginType: "", // 토큰 없을 때도 'loginType' 초기화
      });
      console.log("AuthProvider useEffect: 토큰 없음. authInfo 설정 ->", {
        isLoggedIn: false,
        loginType: "",
      });
    }
  }, []); // 의존성 배열은 비워둡니다.

  return (
    <AuthContext.Provider
      value={{
        ...authInfo, // 현재 인증 정보 상태
        setAuthInfo, // authInfo 상태를 직접 업데이트하는 함수
        secureApiRequest, // 보안 API 요청 래퍼 함수
        updateTokens, // 토큰 업데이트 함수
        logout, // 로그아웃 함수
        logoutAndRedirect, // 로그아웃 후 리다이렉트 함수
        updateProfileImagePath, // 프로필 이미지 경로 업데이트 함수
      }}
    >
      {console.log(
        "AuthContext.Provider Value: ==============================",
        {
          ...authInfo,
          setAuthInfo,
          secureApiRequest,
          updateTokens,
          logout,
          logoutAndRedirect,
          updateProfileImagePath,
        }
      )}
      {children}
    </AuthContext.Provider>
  );
};
