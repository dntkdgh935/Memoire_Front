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

  const { isLoggedIn, userid, nickname, secureApiRequest, setAuthInfo } =
    context || {};

  const [formData, setFormData] = useState({
    nickname: "",
    phone: "",
    birthday: "",
    statusMessage: "",
    prevPwd: "", // 현재 비밀번호 필드
    password: "", // 새 비밀번호 필드
    confirmPwd: "", // 새 비밀번호 확인 필드
    profileImagePath: "", // 프로필 이미지 경로 추가
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-4
  const [isVerified, setIsVerified] = useState(false); // 전화번호 인증 상태

  // 프로필 이미지 관련 상태 추가
  const [selectedProfileFile, setSelectedProfileFile] = useState(null); // ProfileUploader에서 선택된 파일
  const [isProfileImageSafe, setIsProfileImageSafe] = useState(false); // ProfileUploader에서 검사된 이미지 안전성

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태

  // 사용자 정보 불러오기 및 임시 비밀번호 초기 설정
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
        }));
        setOriginalPhone(userData.phone || "");
        // 프로필 이미지는 변경 여부를 판단하기 위해 따로 original 값을 관리하지 않아도 됩니다.
        // selectedProfileFile의 유무로 변경 여부 판단 및 isProfileImageSafe로 안전성 판단.
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
  }, [isLoggedIn, userid, navigate, secureApiRequest, location.state]);

  // 입력 필드 변경 핸들러
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // ProfileUploader에서 파일 선택 시 호출될 콜백
  const handleProfileFileChange = useCallback((file) => {
    setSelectedProfileFile(file);
  }, []);

  // ProfileUploader에서 이미지 안전성 검사 완료 시 호출될 콜백
  const handleProfileSafetyCheckComplete = useCallback((isSafe) => {
    setIsProfileImageSafe(isSafe);
  }, []);

  // CheckPwd 컴포넌트에서 비밀번호 일치 여부 콜백
  const handleValidationChange = useCallback((isValid) => {
    setPasswordMatch(isValid);
  }, []);

  // CheckPwd 컴포넌트에서 비밀번호 강도 점수 콜백
  const handlePasswordStrengthChange = useCallback((score) => {
    setPasswordStrength(score);
  }, []);

  // 폼 제출 핸들러 (정보 업데이트)
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

    const isPasswordChangeAttempted =
      formData.prevPwd || formData.password || formData.confirmPwd;

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
        setError(
          "새 비밀번호가 너무 약합니다. 더 강한 비밀번호를 입력해주세요."
        );
        setIsUpdating(false);
        return;
      }
    }

    if (formData.phone !== originalPhone && !isVerified) {
      setError("전화번호 인증을 완료해주세요.");
      setIsUpdating(false);
      return;
    }

    // 프로필 이미지 변경 로직
    let newProfileImagePath = formData.profileImagePath; // 현재 폼 데이터의 이미지 경로 (기존 또는 선택된 미리보기)
    if (selectedProfileFile) {
      // 새로운 파일이 선택되었고, 안전성 검사를 통과했을 경우
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
          })); // AuthContext 업데이트
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

    // 기타 사용자 정보 업데이트
    try {
      const infoPayload = {
        userId: userid,
        nickname: formData.nickname,
        birthday: formData.birthday,
        statusMessage: formData.statusMessage,
        profileImagePath: newProfileImagePath, // 업로드된 새 경로 또는 기존 경로 사용
      };

      if (isVerified && formData.phone) {
        infoPayload.phone = formData.phone;
      }

      console.log("MyInfo: 사용자 정보 업데이트 페이로드:", infoPayload);

      const infoResponse = await secureApiRequest("/user/myinfo", {
        method: "PATCH",
        body: JSON.stringify(infoPayload),
      });

      let passwordChangeSuccess = true;
      if (isPasswordChangeAttempted) {
        console.log("MyInfo: 비밀번호 변경 요청 시도");
        const passwordPayload = {
          userId: userid,
          prevPwd: formData.prevPwd,
          currPwd: formData.password,
        };
        try {
          await secureApiRequest("/user/update/password", {
            method: "PATCH",
            body: JSON.stringify(passwordPayload),
          });
        } catch (passwordErr) {
          console.error("MyInfo: 비밀번호 변경 오류:", passwordErr);
          setError(
            passwordErr.response?.data?.message ||
              "비밀번호 변경 중 오류가 발생했습니다. 현재 비밀번호를 확인해주세요."
          );
          passwordChangeSuccess = false;
        }
      }

      if (passwordChangeSuccess) {
        setSuccess(infoResponse.message || "정보가 성공적으로 변경되었습니다.");
        // 비밀번호 필드 초기화
        setFormData((prev) => ({
          ...prev,
          prevPwd: "",
          password: "",
          confirmPwd: "",
          profileImagePath: newProfileImagePath, // 최종 업데이트된 경로로 formData 업데이트
        }));
        setSelectedProfileFile(null); // 파일 선택 상태 초기화
        setIsProfileImageSafe(false); // 이미지 안전성 상태 초기화
      }

      if (infoResponse && infoResponse.nickname && setAuthInfo) {
        setAuthInfo((prev) => ({
          ...prev,
          nickname: infoResponse.nickname,
        }));
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

  // 얼굴 ID 등록 페이지로 이동하는 핸들러
  const handleNavigateToFaceRegister = () => {
    console.log("MyInfo: 현재 userid:", userid);
    if (userid) {
      // URL 파라미터 대신 state로 userId를 전달합니다.
      navigate("/user/face-register", { state: { userId: userid } });
    } else {
      setError("사용자 ID를 찾을 수 없습니다. 로그인 후 다시 시도해주세요.");
    }
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

  return (
    <div className={styles.container}>
      <h2>내 정보 수정</h2>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}

      {/* ProfileUploader 컴포넌트 */}
      <div className={styles.profileUploaderSection}>
        <ProfileUploader
          initialProfileImagePath={formData.profileImagePath}
          onFileChange={handleProfileFileChange}
          onSafetyCheckComplete={handleProfileSafetyCheckComplete}
          isUpdating={isUpdating} // 부모의 isUpdating 상태 전달
          secureApiRequest={secureApiRequest} // secureApiRequest 함수 전달
        />
      </div>

      <form onSubmit={handleUpdate} className={styles.form}>
        {/* 닉네임 */}
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

        {/* 전화번호 및 인증 */}
        <div className={styles.inputGroup}>
          <label>전화번호</label>
          <UserVerification
            phone={formData.phone}
            setPhone={(value) =>
              setFormData((prev) => ({ ...prev, phone: value }))
            }
            onVerificationComplete={setIsVerified}
            disabled={isUpdating}
          />
        </div>

        {/* 생년월일 */}
        <div className={styles.inputGroup}>
          <label htmlFor="birthday">생년월일</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleInputChange}
            placeholder="YYYY-MM-DD"
            disabled={isUpdating}
          />
        </div>

        {/* 상태 메시지 */}
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

        {/* 현재 비밀번호 */}
        <div className={styles.inputGroup}>
          <label htmlFor="prevPwd">현재 비밀번호</label>
          <input
            type="password"
            id="prevPwd"
            name="prevPwd"
            value={formData.prevPwd}
            onChange={handleInputChange}
            placeholder="현재 비밀번호 (비밀번호 변경 시 필수)"
            maxLength={16}
            disabled={isUpdating}
          />
        </div>

        {/* 새 비밀번호 및 확인 (CheckPwd 컴포넌트) */}
        <CheckPwd
          password={formData.password}
          confirmPwd={formData.confirmPwd}
          onChange={handleInputChange}
          onValidationChange={handleValidationChange}
          onPasswordStrengthChange={handlePasswordStrengthChange}
          disabled={isUpdating}
        />

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isUpdating || (selectedProfileFile && !isProfileImageSafe)}
        >
          {isUpdating ? "수정 중..." : "정보 수정"}
        </button>
      </form>

      {/* 얼굴 ID 등록 페이지로 이동하는 버튼 */}
      <button
        onClick={handleNavigateToFaceRegister}
        className={styles.faceIdButton}
        disabled={isUpdating || !userid}
      >
        얼굴 ID 등록/수정
      </button>
    </div>
  );
};

export default MyInfo;
