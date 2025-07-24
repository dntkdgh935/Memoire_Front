// src/components/library/LibCollCard.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./LibCollCard.module.css";
import MemoryList from "../../components/common/MemoryList";
import CollActionBtn from "../../components/common/CollActionBtn";
import AvatarWName from "../common/AvatarWName";
import { useNavigate } from "react-router-dom";

/*<LibCollCard
        coll={collection}
        memoryList={memoryList}
        onMemoryClick={handleMemoryClick}
        onActionChange={handleActionChange}
        selectedMemory={selectedMemory}
      /> */
function LibCollCard({
  coll,
  memoryList,
  onMemoryClick,
  onActionChange,
  selectedMemoryId,
  onOpenLilkedUsers,
  onOpenBookmarkedUsers,
}) {
  const { isLoggedIn, userid, role, secureApiRequest } =
    useContext(AuthContext);

  const navigate = useNavigate();

  console.log("collection 주인: ", coll.authorid);

  const handleEditClick = () => {
    navigate("/archive/editcoll", { state: coll });
  };

  const handleDeleteClick = async () => {
    if (window.confirm("정말 해당 컬렉션을 삭제하시겠습니까?")) {
      try {
        await secureApiRequest(
          `/archive/collection/${coll.collectionid}?userid=${coll.authorid}`,
          {
            method: "DELETE",
          }
        );
        alert("컬렉션 삭제 완료");
        navigate("/archive");
      } catch (error) {
        console.error("컬렉션 삭제 실패", error);
        alert("컬렉션 삭제에 실패했습니다");
      }
    }
  };

  const handleAddMemoryClick = () => {
    navigate("/archive/newmem", { state: coll });
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.cardHeader}>
        <div className={styles.collectionTitle}>{coll.collectionTitle}</div>
        {/* 여기에 로그인상태이고 관리자이거나 해당 게시물 작성자이면 편집 버튼을 넣음 */}
        {isLoggedIn && (role === "ADMIN" || userid === coll.authorid) && (
          <div className={styles.buttonGroup}>
            <button className={styles.button} onClick={handleEditClick}>
              수정
            </button>
            <button className={styles.button} onClick={handleDeleteClick}>
              삭제
            </button>
          </div>
        )}
        <AvatarWName
          type="inCollLabel"
          user={{
            username: coll.authorname,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
            userid: coll.authorid,
          }}
        />

        <div className={styles.userName}>{coll.authorid}</div>
        <div className={styles.collectionDate}>{coll.createdDate}</div>
      </div>

      <div className={styles.cardTags}>
        {coll.collTags.map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className={styles.cardFooter}>
        <CollActionBtn
          btnType="like"
          coll={coll}
          onActionChange={onActionChange}
        />

        <CollActionBtn
          btnType="bookmark"
          coll={coll}
          onActionChange={onActionChange}
        />
      </div>
      {/**로그인 상태이고, 자기의 컬렉션일 때만 보이는 부분 */}
      {isLoggedIn && userid === coll.authorid && (
        <div className={styles.interactedUsers}>
          <div onClick={onOpenLilkedUsers} className={styles.likeUsers}>
            좋아요한 유저
          </div>
          <div onClick={onOpenBookmarkedUsers} className={styles.bmUsers}>
            북마크한 유저
          </div>
        </div>
      )}

      <div className={styles.memoryList}>
        <MemoryList
          memoryList={memoryList}
          onMemoryClick={onMemoryClick}
          selectedMemoryId={selectedMemoryId}
        />
        {isLoggedIn && (role === "ADMIN" || userid === coll.authorid) && (
          <div className={styles.memoryItem} onClick={handleAddMemoryClick}>
            +
          </div>
        )}
      </div>
    </div>
  );
}

export default LibCollCard;
