import React, { useState } from "react";
import TagBar from "../../components/library/TagBar";
import Grid from "../../components/common/CollGrid";

import styles from "./LibraryMain.module.css"; // ✅

// src/pages/library/LibraryMain.js
function LibraryMain() {
  const [selectedTag, setSelectedTag] = useState("전체");
  const [topTags] = useState(["임시", "임시2", "임시3"]);

  return (
    <>
      {/* <h2>hello</h2> */}
      <TagBar
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        savedTags={topTags}
      />
      <Grid selectedTag={selectedTag} />
    </>
  );
}

export default LibraryMain;
