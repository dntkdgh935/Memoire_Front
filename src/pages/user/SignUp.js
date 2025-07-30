// src/pages/user/SignUp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import styles from "./SignUp.module.css";
import CheckPwd from "../../components/user/CheckPwd";
// DatePicker import 제거
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import UserVerification from "../../components/user/UserVerification";

function Signup() {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    confirmPwd: "",
    name: "",
    birthday: "", // ✅ SocialSignUp과 동일하게 문자열로 초기화
    nickname: "",
    role: "USER",
    phone: "",
    loginType: "original",
  });
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    setIsIdAvailable(null);
  }, [formData.loginId]);

  const handleIdCheck = async () => {
    if (!formData.loginId) {
      alert("아이디를 입력하세요.");
      return;
    }

    try {
      const response = await apiClient.post("/user/idcheck", null, {
        params: { loginId: formData.loginId },
      });

      if (response.data === "ok") {
        setIsIdAvailable(true);
        alert("사용 가능한 아이디입니다.");
      } else {
        setIsIdAvailable(false);
        alert("이미 사용중인 아이디입니다. 아이디를 다시 작성하세요.");
      }
    } catch (error) {
      console.error("아이디 중복검사 실패 : ", error);
      alert("아이디 중복검사 중 오류가 발생했습니다. 관리자에게 문의하세요.");
    }
  };

  // 생년월일 유효성 검사 함수 (SocialSignUp과 동일하게 YYYY-MM-DD 형식 확인)
  const validateBirthday = (birthdayStr) => {
    if (!birthdayStr) return false;

    // YYYY-MM-DD 형식 확인
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(birthdayStr)) return false;

    const parts = birthdayStr.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const date = new Date(year, month - 1, day); // month는 0부터 시작
    const isValidDate =
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day;

    if (!isValidDate) return false;

    // 미래 날짜 방지
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간 정보를 제거하여 날짜만 비교
    return date <= today;
  };

  const validate = () => {
    if (isIdAvailable === null) {
      alert("아이디 중복검사를 필수로 하여야 합니다.");
      return false;
    }
    if (isIdAvailable === false) {
      alert("사용 가능한 아이디가 아닙니다. 아이디를 다시 확인하세요.");
      return false;
    }
    if (!isPasswordValid) {
      alert("비밀번호가 일치하지 않거나 유효하지 않습니다.");
      return false;
    }
    if (passwordScore < 3) {
      alert("비밀번호 강도가 약합니다. '강함' 이상으로 설정해주세요.");
      return false;
    }
    if (!isPhoneVerified) {
      alert("휴대폰 인증을 완료해주세요.");
      return false;
    }
    if (!formData.name) {
      alert("이름을 입력해주세요.");
      return false;
    }
    // 생년월일 유효성 검사 추가 (SocialSignUp과 동일)
    if (!validateBirthday(formData.birthday)) {
      alert("유효한 생년월일(YYYY-MM-DD 형식, 미래 날짜 불가)을 입력해주세요.");
      return false;
    }
    if (!formData.nickname) {
      alert("닉네임을 입력해주세요.");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordValidationChange = (isValidMatch, score) => {
    setIsPasswordValid(isValidMatch);
    setPasswordScore(score);
  };

  const handlePhoneVerificationComplete = (verified) => {
    setIsPhoneVerified(verified);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const { confirmPwd, ...dataToSend } = formData;

      // birthday는 이미 'YYYY-MM-DD' 문자열이므로 추가 변환 필요 없음
      const response = await apiClient.post("/user/signup", dataToSend);

      if (response.status === 200) {
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("회원가입 실패 : ", error);
      alert("회원 가입에 실패했습니다. 다시 시도해 주세요");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Sign Up</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.idInputGroup}>
            <input
              type="text"
              name="loginId"
              className={styles.input}
              placeholder="아이디"
              value={formData.loginId}
              onChange={handleChange}
              required
              maxLength={12}
            />
            <button
              type="button"
              onClick={handleIdCheck}
              className={styles.idCheckButton}
            >
              중복 확인
            </button>
          </div>

          <UserVerification
            phone={formData.phone}
            setPhone={(val) => setFormData({ ...formData, phone: val })}
            onVerificationComplete={handlePhoneVerificationComplete}
            checkType="signup"
          />

          <CheckPwd
            password={formData.password}
            confirmPwd={formData.confirmPwd}
            onChange={handleChange}
            onValidationChange={(isValid, score) =>
              handlePasswordValidationChange(isValid, score)
            }
          />

          <div className={styles.inputGroup}>
            <input
              type="text"
              name="name"
              className={styles.input}
              placeholder="이름"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={5}
            />
          </div>
          {/* ✅ SocialSignUp과 동일하게 type="date" input 사용 */}
          <div className={styles.inputGroup}>
            <input
              type="date" // ✅ type을 "date"로 변경
              name="birthday"
              className={styles.input}
              placeholder="생년월일 (YYYY-MM-DD)" // placeholder는 type="date"에서 일부 브라우저에서 무시될 수 있습니다.
              value={formData.birthday}
              onChange={handleChange}
              required
              // maxLength는 type="date"에서 의미가 없습니다.
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="nickname"
              className={styles.input}
              placeholder="닉네임"
              value={formData.nickname}
              onChange={handleChange}
              required
              maxLength={8}
            />
          </div>

          <button type="submit" className={styles.loginButton}>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
