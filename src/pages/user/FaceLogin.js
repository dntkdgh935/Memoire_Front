import React, { useRef, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthProvider"; // AuthContext import
import apiClient from "../../utils/axios"; // apiClient import 추가

function FaceLogin() {
  // 컴포넌트 이름 FaceLogin으로 변경
  const videoRef = useRef(null); // 웹캠 비디오 스트림을 위한 참조
  const canvasRef = useRef(null); // 이미지 캡처를 위한 캔버스 참조
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 훅

  const [message, setMessage] = useState(""); // 사용자에게 표시할 메시지
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const [isWebcamActive, setIsWebcamActive] = useState(false); // 웹캠 활성화 상태

  // AuthContext에서 updateTokens만 가져오기 (secureApiRequest는 이제 초기 로그인에 사용 안함)
  const context = useContext(AuthContext);
  const { updateTokens } = context || {};

  useEffect(() => {
    let stream = null; // 웹캠 스트림을 저장할 로컬 변수

    const startWebcam = async () => {
      // videoRef.current가 아직 null이면 즉시 종료 (컴포넌트 마운트 전일 수 있음)
      if (!videoRef.current) return;

      // 웹캠이 이미 활성화되었거나 스트림이 이미 설정되어 있으면 중복 실행 방지
      if (isWebcamActive && videoRef.current.srcObject) {
        return;
      }

      try {
        // 사용자에게 비디오 스트림 권한 요청
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream; // 비디오 요소에 스트림 연결

        // 비디오 재생을 시도하는 헬퍼 함수
        const playVideo = () => {
          if (videoRef.current) {
            // 비디오 요소가 여전히 존재하는지 확인
            videoRef.current
              .play()
              .then(() => {
                setIsWebcamActive(true); // 웹캠 활성화 상태 업데이트
                setMessage(
                  "웹캠이 활성화되었습니다. 얼굴을 정면으로 보여주세요."
                );
              })
              .catch((playErr) => {
                // play() 요청이 중단되거나 실패했을 때의 처리
                console.warn(
                  "웹캠 비디오 재생이 중단되거나 실패했습니다:",
                  playErr
                );
                setMessage(
                  "웹캠 비디오 재생에 문제가 발생했습니다. 페이지를 새로고침해보세요."
                );
                setIsWebcamActive(false); // 재생 실패 시 비활성화 상태로 설정
              });
          }
        };

        // 비디오 요소가 재생 준비가 되었을 때 playVideo 함수를 호출하거나,
        // 이미 준비된 상태라면 즉시 playVideo를 호출
        if (videoRef.current.readyState >= 3) {
          // HAVE_FUTURE_DATA (충분한 데이터가 있음)
          playVideo();
        } else {
          // 'canplay' 이벤트는 비디오가 재생을 시작할 수 있을 때 발생합니다.
          // { once: true } 옵션으로 한 번만 실행되도록 설정하여 중복 호출 방지
          videoRef.current.addEventListener("canplay", playVideo, {
            once: true,
          });
        }
      } catch (err) {
        console.error("웹캠 접근 오류:", err);
        setMessage("웹캠에 접근할 수 없습니다. 권한을 확인해주세요.");
        setIsWebcamActive(false);
      }
    };

    startWebcam(); // 컴포넌트 마운트 시 웹캠 시작

    // 컴포넌트 언마운트 시 웹캠 스트림 정리 함수
    return () => {
      if (videoRef.current) {
        // 'canplay' 이벤트 리스너가 남아있을 경우 제거 (중복 방지)
        videoRef.current.removeEventListener("canplay", () => {});
        videoRef.current.srcObject = null; // 비디오 요소의 스트림을 해제하여 웹캠 정지
      }
      if (stream) {
        // 로컬 변수로 저장된 스트림이 있다면 트랙 정지
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        console.log("웹캠 스트림 정리 완료.");
      }
      setIsWebcamActive(false); // 웹캠 활성화 상태 초기화
    };
  }, []); // 의존성 배열이 비어있으므로 컴포넌트 마운트 시 한 번만 실행

  // 웹캠 프레임을 캡처하여 Blob 형태로 반환하는 함수
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isWebcamActive) {
      setMessage("웹캠이 활성화되어 있지 않습니다.");
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // 비디오의 실제 해상도에 맞춰 캔버스 크기 조절
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // 캔버스에 현재 비디오 프레임 그리기
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 캔버스 이미지를 JPEG Blob으로 변환하여 반환
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.8
      ); // JPEG 형식, 품질 0.8 (압축률 조절 가능)
    });
  };

  // 얼굴로 로그인 처리 함수
  const handleFaceLogin = async () => {
    // secureApiRequest 대신 apiClient를 직접 사용
    if (!apiClient) {
      // apiClient가 정의되었는지 확인
      setMessage(
        "API 클라이언트가 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }
    if (!isWebcamActive) {
      setMessage("웹캠이 활성화되어 있지 않습니다.");
      return;
    }

    setIsLoading(true);
    setMessage("얼굴로 로그인 시도 중입니다...");

    try {
      const imageBlob = await captureFrame();
      if (!imageBlob) {
        setMessage("웹캠 이미지를 캡처할 수 없습니다.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face_login.jpg");

      // apiClient를 사용하여 인증되지 않은 요청 보내기 (로그인 요청이므로)
      const apiResponse = await apiClient.post(`/user/face-login`, formData, {
        headers: {
          "Content-Type": "multipart/form-data", // FormData 사용 시 필수
        },
      });

      // 로그인 성공 처리 (JWT 토큰 저장, 사용자 정보 표시)
      const { accessToken, refreshToken, ...userData } = apiResponse.data;
      updateTokens(accessToken, refreshToken); // AuthContext에 토큰 업데이트
      setMessage(
        `로그인 성공! 사용자: ${userData.nickname || userData.name || userData.userId}`
      );
      console.log("로그인 성공 데이터:", userData);

      // 로그인 성공 후 메인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("얼굴 로그인 요청 중 오류 발생:", error);
      // Axios 에러 처리
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-center border-4 border-blue-300 transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-bold mb-6 text-blue-800">
          Face ID 로그인
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          웹캠을 통해 얼굴을 인식하여 로그인합니다.
        </p>

        <div className="relative w-full max-w-md mx-auto mb-6 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto rounded-lg transform scaleX(-1)" // 웹캠 좌우 반전
          ></video>
          <canvas ref={canvasRef} className="hidden"></canvas>{" "}
          {/* 캡처용 캔버스, 화면에 표시 안함 */}
        </div>

        <div className="mb-6 space-y-4">
          <button
            onClick={handleFaceLogin}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isWebcamActive}
          >
            {isLoading ? "로그인 중..." : "Face ID로 로그인"}
          </button>
          <button
            onClick={() => navigate("/user/login")} // 일반 로그인 페이지로 돌아가기 버튼
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            일반 로그인으로 돌아가기
          </button>
        </div>

        {message && (
          <p
            className={`mt-4 p-3 rounded-lg ${isLoading ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"} font-medium`}
          >
            {message}
          </p>
        )}

        {isLoading && (
          <div className="mt-4 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">처리 중...</span>
          </div>
        )}
      </div>
      <p className="mt-8 text-gray-600 text-sm">
        이 페이지는 등록된 얼굴을 사용하여 로그인할 수 있도록 합니다.
      </p>
    </div>
  );
}

export default FaceLogin; // 컴포넌트 이름 FaceLogin으로 변경
