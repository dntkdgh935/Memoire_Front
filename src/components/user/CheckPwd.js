// src/components/CheckPwd.js (수정된 코드)

import React, { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";
import styles from "./CheckPwd.module.css";

// onValidationChange: 비밀번호 일치 여부 (boolean)
// onPasswordStrengthChange: 비밀번호 강도 점수 (0-4) - 새로 추가할 prop
function CheckPwd({
  password,
  confirmPwd,
  onChange,
  onValidationChange,
  onPasswordStrengthChange,
}) {
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordScore, setPasswordScore] = useState(0);
  const isMessageVisible = password && password.length > 0;

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordScore(result.score); // zxcvbn 점수는 0(가장 약함) ~ 4(가장 강함)
      // ✅ 비밀번호 강도 점수를 상위 컴포넌트로 전달
      if (onPasswordStrengthChange) {
        onPasswordStrengthChange(result.score);
      }
    } else {
      setPasswordScore(0);
      // ✅ 비밀번호가 없을 때도 강도 점수를 0으로 전달
      if (onPasswordStrengthChange) {
        onPasswordStrengthChange(0);
      }
    }
  }, [password, onPasswordStrengthChange]); // onPasswordStrengthChange를 의존성 배열에 추가

  useEffect(() => {
    const match = password === confirmPwd;
    setPasswordMatch(match);
    // 비밀번호 일치 여부만 상위 컴포넌트로 전달
    if (onValidationChange) {
      onValidationChange(match);
    }
  }, [password, confirmPwd, onValidationChange]);

  return (
    <>
      <div className={styles.inputGroup}>
        <input
          type="password"
          name="password" // 새 비밀번호 입력 필드로 사용될 때의 이름
          className={styles.input}
          placeholder="새 비밀번호" // 또는 "비밀번호"
          value={password}
          onChange={onChange}
          required
          maxLength={16}
        />
        {isMessageVisible && (
          <div className={styles.messageWrapper}>
            <p
              className={`${styles.messageSpace} ${
                // zxcvbn 점수는 0부터 시작하므로, 인덱스 0~4에 해당하는 클래스 매핑
                passwordScore === 0
                  ? styles["strength-veryWeak"] // 새로 추가할 클래스 (0점)
                  : passwordScore === 1
                    ? styles["strength-weak"]
                    : passwordScore === 2
                      ? styles["strength-medium"]
                      : passwordScore === 3
                        ? styles["strength-strong"]
                        : styles["strength-veryStrong"] // 4점
              }`}
            >
              비밀번호 강도:{" "}
              {
                // zxcvbn 점수(0~4)에 따른 메시지 매핑
                ["아주 약함", "약함", "보통", "강함", "매우 강함"][
                  passwordScore
                ]
              }
            </p>
          </div>
        )}
      </div>
      <div className={styles.inputGroup}>
        <input
          type="password"
          name="confirmPwd" // 새 비밀번호 확인 입력 필드의 이름
          className={styles.input}
          placeholder="새 비밀번호 확인" // 또는 "비밀번호 확인"
          value={confirmPwd}
          onChange={onChange}
          required
          maxLength={16}
        />
        {!passwordMatch && password && confirmPwd && (
          <div className={styles.messageWrapper}>
            <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default CheckPwd;
