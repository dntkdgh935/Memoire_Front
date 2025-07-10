// src/components/user/CheckPwd.js
import React, { useState, useEffect } from "react"; // useRef는 필요 없어 보입니다.
import styles from "./CheckPwd.module.css";
function CheckPwd({ password, confirmPwd, onChange, onValidationChange }) {
  // `password`, `confirmPwd`는 부모로부터 props로 받습니다.
  // `onChange`는 부모의 `handleChange` 함수를 연결하기 위함입니다.
  // `onValidationChange`는 이 컴포넌트의 유효성 상태를 부모에게 알리기 위함입니다.

  const [passwordMatch, setPasswordMatch] = useState(true); // 비밀번호 일치 여부 상태

  // password 또는 confirmPwd가 변경될 때마다 유효성 검사 실행
  useEffect(() => {
    if (password && confirmPwd) {
      // 둘 다 입력되었을 때만 검사
      const isMatch = password === confirmPwd;
      setPasswordMatch(isMatch);
      // 부모 컴포넌트에 유효성 상태 전달
      if (onValidationChange) {
        onValidationChange(isMatch);
      }
    } else {
      // 하나라도 비어있으면 초기 상태로 (유효성 검사 통과 아님)
      setPasswordMatch(true); // 비어있을 때는 에러 메시지 표시하지 않도록 true로 설정
      if (onValidationChange) {
        onValidationChange(false); // 또는 null, 부모에서 판단하도록
      }
    }
  }, [password, confirmPwd, onValidationChange]);

  // handleConfirmPwd는 더 이상 필요 없습니다.
  // useEffect가 password, confirmPwd 변경 시마다 자동으로 검사합니다.

  return (
    <>
      {" "}
      {/* Fragment를 사용하여 여러 요소를 감쌈 */}
      <div className={styles.inputGroup}>
        {" "}
        {/* styles.formGroup 대신 기존 SignUp.js의 styles.inputGroup 사용 */}
        <input
          type="password"
          name="password" // formData.password 대신 직접 `password` prop 사용
          className={styles.input}
          placeholder="비밀번호"
          value={password}
          onChange={onChange} // 부모의 handleChange를 그대로 사용
          required
        />
      </div>
      <div className={styles.inputGroup}>
        <input
          type="password"
          name="confirmPwd" // formData.confirmPwd 대신 직접 `confirmPwd` prop 사용
          className={styles.input}
          placeholder="비밀번호 확인"
          value={confirmPwd}
          onChange={onChange} // 부모의 handleChange를 그대로 사용
          // onBlur={handleConfirmPwd} // 필요 없음, useEffect에서 처리
          required
        />
        {/* 비밀번호 불일치 시 메시지 표시 */}
        {!passwordMatch && password && confirmPwd && (
          <p className={styles.errorMessage}>비밀번호가 일치하지 않습니다.</p>
        )}
      </div>
    </>
  );
}

export default CheckPwd;
