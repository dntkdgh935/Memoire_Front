import React, { useEffect } from "react";
import Masonry from "react-masonry-css";
import VisitProfileCard from "./VisitProfileCard"; // 사용자 카드 컴포넌트
import styles from "./UserGrid.module.css"; // 스타일 적용
import UserInfoCard from "./UserInfoCard";

function UserGrid({ users, onFollowBtnClick }) {
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1,
  };

  // useEffect로 컴포넌트 렌더링 시 한 번만 console.log 실행
  useEffect(() => {
    users.forEach((user) => {
      console.log(user);
    });
  }, [users]);

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className={styles.myMasonryGrid}
      columnClassName={styles.myMasonryGridColumn}
    >
      {users.map((user) => (
        <UserInfoCard
          key={user.loginId} // 고유한 key 값 제공
          userId={user.userId}
          loginId={user.loginId}
          nickname={user.nickname}
          profileImagePath={user.profileImagePath}
          statusMessage={user.statusMessage}
          userFreqTags={user.userFreqTags}
          relStatusWLoginUser={user.relStatusWLoginUser}
          onFollowBtnClick={onFollowBtnClick} // 팔로우 버튼 클릭 시 처리
        />
      ))}
    </Masonry>
  );
}

export default UserGrid;
