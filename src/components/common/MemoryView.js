// src/components/common/MemoryView.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./MemoryView.module.css";
import { useNavigate } from "react-router-dom";

function MemoryView({ selectedMemory, authorid, numMemories }) {
  console.log("🧪 [MemoryView] selectedMemory:", selectedMemory); // ✅ 정확한 확인용
  // useEffect(() => {
  //   console.log("메모리 뷰: " + selectedMemory); // ✅ 여긴 string + object니까 그냥 "[object Object]" 찍힘
  //   if (selectedMemory) {
  //     setisLoading(false);
  //   }
  // }, [selectedMemory]);

  const { isLoggedIn, userid, role, secureApiRequest } =
    useContext(AuthContext);

  const navigate = useNavigate();

  if (!selectedMemory) {
    return <div className={styles.loading}>로딩중...</div>;
  }

  const handleEditClick = () => {
    navigate("/archive/editmem", { state: selectedMemory });
  };

  const handleDeleteClick = async () => {
    if (!window.confirm("정말 해당 컬렉션을 삭제하시겠습니까?")) return;
    if (numMemories <= 1) {
      alert("오류: 컬렉션엔 최소 1개의 메모리가 존재해야 합니다");
      navigate("/archive");
      return;
    }
    try {
      await secureApiRequest(
        `/archive/memory/${selectedMemory.memoryid}?userid=${userid}`,
        {
          method: "DELETE",
        }
      );
      alert("메모리 삭제 완료");
      navigate("/archive");
    } catch (error) {
      console.error("메모리 삭제 실패", error);
      alert("메모리 삭제에 실패했습니다");
    }
  };

  const { createdDate, title, memoryType, content, filepath } = selectedMemory;

  return (
    <div className={styles.memoryContainer}>
      <div className={styles.metaInfo}>
        <span className={styles.date}>
          {new Date(createdDate).toLocaleDateString("ko-KR")}
        </span>
        <h2 className={styles.title}>{title}</h2>
        <hr className={styles.divider} />
        {isLoggedIn && (role === "ADMIN" || userid === authorid) && (
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleEditClick}>
              수정
            </button>
            <button className={styles.button} onClick={handleDeleteClick}>
              삭제
            </button>
          </div>
        )}
      </div>

      {memoryType === "text" && (
        <div className={styles.textContent}>{content}</div>
      )}

      {memoryType === "image" && (
        <div className={styles.imageWrapper}>
          <img src={filepath} alt={title} className={styles.imageContent} />
        </div>
      )}

      {memoryType === "video" && (
        <div className={styles.videoWrapper}>
          <video controls className={styles.videoContent}>
            <source src={filepath} type="video/mp4" />
            브라우저가 비디오를 지원하지 않습니다.
          </video>
        </div>
      )}
    </div>
  );
}

export default MemoryView;
