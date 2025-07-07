// src/util/axios.js
import axios from "axios";

// 페이지 공통 axios 객체 생성
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "applicateion/json",
  },
  withCredentials: true, // 쿠키 포함 함
});

//토큰 포함 요청 처리
apiClient.interceptors.request.use(
  (response) => {
    console.log("Axios 요청 성공 : ", response);
    return response;
  },
  (error) => {
    // 요청이 실패해서, fail 코드가 전송왔을 때 공통 처리 내용 작성함
    // await 사용으로 .catch((error) => { 실패시 처리내용 }) 생략됨 => 이 부분을 담당함
    console.error("Axios 응답 에러 : ", error);
    return Promise.reject(error);
  },
  (config) => {
    // axios 로 요청시 같이 전송보낼 토큰 지정 처리
    // 로그인 성공시 저장해 놓은 localStorage 에서 토큰을 꺼냄
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (accessToken && refreshToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`; //빽틱 사용해야 함
      config.headers["RefreshToken"] = `Bearer ${refreshToken}`; //빽틱 사용해야 함
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
