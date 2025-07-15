import React from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";

function WorkResultPanel({ result, originalMemoryId, originalMemoryTitle }) {
  const isLoading = result?.status === "loading";
  const isError = result?.status === "error";
  const isSuccess = result?.imageUrl;

  const handleSaveAsNewMemory = async () => {
    try {
      const response = await fetch("/api/atelier/image/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: originalMemoryTitle,
          imageUrl: result.imageUrl,
          collectionId: result.collectionId,
          memoryType: "image",
          memoryOrder: result.memoryOrder,
        }),
      });
      if (!response.ok) throw new Error("저장 실패");
      alert("새 메모리로 저장되었습니다!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("저장 중 오류 발생");
    }
  };

  const handleOverwriteMemory = async () => {
    if (!originalMemoryId) {
      alert("원본 메모리 ID가 없습니다.");
      return;
    }
    try {
      const response = await fetch(
        `/api/atelier/image/update/${originalMemoryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: originalMemoryTitle,
            imageUrl: result.imageUrl,
          }),
        }
      );
      if (!response.ok) throw new Error("덮어쓰기 실패");
      alert("원본 메모리가 덮어쓰기 되었습니다!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("업데이트 중 오류 발생");
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.date}>
        {new Date().toISOString().split("T")[0]}
      </div>
      <div className={styles.title}>{originalMemoryTitle || "제목 없음"}</div>

      {/* 🔄 로딩 중 */}
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

      {/* ❌ 실패 시 */}
      {isError && (
        <div className={styles.errorBox}>
          <img src={errorImg} alt="에러" />
          <p className={styles.errorText}>이미지 생성 실패</p>
          <p className={styles.errorReason}>
            알 수 없는 오류로 인해 이미지 생성에 실패하였습니다.
            <br />
            실패 사유 : {result.errorMessage || "알 수 없음"}
          </p>
        </div>
      )}

      {/* ✅ 성공 시 */}
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

      {/* 💤 아무 상태도 아닐 때 */}
      {!result && (
        <p className={styles.placeholder}>
          이미지를 생성하려면 오른쪽 버튼을 클릭하세요.
        </p>
      )}
    </div>
  );
}

export default WorkResultPanel;
