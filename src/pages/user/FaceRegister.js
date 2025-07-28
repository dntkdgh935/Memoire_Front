import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthProvider";
import WebcamFaceDetector from "../../components/user/WebcamFaceDetector";
import styles from "./FaceRegister.module.css";

function FaceRegister() {
  const webcamRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const context = useContext(AuthContext);
  const { userid, nickname, secureApiRequest } = context || {};

  const currentUserId = location.state?.userId || userid;

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceDetectedOnScreen, setIsFaceDetectedOnScreen] = useState(false);
  const [webcamDetectionScore, setWebcamDetectionScore] = useState(0);
  const [isProcessingFaceRegister, setIsProcessingFaceRegister] =
    useState(false);
  // ✅ 새로 추가: 등록 완료 여부 상태
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const REQUIRED_FACE_SCORE_FOR_REGISTER = 0.9;

  const handleFaceDetected = useCallback((score) => {
    setIsFaceDetectedOnScreen(true);
  }, []);

  const handleNoFaceDetected = useCallback(() => {
    // 등록 완료 시에는 이 메시지가 표시되지 않도록 조건 추가
    if (!isRegistrationComplete) {
      setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
    }
    setIsFaceDetectedOnScreen(false);
  }, [isRegistrationComplete]); // isRegistrationComplete를 의존성 배열에 추가

  const handleDetectionScoreUpdate = useCallback(
    (score) => {
      setWebcamDetectionScore(score);
      // 등록 완료 시에는 점수 업데이트 메시지를 표시하지 않음
      if (isRegistrationComplete) return;

      if (score >= REQUIRED_FACE_SCORE_FOR_REGISTER) {
        setMessage(
          `높은 정확도 (${score.toFixed(2)})로 얼굴이 감지되었습니다! "현재 얼굴로 등록하기" 버튼을 누르거나 잠시 기다려주세요.`
        );
      } else if (score > 0) {
        setMessage(
          `얼굴 감지 정확도: ${score.toFixed(2)} (최소 ${REQUIRED_FACE_SCORE_FOR_REGISTER.toFixed(2)} 이상 권장)`
        );
      } else {
        setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
      }
    },
    [isRegistrationComplete]
  ); // isRegistrationComplete를 의존성 배열에 추가

  // handleRegisterFace 함수를 다른 useEffect보다 먼저 정의
  const handleRegisterFace = useCallback(async () => {
    if (!secureApiRequest) {
      setMessage(
        "인증 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      setIsProcessingFaceRegister(false);
      return;
    }
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId.trim() === ""
    ) {
      setMessage("유효한 사용자 정보가 없습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
      setIsProcessingFaceRegister(false);
      return;
    }
    if (!webcamRef.current || !webcamRef.current.isFaceDetected()) {
      setMessage("등록을 시도하기 전에 얼굴을 웹캠 중앙에 맞춰주세요.");
      setIsProcessingFaceRegister(false);
      return;
    }
    if (webcamDetectionScore < REQUIRED_FACE_SCORE_FOR_REGISTER) {
      setMessage(
        `얼굴 정확도가 부족합니다 (${webcamDetectionScore.toFixed(2)}). ` +
          `최소 ${REQUIRED_FACE_SCORE_FOR_REGISTER.toFixed(2)} 이상일 때 등록할 수 있습니다.`
      );
      setIsProcessingFaceRegister(false);
      return;
    }

    setIsLoading(true);
    setMessage("얼굴 임베딩을 등록 중입니다...");

    try {
      const imageBlob = await webcamRef.current.captureFrame();
      if (!imageBlob) {
        setMessage("웹캠 이미지를 캡처할 수 없습니다.");
        setIsLoading(false);
        setIsProcessingFaceRegister(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face_register.jpg");

      const apiResponse = await secureApiRequest(
        `/user/${currentUserId}/face-embedding`,
        {
          method: "POST",
          body: formData,
        }
      );

      setMessage("등록이 완료되었습니다.");
      // ✅ 등록 성공 시 컴포넌트 숨김을 위한 상태 변경
      setIsRegistrationComplete(true);

      // WebcamFaceDetector 컴포넌트가 언마운트되면서 웹캠이 자동으로 꺼지므로,
      // 여기서 직접 stopWebcam을 호출하는 것은 필수는 아니지만, 안전을 위해 남겨두는 것도 좋습니다.
      if (webcamRef.current && webcamRef.current.stopWebcam) {
        webcamRef.current.stopWebcam();
      }
    } catch (error) {
      console.error("얼굴 임베딩 등록 요청 중 오류 발생:", error);
      setMessage(
        error.response?.data?.message ||
          `얼굴 임베딩 등록 중 오류 발생: ${error.message}`
      );
      if (error.response?.status === 401) {
        setMessage("인증이 필요합니다. 다시 로그인해주세요.");
      }
    } finally {
      setIsLoading(false);
      setIsProcessingFaceRegister(false);
    }
  }, [
    currentUserId,
    navigate,
    secureApiRequest,
    isFaceDetectedOnScreen,
    webcamDetectionScore,
    REQUIRED_FACE_SCORE_FOR_REGISTER,
  ]);

  // 자동 등록 트리거 useEffect
  useEffect(() => {
    // 웹캠이 이미 등록 완료되어 숨겨진 상태가 아니고, 기타 조건 충족 시 자동 등록 시도
    if (
      !isLoading &&
      !isProcessingFaceRegister &&
      !isRegistrationComplete && // ✅ 등록 완료 상태가 아닐 때만 시도
      isFaceDetectedOnScreen &&
      webcamDetectionScore >= REQUIRED_FACE_SCORE_FOR_REGISTER
    ) {
      setIsProcessingFaceRegister(true);
      setMessage("얼굴 인식 정확도 충족! 자동 등록을 시도합니다...");
      handleRegisterFace();
    }
  }, [
    webcamDetectionScore,
    isFaceDetectedOnScreen,
    isLoading,
    isProcessingFaceRegister,
    handleRegisterFace,
    isRegistrationComplete,
  ]); // isRegistrationComplete 의존성 추가

  useEffect(() => {
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId.trim() === ""
    ) {
      setMessage("사용자 정보가 유효하지 않습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
    } else {
      // 등록 완료 상태에 따라 초기 메시지 변경
      if (isRegistrationComplete) {
        setMessage("얼굴 등록이 완료되었습니다.");
      } else {
        setMessage("웹캠을 활성화하고 얼굴을 정면으로 보여주세요.");
      }
    }

    // 컴포넌트 언마운트 시 웹캠 정지
    return () => {
      if (webcamRef.current && webcamRef.current.stopWebcam) {
        console.log("FaceRegister 컴포넌트 언마운트. 웹캠 중지 요청.");
        webcamRef.current.stopWebcam();
      }
    };
  }, [currentUserId, navigate, isRegistrationComplete]); // isRegistrationComplete 의존성 추가

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>얼굴 ID 등록</h1>
        <p className={styles.userIdText}>
          <span className={styles.userIdHighlight}>사용자:</span>{" "}
          {nickname || "알 수 없는 사용자"}
        </p>

        {/* ✅ isRegistrationComplete가 true일 때 WebcamFaceDetector 숨김 */}
        {!isRegistrationComplete ? (
          <WebcamFaceDetector
            ref={webcamRef}
            onFaceDetected={handleFaceDetected}
            onNoFaceDetected={handleNoFaceDetected}
            onDetectionScoreUpdate={handleDetectionScoreUpdate}
            minConfidence={0.7}
            startWebcam={true} // 웹캠은 계속 켜진 상태로 두되, 컴포넌트가 아예 사라지면 꺼짐
          />
        ) : (
          // ✅ 웹캠이 숨겨진 자리에 등록 완료 메시지 등을 표시할 수 있습니다.
          <div className={styles.webcamPlaceholder}>
            <p>✅ 얼굴 등록이 성공적으로 완료되었습니다!</p>
            <span alt="등록 완료" className={styles.successIcon} />{" "}
            {/* 적절한 이미지 경로로 변경 */}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button
            onClick={() => navigate("/user/myinfo")}
            className={styles.secondaryButton}
            disabled={isLoading || isProcessingFaceRegister}
          >
            마이페이지로 돌아가기
          </button>
        </div>

        {message && (
          <p
            className={`${styles.message} ${
              isLoading ? styles.messageLoading : styles.messageNormal
            }`}
          >
            {message}
          </p>
        )}

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

export default FaceRegister;
