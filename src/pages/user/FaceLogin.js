import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import WebcamFaceDetector from "../../components/user/WebcamFaceDetector";
import styles from "./FaceLogin.module.css";

function FaceLogin() {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [loginId, setLoginId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceDetectedOnScreen, setIsFaceDetectedOnScreen] = useState(false);
  const [currentFaceScore, setCurrentFaceScore] = useState(0);
  const [isProcessingFaceLogin, setIsProcessingFaceLogin] = useState(false);

  // ✅ shouldWebcamStart 상태를 재사용하여 웹캠 제어
  const [shouldWebcamStart, setShouldWebcamStart] = useState(false);
  const [hasClickedWebcamArea, setHasClickedWebcamArea] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false); // ✅ 로그인 성공 여부 상태 추가

  const { updateTokens } = useContext(AuthContext);

  const REQUIRED_FACE_SCORE = 0.9;

  useEffect(() => {
    // 아이디가 입력되었고, 사용자가 웹캠 영역을 클릭했으며, 로그인 성공 상태가 아닐 때만 웹캠 시작 허용
    if (loginId.trim() !== "" && hasClickedWebcamArea && !isLoginSuccess) {
      setShouldWebcamStart(true);
    } else {
      setShouldWebcamStart(false); // 그 외의 경우 (아이디 없음, 클릭 안함, 로그인 성공 시) 웹캠 시작 불허
    }
  }, [loginId, hasClickedWebcamArea, isLoginSuccess]); // isLoginSuccess 의존성 추가

  const handleFaceDetected = useCallback((score) => {
    setIsFaceDetectedOnScreen(true);
  }, []);

  const handleNoFaceDetected = useCallback(() => {
    // 로그인 성공 시에는 이 메시지가 표시되지 않도록 조건 추가
    if (!isLoginSuccess) {
      setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
    }
    setIsFaceDetectedOnScreen(false);
  }, [isLoginSuccess]); // isLoginSuccess 의존성 추가

  const handleDetectionScoreUpdate = useCallback(
    (score) => {
      setCurrentFaceScore(score);
      // 로그인 성공 시에는 점수 업데이트 메시지를 표시하지 않음
      if (isLoginSuccess) return;

      if (shouldWebcamStart) {
        if (score >= REQUIRED_FACE_SCORE) {
          setMessage(
            `높은 정확도 (${score.toFixed(2)})로 얼굴이 감지되었습니다!`
          );
        } else if (score > 0) {
          setMessage(`얼굴 감지 정확도: ${score.toFixed(2)} (0.90 이상 필요)`);
        } else {
          setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
        }
      }
    },
    [shouldWebcamStart, isLoginSuccess]
  ); // isLoginSuccess 의존성 추가

  const handleFaceLogin = useCallback(async () => {
    if (!loginId) {
      alert("아이디를 입력해주세요.");
      setIsProcessingFaceLogin(false);
      return;
    }
    if (!hasClickedWebcamArea) {
      alert("웹캠을 활성화하려면 웹캠 영역을 클릭해주세요.");
      setIsProcessingFaceLogin(false);
      return;
    }
    if (!webcamRef.current || !webcamRef.current.isFaceDetected()) {
      alert("얼굴이 감지되지 않았습니다. 웹캠을 다시 확인해주세요.");
      setIsProcessingFaceLogin(false);
      return;
    }
    if (currentFaceScore < REQUIRED_FACE_SCORE) {
      alert(
        `얼굴 정확도가 부족합니다 (${currentFaceScore.toFixed(2)}). 0.90 이상이어야 합니다.`
      );
      setIsProcessingFaceLogin(false);
      return;
    }

    setIsLoading(true);
    setMessage("얼굴과 아이디가 확인되었습니다. 로그인 처리 중...");

    try {
      const faceImageBlob = await webcamRef.current.captureFrame();
      if (!faceImageBlob) {
        alert("얼굴 이미지를 캡처할 수 없습니다.");
        setIsLoading(false);
        setIsProcessingFaceLogin(false);
        return;
      }
      console.log("캡처된 이미지 Blob:", faceImageBlob);

      const formData = new FormData();
      formData.append("file", faceImageBlob, "face_login.jpeg");
      formData.append("loginId", loginId);

      const response = await apiClient.post("/user/face-login", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { accessToken, refreshToken } = response.data;
      updateTokens(accessToken, refreshToken);
      localStorage.setItem("lastLoginType", "faceId");

      alert("Face ID 로그인 성공!");
      // ✅ 로그인 성공 시 웹캠 정지를 위해 shouldWebcamStart 상태를 false로 설정
      setShouldWebcamStart(false);
      setIsLoginSuccess(true); // ✅ 로그인 성공 상태로 변경

      // WebcamFaceDetector 컴포넌트가 shouldWebcamStart=false를 받으면 스스로 정지하므로
      // 여기서 stopWebcam을 직접 호출하는 것은 필수는 아니지만, 안전을 위해 남겨두어도 무방합니다.
      if (webcamRef.current && webcamRef.current.stopWebcam) {
        webcamRef.current.stopWebcam();
      }

      navigate("/");
    } catch (error) {
      console.error("Face ID 로그인 실패:", error);
      if (error.response) {
        alert(
          error.response.data.message ||
            error.response.data.error ||
            "Face ID 로그인 실패!"
        );
      } else if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("알 수 없는 오류 발생.");
      }
    } finally {
      setIsLoading(false);
      setIsProcessingFaceLogin(false); // 로그인 처리 완료
    }
  }, [
    loginId,
    updateTokens,
    navigate,
    currentFaceScore,
    hasClickedWebcamArea,
    shouldWebcamStart,
    isLoginSuccess,
  ]); // isLoginSuccess 의존성 추가

  useEffect(() => {
    // 이미 로그인 성공 상태이거나, 로딩/처리 중이면 자동 트리거 막음
    if (isLoginSuccess || isLoading || isProcessingFaceLogin) {
      return;
    }

    if (
      currentFaceScore >= REQUIRED_FACE_SCORE &&
      loginId.trim() !== "" &&
      hasClickedWebcamArea &&
      shouldWebcamStart
    ) {
      setIsProcessingFaceLogin(true);
      handleFaceLogin();
    }
  }, [
    currentFaceScore,
    loginId,
    isLoading,
    isProcessingFaceLogin,
    handleFaceLogin,
    hasClickedWebcamArea,
    shouldWebcamStart,
    isLoginSuccess,
  ]);

  useEffect(() => {
    // 로그인 성공 시에는 메시지 업데이트 로직을 건너뜀
    if (isLoginSuccess) {
      setMessage("로그인에 성공했습니다."); // 로그인 성공 최종 메시지
      return;
    }

    if (loginId.trim() === "") {
      setMessage("아이디를 입력해주세요.");
    } else if (!hasClickedWebcamArea) {
      setMessage("웹캠 화면을 클릭하여 활성화해주세요.");
    } else {
      setMessage("얼굴을 웹캠 중앙에 맞춰주세요.");
    }

    return () => {
      if (webcamRef.current && webcamRef.current.stopWebcam) {
        console.log("FaceLogin 컴포넌트 언마운트. 웹캠 중지 요청.");
        webcamRef.current.stopWebcam();
      }
    };
  }, [loginId, hasClickedWebcamArea, isLoginSuccess]); // isLoginSuccess 의존성 추가

  const handleWebcamAreaClick = () => {
    if (loginId.trim() !== "" && !hasClickedWebcamArea && !isLoginSuccess) {
      // ✅ 로그인 성공 시 클릭 막기
      setHasClickedWebcamArea(true);
      setMessage("웹캠 활성화 중... 얼굴을 정면으로 보여주세요.");
    } else if (loginId.trim() === "") {
      alert("웹캠을 활성화하려면 먼저 아이디를 입력해주세요.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h2 className={styles.title}>Face ID 로그인</h2>
        <div
          className={styles.webcamSection}
          onClick={handleWebcamAreaClick}
          style={{
            cursor:
              shouldWebcamStart || !loginId.trim() || isLoginSuccess
                ? "default"
                : "pointer",
          }}
        >
          {/* ✅ shouldWebcamStart 상태에 따라 웹캠 렌더링 */}
          {!isLoginSuccess ? (
            <WebcamFaceDetector
              ref={webcamRef}
              onFaceDetected={handleFaceDetected}
              onNoFaceDetected={handleNoFaceDetected}
              onDetectionScoreUpdate={handleDetectionScoreUpdate}
              minConfidence={0.7}
              startWebcam={shouldWebcamStart} // ✅ shouldWebcamStart 값 사용
            />
          ) : (
            <div className={styles.loginSuccessPlaceholder}>
              <p>✅ Face ID 로그인 성공!</p>
              {/* 로그인 성공 후 보여줄 이미지 또는 아이콘 추가 가능 */}
              <img
                src="/path/to/login_success_icon.png"
                alt="로그인 성공"
                className={styles.successIcon}
              />
            </div>
          )}
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.inputGroup}>
          <input
            className={styles.input}
            type="text"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value);
              setHasClickedWebcamArea(false); // 아이디 변경 시 웹캠 영역 클릭 상태 초기화
              setIsLoginSuccess(false); // 아이디 변경 시 로그인 성공 상태 초기화
            }}
            placeholder="아이디를 입력하세요"
            aria-label="User ID for Face Login"
            maxLength="12"
            disabled={isLoading || isProcessingFaceLogin || isLoginSuccess} // ✅ 로그인 성공 시 비활성화
          />
        </div>
        <button
          className={styles.loginButton}
          onClick={handleFaceLogin}
          disabled={
            !loginId ||
            isLoading ||
            !hasClickedWebcamArea ||
            !isFaceDetectedOnScreen ||
            currentFaceScore < REQUIRED_FACE_SCORE ||
            isProcessingFaceLogin ||
            !shouldWebcamStart ||
            isLoginSuccess // ✅ 로그인 성공 시 버튼 비활성화
          }
        >
          {isLoading ? "로그인 처리 중..." : "Face ID로 로그인"}
        </button>
        <div className={styles.backLink}>
          <span
            onClick={() => navigate("/user/login")}
            role="button"
            tabIndex={0}
          >
            일반 로그인으로 돌아가기
          </span>
        </div>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>처리 중...</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default FaceLogin;
