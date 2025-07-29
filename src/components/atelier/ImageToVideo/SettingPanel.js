import React, { useState, useRef, useEffect, useContext } from "react";
import styles from "./SettingPanel.module.css";
import { AuthContext } from "../../../AuthProvider";

export default function SettingPanel({ selectedMemory, onGenerate }) {
  //립싱크 모델 사용 여부 설정
  const [useLipSync, setUseLipSync] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const { secureApiRequest } = useContext(AuthContext);

  // TTS 설정
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [ttsScript, setTtsScript] = useState("");
  const [ttsSpeech, setTtsSpeech] = useState("");
  const [ttsUrl, setTtsUrl] = useState("");
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState(null);
  const [ttsGenerated, setTtsGenerated] = useState(false);

  // 비디오 설정
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);

  const audioRef = useRef(null);

  const TTS_SCRIPT_MAX = 500;
  const TTS_SPEECH_MAX = 200;
  const VIDEO_PROMPT_MAX = 200;

  useEffect(() => {
    setUseLipSync(false);
    setTtsEnabled(false);
    setVoiceGender("female");
    setTtsScript("");
    setTtsSpeech("");
    setTtsUrl("");
    setTtsGenerated(false);
    setTtsError(null);
    setVideoPrompt("");
    setVideoError(null);
  }, [selectedMemory]);

  useEffect(() => {
    if (ttsGenerated) {
      audioRef.current?.load();
    }
  }, [ttsUrl]);

  useEffect(() => {
    if (useLipSync) setTtsEnabled(true);
  }, [useLipSync]);

  if (!selectedMemory) {
    return <p className={styles.placeholder}>왼쪽에서 메모리를 선택해주세요</p>;
  }

  const handleGenerateTts = async () => {
    setTtsLoading(true);
    setTtsError(null);

    try {
      const payload = {
        script: ttsScript,
        speech: ttsSpeech,
        gender: voiceGender,
      };
      console.log("payload: ", payload);

      const res = await secureApiRequest("/atelier/video/generate-tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 413) {
        alert("⚠️ 생성된 결과가 너무 커서 저장할 수 없습니다.");
        return;
      }

      if (res.status !== 200) {
        const errorText = res.data?.message || "TTS 생성 실패";
        throw new Error(errorText);
      }

      const data = res.data;
      console.log("TTS 생성 결과:", data);
      onGenerate({ status: "success" });
      setTtsUrl(`http://localhost:8000${data.audio_url}`);
      setTtsGenerated(true);
    } catch (e) {
      onGenerate({
        status: "error",
        errorMessage: e.message || "알 수 없는 오류",
      });
      console.error("TTS 생성 오류:", e);
    } finally {
      setTtsLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    onGenerate({ status: "loading" });
    setVideoLoading(true);
    setVideoError(null);

    console.log("selectedMemory : ", selectedMemory);
    const imageUrl = `http://localhost:8080/upload_files/memory_img/${selectedMemory.filename}`;

    try {
      const payload = {
        imageUrl: imageUrl,
        videoPrompt,
        ttsUrl: ttsEnabled ? ttsUrl : undefined,
        lipSyncEnabled: useLipSync,
      };

      console.log("payload ▶", payload);

      const res = await secureApiRequest("/atelier/video/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 413) {
        alert("⚠️ 생성된 결과가 너무 커서 저장할 수 없습니다.");
        return;
      }

      if (res.status !== 200) {
        const errorText = res.data?.message || "영상 생성 실패";
        throw new Error(errorText);
      }

      onGenerate({
        status: "success",
        videoUrl: res.data.videoUrl,
        resultDto: res.data,
      });
    } catch (err) {
      onGenerate({
        status: "error",
        errorMessage: err.message || "알 수 없는 오류",
      });
      console.error("영상 생성 오류:", err);
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
          src={`http://localhost:8080/upload_files/memory_img/${selectedMemory.filename}`}
          alt={selectedMemory.title}
          className={styles.imagePreview}
        />
      </div>

      {/* 립싱크 모델 사용 설정 */}
      <div className={styles.field}>
        <label>립싱크 모델 사용</label>
        <div className={styles.optionButtons}>
          <button
            className={!useLipSync ? styles.optionActive : styles.option}
            onClick={() => setUseLipSync(false)}
            disabled={ttsEnabled && ttsGenerated}
          >
            미사용
          </button>
          <button
            className={useLipSync ? styles.optionActive : styles.option}
            onClick={() => setUseLipSync(true)}
          >
            사용
          </button>
        </div>
      </div>

      {/* TTS 설정 */}
      <div className={styles.field}>
        <label>음성 생성 여부</label>
        <div className={styles.optionButtons}>
          <button
            className={!ttsEnabled ? styles.optionActive : styles.option}
            onClick={() => setTtsEnabled(false)}
            disabled={useLipSync}
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
          {/* 1) 음성 선택 UI */}
          <div className={styles.voiceSelection}>
            <label>
              <input
                type="radio"
                name="voiceGender"
                value="female"
                checked={voiceGender === "female"}
                onChange={() => setVoiceGender("female")}
              />
              여성 목소리
            </label>
            <label>
              <input
                type="radio"
                name="voiceGender"
                value="male"
                checked={voiceGender === "male"}
                onChange={() => setVoiceGender("male")}
              />
              남성 목소리
            </label>
          </div>

          {/* 스크립트 */}
          <div className={styles.field}>
            <label>대사 톤/분위기 입력</label>
            <textarea
              rows={3}
              className={styles.textarea}
              placeholder="예: 부드럽고 따뜻한 목소리"
              value={ttsScript}
              onChange={(e) => setTtsScript(e.target.value)}
              maxLength={TTS_SCRIPT_MAX}
            />
            <div className={styles.charCount}>
              {ttsScript.length}/{TTS_SCRIPT_MAX}
            </div>
          </div>

          {/* 대사 */}
          <div className={styles.field}>
            <label>대사 설정</label>
            <textarea
              rows={2}
              className={styles.textarea}
              placeholder="원하는 대사가 있으면 적어주세요"
              value={ttsSpeech}
              onChange={(e) => setTtsSpeech(e.target.value)}
              maxLength={TTS_SPEECH_MAX}
            />
            <div className={styles.charCount}>
              {ttsSpeech.length}/{TTS_SPEECH_MAX}
            </div>
          </div>

          {ttsError && <p className={styles.errorText}>{ttsError}</p>}
          <div className={styles.lipsync}>
            <button
              className={styles.generateBtn}
              onClick={handleGenerateTts}
              disabled={ttsLoading || !ttsScript || !ttsSpeech}
            >
              {ttsLoading
                ? "생성 중..."
                : ttsGenerated
                  ? "다시 생성"
                  : "음성 생성"}
            </button>
            {/* 미리듣기 버튼 */}
            {ttsGenerated && (
              <div className={styles.field}>
                <audio ref={audioRef} src={ttsUrl} controls />
                <button
                  className={styles.generateBtn}
                  onClick={() => audioRef.current?.play()}
                >
                  미리듣기
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* 비디오 설정 */}
      {(ttsGenerated || !ttsEnabled) && (
        <>
          <hr />
          {useLipSync ? (
            <div className={styles.footer}>
              <button
                className={styles.generateBtn}
                onClick={handleGenerateVideo}
                disabled={videoLoading}
              >
                {videoLoading ? "영상 생성중..." : "영상 생성"}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label>영상 프롬프트</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="예: 따뜻한 카페 안에서의 장면"
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  maxLength={VIDEO_PROMPT_MAX}
                />
                <div className={styles.charCount}>
                  {videoPrompt.length}/{VIDEO_PROMPT_MAX}
                </div>
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
        </>
      )}
    </div>
  );
}
