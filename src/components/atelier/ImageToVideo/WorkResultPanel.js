import React, { useState, useEffect, useContext } from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../AuthProvider";

function WorkResultPanel({
  result,
  originalMemoryId,
  originalMemoryTitle,
  selectedCollectionId,
}) {
  const navigate = useNavigate();
  const isLoading = result?.status === "loading";
  const isError = result?.status === "error";
  const isSuccess = result?.status === "success";

  const [videoUrl, setVideoUrl] = useState("");
  const { secureApiRequest } = useContext(AuthContext);

  useEffect(() => {
    if (result?.videoUrl) {
      const Url = `http://localhost:8080/upload_files${result.videoUrl}`;
      console.log("videoUrl: ", videoUrl);
      setVideoUrl(Url);
    }
  }, [result?.videoUrl]);

  // 새 메모리로 저장
  const handleSaveAsNewMemory = async () => {
    console.log("Saving new memory:", {
      collectionId: selectedCollectionId,
      resultDto: result.resultDto,
    });
    if (!result?.resultDto) {
      alert("저장할 메모리 ID 또는 결과 데이터가 없습니다.");
      return;
    }
    const payload = {
      collectionId: selectedCollectionId,
      ...result.resultDto,
      title: originalMemoryTitle,
    };
    try {
      const res = await secureApiRequest(
        `/atelier/video/${selectedCollectionId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || "새 메모리 저장 실패");
      }

      alert("✅ 새 메모리로 저장되었습니다!");
      navigate("/");
    } catch (err) {
      console.error("❌ 저장 중 오류:", err);
      alert("저장 중 오류 발생: " + (err.message || ""));
    }
  };

  // 원본 메모리 덮어쓰기
  const handleOverwriteMemory = async () => {
    if (!originalMemoryId || !result?.resultDto) {
      alert("저장할 메모리 ID 또는 결과 데이터가 없습니다.");
      return;
    }
    try {
      const res = await secureApiRequest(
        `/atelier/video/save/${originalMemoryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.resultDto),
        }
      );

      if (res.status < 200 || res.status >= 300) {
        throw new Error(res.data?.message || "메모리 덮어쓰기 실패");
      }

      alert("✅ 원본 메모리가 덮어쓰기 되었습니다!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("업데이트 중 오류 발생");
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.date}>
        {new Date().toISOString().split("T")[0]}
      </div>
      <div className={styles.title}>{originalMemoryTitle || "제목 없음"}</div>

      {isLoading && (
        <div className={styles.loadingBox}>
          <img src={loadingImg} alt="로딩 중" />
          <p>
            영상 생성중
            <br />
            잠시만 기다려주세요.
          </p>
        </div>
      )}
      {isError && (
        <div className={styles.errorBox}>
          <img src={errorImg} alt="에러" />
          <p className={styles.errorText}>오류: {result.errorMessage}</p>
        </div>
      )}

      {isSuccess && videoUrl && (
        <div className={styles.videoBox}>
          <video
            src={videoUrl}
            controls
            poster={result.previewImageUrl}
            className={styles.video}
          />
          <button
            className={styles.secondaryBtn}
            onClick={handleOverwriteMemory}
          >
            원본 메모리 덮어쓰기
          </button>
          <button className={styles.primaryBtn} onClick={handleSaveAsNewMemory}>
            새 메모리로 저장
          </button>
        </div>
      )}

      {/* 초기 안내 */}
      {!videoUrl && !isLoading && !isError && (
        <p className={styles.placeholder}>
          프롬프트를 입력하시고 영상을 생성해주세요.
        </p>
      )}
    </div>
  );
}

export default WorkResultPanel;
