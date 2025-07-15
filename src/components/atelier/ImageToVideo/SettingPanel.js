import React, { useState } from "react";
import styles from "./SettingPanel.module.css";

export default function SettingPanel({
  selectedMemory,
  currentUserId,
  onGenerate, // 최종 비디오 URL을 받는 콜백
}) {
  // 1단계: TTS 설정
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsPrompt, setTtsPrompt] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [ttsGenerated, setTtsGenerated] = useState(false);
  const [ttsUrl, setTtsUrl] = useState("");

  // 2단계: 비디오 설정
  const [videoPrompt, setVideoPrompt] = useState("");
  const [extraRequest, setExtraRequest] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);

  if (!selectedMemory) {
    return <p className={styles.placeholder}>왼쪽에서 메모리를 선택해주세요</p>;
  }

  const handleGenerateTts = async () => {
    setTtsLoading(true);
    setTtsError(null);
    try {
      const resp = await fetch("/atelier/tts/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memoryId: selectedMemory.memoryid,
          userId: currentUserId,
          prompt: ttsPrompt,
        }),
      });
      if (!resp.ok) throw new Error("TTS 생성 실패");
      const data = await resp.json();
      setTtsUrl(data.ttsUrl);
      setTtsGenerated(true);
    } catch (err) {
      setTtsError(err.message);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setVideoLoading(true);
    setVideoError(null);
    try {
      const payload = {
        imageUrl: selectedMemory.imageUrl,
        stylePrompt: videoPrompt,
        userId: currentUserId,
        title: selectedMemory.title,
        content: selectedMemory.content,
        filename: selectedMemory.filename,
        filepath: selectedMemory.filepath,
      };
      // TTS 사용 시 생성된 URL도 함께 전송
      if (ttsEnabled && ttsGenerated) {
        payload.ttsUrl = ttsUrl;
      }
      const resp = await fetch("/atelier/imtim/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error("비디오 생성 실패");
      const data = await resp.json();
      onGenerate(data.videoUrl);
    } catch (err) {
      setVideoError(err.message);
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className={styles.settingPanel}>
      {/* 제목/원본 이미지 */}
      <div className={styles.field}>
        <label>제목</label>
        <input
          type="text"
          value={selectedMemory.title}
          readOnly
          className={styles.input}
        />
      </div>
      <div className={styles.field}>
        <label>원본 이미지</label>
        <img
          src={selectedMemory.imageUrl}
          alt="원본"
          className={styles.imagePreview}
        />
      </div>

      {/* 1단계: TTS 설정 */}
      <div className={styles.field}>
        <label>음성 생성 여부</label>
        <div className={styles.optionButtons}>
          <button
            className={!ttsEnabled ? styles.optionActive : styles.option}
            onClick={() => setTtsEnabled(false)}
          >
            TTS 사용 안 함
          </button>
          <button
            className={ttsEnabled ? styles.optionActive : styles.option}
            onClick={() => setTtsEnabled(true)}
          >
            TTS 사용
          </button>
        </div>
      </div>

      {ttsEnabled && (
        <div className={styles.field}>
          <label>TTS 프롬프트</label>
          <textarea
            rows={3}
            className={styles.textarea}
            placeholder="예: 부드럽고 따뜻한 내레이션"
            value={ttsPrompt}
            onChange={(e) => setTtsPrompt(e.target.value)}
          />
          {ttsError && <p className={styles.errorText}>{ttsError}</p>}
          <button
            className={styles.generateBtn}
            onClick={handleGenerateTts}
            disabled={ttsLoading || !ttsPrompt}
          >
            {ttsLoading
              ? "생성 중..."
              : ttsGenerated
                ? "다시 생성"
                : "음성 생성"}
          </button>
        </div>
      )}

      {/* 2단계: 비디오 설정 (TTS skip or done) */}
      {(ttsGenerated || !ttsEnabled) && (
        <>
          <hr />

          <div className={styles.field}>
            <label>영상 프롬프트</label>
            <input
              type="text"
              className={styles.input}
              placeholder="예: 따뜻한 카페 안에서의 장면"
              value={videoPrompt}
              onChange={(e) => setVideoPrompt(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>기타 요청</label>
            <textarea
              rows={3}
              className={styles.textarea}
              placeholder="예: 은은한 빛깔 강조"
              value={extraRequest}
              onChange={(e) => setExtraRequest(e.target.value)}
            />
          </div>
          {videoError && <p className={styles.errorText}>{videoError}</p>}
          <div className={styles.footer}>
            <button
              className={styles.generateBtn}
              onClick={handleGenerateVideo}
              disabled={videoLoading || !videoPrompt}
            >
              {videoLoading ? "영상 생성중..." : "영상 생성"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
