import React from "react";
import axios from "axios";

import { useNavigate, useLocation } from "react-router-dom";
import styles from "./LibCollLabel.module.css";
import AvatarWName from "../common/AvatarWName"; // 이 import도 필요합니다
import CollActionButton from "../common/CollActionBtn";
// 좋아요 클릭 시 처리 함수

function LibCollLabel({ coll }) {
  // const [isLiked, setIsLiked] = useState(coll.isLiked || false); // 좋아요 상태 관리
  // const [isBookmarked, setIsBookmarked] = useState(coll.isBookmarked || false); // 북마크 상태 관리

  // const toggleLikeClick = async () => {
  //   try {
  //     const response = await axios.post("/api/like", {
  //       collectionId: coll.id,
  //       isLiked: !isLiked,
  //     });

  //     if (response.status === 200) {
  //       setIsLiked(!isLiked); // 상태를 토글
  //     } else {
  //       console.error("Error liking the collection");
  //     }
  //   } catch (error) {
  //     console.error("Error sending like request", error);
  //   }
  // };

  // // 북마크 클릭 시 처리 함수
  // const toggleBMClick = async () => {
  //   try {
  //     const response = await axios.post("/api/bookmark", {
  //       collectionId: coll.id,
  //       isBookmarked: !isBookmarked,
  //     });

  //     if (response.status === 200) {
  //       setIsBookmarked(!isBookmarked); // 상태를 토글
  //     } else {
  //       console.error("Error bookmarking the collection");
  //     }
  //   } catch (error) {
  //     console.error("Error sending bookmark request", error);
  //   }
  // };

  return (
    <div className={styles.overlay}>
      <div className={styles.label}>
        <AvatarWName
          type="inCollLabel"
          user={{
            username: coll.authorname,
            displayId: `@${coll.authorid}`,
            profileImageUrl: coll.authorProfileImage,
          }}
        />
        <h3>{coll.collectionTitle}</h3>
        <p>{coll.createdDate}</p>
        <div className={styles.actionButtons}>
          <CollActionButton type="like" />
          <CollActionButton type="bookmark" />
        </div>
      </div>
    </div>
  );
}

export default LibCollLabel;
