import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../../AuthProvider";

// CSS 모듈 임포트
import styles from "./SocialSignUp.module.css"; // ✅ CSS 모듈 임포트

function SocialSignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateTokens } = useContext(AuthContext);

  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId");
  const socialType = queryParams.get("socialType");
  const socialId = queryParams.get("socialId");
  const initialName = queryParams.get("name") || "";
  const initialNickname = queryParams.get("nickname") || "";

  const [name, setName] = useState(initialName);
  const [nickname, setNickname] = useState(initialNickname);
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!userId || !socialType || !socialId) {
      alert("잘못된 접근입니다.");
      navigate("/");
    }
  }, [userId, socialType, socialId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);

    if (!name.trim()) {
      setErrorMessage("이름을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }
    if (!nickname.trim()) {
      setErrorMessage("닉네임을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }
    if (!phone.trim() || !/^\d{10,11}$/.test(phone)) {
      setErrorMessage("유효한 전화번호 (숫자 10-11자리)를 입력해주세요.");
      setIsSubmitting(false);
      return;
    }
    if (!birthday.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      setErrorMessage("생년월일을 YYYY-MM-DD 형식으로 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post("/user/social/complete-signup", {
        userId,
        socialType,
        socialId,
        name,
        nickname,
        phone,
        birthday,
      });

      if (response.status === 200) {
        const {
          accessToken,
          refreshToken,
          userId,
          name,
          role,
          autoLoginFlag,
          nickname: userNickname,
        } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", name);
        localStorage.setItem("userRole", role);
        localStorage.setItem("autoLoginFlag", autoLoginFlag);
        localStorage.setItem("userNickname", userNickname);

        updateTokens(accessToken, refreshToken);

        console.log("회원가입 완료! 메인 페이지로 이동합니다.");
        alert("회원가입이 완료되었습니다!");
        navigate("/");
      } else {
        setErrorMessage(
          response.data.message || "회원가입 중 오류가 발생했습니다."
        );
      }
    } catch (error) {
      console.error("회원가입 API 호출 오류:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("서버와 통신 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.socialSignUpContainer}>
      {" "}
      {/* ✅ 클래스 적용 */}
      <h2>추가 정보 입력</h2>
      <p>소셜 로그인으로 회원가입을 완료하시려면 추가 정보를 입력해주세요.</p>
      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}{" "}
      {/* ✅ 클래스 적용 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        {" "}
        {/* ✅ 클래스 적용 */}
        <div className={styles.inputGroup}>
          {" "}
          {/* ✅ 클래스 적용 */}
          <label htmlFor="name" className={styles.label}>
            {" "}
            {/* ✅ 클래스 적용 */}
            이름:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input} /* ✅ 클래스 적용 */
          />
        </div>
        <div className={styles.inputGroup}>
          {" "}
          {/* ✅ 클래스 적용 */}
          <label htmlFor="nickname" className={styles.label}>
            {" "}
            {/* ✅ 클래스 적용 */}
            닉네임:
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            className={styles.input} /* ✅ 클래스 적용 */
          />
        </div>
        <div className={styles.inputGroup}>
          {" "}
          {/* ✅ 클래스 적용 */}
          <label htmlFor="phone" className={styles.label}>
            {" "}
            {/* ✅ 클래스 적용 */}
            전화번호:
          </label>
          <input
            type="tel"
            id="phone"
            placeholder="예: 01012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={styles.input} /* ✅ 클래스 적용 */
          />
        </div>
        <div className={styles.inputGroup}>
          {" "}
          {/* ✅ 클래스 적용 */}
          <label htmlFor="birthday" className={styles.label}>
            {" "}
            {/* ✅ 클래스 적용 */}
            생년월일 (YYYY-MM-DD):
          </label>
          <input
            type="date"
            id="birthday"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
            className={styles.input} /* ✅ 클래스 적용 */
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton} /* ✅ 클래스 적용 */
        >
          {isSubmitting ? "처리 중..." : "회원가입 완료"}{" "}
        </button>
      </form>
    </div>
  );
}

export default SocialSignUp;
