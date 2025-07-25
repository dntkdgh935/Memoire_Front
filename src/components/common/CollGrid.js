// src/components/common/CollGrid.js
import React from "react";
import Masonry from "react-masonry-css";
import CollCard from "./CollCard";
import styles from "./CollGrid.module.css";

function CollGrid({ colls, onLikeChange, onBookmarkChange, onCollClick }) {
  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    768: 2,
    480: 1,
  };
  // console.log()를 map 밖에서 실행
  // colls.forEach((coll) => console.log(coll));

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className={styles.myMasonryGrid}
        columnClassName={styles.myMasonryGridColumn}
      >
        {colls.map((coll, index) => (
          <CollCard
            key={`${coll.collectionid}-${index}`} // ✅ 고유 key
            collection={coll}
            onLikeChange={onLikeChange}
            onBookmarkChange={onBookmarkChange}
            onCollClick={onCollClick}
          />
        ))}
      </Masonry>
    </>
  );
}

export default CollGrid;
