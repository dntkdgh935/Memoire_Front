// src/components/common/CollGrid.js
import React from "react";
import Masonry from "react-masonry-css";
import CollCard from "./CollCard";
import styles from "./CollGrid.module.css";

function CollGrid({
  colls,
  onActionChange,
  onCollClick,
  scrollRef,
  loaderRef,
}) {
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
      <div
        ref={scrollRef}
        style={{
          height: "80vh",
          overflowY: "auto",
        }}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className={styles.myMasonryGrid}
          columnClassName={styles.myMasonryGridColumn}
        >
          {colls.map((coll, index) => (
            <CollCard
              key={`${coll.collectionid}-${index}`} // ✅ 고유 key
              collection={coll}
              onActionChange={onActionChange}
              onCollClick={onCollClick}
            />
          ))}
        </Masonry>
        <div ref={loaderRef} style={{ height: "40px" }} />
      </div>
    </>
  );
}

export default CollGrid;
