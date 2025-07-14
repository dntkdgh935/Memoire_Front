import React, { useState, useEffect } from "react";
import Cleave from "cleave.js/react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import apiClient from "../../utils/axios";
import styles from "./UserVerification.module.css"; // CSS 모듈 임포트

function UserVerification({ phone, setPhone, onVerificationComplete }) {
  // const [verificationCode, setVerificationCode] = useState(""); // ✅ 이 상태는 더 이상 사용하지 않음
  const [displayedCode, setDisplayedCode] = useState(""); // ✅ 발급받은 인증번호를 저장할 새로운 상태
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const API_BASE_URL = "/api/verification";

  useEffect(() => {
    if (isVerified || !isCodeSent) {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [isVerified, isCodeSent, timerInterval]);

  useEffect(() => {
    if (isCodeSent && remainingTime > 0 && !isVerified) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setTimerInterval(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(timer);
      return () => clearInterval(timer);
    } else if (remainingTime === 0 && isCodeSent && !isVerified) {
      showMessage(
        "인증 유효 시간이 만료되었습니다. 다시 시도해주세요.",
        "error"
      );
    }
  }, [isCodeSent, remainingTime, isVerified]);

  const showMessage = (text, type = "info") => {
    setMessage({ text, type });
  };

  const handlePhoneChange = (e) => {
    const rawValue = e.target.rawValue;
    setPhone(rawValue);
    setIsCodeSent(false);
    setIsVerified(false);
    // setVerificationCode(""); // ✅ 이 부분 제거
    setDisplayedCode(""); // ✅ 표시할 인증번호 초기화
    setMessage({ text: "", type: "" });
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setRemainingTime(0);
    onVerificationComplete(false);
  };

  const phoneNumberParsed = parsePhoneNumberFromString(phone, "KR");
  const isValidPhone = phoneNumberParsed?.isValid() ?? false;

  const handleGenerateCode = async () => {
    if (!phone) {
      showMessage("휴대폰 번호를 입력해주세요.", "error");
      return;
    }
    if (!isValidPhone) {
      showMessage("유효하지 않은 휴대폰 번호입니다.", "error");
      return;
    }
    if (isVerified) {
      showMessage("이미 인증이 완료되었습니다.", "info");
      return;
    }

    setIsLoading(true);
    showMessage("");
    try {
      const response = await apiClient.post(`${API_BASE_URL}/generate-code`, {
        phone: phone,
      });
      const data = response.data;

      if (data.verificationCode) {
        setDisplayedCode(data.verificationCode); // ✅ 발급받은 인증번호를 저장
        showMessage(
          `이 번호를 복사하여 <span class="${styles.highlightText}">kdong1230@naver.com</span>(으)로 MMS 문자 메시지를 보내주세요. ` +
            `<br><span class="${styles.boldHighlight}">MMS 내용에는 반드시 인증번호만 포함</span>되어야 합니다.` +
            `<br>메일 발송 후 <span class="${styles.boldHighlight}">최소 10초 이상 기다린 후</span> 아래 "인증 확인" 버튼을 눌러주세요.`,
          "success"
        );
        setIsCodeSent(true);
        setRemainingTime(5 * 60);
        if (timerInterval) clearInterval(timerInterval);
      } else {
        showMessage(
          "인증번호 발급에 실패했습니다. 다시 시도해주세요.",
          "error"
        );
      }
    } catch (error) {
      console.error("인증번호 생성 오류:", error);
      showMessage(
        "인증번호 발급 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!phone || !displayedCode) {
      // ✅ displayedCode 사용
      showMessage("휴대폰 번호와 인증번호를 모두 입력해주세요.", "error");
      return;
    }
    if (isVerified) {
      showMessage("이미 인증이 완료되었습니다.", "info");
      return;
    }
    if (remainingTime <= 0) {
      showMessage(
        "인증 유효 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.",
        "error"
      );
      return;
    }

    setIsLoading(true);
    showMessage("");
    try {
      const response = await apiClient.post(`${API_BASE_URL}/verify-code`, {
        phone: phone,
        verificationCode: displayedCode, // ✅ displayedCode 사용
      });
      const data = response.data;

      if (data.verificationCode === "success") {
        showMessage(`인증 성공! 전화번호: ${data.phone}`, "success");
        setIsVerified(true);
        onVerificationComplete(true);
      } else if (data.verificationCode === "wait") {
        showMessage(
          `인증 대기 중: 이메일 확인 중이거나 서버 응답 지연. 잠시 후 다시 시도해주세요.`,
          "info"
        );
        onVerificationComplete(false);
      } else {
        showMessage(
          `인증 실패: 유효하지 않은 코드이거나 오류가 발생했습니다.`,
          "error"
        );
        setIsVerified(false);
        onVerificationComplete(false);
      }
    } catch (error) {
      console.error("인증 확인 오류:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message &&
        error.response.data.message.includes("IMAP verification failed")
      ) {
        showMessage(
          "IMAP 인증에 실패했습니다. 메일 발송 상태를 확인해주세요.",
          "error"
        );
      } else {
        showMessage(
          "인증 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          "error"
        );
      }
      setIsVerified(false);
      onVerificationComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* 전화번호 입력 및 발송 버튼 그룹 */}
      <div className={styles.phoneInputWithButton}>
        <div className={styles.inputGroup}>
          <Cleave
            className={styles.input}
            placeholder="010-1234-5678"
            options={{
              delimiters: ["-", "-"],
              blocks: [3, 4, 4],
              numericOnly: true,
            }}
            value={phoneNumberParsed?.formatNational() ?? phone}
            onChange={handlePhoneChange}
            disabled={isCodeSent && !isVerified}
          />
          {isCodeSent && remainingTime > 0 && !isVerified && (
            <span className={styles.timerDisplay}>
              {formatTime(remainingTime)}
            </span>
          )}
        </div>
        {!isCodeSent || (remainingTime <= 0 && !isVerified) ? (
          <button
            type="button"
            onClick={handleGenerateCode}
            className={`${styles.actionButton} ${isLoading ? styles.loading : ""}`}
            disabled={isLoading || !isValidPhone || isVerified}
          >
            {isLoading ? "발송 중..." : "인증번호 발급"}
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.actionButton} ${styles.disabledButton}`}
            disabled
          >
            발급완료
          </button>
        )}
      </div>
      {/* 전화번호 유효성 에러 메시지는 inputGroup 바로 아래에 있어야 함 */}
      {!isValidPhone && phone && (
        <span className={styles.errorText}>유효하지 않은 전화번호입니다.</span>
      )}
      {/* 인증번호 '입력' (실제로는 출력) 및 확인 버튼 그룹 */}
      {isCodeSent && !isVerified && (
        <div className={styles.verificationInputGroup}>
          {/* ✅ input 태그 대신 읽기 전용 div 또는 span 사용 */}
          <div
            className={styles.input} // input과 동일한 스타일을 적용하기 위해
            style={{
              display: "flex",
              alignItems: "center",
              paddingLeft: "12px", // input과 동일한 좌측 패딩
              color: "#333", // 텍스트 색상
              backgroundColor: "#f0f0f0", // 읽기 전용 느낌을 주기 위한 배경색
              cursor: "default", // 커서 변경
              userSelect: "text", // 텍스트 선택 가능하도록
              fontWeight: "bold", // 인증번호 강조
            }}
          >
            {displayedCode ? displayedCode : "인증번호 대기 중..."}
          </div>
          <button
            type="button"
            onClick={handleVerifyCode}
            className={`${styles.actionButton} ${isLoading ? styles.loading : ""}`}
            disabled={
              isLoading ||
              displayedCode.length !== 4 || // ✅ displayedCode 사용
              isVerified ||
              remainingTime <= 0
            }
          >
            {isLoading ? "확인 중..." : "인증 확인"}
          </button>
        </div>
      )}

      {isVerified && (
        <div className={styles.verifiedMessage}>✓ 휴대폰 인증 완료!</div>
      )}

      {message.text && (
        <div
          className={`${styles.messageBox} ${
            message.type === "success"
              ? styles.success
              : message.type === "error"
                ? styles.error
                : styles.info
          }`}
          dangerouslySetInnerHTML={{ __html: message.text }}
        ></div>
      )}
    </div>
  );
}

export default UserVerification;
