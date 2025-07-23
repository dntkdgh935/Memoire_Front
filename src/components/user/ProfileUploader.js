import React, { useState, useCallback, useEffect } from "react";
import styles from "./ProfileUploader.module.css";

const ProfileUploader = ({
  initialProfileImagePath,
  onFileChange, // 선택된 파일 전달 (new)
  onSafetyCheckComplete, // 안전성 검사 결과 전달 (new)
  isUpdating, // MyInfo의 isUpdating 상태를 전달받아 disabled 처리 (new)
  secureApiRequest, // secureApiRequest prop으로 받음 (new)
}) => {
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [fileName, setFileName] = useState("");

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
  }, [initialProfileImagePath]);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];

      if (!file) {
        setPreview(
          initialProfileImagePath
            ? `http://localhost:8080${initialProfileImagePath}`
            : ""
        );
        setMessage(
          initialProfileImagePath
            ? "현재 프로필 이미지입니다. 변경하려면 새로운 이미지를 선택하세요."
            : "이미지를 선택해주세요."
        );
        setFileName("");
        onFileChange(null); // 파일 없음
        onSafetyCheckComplete(false); // 안전하지 않음
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      onFileChange(file); // 선택된 파일 객체를 부모로 전달
      checkImageSafety(file);
    },
    [initialProfileImagePath, onFileChange, onSafetyCheckComplete]
  );

  const checkImageSafety = async (file) => {
    setIsChecking(true);
    setMessage("이미지 유해성을 검사 중입니다...");
    onSafetyCheckComplete(false); // 검사 시작 시 안전하지 않은 상태로 초기화

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
        onSafetyCheckComplete(true); // 안전함
      } else {
        setMessage(
          "유해 가능성이 있는 이미지입니다. 다른 이미지를 선택해주세요."
        );
        onSafetyCheckComplete(false); // 안전하지 않음
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
        disabled={isChecking || isUpdating} // isUpdating 상태도 disabled에 반영
        className={styles.fileInput}
      />

      {fileName && <div className={styles.fileName}>{fileName}</div>}

      <p
        className={
          isChecking
            ? styles.infoMessage
            : message.includes("안전한")
              ? styles.safeMessage
              : styles.unsafeMessage
        }
      >
        {message}
      </p>

      {/* ProfileUploader 자체의 업로드 버튼은 제거됩니다. */}
    </div>
  );
};

export default ProfileUploader;
