// src/components/CheckPwd.js

import React, { useState, useEffect, useCallback } from "react";
import zxcvbn from "zxcvbn";
import styles from "./CheckPwd.module.css";

/**
 * 비밀번호 유효성 검사 및 강도 측정을 위한 컴포넌트.
 *
 * @param {object} props - 컴포넌트 속성
 * @param {string} props.password - 현재 입력된 비밀번호
 * @param {string} props.confirmPwd - 비밀번호 확인 필드에 입력된 값
 * @param {function} props.onChange - 비밀번호 입력 필드 변경 핸들러
 * @param {function} props.onValidationChange - 비밀번호 일치 여부(boolean)를 상위로 전달하는 콜백
 * @param {function} props.onPasswordStrengthChange - 비밀번호 강도 점수(0-4)를 상위로 전달하는 콜백
 * @param {boolean} [props.disabled=false] - 입력 필드를 비활성화할지 여부
 */
function CheckPwd({
  password,
  confirmPwd,
  onChange,
  onValidationChange,
  onPasswordStrengthChange,
  disabled = false, // disabled prop 추가 및 기본값 설정
}) {
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordScore, setPasswordScore] = useState(0);

  useEffect(() => {
    let currentScore = 0;
    if (password) {
      const result = zxcvbn(password);
      currentScore = result.score;
    }
    setPasswordScore(currentScore);
    if (onPasswordStrengthChange) {
      onPasswordStrengthChange(currentScore);
    }
  }, [password, onPasswordStrengthChange]);

  useEffect(() => {
    const match = password === confirmPwd;
    setPasswordMatch(match);
    if (onValidationChange) {
      onValidationChange(match);
    }
  }, [password, confirmPwd, onValidationChange]);

  const strengthMessages = ["아주 약함", "약함", "보통", "강함", "매우 강함"];
  const strengthClasses = [
    styles["strength-veryWeak"],
    styles["strength-weak"],
    styles["strength-medium"],
    styles["strength-strong"],
    styles["strength-veryStrong"],
  ];

  const isStrengthMessageVisible = password && password.length > 0;
  const isMismatchMessageVisible = !passwordMatch && password && confirmPwd;

  return (
    <>
      <div className={styles.inputGroup}>
        <input
          type="password"
          name="password"
          className={styles.input}
          placeholder="비밀번호"
          value={password}
          onChange={onChange}
          maxLength={16}
          aria-label="새 비밀번호 입력"
          disabled={disabled} // disabled prop 적용
        />
        {isStrengthMessageVisible && (
          <div className={styles.messageWrapper}>
            <p
              className={`${styles.messageSpace} ${strengthClasses[passwordScore]}`}
            >
              비밀번호 강도: {strengthMessages[passwordScore]}
            </p>
          </div>
        )}
      </div>
      <div className={styles.inputGroup}>
        <input
          type="password"
          name="confirmPwd"
          className={styles.input}
          placeholder="비밀번호 확인"
          value={confirmPwd}
          onChange={onChange}
          maxLength={16}
          aria-label="새 비밀번호 확인 입력"
          disabled={disabled} // disabled prop 적용
        />
        {isMismatchMessageVisible && (
          <div className={styles.messageWrapper}>
            <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default React.memo(CheckPwd);
