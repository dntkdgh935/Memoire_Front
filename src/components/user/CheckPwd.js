//src/components/user/CheckPwd
import React, { useEffect, useState, useRef } from "react";

//전송 전에 input 값 유효성 검사 처리
const validate = () => {
  //암호와 암호 확인이 일치하는지 확인
  if (formData.userPwd !== formData.confirmPwd) {
    alert("비밀번호와 비밀번호 확인이 일치하지 않습니다. 다시 입력하세요.");
    return false;
  }

  //모든 유효성 검사를 통과하면
  return true;
};

// 암호확인 input 의 포커스(focus) 가 사라지면 작동되는 핸들러 함수임
const handleConfirmPwd = () => {
  if (formData.confirmPwd) {
    validate();
  }
};

return (
  <div>
    <div className={styles.formGroup}>
      <label htmlFor="userPwd">비밀번호: </label>
      <input
        type="password"
        id="userPwd"
        name="userPwd"
        value={formData.userPwd}
        onChange={handleChange}
        required
      />
    </div>

    <div className={styles.formGroup}>
      <label htmlFor="confirmPwd">비밀번호 확인: </label>
      <input
        type="password"
        id="confirmPwd"
        name="confirmPwd"
        value={formData.confirmPwd}
        onChange={handleChange}
        onBlur={handleConfirmPwd}
        required
      />
    </div>
  </div>
);
