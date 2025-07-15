import React from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";

function WorkResultPanel({ result, originalMemoryId, originalMemoryTitle }) {
  const isLoading = result?.status === "loading";
  const isError = result?.status === "error";
  const isSuccess = result?.videoUrl; // imageUrl → videoUrl 체크

  // …생략: handleSaveAsNewMemory, handleOverwriteMemory 동일…

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
            poster={result.previewImageUrl /* 선택 사항 */}
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
