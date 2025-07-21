import React, { useState, useCallback, useContext, useEffect } from "react"; // useEffect 임포트 추가
import { AuthContext } from "../../AuthProvider"; // AuthContext의 실제 경로에 맞게 수정해주세요.

const ProfileUploader = () => {
  const { secureApiRequest, userid, updateProfileImagePath, profileImagePath } =
    useContext(AuthContext); // profileImagePath 가져오기

  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isSafe, setIsSafe] = useState(false);
  const [message, setMessage] = useState("이미지를 선택해주세요.");
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 컴포넌트 마운트 시 또는 profileImagePath 변경 시 기존 프로필 이미지 표시
  useEffect(() => {
    if (profileImagePath) {
      // 백엔드 URL과 합쳐서 완전한 이미지 경로 생성
      setPreview(`http://localhost:8080${profileImagePath}`);
      setMessage(
        "현재 프로필 이미지입니다. 변경하려면 새로운 이미지를 선택하세요."
      );
    } else {
      setPreview(""); // 프로필 이미지가 없으면 미리보기 비움
      setMessage("프로필 이미지가 없습니다. 이미지를 선택해주세요.");
    }
  }, [profileImagePath]); // profileImagePath가 변경될 때마다 실행

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) {
        // 파일 선택 취소 시 기존 이미지로 돌아가거나 초기 상태로 설정
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
        setIsSafe(false); // 안전성 상태 초기화
        return;
      }

      setSelectedFile(file);

      // 새 파일 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // 파일 선택 시 유해성 검사 시작
      checkImageSafety(file);
    },
    [profileImagePath]
  ); // profileImagePath를 의존성 배열에 추가

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
      setIsSafe(false); // 업로드 후 버튼 다시 비활성화

      if (response.data.filePath) {
        updateProfileImagePath(response.data.filePath); // AuthContext 업데이트
        // 업로드 성공 후 preview를 새로 업로드된 이미지로 유지
        // setPreview(`http://localhost:8080${response.data.filePath}`); // 이미 updateProfileImagePath가 useEffect를 트리거하므로 불필요
      }
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      setMessage("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      setSelectedFile(null); // 파일 업로드 후 선택된 파일 초기화
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 text-center">
        프로필 이미지 변경
      </h3>

      {preview && (
        <div className="flex justify-center">
          <img
            src={preview} // 기존 이미지 또는 새 이미지 미리보기 표시
            alt="Profile Preview"
            className="w-40 h-40 object-cover rounded-full border-4 border-blue-300 shadow-lg"
          />
        </div>
      )}

      <div className="flex justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isChecking || isUploading}
          className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
        />
      </div>

      <p
        className={`text-center text-sm ${isSafe ? "text-green-600" : "text-red-600"}`}
      >
        {message}
      </p>

      <div className="flex justify-center">
        <button
          onClick={handleUpload}
          disabled={!isSafe || isChecking || isUploading}
          className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold
                                hover:bg-blue-700 focus:outline-none focus:ring-2
                                focus:ring-blue-500 focus:ring-opacity-50
                                disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "업로드 중..." : "프로필 이미지 저장"}
        </button>
      </div>
    </div>
  );
};

export default ProfileUploader;
