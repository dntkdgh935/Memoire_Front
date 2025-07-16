import React, { useState } from "react";
import styles from "./SettingPanel.module.css";

export default function SettingPanel({
  selectedMemory,
  currentUserId,
  onGenerate,
}) {
  // TTS 설정
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsScript, setTtsScript] = useState("");
  const [ttsStyle, setTtsStyle] = useState("default");
  const [ttsTone, setTtsTone] = useState("neutral");
  const [ttsUrl, setTtsUrl] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [ttsGenerated, setTtsGenerated] = useState(false);

  // tts 미리듣기
  const [ttsPreviewUrl, setTtsPreviewUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // 비디오 설정
  const [videoPrompt, setVideoPrompt] = useState("");
  const [extraPrompt, setExtraPrompt] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);

  if (!selectedMemory) {
    return <p className={styles.placeholder}>왼쪽에서 메모리를 선택해주세요</p>;
  }

  const handleGenerateTts = async () => {
    setTtsLoading(true);
    setTtsError(null);

    try {
      const payload = { script: ttsScript, ttsStyle, tone: ttsTone };
      const res = await fetch("/atelier/video/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || "TTS 생성 실패");
      const url = await res.text();
      setTtsUrl(url);
      setTtsGenerated(true);
    } catch (e) {
      setTtsError(e.message);
    } finally {
      setTtsLoading(false);
    }
  };

  const handlePreviewTts = async () => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const payload = { script: ttsScript, ttsStyle, tone: ttsTone };
      const res = await fetch("/atelier/video/preview-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.text()) || "미리듣기 실패");
      const url = await res.text();
      setTtsPreviewUrl(url);
    } catch (e) {
      setPreviewError(e.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    setVideoLoading(true);
    setVideoError(null);
    try {
      const payload = {
        imageUrl: selectedMemory.imageUrl,
        videoPrompt,
        extraPrompt,
        ttsUrl: ttsEnabled ? ttsUrl : undefined,
      };
      const resp = await fetch("/atelier/video/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error((await resp.text()) || "영상 생성 실패");
      const dto = await resp.json();
      onGenerate(dto);
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
        <>
          {/* 스크립트 */}
          <div className={styles.field}>
            <label>내레이션 스크립트</label>
            <textarea
              rows={3}
              className={styles.textarea}
              placeholder="예: 부드럽고 따뜻한 내레이션"
              value={ttsScript}
              onChange={(e) => setTtsScript(e.target.value)}
            />
          </div>

          {/* 스타일 */}
          <div className={styles.field}>
            <label>TTS 스타일</label>
            <select
              className={styles.select}
              value={ttsStyle}
              onChange={(e) => setTtsStyle(e.target.value)}
            >
              <option value="default">디폴트</option>
              <option value="warm">Warm</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>

          {/* 톤 */}
          <div className={styles.field}>
            <label>톤</label>
            <select
              className={styles.select}
              value={ttsTone}
              onChange={(e) => setTtsTone(e.target.value)}
            >
              <option value="neutral">Neutral</option>
              <option value="cheerful">Cheerful</option>
              <option value="serious">Serious</option>
            </select>
          </div>

          {ttsError && <p className={styles.errorText}>{ttsError}</p>}
          <div className={styles.footer}>
            <button
              className={styles.generateBtn}
              onClick={handleGenerateTts}
              disabled={ttsLoading || !ttsScript || !ttsStyle || !ttsTone}
            >
              {ttsLoading
                ? "생성 중..."
                : ttsGenerated
                  ? "다시 생성"
                  : "음성 생성"}
            </button>
            {/* 미리듣기 버튼 */}
            {ttsGenerated && (
              <button
                className={styles.secondaryBtn}
                onClick={handlePreviewTts}
                disabled={previewLoading}
              >
                {previewLoading ? "미리듣기 중..." : "미리듣기"}
              </button>
            )}
          </div>

          {/* 오디오 플레이어 */}
          {ttsPreviewUrl && (
            <div className={styles.field}>
              <audio controls src={ttsPreviewUrl} />
              {previewError && (
                <p className={styles.errorText}>{previewError}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* 2단계: 비디오 설정 */}
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
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
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
