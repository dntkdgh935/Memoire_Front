import React from "react";
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
  const isLoading = result?.status === "loading";
  const isError = result?.status === "error";
  const isSuccess = result?.videoUrl;

  const navigate = useNavigate();

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
      const response = await fetch(`/atelier/video/${selectedCollectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("새 메모리 저장 실패");
      alert("새 메모리로 저장되었습니다!");
      navigate("/");
      // window.location.reload();
    } catch (err) {
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

      // window.location.reload();
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
            동영상 생성중
            <br />
            잠시만 기다려주세요.
          </p>
        </div>
      )}

      {isError && (
        <div className={styles.errorBox}>
          <img src={errorImg} alt="에러" />
          <p className={styles.errorText}>동영상 생성 실패</p>
          <p className={styles.errorReason}>
            실패 사유: {result.errorMessage || "알 수 없음"}
          </p>
        </div>
      )}

      {isSuccess && (
        <div className={styles.videoBox}>
          {/* HTML5 video 태그로 재생 */}
          <video
            src={result.videoUrl}
            controls
            autoPlay={false}
            poster={result.previewImageUrl}
          />
          <div className={styles.buttonGroup}>
            <button
              className={styles.secondaryBtn}
              onClick={handleOverwriteMemory}
            >
              원본 메모리 덮어쓰기
            </button>
            <button
              className={styles.primaryBtn}
              onClick={handleSaveAsNewMemory}
            >
              새 메모리로 저장
            </button>
          </div>
        </div>
      )}

      {!result && (
        <p className={styles.placeholder}>
          오른쪽 하단 “생성” 버튼을 눌러주세요.
        </p>
      )}
    </div>
  );
}

export default WorkResultPanel;
