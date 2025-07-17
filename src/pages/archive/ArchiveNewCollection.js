// src/components/CollectionForm.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./ArchiveNewCollection.module.css";

function ArchiveNewCollection() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  const [collection, setCollection] = useState({
    authorid: "",
    collectionTitle: "",
    visibility: "",
    color: "",
  });

  const navigate = useNavigate();
  useEffect(() => {
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/");
      return;
    }

    setCollection((prevCollection) => ({
      ...prevCollection,
      authorid: userid, //AuthProvider 에서 가져온 userid
      color: "#000000",
    }));
  }, [isLoggedIn, userid, navigate]);

  if (isLoggedIn === null || isLoggedIn === undefined || !userid) {
    return <div>로딩중...</div>;
  }

  const handleNext = async (e) => {
    e.preventDefault();

    const byteLength = new Blob([collection.collectionTitle]).size;
    if (byteLength > 255) {
      alert("컬렉션 제목은 최대 255바이트까지만 입력 가능합니다.");
      return;
    }

    navigate("/archive/newmem", { state: collection });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCollection((prevCollection) => ({
      ...prevCollection,
      [name]: value,
    }));
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <label className={styles.label}>컬렉션 제목</label>
          <label className={styles.label}>공유범위</label>
          <label className={styles.label}>테마</label>
        </div>

        <div className={styles.rightColumn}>
          <form className={styles.form} onSubmit={handleNext}>
            <input
              type="text"
              name="collectionTitle"
              onChange={handleChange}
              className={styles.input}
              value={collection.collectionTitle}
              placeholder="텍스트를 입력하세요"
              required
            />

            <select
              name="visibility"
              onChange={handleChange}
              className={styles.select}
              value={collection.visibility}
              required
            >
              <option value="">공유범위: 선택 없음</option>
              <option value="1">전체공개</option>
              <option value="2">팔로워</option>
              <option value="3">비공개</option>
            </select>
            <input
              type="color"
              name="color"
              onChange={handleChange}
              className={styles.colorPicker}
              value={collection.color}
              required
            />
            <div>
              <input type="submit" value="다음" /> &nbsp; &nbsp;
              <input
                type="button"
                value="뒤로가기"
                onClick={() => {
                  navigate(-1);
                }}
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ArchiveNewCollection;
