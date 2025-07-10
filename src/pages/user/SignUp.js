//src/pages/user/SignUp.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../utils/axios";
import styles from "./SignUp.module.css"; // Import the CSS module

function Signup() {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    confirmPwd: "",
    userName: "",
    birthday: "",
    roll: "",
    phone: "",
  });
  const [isIdAvailable, setIsIdAvailable] = useState(null);

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
    if (formData.password !== formData.confirmPwd) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다. 다시 입력하세요.");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (!validate()) {
      return;
    }
    // 권한이 선택되지 않았을 경우 기본값 설정 (선택 사항)
    if (!formData.roll) {
      setFormData((prev) => ({ ...prev, roll: "USER" }));
    }

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
  //권한 수정 관련
  const [showPermissions, setShowPermissions] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState("USER"); // 기본값 설정

  const handleTogglePermissions = () => {
    setShowPermissions(!showPermissions);
  };

  const handleSelectPermission = (permission) => {
    setSelectedPermission(permission);
    // 이 부분이 추가/변경되었습니다: 선택된 권한을 formData.roll에 저장
    setFormData((prev) => ({ ...prev, roll: permission }));
    setShowPermissions(false); // 선택 후 슬라이드 닫기
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Sign Up</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="loginId"
              className={styles.input}
              placeholder="아이디"
              value={formData.loginId}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={handleIdCheck}
              className={styles.loginButton}
              style={{ marginTop: "8px" }}
            >
              아이디 중복 확인
            </button>
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              name="password"
              className={styles.input}
              placeholder="비밀번호"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="password"
              name="confirmPwd"
              className={styles.input}
              placeholder="비밀번호 확인"
              value={formData.confirmPwd}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="userName"
              className={styles.input}
              placeholder="이름"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="date"
              name="birthday"
              className={styles.input}
              value={formData.birthday}
              onChange={handleChange}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <input
              type="text"
              name="phone"
              className={styles.input}
              placeholder="전화번호"
              value={formData.phone}
              onChange={handleChange}
              required
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
