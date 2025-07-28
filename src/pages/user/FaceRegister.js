import React, {
  useRef,
  useEffect,
  useState,
  useContext,
  useCallback,
} from "react"; // useCallback 추가
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

  const REQUIRED_FACE_SCORE_FOR_REGISTER = 0.9; // 등록을 위한 최소 얼굴 정확도

  // 콜백 함수들을 useCallback으로 감싸서 최적화
  const handleFaceDetected = useCallback((score) => {
    setIsFaceDetectedOnScreen(true);
    // 메시지는 handleDetectionScoreUpdate에서 업데이트될 것
  }, []);

  const handleNoFaceDetected = useCallback(() => {
    setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
    setIsFaceDetectedOnScreen(false);
  }, []);

  const handleDetectionScoreUpdate = useCallback((score) => {
    setWebcamDetectionScore(score);
    if (score >= REQUIRED_FACE_SCORE_FOR_REGISTER) {
      setMessage(
        `높은 정확도 (${score.toFixed(2)})로 얼굴이 감지되었습니다! "현재 얼굴로 등록하기" 버튼을 눌러주세요.`
      );
    } else if (score > 0) {
      setMessage(
        `얼굴 감지 정확도: ${score.toFixed(2)} (최소 ${REQUIRED_FACE_SCORE_FOR_REGISTER.toFixed(2)} 이상 권장)`
      );
    } else {
      setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
    }
  }, []);

  useEffect(() => {
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId.trim() === ""
    ) {
      setMessage("사용자 정보가 유효하지 않습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
    } else {
      setMessage("웹캠을 활성화하고 얼굴을 정면으로 보여주세요.");
    }

    // 컴포넌트 언마운트 시 웹캠을 끄도록 정리 함수 추가
    return () => {
      if (webcamRef.current && webcamRef.current.stopWebcam) {
        console.log("FaceRegister 컴포넌트 언마운트. 웹캠 중지 요청.");
        webcamRef.current.stopWebcam();
      }
    };
  }, [currentUserId, navigate]);

  const handleRegisterFace = async () => {
    if (!secureApiRequest) {
      setMessage(
        "인증 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }
    if (
      !currentUserId ||
      currentUserId === "undefined" ||
      currentUserId.trim() === ""
    ) {
      setMessage("유효한 사용자 정보가 없습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
      return;
    }
    if (!webcamRef.current || !webcamRef.current.isFaceDetected()) {
      setMessage("등록을 시도하기 전에 얼굴을 웹캠 중앙에 맞춰주세요.");
      return;
    }
    // 정확도 조건 추가
    if (webcamDetectionScore < REQUIRED_FACE_SCORE_FOR_REGISTER) {
      setMessage(
        `얼굴 정확도가 부족합니다 (${webcamDetectionScore.toFixed(2)}). ` +
          `최소 ${REQUIRED_FACE_SCORE_FOR_REGISTER.toFixed(2)} 이상일 때 등록할 수 있습니다.`
      );
      return;
    }

    setIsLoading(true);
    setMessage("얼굴 임베딩을 등록 중입니다...");

    try {
      const imageBlob = await webcamRef.current.captureFrame();
      if (!imageBlob) {
        setMessage("웹캠 이미지를 캡처할 수 없습니다.");
        setIsLoading(false);
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

      setMessage(
        apiResponse.data?.message || `얼굴 임베딩이 성공적으로 등록되었습니다.`
      );

      // ✅ 등록 성공 시 웹캠 중지
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
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>얼굴 ID 등록</h1>
        <p className={styles.userIdText}>
          <span className={styles.userIdHighlight}>사용자:</span>{" "}
          {nickname || "알 수 없는 사용자"}
        </p>

        <WebcamFaceDetector
          ref={webcamRef}
          onFaceDetected={handleFaceDetected}
          onNoFaceDetected={handleNoFaceDetected}
          onDetectionScoreUpdate={handleDetectionScoreUpdate}
          minConfidence={0.7} // 이 값은 WebcamFaceDetector 내부의 감지 로직에 사용
        />

        <div className={styles.buttonGroup}>
          <button
            onClick={handleRegisterFace}
            className={styles.primaryButton}
            disabled={
              isLoading ||
              !isFaceDetectedOnScreen ||
              webcamDetectionScore < REQUIRED_FACE_SCORE_FOR_REGISTER
            } // 정확도 조건 추가
          >
            {isLoading ? "등록 중..." : "현재 얼굴로 등록하기"}
          </button>
          <button
            onClick={() => navigate("/user/myinfo")}
            className={styles.secondaryButton}
            disabled={isLoading}
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
