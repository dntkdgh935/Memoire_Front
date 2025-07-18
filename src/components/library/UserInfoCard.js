import React from "react";
import PropTypes from "prop-types";
import styles from "./UserInfoCard.module.css"; // 스타일을 위한 CSS 파일 (필요시 추가)

function UserInfoCard({
  loginId,
  nickname,
  profileImagePath,
  statusMessage,
  userFreqTags,
  relStatusWLoginUser,
}) {
  return (
    <div className={styles.cardContainer}>
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
        <p className={styles.statusMessage}>{statusMessage}</p>

        {/* 자주 사용하는 태그들 */}
        <div className={styles.userTags}>
          <h4>자주 사용하는 태그:</h4>
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
          <strong>관계 상태: </strong>
          <span>{relStatusWLoginUser}</span>
        </div>
      </div>
    </div>
  );
}
export default UserInfoCard;
