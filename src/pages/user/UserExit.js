import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider"; // AuthContext 경로 확인
import styles from "./UserExit.module.css";

const UserExit = () => {
  const navigate = useNavigate();
  const { secureApiRequest, logoutAndRedirect } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // 취소 버튼 클릭 핸들러
  const handleCancel = () => {
    navigate("/user/myinfo"); // 내 정보 페이지로 돌아가기
  };

  // 확인 버튼 클릭 핸들러 (탈퇴 진행)
  const handleConfirm = async () => {
    setError("");
    setIsProcessing(true);

    try {
      // 백엔드 /user/exit 엔드포인트 호출
      const response = await secureApiRequest("/user/exit", {
        method: "PATCH", // 탈퇴는 DELETE 메서드를 사용하는 것이 일반적입니다.
      });

      if (response.status === 200) {
        // 탈퇴 성공 시
        alert("회원 탈퇴가 성공적으로 처리되었습니다."); // alert 대신 커스텀 모달 사용 권장
        logoutAndRedirect(); // 로그아웃 처리 및 로그인 페이지로 리다이렉트
        navigate("/user/exitOk"); // 잘가요 페이지로 이동
      } else {
        // 서버에서 오류 응답을 보낸 경우
        setError(response.message || "회원 탈퇴 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error("회원 탈퇴 API 호출 오류:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "회원 탈퇴 중 예상치 못한 오류가 발생했습니다."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>회원 탈퇴</h2>
      <p className={styles.message}>정말로 탈퇴하시겠습니까?</p>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.buttonGroup}>
        <button
          onClick={handleCancel}
          className={styles.cancelButton}
          disabled={isProcessing}
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className={styles.confirmButton}
          disabled={isProcessing}
        >
          {isProcessing ? "탈퇴 처리 중..." : "확인"}
        </button>
      </div>

      <p className={styles.warningMessage}>
        확인을 누르면 바로 탈퇴가 진행됩니다.
      </p>
    </div>
  );
};

export default UserExit;
