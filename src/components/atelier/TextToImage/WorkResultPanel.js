import React from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";

function WorkResultPanel({ result, originalMemoryId, originalMemoryTitle }) {
  const isLoading = result?.status === "loading";
  const isError   = result?.status === "error";
  const isSuccess = Boolean(result?.imageUrl);

  const handleSaveAsNewMemory = async () => {
    try {
      const payload = {
        // **원본 메모리 ID** 추가
        originalMemoryId,
        // 백엔드에서 복사할 제목(없으면 백엔드가 알아서 처리)
        title: originalMemoryTitle,
        // DALL·E 리턴값
        imageUrl: result.imageUrl,
        prompt:   result.prompt || "",
        style:    result.style || "",
        // 컬렉션, 정렬 순서 정보
        collectionId: result.collectionId,
        memoryOrder:  result.memoryOrder,
        // 명시적으로 “image” 타입
        memoryType: "image",
      };

      const response = await fetch("/api/atelier/image/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("저장 실패");

      alert("새 메모리로 저장되었습니다!");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("저장 중 오류 발생");
    }
  };

  const handleOverwriteMemory = async () => {
    if (!originalMemoryId) {
      alert("원본 메모리 ID가 없습니다.");
      return;
    }

    try {
      const payload = {
        // 덮어쓸 때도 originalMemoryId는 URL 경로로 전달되고,
        // 내부에서는 기존 제목을 복사하므로 title 생략 가능
        title: originalMemoryTitle,
        imageUrl: result.imageUrl,
        prompt:   result.prompt || "",
        style:    result.style || "",
        filename: result.filename   || "",
        filepath: result.filepath   || "",
      };

      const response = await fetch(
        `/api/atelier/image/update/${originalMemoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("덮어쓰기 실패");

      alert("원본 메모리가 덮어쓰기 되었습니다!");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("업데이트 중 오류 발생");
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.date}>
        {new Date().toISOString().split("T")[0]}
      </div>
      <div className={styles.title}>
        {originalMemoryTitle || "제목 없음"}
      </div>

      {isLoading && (
        <div className={styles.loadingBox}>
          <img src={loadingImg} alt="로딩 중" />
          <p>
            이미지 생성중<br />
            잠시만 기다려주세요.
          </p>
        </div>
      )}

      {isError && (
        <div className={styles.errorBox}>
          <img src={errorImg} alt="에러" />
          <p className={styles.errorText}>이미지 생성 실패</p>
          <p className={styles.errorReason}>
            실패 사유 : {result.errorMessage || "알 수 없음"}
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
          이미지를 생성하려면 오른쪽 버튼을 클릭하세요.
        </p>
      )}
    </div>
  );
}

export default WorkResultPanel;