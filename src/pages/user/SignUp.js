// src/pages/user/SignUp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import styles from "./SignUp.module.css";
import CheckPwd from "../../components/user/CheckPwd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UserVerification from "../../components/user/UserVerification"; // UserVerification 임포트

function Signup() {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    confirmPwd: "",
    name: "",
    birthday: "",
    nickname: "",
    role: "USER",
    phone: "",
  });
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false); // ✅ 휴대폰 인증 상태 추가

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

  const validate = () => {
    if (!isIdAvailable) {
      // 아이디 중복 확인 필수
      alert("아이디 중복검사를 필수로 하여야 합니다.");
      return false;
    }
    if (!isIdAvailable === true) {
      // 아이디 중복 확인 결과가 사용 가능이어야 함
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
      // ✅ 휴대폰 인증 여부 확인
      alert("휴대폰 인증을 완료해주세요.");
      return false;
    }
    // 나머지 필드 유효성 검사 (필요하면 추가)
    if (!formData.name) {
      alert("이름을 입력해주세요.");
      return false;
    }
    if (!formData.birthday) {
      alert("생년월일을 선택해주세요.");
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

  const handleDateChange = (date) => {
    setFormData({ ...formData, birthday: date });
  };

  // ✅ UserVerification에서 호출될 인증 완료 콜백 함수
  const handlePhoneVerificationComplete = (verified) => {
    setIsPhoneVerified(verified);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 유효성 검사를 여기서 수행
    if (!validate()) {
      return;
    }

    try {
      const response = await apiClient.post("/user/signup", formData);

      if (response.status === 200) {
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("회원가입 실패 : ", error);
      // 백엔드에서 특정 오류 메시지를 보낸다면 파싱하여 표시 가능
      alert("회원 가입에 실패했습니다. 다시 시도해 주세요");
    }
  };

  const [showPermissions, setShowPermissions] = useState(false);

  const handleSelectPermission = (permission) => {
    setFormData((prev) => ({ ...prev, role: permission }));
    setShowPermissions(false);
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

          {/* ✅ UserVerification 컴포넌트 사용 */}
          <UserVerification
            phone={formData.phone}
            setPhone={(val) => setFormData({ ...formData, phone: val })}
            onVerificationComplete={handlePhoneVerificationComplete} // 콜백 함수 전달
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
          <div className={styles.inputGroup}>
            <DatePicker
              selected={formData.birthday}
              onChange={handleDateChange}
              placeholderText="생년월일"
              dateFormat="yyyy-MM-dd"
              className={styles.input}
              maxDate={new Date()}
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
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

          {showPermissions && (
            <div className={styles.permissionSlide}>
              <div
                className={styles.permissionOption}
                onClick={() => handleSelectPermission("USER")}
              >
                USER
              </div>
              <div
                className={styles.permissionOption}
                onClick={() => handleSelectPermission("ADMIN")}
              >
                ADMIN
              </div>
              <div
                className={styles.permissionOption}
                onClick={() => handleSelectPermission("BAD")}
              >
                BAD
              </div>
              <div
                className={styles.permissionOption}
                onClick={() => handleSelectPermission("EXIT")}
              >
                EXIT
              </div>
            </div>
          )}

          <button type="submit" className={styles.loginButton}>
            회원가입
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
