import React, { useState, useCallback, useContext, useEffect } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./ProfileUploader.module.css"; // CSS 모듈 임포트

const ProfileUploader = () => {
  const { secureApiRequest, userid, updateProfileImagePath, profileImagePath } =
    useContext(AuthContext);

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isSafe, setIsSafe] = useState(false);
  const [message, setMessage] = useState("이미지를 선택해주세요.");
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState(""); // 선택한 파일명 상태 추가

  useEffect(() => {
    if (profileImagePath) {
      setPreview(`http://localhost:8080${profileImagePath}`);
      setMessage(
        "현재 프로필 이미지입니다. 변경하려면 새로운 이미지를 선택하세요."
      );
    } else {
      setPreview("");
      setMessage("프로필 이미지가 없습니다. 이미지를 선택해주세요.");
    }
  }, [profileImagePath]);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) {
        if (profileImagePath) {
          setPreview(`http://localhost:8080${profileImagePath}`);
          setMessage(
            "현재 프로필 이미지입니다. 변경하려면 새로운 이미지를 선택하세요."
          );
        } else {
          setPreview("");
          setMessage("이미지를 선택해주세요.");
        }
        setSelectedFile(null);
        setFileName("");
        setIsSafe(false);
        return;
      }

      setSelectedFile(file);
      setFileName(file.name); // 파일명 저장

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      checkImageSafety(file);
    },
    [profileImagePath]
  );

  const checkImageSafety = async (file) => {
    setIsChecking(true);
    setIsSafe(false);
    setMessage("이미지 유해성을 검사 중입니다...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await secureApiRequest("/user/images/check-safety", {
        method: "POST",
        body: formData,
      });

      if (response.data.safe) {
        setIsSafe(true);
        setMessage("안전한 이미지입니다. 저장 버튼을 눌러 업로드하세요.");
      } else {
        setIsSafe(false);
        setMessage(
          "유해 가능성이 있는 이미지입니다. 다른 이미지를 선택해주세요."
        );
      }
    } catch (error) {
      console.error("이미지 안전성 검사 중 오류:", error);
      setMessage("이미지 검사 중 오류가 발생했습니다.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !isSafe) {
      alert("업로드할 수 있는 이미지가 아닙니다.");
      return;
    }
    if (!userid) {
      alert("사용자 ID를 찾을 수 없습니다. 로그인 상태를 확인해주세요.");
      return;
    }

    setIsUploading(true);
    setMessage("이미지를 업로드하는 중입니다...");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await secureApiRequest(`/user/${userid}/profile-image`, {
        method: "POST",
        body: formData,
      });
      setMessage("프로필 이미지가 성공적으로 변경되었습니다.");
      setIsSafe(false);

      if (response.data.filePath) {
        updateProfileImagePath(response.data.filePath);
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      setMessage("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setFileName("");
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
        disabled={isChecking || isUploading}
        className={styles.fileInput}
      />

      {fileName && <div className={styles.fileName}>{fileName}</div>}

      <p className={isSafe ? styles.safeMessage : styles.unsafeMessage}>
        {message}
      </p>

      <button
        onClick={handleUpload}
        disabled={!isSafe || isChecking || isUploading}
        className={styles.uploadButton}
      >
        {isUploading ? "업로드 중..." : "프로필 이미지 저장"}
      </button>
    </div>
  );
};

export default ProfileUploader;
