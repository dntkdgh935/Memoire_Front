import { createContext, useState, useEffect } from "react";
import apiClient from "./utils/axios";

export const AuthContext = createContext(null);

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

    console.log("parseAccessToken: 파싱된 페이로드:", parsed);

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

export const AuthProvider = ({ children }) => {
  const [authInfo, setAuthInfo] = useState({
    isLoggedIn: null,
    role: "",
    name: "",
    userid: "",
    autoLoginFlag: "",
    nickname: "",
    profileImagePath: "", // <-- profileImagePath 상태 추가
    setAuthInfo: () => {},
  });

  console.log("AuthProvider: 초기 authInfo 상태:", authInfo);

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
      profileImagePath: "", // <-- 초기화 시에도 포함
      setAuthInfo,
    });
  };

  const logoutAndRedirect = () => {
    if (!authInfo.isLoggedIn && !localStorage.getItem("accessToken")) return;
    logout();
    window.location.href = "/user/login";
  };

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
          profileImagePath: authInfo.profileImagePath, // 기존 값 유지 (토큰에는 없을 수 있음)
          setAuthInfo,
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

  // <-- 새로운 함수 추가: 프로필 이미지 경로 업데이트
  const updateProfileImagePath = (newPath) => {
    setAuthInfo((prev) => ({
      ...prev,
      profileImagePath: newPath,
    }));
    console.log("AuthContext: profileImagePath 업데이트됨:", newPath);
  };
  // -->

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
      console.log("Reissue 요청 - AccessToken:", accessToken);
      console.log("Reissue 요청 - RefreshToken:", refreshToken);

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
        return await handleReissueTokens();
      } else {
        console.error("Reissue 중 예상치 못한 오류 발생:", error.message);
        logoutAndRedirect();
      }
    }
  };

  useEffect(() => {
    const storedAccessToken = localStorage.getItem("accessToken");
    const storedRefreshToken = localStorage.getItem("refreshToken");
    const storedAutoLoginFlag = localStorage.getItem("autoLoginFlag");

    console.log(
      "AuthProvider useEffect 실행: storedAccessToken=",
      storedAccessToken,
      "storedRefreshToken=",
      storedRefreshToken,
      "storedAutoLoginFlag=",
      storedAutoLoginFlag
    );

    if (storedAccessToken && storedRefreshToken) {
      const parsedToken = parseAccessToken(storedAccessToken);
      console.log("AuthProvider useEffect: parsedAccessToken=", parsedToken);

      if (parsedToken) {
        // 초기 로드 시 사용자 정보와 함께 프로필 이미지 경로도 가져옴
        const fetchUserProfileImage = async () => {
          try {
            const userInfoResponse = await apiClient.get(`/user/myinfo-detail`); // 백엔드에서 사용자 상세 정보 가져오기
            const profilePath = userInfoResponse.data.profileImagePath || "";
            setAuthInfo({
              isLoggedIn: true,
              role: parsedToken.role || "",
              name: parsedToken.name || "",
              userid: parsedToken.userid || "",
              autoLoginFlag: storedAutoLoginFlag || "N",
              nickname: parsedToken.nickname || "",
              profileImagePath: profilePath, // <-- 여기에서 설정
              setAuthInfo,
            });
            console.log(
              "AuthProvider useEffect: authInfo 설정 (프로필 이미지 포함)"
            );
          } catch (error) {
            console.error("프로필 이미지 로드 실패:", error);
            // 실패 시에도 기본 정보로 설정
            setAuthInfo({
              isLoggedIn: true,
              role: parsedToken.role || "",
              name: parsedToken.name || "",
              userid: parsedToken.userid || "",
              autoLoginFlag: storedAutoLoginFlag || "N",
              nickname: parsedToken.nickname || "",
              profileImagePath: "", // 실패 시 빈 값
              setAuthInfo,
            });
          }
        };
        fetchUserProfileImage();
      } else {
        console.log("AccessToken 유효하지 않음. 재발급 시도 또는 로그아웃");
        handleReissueTokens(storedAutoLoginFlag === "Y").catch(() => {
          console.log("토큰 재발급 실패. 로그아웃 처리.");
          logoutAndRedirect();
        });
      }
    } else {
      console.log("토큰 없음. 로그인 상태 아님.");
      setAuthInfo({
        isLoggedIn: false,
        role: "",
        name: "",
        userid: "",
        autoLoginFlag: "",
        nickname: "",
        profileImagePath: "",
        setAuthInfo,
      });
    }
  }, []); // 의존성 배열에 secureApiRequest를 추가하지 않음 (무한 루프 방지)

  const secureApiRequest = async (URL, options = {}, retry = true) => {
    console.log("secureApiRequest 실행: URL=", URL, "options=", options);

    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken || !refreshToken) {
      throw new Error("AccessToken 또는 RefreshToken이 없습니다.");
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
          if (authInfo.autoLoginFlag === "Y") {
            try {
              await handleReissueTokens(true);
              return secureApiRequest(URL, options, false);
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
                await handleReissueTokens(true);
                return secureApiRequest(URL, options, false);
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
          console.warn("AccessToken 만료, RefreshToken으로 재발급 시도 중...");
          try {
            await handleReissueTokens();
            return secureApiRequest(URL, options, false);
          } catch (accessError) {
            console.error(
              "AccessToken 재발급 실패:",
              accessError.response?.data
            );
            logoutAndRedirect();
          }
        }
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authInfo,
        secureApiRequest,
        updateTokens,
        logout,
        logoutAndRedirect,
        updateProfileImagePath, // <-- 새로 추가된 함수 제공
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
