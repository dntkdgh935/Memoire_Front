// src/pages/user/SignUp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import styles from "./SignUp.module.css";
import CheckPwd from "../../components/user/CheckPwd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import UserVerification from "../../components/user/UserVerification";

function Signup() {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    confirmPwd: "",
    name: "",
    birthday: "",
    nickname: "",
    role: "USER", // 초기값을 "USER"로 설정하여 불필요한 조건문 제거
    phone: "",
  });
  const [isIdAvailable, setIsIdAvailable] = useState(null);
  // ✅ CheckPwd 컴포넌트의 유효성 상태를 받을 새로운 상태 추가
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [passwordScore, setPasswordScore] = useState(0);

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

  // ✅ validate 함수는 이제 CheckPwd의 유효성도 함께 확인합니다.
  const validate = () => {
    // 비밀번호 유효성 (CheckPwd 컴포넌트에서 전달받은 상태 사용)
    if (!isPasswordValid) {
      alert("비밀번호 일치하지 않습니다.");
      return false;
    }
    if (passwordScore < 3) {
      alert("비밀번호 강도가 약합니다. '강함' 이상으로 설정해주세요.");
      return false;
    }
    // 다른 유효성 검사 (필요하면 추가)
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ CheckPwd 컴포넌트에서 유효성 상태를 받아올 함수
  const handlePasswordValidationChange = (isValidMatch, score) => {
    setIsPasswordValid(isValidMatch); // isValidMatch는 이제 일치 여부만
    setPasswordScore(score); // 강도 점수도 받아옴
  };
  const handleDateChange = (date) => {
    setFormData({ ...formData, birthday: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isIdAvailable === false) {
      alert("이미 사용중인 아이디입니다. 아이디를 다시 작성하세요.");
      return;
    }

    if (isIdAvailable === null) {
      alert("아이디 중복검사를 필수로 하여야 합니다.");
      return;
    }

    // ✅ validate 함수 호출 시 CheckPwd의 유효성도 검사
    if (!validate()) {
      return;
    }

    // `formData.role`의 초기값을 "USER"로 설정했으므로 이 조건문은 더 이상 필요 없습니다.
    // if (!formData.role) {
    //   setFormData((prev) => ({ ...prev, role: "USER" }));
    // }

    try {
      const response = await apiClient.post("/user/signup", formData);

      if (response.status === 200) {
        alert("회원가입이 완료되었습니다.");
        navigate("/");
      }
    } catch (error) {
      console.error("회원가입 실패 : ", error);
      alert("회원 가입에 실패했습니다. 다시 시도해 주세요");
    }
  };

  // 권한 수정 관련 (기존 코드와 동일, 변수명 roll -> role로 변경)
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(formData.role); // formData.role 초기값 사용

  useEffect(() => {
    setSelectedPermission(formData.role); // formData.role이 변경될 때마다 UI 업데이트
  }, [formData.role]);

  const handleTogglePermissions = () => {
    setShowPermissions(!showPermissions);
  };

  const handleSelectPermission = (permission) => {
    setSelectedPermission(permission);
    setFormData((prev) => ({ ...prev, role: permission }));
    setShowPermissions(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Sign Up</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          {/* 아이디 입력과 중복 체크 버튼을 감싸는 새로운 inputGroup */}
          <div className={styles.idInputGroup}>
            {" "}
            {/* 이 부분 수정 */}
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
          />

          {/* ✅ CheckPwd 컴포넌트 사용 */}
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
          <div
            className={styles.permissionButton}
            onClick={handleTogglePermissions}
          >
            권한 수정: {selectedPermission}
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
