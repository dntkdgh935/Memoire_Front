import React, { useContext } from "react";
import styles from "./WorkResultPanel.module.css";
import loadingImg from "../../../assets/loading_pen.png";
import errorImg from "../../../assets/error_rain.png";
import { AuthContext } from "../../../AuthProvider"; // ✅ secureApiRequest 불러오기

function WorkResultPanel({ result, originalMemoryId, originalMemoryTitle }) {
  const isLoading = result?.status === "loading";
  const isError   = result?.status === "error";
  const isSuccess = Boolean(result?.imageUrl);
  const { secureApiRequest } = useContext(AuthContext); // ✅

  const handleSaveAsNewMemory = async () => {
    try {
      const payload = {
        originalMemoryId,
        title: originalMemoryTitle,
        imageUrl: result.imageUrl,
        prompt: result.prompt || "",
        style: result.style || "",
        collectionId: result.collectionId,
        memoryOrder: result.memoryOrder,
        memoryType: "image",
      };

      const res = await secureApiRequest("/api/atelier/image/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status !== 200) throw new Error("저장 실패");
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
        title: originalMemoryTitle,
        imageUrl: result.imageUrl,
        prompt: result.prompt || "",
        style: result.style || "",
        filename: result.filename || "",
        filepath: result.filepath || "",
      };

      const res = await secureApiRequest(`/api/atelier/image/update/${originalMemoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status !== 200) throw new Error("덮어쓰기 실패");
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
            <button className={styles.secondaryBtn} onClick={handleOverwriteMemory}>
              원본 메모리 덮어쓰기
            </button>
            <button className={styles.primaryBtn} onClick={handleSaveAsNewMemory}>
              새 메모리로 저장
            </button>
          </div>
        </div>
      )}

      {!result && (
        <p className={styles.placeholder}>
          이미지를 생성하려면 좌측의 적용 버튼을 클릭하세요.
        </p>
      )}
    </div>
  );
}

export default WorkResultPanel;