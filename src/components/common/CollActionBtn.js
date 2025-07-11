import React, { useState } from "react";
import styles from "./CollActionBtn.module.css";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import axios from "axios";

function CollActionBtn({ btnType, coll, onActionChange }) {
  // 아이콘 스타일을 userlike와 userbookmark 상태에 따라 변경
  const iconStyle = {
    color:
      btnType === "like"
        ? coll.userlike
          ? "var(--color-main)"
          : "var(--color-normal-text)" // 좋아요 상태에 따른 색상 변경
        : coll.userbookmark
          ? "var(--color-main)"
          : "var(--color-normal-text)", // 북마크 상태에 따른 색상 변경
  };

  //coll 의 userlike/ userbm 상태에 따라 다른 아이콘 표시
  const IconComponent =
    btnType === "like"
      ? //like 버튼
        coll.userlike // userlike 상태에 따라 아이콘 변경
        ? FaHeart // userlike가 true이면 채워진 하트
        : FaRegHeart // userlike가 false이면 빈 하트
      : //bookmark 버튼
        coll.userbookmark // userbookmark 상태에 따라 아이콘 변경
        ? FaBookmark // userbookmark가 true이면 채워진 북마크
        : FaRegBookmark; // userbookmark가 false이면 빈 북마크

  const handleBtnClick = () => {
    const actionType = btnType === "like" ? "userlike" : "userbookmark"; // 클릭된 버튼에 따른 액션 설정
    // 부모에게 상태 변경을 요청 (API 요청은 부모에서 처리)
    onActionChange(coll.collectionid, actionType);
  };

  return (
    <div
      className={`${styles.button} ${btnType === "like" ? styles.like : styles.bookmark}`}
      onClick={handleBtnClick}
    >
      <IconComponent className={styles.icon} style={iconStyle} />
      <span>
        {btnType === "like"
          ? `좋아요 ${coll.likeCount}` // btnType이 "like"이면 likeCount 출력
          : `북마크 ${coll.bookmarkCount}`}{" "}
      </span>
    </div>
  );
}

export default CollActionBtn;
