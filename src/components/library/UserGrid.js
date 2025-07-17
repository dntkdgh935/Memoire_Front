import React from "react";
import Masonry from "react-masonry-css";
import VisitProfileCard from "./VisitProfileCard"; // 사용자 카드 컴포넌트
import styles from "./UserGrid.module.css"; // 스타일 적용

function UserGrid({ users, onFollowChange, onUserClick }) {
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1,
  };

  // console.log()를 map 밖에서 실행
  users.forEach((user) => console.log(user));

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className={styles.myMasonryGrid}
      columnClassName={styles.myMasonryGridColumn}
    >
      {users.map((user) => (
        <VisitProfileCard
          key={user.userid}
          ownerid={user.userid}
          relStatus={user.isFollowing ? "팔로잉" : "팔로우"}
          relBtnMsg={user.isFollowing ? "언팔로우" : "팔로우"}
          onFollowBtnClick={() => onFollowChange(user.userid, "follow")}
          onBlockClick={() => console.log("차단 클릭")} // 차단 버튼 클릭시 실행
        />
      ))}
    </Masonry>
  );
}

export default UserGrid;
