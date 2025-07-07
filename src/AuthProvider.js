//src/AuthProvider.js
import { createContext, useState, useEffect } from "react";
import apiclient from "./utils/axios";

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
    return jsonPayload.parse(jsonPayload);
  } catch (error) {
    console.error("AccessToken 파싱오류 : ", error);
    return null;
  }
};
