import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./CollActionBtn.module.css";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";

function ActionBtn_like({ coll, onLikeChange }) {
  const iconStyle = {
    color: coll.userlike ? "var(--color-main)" : "var(--color-normal-text)", // 좋아요 상태에 따른 색상 변경
  };
  const IconComponent = coll.userlike // userlike 상태에 따라 아이콘 변경
    ? FaHeart // userlike가 true이면 채워진 하트
    : FaRegHeart; // userlike가 false이면 빈 하트

  return (
    <div
      className={`${styles.button} ${styles.like}`}
      onClick={() => onLikeChange(coll)}
    >
      <IconComponent className={styles.icon} style={iconStyle} />
      <span>{`좋아요 ${coll.likeCount}`} </span>
    </div>
  );
}

export default ActionBtn_like;
