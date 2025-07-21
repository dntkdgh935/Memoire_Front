import React, { useRef, useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { AuthContext } from "../../AuthProvider"; // AuthContext import

function FaceRegister() {
  const videoRef = useRef(null); // Reference for the webcam video stream
  const canvasRef = useRef(null); // Reference for the canvas to capture images
  // const { userId: encodedUserId } = useParams(); // 이전 코드: userId로 가져와서 문제 발생
  const { userid: encodedUserId } = useParams(); // 수정된 코드: 라우트 파라미터 이름과 일치하는 userid로 가져옴
  const userId = decodeURIComponent(encodedUserId); // Decode the userId
  const navigate = useNavigate(); // Hook for navigation

  const [message, setMessage] = useState(""); // Message to display to the user
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isWebcamActive, setIsWebcamActive] = useState(false); // Webcam active state

  // Get secureApiRequest from AuthContext
  const context = useContext(AuthContext);
  const { secureApiRequest } = context || {};

  useEffect(() => {
    let stream = null; // Local variable to hold the webcam stream

    // --- 추가된 디버깅 로그 시작 ---
    console.group("FaceRegisterPage useEffect Debugging");
    console.log("1. userId (decoded from URL):", userId);
    console.log("2. userId is truthy:", !!userId);
    console.log('3. userId !== "undefined":', userId !== "undefined");
    console.log('4. userId.trim() !== "":', userId.trim() !== "");
    const conditionResult =
      userId && userId !== "undefined" && userId.trim() !== "";
    console.log(
      "5. Combined condition result (should be true to proceed):",
      conditionResult
    );
    console.groupEnd();
    // --- 추가된 디버깅 로그 끝 ---

    const startWebcam = async () => {
      // Return if videoRef.current is null (component not yet mounted)
      if (!videoRef.current) return;

      // Prevent duplicate execution if webcam is already active or stream is already set
      if (isWebcamActive && videoRef.current.srcObject) {
        return;
      }

      try {
        // Request webcam access from the user
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream; // Connect the stream to the video element

        // Helper function to attempt video playback
        const playVideo = () => {
          if (videoRef.current) {
            // Check if video element still exists
            videoRef.current
              .play()
              .then(() => {
                setIsWebcamActive(true); // Update webcam active state
                setMessage(
                  `사용자 ID: ${userId} - 웹캠이 활성화되었습니다. 얼굴을 정면으로 보여주세요.`
                );
              })
              .catch((playErr) => {
                // Handle cases where play() request is interrupted or fails
                console.warn(
                  "웹캠 비디오 재생이 중단되거나 실패했습니다:",
                  playErr
                );
                setMessage(
                  "웹캠 비디오 재생에 문제가 발생했습니다. 페이지를 새로고침해보세요."
                );
                setIsWebcamActive(false); // Set to inactive state on playback failure
              });
          }
        };

        // Call playVideo when the video element is ready to play,
        // or immediately if it's already ready
        if (videoRef.current.readyState >= 3) {
          // HAVE_FUTURE_DATA (enough data available)
          playVideo();
        } else {
          // 'canplay' event fires when the video is ready to start playing.
          // Use { once: true } option to ensure it runs only once and prevents duplicate calls
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

    // Execute webcam start logic only if userId is valid
    if (conditionResult) {
      // 위에 계산된 conditionResult 변수 사용
      console.log(
        "FaceRegisterPage useEffect: userId is valid, starting webcam."
      );
      startWebcam();
    } else {
      console.log(
        "FaceRegisterPage useEffect: userId is NOT valid, redirecting to myinfo."
      );
      setMessage("사용자 ID가 유효하지 않습니다. 마이페이지로 돌아가주세요.");
      // Redirect to myinfo page immediately if userId is invalid
      navigate("/user/myinfo");
    }

    // Cleanup function for webcam stream on component unmount
    return () => {
      if (videoRef.current) {
        // Remove 'canplay' event listener if it exists (to prevent memory leaks)
        videoRef.current.removeEventListener("canplay", () => {});
        videoRef.current.srcObject = null; // Disconnect stream from video element to stop webcam
      }
      if (stream) {
        // If local stream variable exists, stop its tracks
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
        console.log("웹캠 스트림 정리 완료.");
      }
      setIsWebcamActive(false); // Reset webcam active state
    };
  }, [userId, navigate]); // Re-run useEffect only when userId or navigate changes

  // Function to capture the webcam frame and return it as a Blob
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isWebcamActive) {
      setMessage("웹캠이 활성화되어 있지 않습니다.");
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Adjust canvas size to match video's actual resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas image to JPEG Blob and return
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.8
      ); // JPEG format, quality 0.8 (adjustable compression)
    });
  };

  // Function to handle face embedding registration
  const handleRegisterFace = async () => {
    // Return if secureApiRequest is not available
    if (!secureApiRequest) {
      setMessage(
        "인증 서비스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요."
      );
      return;
    }
    // Re-validate userId to ensure it's a valid string
    if (!userId || userId === "undefined" || userId.trim() === "") {
      setMessage("유효한 사용자 ID가 없습니다. 마이페이지로 돌아가주세요.");
      navigate("/user/myinfo");
      return;
    }
    if (!isWebcamActive) {
      setMessage("웹캠이 활성화되어 있지 않습니다.");
      return;
    }

    setIsLoading(true);
    setMessage("얼굴 임베딩을 등록 중입니다...");

    try {
      const imageBlob = await captureFrame();
      if (!imageBlob) {
        setMessage("웹캠 이미지를 캡처할 수 없습니다.");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", imageBlob, "face_register.jpg");

      // Use secureApiRequest to send an authenticated request
      const apiResponse = await secureApiRequest(
        `/user/${userId}/face-embedding`,
        {
          method: "POST",
          body: formData, // FormData automatically sets Content-Type to multipart/form-data
          // Headers are handled internally by secureApiRequest, so no need to specify here
        }
      );

      // secureApiRequest throws an error if the response is not OK, so no need for separate response.ok check
      setMessage(
        apiResponse.data?.message ||
          `${userId}의 얼굴 임베딩이 성공적으로 등록되었습니다.`
      );
    } catch (error) {
      console.error("얼굴 임베딩 등록 요청 중 오류 발생:", error);
      // Error object from secureApiRequest might contain response?.data?.message
      setMessage(
        error.response?.data?.message ||
          `얼굴 임베딩 등록 중 오류 발생: ${error.message}`
      );
      if (error.response?.status === 401) {
        setMessage("인증이 필요합니다. 다시 로그인해주세요.");
        // Optionally redirect to login page
        // navigate('/user/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg text-center border-4 border-blue-300 transform transition-all duration-300 hover:scale-105">
        <h1 className="text-4xl font-bold mb-6 text-blue-800">얼굴 ID 등록</h1>
        <p className="text-lg text-gray-700 mb-4">
          <span className="font-semibold">사용자 ID:</span> {userId}
        </p>

        <div className="relative w-full max-w-md mx-auto mb-6 rounded-lg overflow-hidden border-2 border-gray-300 shadow-md">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-auto rounded-lg transform scaleX(-1)" // Flip webcam horizontally
          ></video>
          <canvas ref={canvasRef} className="hidden"></canvas>{" "}
          {/* Hidden canvas for capturing */}
        </div>

        <div className="mb-6 space-y-4">
          <button
            onClick={handleRegisterFace}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isLoading || !isWebcamActive || !userId || userId === "undefined"
            }
          >
            {isLoading ? "등록 중..." : "현재 얼굴로 등록하기"}
          </button>
          <button
            onClick={() => navigate("/user/myinfo")} // Button to navigate back to MyInfo page
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            마이페이지로 돌아가기
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
        이 페이지에서 웹캠을 통해 사용자 얼굴 임베딩을 등록할 수 있습니다.
      </p>
    </div>
  );
}

export default FaceRegister;
