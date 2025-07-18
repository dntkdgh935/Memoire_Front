// src/components/common/NotificationsDropdown.js

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";

import styles from "./NotificationDropdown.module.css"; // 스타일 파일
import AvatarWName from "./AvatarWName";

function NotificationsDropdown({
  followReqs,
  onFollowRequestApproval,
  closeDropdown,
}) {
  const { isLoggedIn, userid, role } = useContext(AuthContext);

  return (
    <div className={styles.dropdownContainer}>
      <h3>팔로우 요청</h3>
      {followReqs.length > 0 ? (
        followReqs.map((request) => (
          <div key={request.requesterid} className={styles.notificationItem}>
            <p>
              <AvatarWName
                user={{
                  username: request.requesternickname,
                  profileImageUrl: request.requesterProfileImage,
                  userid: request.requesterid,
                }}
                type="inCollLabel" // `inCollLabel` 스타일로 설정
              />
              님이 팔로우 요청을 보냈습니다.
            </p>
            <button
              onClick={() =>
                onFollowRequestApproval(request.requesterid, userid)
              }
            >
              승인
            </button>
          </div>
        ))
      ) : (
        <p>새로운 팔로우 요청이 없습니다.</p>
      )}
      <button className={styles.closeButton} onClick={closeDropdown}>
        닫기
      </button>
    </div>
  );
}

export default NotificationsDropdown;
