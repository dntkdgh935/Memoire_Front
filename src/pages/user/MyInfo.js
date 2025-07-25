import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import CheckPwd from "../../components/user/CheckPwd";
import UserVerification from "../../components/user/UserVerification";
import ProfileUploader from "../../components/user/ProfileUploader";
import styles from "./MyInfo.module.css";

const MyInfo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const context = useContext(AuthContext);
  const [originalPhone, setOriginalPhone] = useState("");

  const {
    isLoggedIn,
    userid,
    nickname,
    secureApiRequest,
    setAuthInfo,
    logoutAndRedirect,
    loginType, // loginType을 AuthContext에서 가져옵니다.
  } = context || {};

  const [formData, setFormData] = useState({
    nickname: "",
    phone: "",
    birthday: "",
    statusMessage: "",
    prevPwd: "",
    password: "",
    confirmPwd: "",
    profileImagePath: "",
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [isVerified, setIsVerified] = useState(false); // 전화번호 인증 상태

  const [selectedProfileFile, setSelectedProfileFile] = useState(null);
  const [isProfileImageSafe, setIsProfileImageSafe] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // loginType이 "original"이 아닐 경우 비밀번호 및 얼굴 ID 기능을 비활성화
  const isOriginalLogin = loginType === "original";

  // ⭐️⭐️⭐️ 추가된 디버깅용 console.log ⭐️⭐️⭐️
  console.log("MyInfo Render - Raw context:", context);
  console.log("MyInfo Render - loginType from context:", loginType);
  console.log("MyInfo Render - isOriginalLogin calculated:", isOriginalLogin);
  // ⭐️⭐️⭐️ 여기까지 ⭐️⭐️⭐️

  useEffect(() => {
    if (isLoggedIn === null || isLoggedIn === undefined) {
      console.log("MyInfo: AuthContext 또는 isLoggedIn 초기화 대기 중...");
      return;
    }

    if (!isLoggedIn || !userid) {
      console.log("MyInfo: 로그인 정보 없음, /user/login으로 리다이렉트");
      setError("인증 정보가 없습니다. 다시 로그인해주세요.");
      setIsLoading(false);
      navigate("/user/login");
      return;
    }

    const loadUserData = async () => {
      console.log("MyInfo: 사용자 데이터 로드 시작");
      setIsLoading(true);
      setError("");
      try {
        const apiResponse = await secureApiRequest("/user/myinfo-detail", {
          method: "GET",
        });

        const userData = apiResponse.data;

        console.log("MyInfo - Parsed User Data (from .data):", userData);

        console.log(
          "MyInfo - 받아온 profileImagePath:",
          userData.profileImagePath
        );

        const { tempPwd } = location.state || {};
        console.log("Received tempPwd from location state:", tempPwd);

        setFormData((prev) => ({
          ...prev,
          nickname: userData.nickname || "",
          phone: userData.phone || "",
          birthday: userData.birthday || "",
          statusMessage: userData.statusMessage || "",
          profileImagePath: userData.profileImagePath || "",
          prevPwd: tempPwd || "",
          password: "",
          confirmPwd: "",
        }));
        setOriginalPhone(userData.phone || "");
        console.log("MyInfo: 사용자 데이터 로드 성공, formData 업데이트됨");
      } catch (err) {
        console.error("MyInfo: 사용자 정보 로드 오류:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "사용자 정보를 불러오는데 실패했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && userid) {
      loadUserData();
    }
    // ⭐️⭐️⭐️ loginType을 의존성 배열에 추가하여 변화 감지 ⭐️⭐️⭐️
    console.log(
      "MyInfo initial load useEffect - current loginType:",
      loginType
    );
  }, [
    isLoggedIn,
    userid,
    navigate,
    secureApiRequest,
    location.state,
    loginType,
  ]);

  // ⭐️⭐️⭐️ loginType 변화 감지용 useEffect 추가 ⭐️⭐️⭐️
  useEffect(() => {
    console.log("MyInfo: loginType has changed to", loginType);
    if (loginType === "original") {
      console.log(
        "MyInfo: loginType is now 'original'. Password fields and Face ID button should be visible/enabled."
      );
    }
  }, [loginType]);
  // ⭐️⭐️⭐️ 여기까지 ⭐️⭐️⭐️

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleProfileFileChange = useCallback((file) => {
    setSelectedProfileFile(file);
  }, []);

  const handleProfileSafetyCheckComplete = useCallback((isSafe) => {
    setIsProfileImageSafe(isSafe);
  }, []);

  const handleValidationChange = useCallback((isValid) => {
    setPasswordMatch(isValid);
  }, []);

  const handlePasswordStrengthChange = useCallback((score) => {
    setPasswordStrength(score);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsUpdating(true);

    if (!userid) {
      setError("사용자 ID가 없습니다. 다시 로그인해주세요.");
      setIsUpdating(false);
      navigate("/user/login");
      return;
    }

    // 비밀번호 변경 시도 여부 판단 (prevPwd, password, confirmPwd 중 하나라도 입력되었는지)
    // loginType이 "original"이 아닐 경우 비밀번호 변경 시도를 막습니다.
    const isPasswordChangeAttempted =
      isOriginalLogin &&
      (formData.prevPwd || formData.password || formData.confirmPwd);
    let passwordChangeSuccessful = false; // 비밀번호 변경 성공 여부 추적

    // 프로필 이미지 업로드 처리 (비밀번호 변경보다 먼저 처리하여 경로를 확보)
    let newProfileImagePath = formData.profileImagePath;
    if (selectedProfileFile) {
      if (!isProfileImageSafe) {
        setError("선택된 프로필 이미지가 안전하지 않습니다.");
        setIsUpdating(false);
        return;
      }

      try {
        const profileFormData = new FormData();
        profileFormData.append("image", selectedProfileFile);

        const profileUploadResponse = await secureApiRequest(
          `/user/${userid}/profile-image`,
          {
            method: "POST",
            body: profileFormData,
          }
        );

        if (profileUploadResponse.data && profileUploadResponse.data.filePath) {
          newProfileImagePath = profileUploadResponse.data.filePath;
          setAuthInfo((prev) => ({
            ...prev,
            profileImagePath: newProfileImagePath,
          }));
          console.log(
            "프로필 이미지 업로드 및 경로 업데이트 성공:",
            newProfileImagePath
          );
        } else {
          throw new Error("프로필 이미지 업로드에 실패했습니다.");
        }
      } catch (profileUploadError) {
        console.error("프로필 이미지 업로드 중 오류:", profileUploadError);
        setError(
          profileUploadError.response?.data?.message ||
            "프로필 이미지 업로드 중 오류가 발생했습니다."
        );
        setIsUpdating(false);
        return; // 이미지 업로드 실패 시 전체 업데이트 중단
      }
    }

    // 비밀번호 변경이 시도된 경우, 비밀번호 유효성 검사 및 업데이트를 먼저 수행
    if (isPasswordChangeAttempted) {
      if (!formData.prevPwd) {
        setError("현재 비밀번호를 입력해주세요.");
        setIsUpdating(false);
        return;
      }
      if (!formData.password || !formData.confirmPwd) {
        setError("새 비밀번호와 비밀번호 확인을 모두 입력해주세요.");
        setIsUpdating(false);
        return;
      }
      if (!passwordMatch) {
        setError("새 비밀번호가 일치하지 않습니다.");
        setIsUpdating(false);
        return;
      }
      if (passwordStrength < 2) {
        // 비밀번호 강도 '보통' 이상 (0: 매우 약함, 1: 약함, 2: 보통, 3: 강함, 4: 매우 강함)
        setError(
          "새 비밀번호가 너무 약합니다. 더 강한 비밀번호를 입력해주세요."
        );
        setIsUpdating(false);
        return;
      }

      // 비밀번호 업데이트 요청
      try {
        console.log("MyInfo: 비밀번호 변경 요청 시도");
        const passwordPayload = {
          userId: userid,
          prevPwd: formData.prevPwd,
          currPwd: formData.password,
        };
        await secureApiRequest("/user/update/password", {
          method: "PATCH",
          body: JSON.stringify(passwordPayload),
        });
        passwordChangeSuccessful = true; // 비밀번호 변경 성공
        setSuccess("비밀번호가 성공적으로 변경되었습니다."); // 비밀번호 변경 성공 메시지
        // 비밀번호 변경 성공 시 prevPwd, password, confirmPwd 초기화
        setFormData((prev) => ({
          ...prev,
          prevPwd: "",
          password: "",
          confirmPwd: "",
        }));
      } catch (passwordErr) {
        console.error("MyInfo: 비밀번호 변경 오류:", passwordErr);
        setError(
          passwordErr.response?.data?.message ||
            "비밀번호 변경 중 오류가 발생했습니다. 현재 비밀번호를 확인해주세요."
        );
        setIsUpdating(false);
        return; // 비밀번호 변경 실패 시 전체 업데이트 중단
      }
    }

    // 전화번호 변경 시 인증 여부 확인
    if (formData.phone !== originalPhone && !isVerified) {
      setError("전화번호 인증을 완료해주세요.");
      setIsUpdating(false);
      return;
    }

    // 일반 사용자 정보 업데이트
    try {
      const infoPayload = {
        userId: userid,
        nickname: formData.nickname,
        birthday: formData.birthday,
        statusMessage: formData.statusMessage,
        profileImagePath: newProfileImagePath,
      };

      if (formData.phone && (formData.phone !== originalPhone || isVerified)) {
        infoPayload.phone = formData.phone;
      }

      console.log("MyInfo: 사용자 정보 업데이트 페이로드:", infoPayload);

      const infoResponse = await secureApiRequest("/user/myinfo", {
        method: "PATCH",
        body: JSON.stringify(infoPayload),
      });

      // 일반 정보 업데이트 성공 메시지 (비밀번호 변경 메시지와 중복되지 않도록)
      if (!isPasswordChangeAttempted || passwordChangeSuccessful) {
        // 비밀번호 변경 시도 없었거나, 비밀번호 변경도 성공했을 경우
        setSuccess(infoResponse.message || "정보가 성공적으로 변경되었습니다.");
      }

      setFormData((prev) => ({
        ...prev,
        profileImagePath: newProfileImagePath,
      }));
      setSelectedProfileFile(null);
      setIsProfileImageSafe(false);

      // AuthContext의 닉네임 업데이트
      if (
        infoResponse &&
        infoResponse.data &&
        infoResponse.data.nickname &&
        setAuthInfo
      ) {
        setAuthInfo((prev) => ({
          ...prev,
          nickname: infoResponse.data.nickname,
        }));
      }

      // ✅ 최종 리다이렉션 로직
      if (passwordChangeSuccessful) {
        alert("비밀번호가 변경되었습니다. 다시 로그인해주세요.");
        logoutAndRedirect(); // ✅ clearAuthInfo() 대신 logoutAndRedirect() 호출
      } else {
        alert("정보가 성공적으로 변경되었습니다.");
        navigate("/library"); // 라이브러리 페이지로 이동
      }
    } catch (err) {
      console.error("MyInfo: 사용자 정보 업데이트 오류:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "정보 변경 중 오류가 발생했습니다."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNavigateToFaceRegister = () => {
    console.log("MyInfo: 현재 userid:", userid);
    if (userid) {
      navigate("/user/face-register", { state: { userId: userid } });
    } else {
      setError("사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.");
    }
  };
  const handleNavigateToExit = () => {
    navigate("/user/exit");
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <p>사용자 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }
  console.log(
    "MyInfo -> ProfileUploader에 전달할 경로:",
    formData.profileImagePath
  );
  return (
    <div className={styles.container}>
      <h2>내 정보 수정</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      <div className={styles.profileUploaderSection}>
        <ProfileUploader
          initialProfileImagePath={formData.profileImagePath}
          onFileChange={handleProfileFileChange}
          onSafetyCheckComplete={handleProfileSafetyCheckComplete}
          isUpdating={isUpdating}
          secureApiRequest={secureApiRequest}
        />
      </div>

      <form onSubmit={handleUpdate} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="nickname">닉네임</label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            value={formData.nickname}
            onChange={handleInputChange}
            placeholder="닉네임을 입력하세요"
            maxLength={50}
            disabled={isUpdating}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>전화번호</label>
          <UserVerification
            phone={formData.phone}
            setPhone={(value) =>
              setFormData((prev) => ({ ...prev, phone: value }))
            }
            onVerificationComplete={setIsVerified}
            disabled={isUpdating}
            checkType="myinfo" // MyInfo 페이지임을 나타내는 새로운 checkType 추가
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="birthday">생년월일</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            placeholder="YYYY-MM-DD"
            readOnly // 생년월일 필드를 읽기 전용으로 설정
            disabled={isUpdating}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="statusMessage">상태 메시지</label>
          <input
            type="text"
            id="statusMessage"
            name="statusMessage"
            value={formData.statusMessage}
            onChange={handleInputChange}
            placeholder="상태 메시지를 입력하세요"
            maxLength={100}
            disabled={isUpdating}
          />
        </div>

        {/* 비밀번호 변경 필드는 loginType이 "original"일 때만 렌더링 */}
        {isOriginalLogin && (
          <>
            <div className={styles.inputGroup} aria-label="비밀번호 변경">
              <label htmlFor="prevPwd">현재 비밀번호</label>
              <input
                type="password"
                id="prevPwd"
                name="prevPwd"
                value={formData.prevPwd}
                onChange={handleInputChange}
                placeholder="현재 비밀번호 (비밀번호 변경 시 필수)"
                maxLength={16}
                disabled={isUpdating || !isOriginalLogin}
              />
            </div>

            <CheckPwd
              password={formData.password}
              confirmPwd={formData.confirmPwd}
              onChange={handleInputChange}
              onValidationChange={handleValidationChange}
              onPasswordStrengthChange={handlePasswordStrengthChange}
              disabled={isUpdating || !isOriginalLogin}
            />
          </>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isUpdating || (selectedProfileFile && !isProfileImageSafe)}
        >
          {isUpdating ? "수정 중..." : "정보 수정"}
        </button>
      </form>

      <button
        onClick={handleNavigateToFaceRegister}
        className={styles.faceIdButton}
        // 얼굴 ID 등록/수정 버튼도 loginType이 "original"일 때만 활성화
        disabled={isUpdating || !userid || !isOriginalLogin}
      >
        얼굴 ID 등록/수정
      </button>
      <div className={styles.deleteLink}>
        <button
          type="button"
          className={styles.deleteLinkText}
          onClick={handleNavigateToExit}
        >
          탈퇴하기
        </button>
      </div>
    </div>
  );
};

export default MyInfo;
