import React, { useRef, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import WebcamFaceDetector from "../../components/user/WebcamFaceDetector"; // WebcamFaceDetector import

import styles from "./FaceLogin.module.css";

function FaceLogin() {
  const webcamRef = useRef(null); // WebcamFaceDetector 컴포넌트의 ref
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFaceDetectedOnScreen, setIsFaceDetectedOnScreen] = useState(false);
  const [webcamDetectionScore, setWebcamDetectionScore] = useState(0);

  const context = useContext(AuthContext);
  const { updateTokens } = context || {};

  const handleFaceDetected = (score) => {
    setMessage("얼굴이 감지되었습니다. 'Face ID로 로그인' 버튼을 눌러주세요.");
    setIsFaceDetectedOnScreen(true);
  };

  const handleNoFaceDetected = () => {
    setMessage("얼굴을 찾을 수 없습니다. 얼굴을 웹캠 중앙에 맞춰주세요.");
    setIsFaceDetectedOnScreen(false);
  };

  const handleDetectionScoreUpdate = (score) => {
    setWebcamDetectionScore(score);
  };

  const handleFaceLogin = async () => {
    if (!apiClient) {
      setMessage(
        "API 클라이언트가 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }

    if (!webcamRef.current || !webcamRef.current.isFaceDetected()) {
      setMessage("로그인을 시도하기 전에 얼굴을 웹캠 중앙에 맞춰주세요.");
      return;
    }

    setIsLoading(true);
    setMessage("얼굴로 로그인 시도 중입니다...");

    try {
      const imageBlob = await webcamRef.current.captureFrame();
      if (!imageBlob) {
        setMessage("웹캠 이미지를 캡처할 수 없습니다.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face_login.jpg");

      const apiResponse = await apiClient.post(`/user/face-login`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { accessToken, refreshToken, ...userData } = apiResponse.data;

      updateTokens(accessToken, refreshToken);

      setMessage(
        `로그인 성공! 사용자: ${userData.nickname || userData.name || userData.userId}`
      );

      navigate("/");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          `얼굴 로그인 중 오류 발생: ${error.message}`
      );
      if (error.response?.status === 401) {
        setMessage(
          "얼굴 인식에 실패했거나 일치하는 사용자가 없습니다. 다시 시도해주세요."
        );
      } else if (error.response?.status === 404) {
        setMessage(
          "얼굴 임베딩을 찾을 수 없습니다. 등록된 얼굴이 있는지 확인해주세요."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Face ID 로그인</h1>
        <p className={styles.description}>
          웹캠을 통해 얼굴을 인식하여 로그인합니다.
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
            onClick={handleFaceLogin}
            className={styles.loginButton}
            disabled={isLoading || !isFaceDetectedOnScreen}
          >
            {isLoading ? "로그인 중..." : "Face ID로 로그인"}
          </button>
          <button
            onClick={() => navigate("/user/login")}
            className={styles.normalButton}
            disabled={isLoading}
          >
            일반 로그인으로 돌아가기
          </button>
        </div>

        {message && (
          <p
            className={`${styles.message} ${
              isLoading ? styles.loadingMessage : styles.normalMessage
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

export default FaceLogin;
