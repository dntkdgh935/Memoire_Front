import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserExitOk.module.css";

const UserExitOk = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate("/user/login"); // 로그인 페이지로 이동
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>안녕히 가세요!</h2>
      <p className={styles.message}>저희 서비스를 이용해 주셔서 감사합니다.</p>
      <p className={styles.message}>다음에 더 좋은 모습으로 찾아뵙겠습니다.</p>
      <button onClick={handleGoToLogin} className={styles.loginButton}>
        로그인 페이지로 이동
      </button>
    </div>
  );
};

export default UserExitOk;
