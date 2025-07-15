// src/components/CollectionForm.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ArchiveNewCollection.module.css";

function ArchiveNewCollection() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <label className={styles.label}>컬렉션 제목</label>
          <label className={styles.label}>공유범위</label>
          <label className={styles.label}>테마</label>
        </div>

        <div className={styles.rightColumn}>
          <input
            type="text"
            className={styles.input}
            placeholder="텍스트를 입력하세요"
          />

          <select className={styles.select} required>
            <option value="">공유범위: 선택 없음</option>
            <option value="1">전체공개</option>
            <option value="2">팔로워</option>
            <option value="3">비공개</option>
          </select>
          <input type="color" className={styles.colorPicker} />
        </div>
      </div>
      <div>
        <input type="submit" value="등록하기" /> &nbsp; &nbsp;
        <input
          type="button"
          value="뒤로가기"
          onClick={() => {
            navigate(-1);
          }}
        />
      </div>
    </>
  );
}

export default ArchiveNewCollection;
