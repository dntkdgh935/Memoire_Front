import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./CollActionBtn.module.css";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import axios from "axios";

function ActionBtn_bm({ coll, onBookmarkChange }) {
  const iconStyle = {
    color: coll.userbookmark ? "var(--color-main)" : "var(--color-normal-text)", // 좋아요 상태에 따른 색상 변경
  };
  const IconComponent = coll.userbookmark
    ? FaBookmark //
    : FaRegBookmark; //

  return (
    <div
      className={`${styles.button} ${styles.bookmark}`}
      onClick={() => onBookmarkChange(coll)}
    >
      <IconComponent className={styles.icon} style={iconStyle} />
      <span>{`북마크 ${coll.bookmarkCount}`} </span>
    </div>
  );
}

export default ActionBtn_bm;
