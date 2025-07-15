// src/components/ArchiveNewMemory.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ArchiveNewMemory.module.css";

function ArchiveNewMemory() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state: collection } = useLocation();

  const [tab, setTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      setTimeout(() => navigate("/"), 100);
      return;
    }
    if (userid && collection?.authorid && userid !== collection.authorid) {
      alert("문제가 발생했습니다!");
      setTimeout(() => navigate("/archive"), 100);
      return;
    }
    if (!collection) {
      alert("잘못된 접근입니다");
      setTimeout(() => navigate("/archive"), 100);
      return;
    }
  }, [isLoggedIn, userid, collection, navigate]);

  if (!collection) {
    return <div>잘못된 접근입니다</div>;
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    if (
      tab === "text" &&
      !window.confirm(
        "텍스트 업로드를 진행하시겠습니까?\n(업로드한 이미지/비디오는 사라집니다)"
      )
    ) {
      return;
    } else if (
      tab === "media" &&
      !window.confirm(
        "이미지/비디오 업로드를 진행하시겠습니까?\n(업로드한 텍스트는 사라집니다)"
      )
    ) {
      return;
    }
    const formData = new FormData();
    formData.append("authorid", collection.authorid);
    formData.append("collectionTitle", collection.collectionTitle);
    formData.append("visibility", collection.visibility);
    formData.append("color", collection.color);
    formData.append("memoryType", tab);
    formData.append("title", title);
    if (tab === "text") {
      formData.append("content", content);
    } else {
      if (file) {
        formData.append("file", file);
      }
    }

    try {
      await secureApiRequest("/archive/newColl", {
        method: "POST",
        body: formData,
      });

      alert("업로드 성공");
      navigate("/archive");
    } catch (e) {
      console.error("컬렉션 업로드 실패 ", e);
      alert("업로드 중 오류 발생");
    }
    navigate("/archive");
  };

  return (
    <>
      <form onSubmit={handleUpload}>
        <div className={styles.container}>
          <div className={styles.leftPane}>
            <label className={styles.label}>제목</label>
            <input
              className={styles.titleInput}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              required
            />

            <label className={styles.label}>내용</label>
            <div className={styles.tabGroup}>
              <button
                className={`${styles.tab} ${tab === "text" ? styles.activeTab : ""}`}
                onClick={() => setTab("text")}
              >
                텍스트
              </button>
              <button
                className={`${styles.tab} ${tab === "media" ? styles.activeTab : ""}`}
                onClick={() => setTab("media")}
              >
                이미지/영상
              </button>
            </div>

            {tab === "text" ? (
              <textarea
                className={styles.textArea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력하세요"
                required
              />
            ) : (
              <div className={styles.fileDropZone}>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                <p>이미지 파일을 선택하거나 여기로 끌어다 놓으세요.</p>
              </div>
            )}
          </div>
          {tab === "media" && (
            <div className={styles.rightPane}>
              <div className={styles.previewCard}>
                <span>이미지/영상 미리보기</span>
                <h2 className={styles.previewTitle}>{title}</h2>
                {tab === "media" && file ? (
                  file.type.startsWith("video/") ? (
                    <video
                      controls
                      className={styles.previewImage}
                      src={URL.createObjectURL(file)}
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className={styles.previewImage}
                    />
                  )
                ) : (
                  <p className={styles.previewText}>{content}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {collection.visibility === "1" && (
          <div className={styles.visibilityBtns}>공유범위: 전체공개</div>
        )}
        {collection.visibility === "2" && (
          <div className={styles.visibilityBtns}>공유범위: 팔로워</div>
        )}
        {collection.visibility === "3" && (
          <div className={styles.visibilityBtns}>공유범위: 비공개</div>
        )}

        <button type="submit" className={styles.uploadBtn}>
          업로드
        </button>
      </form>
    </>
  );
}

export default ArchiveNewMemory;
