import React, { useState, useEffect } from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";
import { useNavigate } from "react-router-dom";

function WorkResultPanel({
  result,
  originalMemoryId,
  originalMemoryTitle,
  selectedCollectionId,
}) {
  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (result?.videoUrl) {
      setVideoUrl(`http://localhost:8080/upload_files/${result.videoUrl}`);
      setError(null);
      console.log("rawVideoUrl :", videoUrl);
    }
  }, [result?.videoUrl]);

  // 새 메모리로 저장
  const handleSaveAsNewMemory = async () => {
    console.log("Saving new memory:", {
      collectionId: selectedCollectionId,
      resultDto: result.resultDto,
    });
    setLoading(true);
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
      const response = await fetch(`/atelier/video/${selectedCollectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("새 메모리 저장 실패");
      alert("새 메모리로 저장되었습니다!");
      navigate("/");
    } catch (err) {
      setLoading(false);
      setError(true);
      console.error(err);
      alert("저장 중 오류 발생");
    }
  };

  // 원본 메모리 덮어쓰기
  const handleOverwriteMemory = async () => {
    if (!originalMemoryId || !result?.resultDto) {
      alert("저장할 메모리 ID 또는 결과 데이터가 없습니다.");
      return;
    }
    try {
      const response = await fetch(`/atelier/video/save/${originalMemoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.resultDto),
      });
      if (!response.ok) throw new Error("덮어쓰기 실패");
      alert("원본 메모리가 덮어쓰기 되었습니다!");
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

      {loading && (
        <div className={styles.loadingBox}>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <img src={loadingImg} alt="로딩 중" />
          <p>
            영상 생성중
            <br />
            잠시만 기다려주세요.
          </p>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      )}
      {error && (
        <div className={styles.errorBox}>
          <img src={errorImg} alt="에러" />
          <p className={styles.errorText}>오류: {error}</p>
        </div>
      )}

      {!loading && !error && videoUrl && (
        <div className={styles.videoBox}>
          <video src={videoUrl} controls poster={result.previewImageUrl} />
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
      {!videoUrl && !loading && !error && (
        <p className={styles.placeholder}>
          프롬프트를 입력하시고 영상을 생성해주세요.
        </p>
      )}
    </div>
  );
}

export default WorkResultPanel;
