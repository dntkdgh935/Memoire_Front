import React, { useState, useCallback, useEffect } from "react";
import styles from "./ProfileUploader.module.css";

const ProfileUploader = ({
  initialProfileImagePath,
  onFileChange,
  onSafetyCheckComplete,
  isUpdating,
  secureApiRequest,
}) => {
  // 현재 미리보기 URL을 관리하는 상태. 초기값은 빈 문자열로 설정합니다.
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [fileName, setFileName] = useState("");

  // ⭐ useEffect를 사용하여 initialProfileImagePath가 변경될 때만 미리보기 URL을 설정합니다.
  // 이 훅은 처음 컴포넌트가 마운트되거나, MyInfo.js에서 사용자 정보가 로드되어
  // initialProfileImagePath prop이 유효한 값으로 바뀔 때 실행됩니다.
  useEffect(() => {
    if (initialProfileImagePath) {
      setPreview(`http://localhost:8080${initialProfileImagePath}`);
      setMessage(
        "현재 프로필 이미지입니다. 변경하려면 새로운 이미지를 선택하세요."
      );
    } else {
      setPreview("");
      setMessage("프로필 이미지가 없습니다. 이미지를 선택해주세요.");
    }
    // 이 훅은 파일 선택 상태와 별개로, 부모로부터 받은 초기 경로에만 반응합니다.
  }, [initialProfileImagePath]);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];

      if (!file) {
        // 파일 선택을 취소했을 때,
        // 기존의 initialProfileImagePath로 미리보기를 복원합니다.
        if (initialProfileImagePath) {
          setPreview(`http://localhost:8080${initialProfileImagePath}`);
          setMessage(
            "현재 프로필 이미지입니다. 변경하려면 새로운 이미지를 선택하세요."
          );
        } else {
          setPreview("");
          setMessage("프로필 이미지가 없습니다. 이미지를 선택해주세요.");
        }
        setFileName("");
        onFileChange(null);
        onSafetyCheckComplete(false);
        return;
      }

      setFileName(file.name);
      // FileReader를 사용하여 선택된 새 파일의 미리보기를 생성합니다.
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // ⭐ 새로 선택된 파일의 Data URL로 미리보기를 설정합니다.
      };
      reader.readAsDataURL(file);

      onFileChange(file);
      checkImageSafety(file);
    },
    [initialProfileImagePath, onFileChange, onSafetyCheckComplete]
  );

  const checkImageSafety = async (file) => {
    setIsChecking(true);
    setMessage("이미지 유해성을 검사 중입니다...");
    onSafetyCheckComplete(false);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await secureApiRequest("/user/images/check-safety", {
        method: "POST",
        body: formData,
      });

      if (response.data.safe) {
        setMessage(
          "안전한 이미지입니다. 정보 수정 버튼을 눌러 변경사항을 저장하세요."
        );
        onSafetyCheckComplete(true);
      } else {
        setMessage(
          "유해 가능성이 있는 이미지입니다. 다른 이미지를 선택해주세요."
        );
        onSafetyCheckComplete(false);
      }
    } catch (error) {
      console.error("이미지 안전성 검사 중 오류 발생:", error);
      setMessage("이미지 검사 중 오류가 발생했습니다.");
      onSafetyCheckComplete(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className={styles.uploaderContainer}>
      <h3 className={styles.title}>프로필 이미지 변경</h3>

      {/* preview 상태에 값이 있을 때만 이미지를 렌더링합니다. */}
      {preview && (
        <img src={preview} alt="Profile Preview" className={styles.preview} />
      )}

      <label htmlFor="profileUpload" className={styles.fileInputLabel}>
        이미지 선택
      </label>
      <input
        id="profileUpload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isChecking || isUpdating}
        className={styles.fileInput}
      />

      {fileName && <div className={styles.fileName}>{fileName}</div>}

      <p
        className={
          isChecking
            ? styles.infoMessage
            : message.includes("안전한")
              ? styles.safeMessage
              : message.includes("유해")
                ? styles.unsafeMessage
                : styles.infoMessage // 기본 메시지 스타일
        }
      >
        {message}
      </p>
    </div>
  );
};

export default ProfileUploader;
