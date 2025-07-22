import React, { useRef, useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthProvider";
import WebcamFaceDetector from "../../components/user/WebcamFaceDetector";
import styles from "./FaceRegister.module.css"; // CSS 모듈 import

function FaceRegister() {
  const webcamRef = useRef(null);
  const { userid: encodedUserId } = useParams();
  const userId = decodeURIComponent(encodedUserId);
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceDetectedOnScreen, setIsFaceDetectedOnScreen] = useState(false);
  const [webcamDetectionScore, setWebcamDetectionScore] = useState(0);

  const context = useContext(AuthContext);
  const { secureApiRequest } = context || {};

  const handleFaceDetected = (score) => {
    setMessage(
      "얼굴이 감지되었습니다. '현재 얼굴로 등록하기' 버튼을 눌러주세요."
    );
    setIsFaceDetectedOnScreen(true);
  };

  const handleNoFaceDetected = () => {
    setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
    setIsFaceDetectedOnScreen(false);
  };

  const handleDetectionScoreUpdate = (score) => {
    setWebcamDetectionScore(score);
  };

  useEffect(() => {
    if (!userId || userId === "undefined" || userId.trim() === "") {
      setMessage("사용자 ID가 유효하지 않습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
    } else {
      setMessage(
        `사용자 ID: ${userId} - 웹캠을 활성화하고 얼굴을 정면으로 보여주세요.`
      );
    }
  }, [userId, navigate]);

  const handleRegisterFace = async () => {
    if (!secureApiRequest) {
      setMessage(
        "인증 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }
    if (!userId || userId === "undefined" || userId.trim() === "") {
      setMessage("유효한 사용자 ID가 없습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
      return;
    }
    if (!webcamRef.current || !webcamRef.current.isFaceDetected()) {
      setMessage("등록을 시도하기 전에 얼굴을 웹캠 중앙에 맞춰주세요.");
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
        `/user/${userId}/face-embedding`,
        {
          method: "POST",
          body: formData,
        }
      );

      setMessage(
        apiResponse.data?.message ||
          `${userId}의 얼굴 임베딩이 성공적으로 등록되었습니다.`
      );
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
          <span className={styles.userIdHighlight}>사용자 ID:</span> {userId}
        </p>

        <WebcamFaceDetector
          ref={webcamRef}
          onFaceDetected={handleFaceDetected}
          onNoFaceDetected={handleNoFaceDetected}
          onDetectionScoreUpdate={handleDetectionScoreUpdate}
          minConfidence={0.7}
        />

        <div className={styles.buttonGroup}>
          <button
            onClick={handleRegisterFace}
            className={styles.primaryButton}
            disabled={isLoading || !isFaceDetectedOnScreen}
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
      <p className={styles.footerText}>
        이 페이지에서 웹캠을 통해 사용자 얼굴 임베딩을 등록할 수 있습니다.
      </p>
    </div>
  );
}

export default FaceRegister;
