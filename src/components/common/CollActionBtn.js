import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import styles from "./CollActionBtn.module.css";
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from "react-icons/fa";
import axios from "axios";

function CollActionBtn({ btnType, coll, onActionChange }) {
  const { isLoggedIn, userid } = useContext(AuthContext);
  // collection 상태가 변경될 때마다 해당 상태를 추적하여 리렌더링
  // useEffect(() => {
  //   if (coll) {
  //     console.log("✅ [변경됨] collection 상태 업데이트:", coll);
  //   }
  // }, [coll]); // collection이 변경될 때마다 호출

  // useEffect(() => {
  //   // 초기 렌더링 시, 서버에서 최신 collection 데이터 가져오기
  //   const fetchCollection = async () => {
  //     try {
  //       const response = await axios.get(
  //         `http://localhost:8080/api/library/collection/${coll.collectionid}/${userid}`
  //       );
  //       setCurrentColl(response.data); // 서버에서 받은 최신 데이터를 상태로 설정
  //     } catch (error) {
  //       console.error("컬렉션 정보 불러오기 실패", error);
  //     }
  //   };

  //   if (coll) {
  //     fetchCollection(); // collection이 있을 때 서버에서 데이터 가져오기
  //   }
  // }, [coll]); // 초기값이 변경될 때마다 새로 데이터를 가져오도록

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
