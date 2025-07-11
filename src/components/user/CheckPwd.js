import React, { useState, useEffect } from "react";
import zxcvbn from "zxcvbn";
import styles from "./CheckPwd.module.css";

function CheckPwd({ password, confirmPwd, onChange, onValidationChange }) {
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordScore, setPasswordScore] = useState(0);
  const isMessageVisible = password && password.length > 0;

  useEffect(() => {
    if (password) {
      const result = zxcvbn(password);
      setPasswordScore(result.score);
    } else {
      setPasswordScore(0);
    }
  }, [password]);

  useEffect(() => {
    const match = password === confirmPwd;
    setPasswordMatch(match);
    // 비밀번호 강도 조건은 SignUp에서 추가로 검사하거나,
    // 이 onValidationChange는 오직 '일치 여부'만 알려주도록 변경
    if (onValidationChange) {
      onValidationChange(match); // 이제 오직 일치 여부만 전달
    }
  }, [password, confirmPwd, onValidationChange]);

  return (
    <>
      {" "}
      <div className={styles.inputGroup}>
        {" "}
        <input
          type="password"
          name="password"
          className={styles.input}
          placeholder="비밀번호"
          value={password}
          onChange={onChange}
          required
          maxLength={16}
        />{" "}
        {isMessageVisible && (
          <div className={styles.messageWrapper}>
            {" "}
            <p
              className={`${styles.messageSpace} ${
                passwordScore === 0
                  ? styles["strength-weak"]
                  : passwordScore === 1
                    ? styles["strength-medium"]
                    : passwordScore === 2
                      ? styles["strength-strong"]
                      : styles["strength-veryStrong"]
              }`}
            >
              비밀번호 강도:{" "}
              {
                ["약함", "보통", "강함", "매우 강함"][
                  Math.min(passwordScore, 3)
                ]
              }{" "}
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
      <div className={styles.inputGroup}>
        {" "}
        <input
          type="password"
          name="confirmPwd"
          className={styles.input}
          placeholder="비밀번호 확인"
          value={confirmPwd}
          onChange={onChange}
          required
          maxLength={16}
        />{" "}
        {!passwordMatch && password && confirmPwd && (
          <div className={styles.messageWrapper}>
            {" "}
            <p className={styles.errorMessage}>
              비밀번호가 일치하지 않습니다.
            </p>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </>
  );
}

export default CheckPwd;
