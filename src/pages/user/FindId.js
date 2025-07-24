import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import { AuthContext } from "../../AuthProvider"; // AuthContext는 현재 사용되지 않지만, 기존 코드에 있었으므로 유지합니다.
import UserVerification from "../../components/user/UserVerification";
import styles from "./FindId.module.css";

function FindId() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const navigate = useNavigate(); // useNavigate 훅을 초기화합니다.

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
    if (!isPhoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return false;
    }
    if (!formData.name.trim()) {
      // 이름 필드의 공백도 검사
      alert("이름을 입력해주세요.");
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

    try {
      // 백엔드 API 호출 전에 formData 값을 콘솔에 로깅하여 확인합니다.
      console.log("Sending formData:", formData);

      // 백엔드 API 호출: 이름과 전화번호를 전송하여 사용자 ID를 찾습니다.
      // 백엔드 엔드포인트가 "/user/findid"로 가정합니다.
      // formData를 URLSearchParams로 변환 후 문자열로 만들고, Content-Type을 명시적으로 설정하여 전송합니다.
      const response = await apiClient.post(
        "/user/findid",
        new URLSearchParams(formData).toString(), // URLSearchParams를 문자열로 변환
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded", // Content-Type을 명시적으로 설정
          },
        }
      );

      // HTTP 상태 코드가 200 OK인 경우
      if (response.status === 200) {
        const foundLoginId = response.data; // 백엔드에서 응답 본문에 직접 loginId를 반환한다고 가정
        alert(
          `찾으신 아이디는 [${foundLoginId}] 입니다. 로그인 페이지로 이동합니다.`
        );
        // 찾은 아이디를 navigate 함수의 state로 전달하여 로그인 페이지로 이동합니다.
        navigate("/user/Login", { state: { foundId: foundLoginId } });
      }
    } catch (error) {
      console.error("아이디 찾기 실패 : ", error); // 오류 로깅

      // 백엔드에서 오류 응답 (예: 404 Not Found, 400 Bad Request, 500 Internal Server Error)을 보낸 경우
      if (error.response) {
        console.error("Backend Error Response:", error.response); // 백엔드 응답 객체 전체 로깅
        console.error("Backend Error Data:", error.response.data); // 백엔드 응답 데이터 로깅

        let errorMessage = "아이디 찾기에 실패했습니다. 다시 시도해 주세요.";
        if (typeof error.response.data === "string") {
          // 백엔드에서 문자열 형태의 오류 메시지를 보낸 경우
          errorMessage = error.response.data;
        } else if (
          typeof error.response.data === "object" &&
          error.response.data.message
        ) {
          // 백엔드에서 { message: "오류 메시지" }와 같은 JSON 객체를 보낸 경우
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "object") {
          // 그 외의 JSON 객체 형태인 경우, JSON.stringify로 변환하여 표시
          errorMessage = JSON.stringify(error.response.data);
        }
        alert(errorMessage);
      } else {
        // 네트워크 오류 등 백엔드 응답 자체가 없는 경우
        alert(
          "네트워크 오류 또는 서버 응답이 없습니다. 잠시 후 다시 시도해 주세요."
        );
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.findIdBox}>
        <h2 className={styles.title}>아이디 찾기</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.idInputGroup}>
            <input
              type="text"
              name="name"
              className={styles.input}
              placeholder="이름"
              value={formData.name}
              onChange={handleChange} // handleChange 함수 연결
              required
              maxLength={5}
            />
            {/* UserVerification 컴포넌트를 사용하여 휴대폰 인증 처리 */}
            <UserVerification
              phone={formData.phone}
              setPhone={(val) => setFormData({ ...formData, phone: val })}
              onVerificationComplete={handlePhoneVerificationComplete} // 인증 완료 콜백 함수 전달
              checkType="find"
            />
          </div>
          {/* 아이디 찾기 제출 버튼 */}
          <button type="submit" className={styles.findIdButton}>
            아이디 찾기
          </button>
        </form>
      </div>
    </div>
  );
}

export default FindId;
