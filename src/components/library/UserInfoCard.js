import React from "react";
import PropTypes from "prop-types";
import styles from "./UserInfoCard.module.css"; // 스타일을 위한 CSS 파일 (필요시 추가)

function UserInfoCard({
  userId,
  loginId,
  nickname,
  profileImagePath,
  statusMessage,
  userFreqTags,
  relStatusWLoginUser,
  onFollowBtnClick,
  onInfoCardClick,
}) {
  // 관계 상태에 따라 메시지 설정 (derived value)
  const getRelBtnMsg = (status) => {
    switch (status) {
      case "0":
        return "팔로잉 요청됨";
      case "1":
        return "팔로잉";
      case "2":
        return "차단 해제";
      case "3":
        return "팔로우 요청";
      default:
        return "상태 불명";
    }
  };
  const relBtnMsg = getRelBtnMsg(relStatusWLoginUser);
  return (
    <div
      className={styles.cardContainer}
      onClick={() => onInfoCardClick(userId)}
    >
      {/* 프로필 이미지 */}
      <div className={styles.profileImage}>
        <img
          src={profileImagePath || "/default-profile.jpg"} // 기본 이미지 경로
          alt={nickname}
          className={styles.profileImageImg}
        />
      </div>

      {/* 사용자 정보 */}
      <div className={styles.userInfo}>
        <h2 className={styles.nickname}>{nickname}</h2>
        <p className={styles.loginId}>@{loginId}</p>
        <div className={styles["status-bubble"]}>
          <p>{statusMessage || "상태메시지가 없습니다."}</p>
        </div>
        {/* 자주 사용하는 태그들 */}
        <div className={styles.userTags}>
          <ul>
            {userFreqTags && userFreqTags.length > 0 ? (
              userFreqTags.map((tag, index) => (
                <li key={index} className={styles.tagItem}>
                  {tag}
                </li>
              ))
            ) : (
              <li>태그 없음</li>
            )}
          </ul>
        </div>

        {/* 관계 상태 */}
        <div className={styles.relStatus}>
          {/* <span>{relStatusWLoginUser}</span> */}
          <button
            className={styles["follow-btn"]}
            onClick={() => onFollowBtnClick(userId, relStatusWLoginUser)}
          >
            {relBtnMsg}
          </button>
        </div>
      </div>
    </div>
  );
}
export default UserInfoCard;
