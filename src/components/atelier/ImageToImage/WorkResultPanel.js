import React from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";

export default function WorkResultPanel({
  result,
  originalMemoryId,
  selectedCollectionId,
  originalMemoryTitle,
}) {
  const isLoading = result?.status === "loading";
  const isError = result?.status === "error";
  const isSuccess = result?.status === "success" && result.imageUrl;

  // 새 메모리로 저장
  const handleSaveAsNewMemory = async () => {
    if (!result?.resultDto) {
      alert("저장할 메모리 ID 또는 결과 데이터가 없습니다.");
      return;
    }
    try {
      const response = await fetch(`/atelier/imtim/${selectedCollectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.resultDto),
      });
      if (!response.ok) throw new Error("새 메모리 저장 실패");
      alert("새 메모리로 저장되었습니다!");
      window.location.reload();
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
      const response = await fetch(`/atelier/imtim/save/${originalMemoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.resultDto),
      });
      if (!response.ok) throw new Error("덮어쓰기 실패");
      alert("원본 메모리가 덮어쓰기 되었습니다!");
      window.location.reload();
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
            이미지 생성중
            <br />
            잠시만 기다려주세요.
          </p>
        </div>
      )}

      {isError && (
        <div className={styles.errorBox}>
          <img src={errorImg} alt="에러" />
          <p className={styles.errorText}>이미지 생성 실패</p>
          <p className={styles.errorReason}>
            {/* 백엔드 에러 메시지 */}
            실패 사유: {result.errorMessage || "알 수 없음"}
          </p>
        </div>
      )}

      {isSuccess && (
        <div className={styles.imageBox}>
          <img src={result.imageUrl} alt="생성된 이미지" />
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
          이미지를 생성하려면 버튼을 클릭하세요.
        </p>
      )}
    </div>
  );
}
