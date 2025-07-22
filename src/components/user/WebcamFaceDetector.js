import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as faceapi from "face-api.js";
import styles from "./WebcamFaceDetector.module.css";

const WebcamFaceDetector = forwardRef(
  (
    {
      onFaceDetected,
      onNoFaceDetected,
      onDetectionScoreUpdate,
      minConfidence = 0.7,
      width = 640,
      height = 480,
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);

    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [faceDetectedInFrame, setFaceDetectedInFrame] = useState(false);
    const [currentDetectionScore, setCurrentDetectionScore] = useState(0);

    // useRef로 이전 얼굴 감지 상태 저장 (렌더링 영향 X)
    const faceDetectedRef = useRef(false);

    // 부모 컴포넌트에서 호출할 수 있는 메서드 노출
    useImperativeHandle(ref, () => ({
      captureFrame: async () => {
        if (
          !videoRef.current ||
          !canvasRef.current ||
          !isWebcamActive ||
          !faceDetectedRef.current
        ) {
          console.warn(
            "captureFrame: 웹캠 비활성 또는 얼굴 미감지 상태에서 캡처 시도."
          );
          return null;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return new Promise((resolve) => {
          canvas.toBlob(
            (blob) => {
              resolve(blob);
            },
            "image/jpeg",
            0.8
          );
        });
      },
      isFaceDetected: () => faceDetectedRef.current,
      getDetectionScore: () => currentDetectionScore,
    }));

    // 모델 로드
    useEffect(() => {
      const loadModels = async () => {
        const MODEL_URL =
          "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/";
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

          if (
            faceapi.nets.tinyFaceDetector.isLoaded &&
            faceapi.nets.faceLandmark68Net.isLoaded
          ) {
            setIsModelsLoaded(true);
            console.log("Face-API.js 모델 로드 완료.");
          } else {
            console.error("Face-API.js 모델 로드 확인 실패.");
          }
        } catch (error) {
          console.error("Face-API.js 모델 로드 실패:", error);
        }
      };

      loadModels();
    }, []);

    // 웹캠 스트림 시작 및 정리
    useEffect(() => {
      let stream = null;

      const startWebcamStream = async () => {
        if (!videoRef.current || !isModelsLoaded) return;

        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;

          const handleLoadedMetadata = () => {
            if (videoRef.current && canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;

              canvasRef.current.style.width =
                videoRef.current.clientWidth + "px";
              canvasRef.current.style.height =
                videoRef.current.clientHeight + "px";
            }
            videoRef.current
              .play()
              .then(() => {
                setIsWebcamActive(true);
                console.log("웹캠 스트림 재생 시작.");
              })
              .catch((playErr) => {
                console.error("웹캠 비디오 재생 실패:", playErr);
                setIsWebcamActive(false);
              });
          };

          videoRef.current.addEventListener(
            "loadedmetadata",
            handleLoadedMetadata,
            { once: true }
          );
        } catch (err) {
          console.error("웹캠 접근 오류:", err);
          setIsWebcamActive(false);
        }
      };

      if (isModelsLoaded) {
        startWebcamStream();
      }

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject
            .getTracks()
            .forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        setIsWebcamActive(false);
        setFaceDetectedInFrame(false);
        setCurrentDetectionScore(0);
      };
    }, [isModelsLoaded]);

    // 얼굴 감지 함수 (requestAnimationFrame 재귀)
    useEffect(() => {
      if (!isWebcamActive || !isModelsLoaded) {
        setCurrentDetectionScore(0);
        setFaceDetectedInFrame(false);
        faceDetectedRef.current = false;
        if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
        if (onNoFaceDetected) onNoFaceDetected();
        return;
      }

      const detectFace = async () => {
        if (
          !videoRef.current ||
          !canvasRef.current ||
          videoRef.current.paused ||
          videoRef.current.ended
        ) {
          setCurrentDetectionScore(0);
          if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
          if (faceDetectedRef.current) {
            setFaceDetectedInFrame(false);
            faceDetectedRef.current = false;
            if (onNoFaceDetected) onNoFaceDetected();
          }
          animationFrameId.current = requestAnimationFrame(detectFace);
          return;
        }

        const displaySize = {
          width: videoRef.current.clientWidth,
          height: videoRef.current.clientHeight,
        };

        if (displaySize.width === 0 || displaySize.height === 0) {
          setCurrentDetectionScore(0);
          if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
          if (faceDetectedRef.current) {
            setFaceDetectedInFrame(false);
            faceDetectedRef.current = false;
            if (onNoFaceDetected) onNoFaceDetected();
          }
          animationFrameId.current = requestAnimationFrame(detectFace);
          return;
        }

        const canvasElement = canvasRef.current;
        if (!canvasElement) {
          console.error("canvasRef.current가 null입니다.");
          setCurrentDetectionScore(0);
          if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
          if (faceDetectedRef.current) {
            setFaceDetectedInFrame(false);
            faceDetectedRef.current = false;
            if (onNoFaceDetected) onNoFaceDetected();
          }
          animationFrameId.current = requestAnimationFrame(detectFace);
          return;
        }

        const context = canvasElement.getContext("2d");
        if (!context) {
          console.error("캔버스 컨텍스트를 가져올 수 없습니다.");
          setCurrentDetectionScore(0);
          if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
          if (faceDetectedRef.current) {
            setFaceDetectedInFrame(false);
            faceDetectedRef.current = false;
            if (onNoFaceDetected) onNoFaceDetected();
          }
          animationFrameId.current = requestAnimationFrame(detectFace);
          return;
        }

        faceapi.matchDimensions(canvasElement, displaySize);

        const detectionsWithLandmarks = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks();

        const resizedDetections = detectionsWithLandmarks
          ? faceapi.resizeResults(detectionsWithLandmarks, displaySize)
          : null;

        context.clearRect(0, 0, canvasElement.width, canvasElement.height);

        let score = 0;
        if (
          detectionsWithLandmarks &&
          detectionsWithLandmarks.detection &&
          detectionsWithLandmarks.detection.score
        ) {
          score = detectionsWithLandmarks.detection.score;
        }
        setCurrentDetectionScore(score);
        if (onDetectionScoreUpdate) onDetectionScoreUpdate(score);

        const isCurrentlyFaceDetected =
          resizedDetections && score >= minConfidence;

        if (isCurrentlyFaceDetected) {
          faceapi.draw.drawDetections(canvasElement, resizedDetections);
          // faceapi.draw.drawFaceLandmarks(canvasElement, resizedDetections);

          if (!faceDetectedRef.current) {
            setFaceDetectedInFrame(true);
            faceDetectedRef.current = true;
            if (onFaceDetected) onFaceDetected(score);
          }
        } else {
          if (faceDetectedRef.current) {
            setFaceDetectedInFrame(false);
            faceDetectedRef.current = false;
            if (onNoFaceDetected) onNoFaceDetected();
          }
        }

        animationFrameId.current = requestAnimationFrame(detectFace);
      };

      animationFrameId.current = requestAnimationFrame(detectFace);

      return () => {
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      };
    }, [
      isWebcamActive,
      isModelsLoaded,
      onFaceDetected,
      onNoFaceDetected,
      onDetectionScoreUpdate,
      minConfidence,
    ]);

    return (
      <div className={styles.container}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={styles.video}
          width={width}
          height={height}
        />
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ pointerEvents: "none" }}
        />
        {!isModelsLoaded && (
          <div className={styles.overlay}>얼굴 인식 모델 로드 중...</div>
        )}
        {!isWebcamActive && isModelsLoaded && (
          <div className={styles.overlay}>웹캠 활성화 대기 중...</div>
        )}
        {isWebcamActive && isModelsLoaded && (
          <div className={styles.accuracyBadge}>
            정확도: {currentDetectionScore.toFixed(2)}
          </div>
        )}
      </div>
    );
  }
);

export default WebcamFaceDetector;
