import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
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
      startWebcam = false,
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const animationFrameId = useRef(null);
    const mediaStreamRef = useRef(null);

    const [isWebcamActive, setIsWebcamActive] = useState(false);
    const [isModelsLoaded, setIsModelsLoaded] = useState(false);
    const [faceDetectedInFrame, setFaceDetectedInFrame] = useState(false);
    const [currentDetectionScore, setCurrentDetectionScore] = useState(0);

    const faceDetectedRef = useRef(false);

    const stopWebcamStream = useCallback(() => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
      if (mediaStreamRef.current) {
        console.log("웹캠 스트림의 트랙 중지 시도...");
        mediaStreamRef.current.getTracks().forEach((track) => {
          if (track.readyState === "live") {
            track.stop();
            console.log(`트랙 중지됨: ${track.kind}`);
          } else {
            console.log(
              `트랙 이미 중지됨 또는 준비 안됨: ${track.kind}, 상태: ${track.readyState}`
            );
          }
        });
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
      setFaceDetectedInFrame(false);
      setCurrentDetectionScore(0);
      if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
      if (onNoFaceDetected) onNoFaceDetected();
      console.log("웹캠 스트림 중지.");
    }, [onDetectionScoreUpdate, onNoFaceDetected]);

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
      stopWebcam: stopWebcamStream,
      // Removed: getFaceEmbedding as it's not used by FaceLogin anymore
    }));

    useEffect(() => {
      const loadModels = async () => {
        const MODEL_URL =
          "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@0.22.2/weights/";
        try {
          await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
          await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
          // Removed: await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
          setIsModelsLoaded(true);
          console.log("Face-API.js 모델 로드 완료.");
        } catch (error) {
          console.error("Face-API.js 모델 로드 실패:", error);
          alert(
            "얼굴 인식 모델 로드에 실패했습니다. 페이지를 새로고침하거나 나중에 다시 시도해주세요."
          );
        }
      };
      loadModels();
    }, []);

    const _startWebcamStream = useCallback(async () => {
      if (!isModelsLoaded) {
        console.log("모델이 로드되지 않아 웹캠 시작 지연.");
        return;
      }
      if (isWebcamActive) {
        console.log("웹캠이 이미 활성 상태입니다.");
        return;
      }
      if (!videoRef.current) {
        console.log("videoRef.current가 아직 준비되지 않아 웹캠 시작 지연.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        mediaStreamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            canvasRef.current.style.width = videoRef.current.clientWidth + "px";
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
      } catch (err) {
        console.error("웹캠 접근 오류:", err);
        setIsWebcamActive(false);
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          alert("웹캠 접근이 거부되었습니다. 카메라 권한을 허용해주세요.");
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          alert("사용 가능한 웹캠 장치를 찾을 수 없습니다.");
        } else {
          alert("웹캠을 시작하는 도중 알 수 없는 오류가 발생했습니다.");
        }
      }
    }, [isModelsLoaded, isWebcamActive]);

    useEffect(() => {
      if (startWebcam && isModelsLoaded && !isWebcamActive) {
        _startWebcamStream();
      } else if (!startWebcam && isWebcamActive) {
        stopWebcamStream();
      }
    }, [
      startWebcam,
      isModelsLoaded,
      isWebcamActive,
      _startWebcamStream,
      stopWebcamStream,
    ]);

    useEffect(() => {
      return () => {
        console.log("WebcamFaceDetector 컴포넌트 언마운트. 웹캠 정리 호출.");
        stopWebcamStream();
      };
    }, [stopWebcamStream]);

    useEffect(() => {
      if (!isWebcamActive || !isModelsLoaded) {
        setCurrentDetectionScore(0);
        setFaceDetectedInFrame(false);
        faceDetectedRef.current = false;
        if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
        if (onNoFaceDetected) onNoFaceDetected();
        return;
      }

      console.log("얼굴 감지 useEffect 시작.");
      const detectFace = async () => {
        if (
          !videoRef.current ||
          !canvasRef.current ||
          videoRef.current.paused ||
          videoRef.current.ended ||
          videoRef.current.readyState < 3
        ) {
          if (faceDetectedRef.current) {
            setFaceDetectedInFrame(false);
            faceDetectedRef.current = false;
            if (onNoFaceDetected) onNoFaceDetected();
          }
          setCurrentDetectionScore(0);
          if (onDetectionScoreUpdate) onDetectionScoreUpdate(0);
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
        // Removed: .withFaceDescriptor(); // 임베딩 추출 불필요

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
        console.log(
          "얼굴 감지 useEffect 클린업. animationFrameId.current:",
          animationFrameId.current
        );
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

    const renderOverlay = () => {
      if (!isModelsLoaded) {
        return <div className={styles.overlay}>얼굴 인식 모델 로드 중...</div>; // 메시지 변경
      }
      if (!isWebcamActive && !startWebcam) {
        return (
          <div className={styles.overlay}>
            아이디를 입력하면 웹캠이 활성화됩니다.
            <div className={styles.cameraIcon}></div>
          </div>
        );
      }
      if (!isWebcamActive && startWebcam && isModelsLoaded) {
        return (
          <div className={styles.overlay}>
            웹캠 활성화 중...
            <div className={styles.spinner}></div>
          </div>
        );
      }
      return null;
    };

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
        {renderOverlay()}
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
