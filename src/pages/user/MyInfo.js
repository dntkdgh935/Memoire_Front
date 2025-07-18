// src/pages/MyInfo.js

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider"; // AuthProvider.js 경로에 맞게 수정
import CheckPwd from "../../components/user/CheckPwd"; // CheckPwd.js 경로에 맞게 수정
import styles from "./MyInfo.module.css"; // CSS 모듈 사용을 가정

function MyInfo() {
  const { secureApiRequest, authInfo, setAuthInfo } = useContext(AuthContext);

  // userData 초기화는 authInfo가 로드된 후에 진행되어야 합니다.
  // 초기에는 빈 값으로 시작하거나, 로딩 상태를 표시합니다.
  const [userData, setUserData] = useState({
    nickname: "",
    phone: "",
    birthday: "",
    statusMessage: "",
  });

  // 비밀번호 변경 관련 상태
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false); // CheckPwd에서 오는 유효성 (일치 여부)
  const [passwordStrengthScore, setPasswordStrengthScore] = useState(0); // CheckPwd에서 오는 비밀번호 강도

  // ✅ 사용자 정보를 불러오는 로딩 상태 추가
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);

  // 컴포넌트 마운트 시 사용자 정보 로드
  useEffect(() => {
    // AuthContext의 isLoggedIn과 userid가 유효할 때만 실행
    // isLoggedIn이 null이 아니거나 (로딩 완료), userid가 존재할 때 로직 실행
    if (authInfo.isLoggedIn !== null && authInfo.userid) {
      const fetchUserProfile = async () => {
        try {
          setIsLoadingUserData(true); // 데이터 로딩 시작
          const response = await secureApiRequest(
            `/user/profile?userid=${authInfo.userid}`,
            {
              method: "GET",
            }
          );
          // API 응답으로 받은 실제 사용자 정보로 userData 상태를 업데이트합니다.
          // 서버에서 없는 값은 빈 문자열로 처리하여 undefined 오류 방지
          setUserData({
            nickname: response.data.nickname || "",
            phone: response.data.phone || "",
            birthday: response.data.birthday || "",
            statusMessage: response.data.statusMessage || "",
          });
          console.log("사용자 정보 불러오기 성공:", response.data);
        } catch (error) {
          console.error(
            "사용자 정보 불러오기 실패:",
            error.response?.data || error.message
          );
          alert("사용자 정보를 불러오는 데 실패했습니다. 다시 시도해주세요.");
          // 필요하다면 로그인 페이지로 리다이렉트
          // navigate("/login");
        } finally {
          setIsLoadingUserData(false); // 데이터 로딩 완료
        }
      };
      fetchUserProfile();
    } else if (authInfo.isLoggedIn === false) {
      // 로그인되지 않은 상태면 로딩 완료로 처리하고, 사용자에게 로그인 필요 메시지 표시
      setIsLoadingUserData(false);
      // alert("로그인이 필요합니다."); // MyInfo 컴포넌트 내부에서 리다이렉션 대신 메시지 표시
    }
  }, [authInfo.isLoggedIn, authInfo.userid, secureApiRequest]); // authInfo?.nickname 대신 authInfo.isLoggedIn, authInfo.userid 사용

  // --- 초기 로딩 및 로그인 상태 체크 ---
  // `isLoggedIn`이 `null`이면 아직 `AuthProvider`에서 인증 정보를 확인 중입니다.
  // `isLoadingUserData`가 true이면 API 호출로 사용자 데이터를 불러오는 중입니다.
  if (authInfo.isLoggedIn === null || isLoadingUserData) {
    return <div>사용자 정보를 불러오는 중입니다...</div>;
  }

  // `isLoggedIn`이 `false`이면 로그인이 필요한 상태입니다.
  if (authInfo.isLoggedIn === false) {
    return <div>로그인이 필요합니다.</div>;
  }
  // --- 여기까지 초기 로딩 및 로그인 상태 체크 ---

  // 일반 정보 입력 핸들러
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // 비밀번호 입력 핸들러 (CheckPwd 컴포넌트의 onChange와 연결)
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    if (name === "password") {
      setNewPassword(value);
    } else if (name === "confirmPwd") {
      setConfirmNewPassword(value);
    } else if (name === "currentPassword") {
      setCurrentPassword(value);
    }
  };

  // CheckPwd 컴포넌트로부터 유효성 상태를 받음 (일치 여부)
  const handleCheckPwdValidation = (isValid) => {
    setIsPasswordValid(isValid);
  };

  // CheckPwd 컴포넌트로부터 비밀번호 강도 점수를 받음
  const handlePasswordStrengthChange = (score) => {
    setPasswordStrengthScore(score);
  };

  // 내 정보 수정 제출 핸들러
  const handleSubmitMyInfo = async (e) => {
    e.preventDefault();
    if (!authInfo.userid) {
      alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const payload = {
        userId: authInfo.userid,
        nickname: userData.nickname,
        phone: userData.phone,
        birthday: userData.birthday,
        statusMessage: userData.statusMessage,
      };
      const response = await secureApiRequest("/user/myinfo", {
        method: "PATCH",
        data: payload,
      });
      console.log("내 정보 변경 성공:", response.data);
      alert("내 정보가 성공적으로 변경되었습니다.");

      // 변경된 닉네임이 있다면 AuthContext의 authInfo도 업데이트합니다.
      setAuthInfo((prev) => ({
        ...prev,
        nickname: response.data.nickname || prev.nickname,
      }));
    } catch (error) {
      console.error(
        "내 정보 변경 실패:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data?.message || "내 정보 변경 중 오류가 발생했습니다.";
      alert(`오류: ${errorMessage}`);
    }
  };

  // 비밀번호 변경 제출 핸들러
  const handleSubmitPassword = async (e) => {
    e.preventDefault();

    // 클라이언트 측 유효성 검사
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert(
        "현재 비밀번호, 새 비밀번호, 새 비밀번호 확인을 모두 입력해주세요."
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (currentPassword === newPassword) {
      alert("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }
    // CheckPwd 컴포넌트에서 강도 점수를 받으므로, 여기서 최소 강도 확인 (예: '보통' 이상)
    if (passwordStrengthScore < 2) {
      alert(
        "비밀번호는 '보통' 이상으로 설정해주세요. (영문, 숫자, 특수문자 조합)"
      );
      return;
    }

    if (!authInfo.userid) {
      alert("사용자 정보를 불러올 수 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const payload = {
        userId: authInfo.userid,
        prevPwd: currentPassword,
        currPwd: newPassword,
      };
      const response = await secureApiRequest("/user/update/password", {
        method: "PATCH",
        data: payload,
      });
      console.log("비밀번호 변경 성공:", response.data);
      alert("비밀번호가 성공적으로 변경되었습니다.");

      // 성공 시 비밀번호 필드 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error(
        "비밀번호 변경 실패:",
        error.response?.data || error.message
      );
      const errorMessage =
        error.response?.data || "비밀번호 변경 중 오류가 발생했습니다.";
      alert(`오류: ${errorMessage}`);
    }
  };

  return (
    <div className={styles.container}>
      <h1>내 정보 관리</h1>

      <section className={styles.infoSection}>
        <h2>회원 정보 수정</h2>
        <form onSubmit={handleSubmitMyInfo}>
          <div className={styles.inputGroup}>
            <label htmlFor="userIdDisplay">사용자 ID:</label>
            <input
              type="text"
              id="userIdDisplay"
              value={authInfo.userid || ""} // authInfo.userid는 이미 체크되었으므로 ?. 생략 가능
              disabled
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="nickname">닉네임:</label>
            <input
              type="text"
              id="nickname"
              name="nickname"
              value={userData.nickname}
              onChange={handleInfoChange}
              maxLength={10}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">전화번호:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleInfoChange}
              placeholder="010-1234-5678"
              maxLength={13}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="birthday">생년월일:</label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={userData.birthday}
              onChange={handleInfoChange}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="statusMessage">상태 메시지:</label>
            <textarea
              id="statusMessage"
              name="statusMessage"
              value={userData.statusMessage}
              onChange={handleInfoChange}
              maxLength={100}
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            정보 수정
          </button>
        </form>
      </section>

      <hr className={styles.divider} />

      <section className={styles.passwordSection}>
        <h2>비밀번호 변경</h2>
        <form onSubmit={handleSubmitPassword}>
          <div className={styles.inputGroup}>
            <label htmlFor="currentPassword">현재 비밀번호:</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              className={styles.input}
              value={currentPassword}
              onChange={handlePasswordChange}
              required
              maxLength={16}
            />
          </div>
          <CheckPwd
            password={newPassword}
            confirmPwd={confirmNewPassword}
            onChange={handlePasswordChange}
            onValidationChange={handleCheckPwdValidation}
            onPasswordStrengthChange={handlePasswordStrengthChange}
          />
          <button type="submit" className={styles.submitButton}>
            비밀번호 변경
          </button>
        </form>
      </section>
    </div>
  );
}

export default MyInfo;
