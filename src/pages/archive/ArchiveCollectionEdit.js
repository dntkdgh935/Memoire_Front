import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ArchiveCollectionEdit.module.css";

function ArchiveCollectionEdit() {
  const { isLoggedIn, userid, secureApiRequest } = useContext(AuthContext);

  const { state: coll } = useLocation();

  const [collection, setCollection] = useState({
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
    if (!coll) {
      alert("잘못된 접근입니다");
      navigate("/");
      return;
    }
    setCollection({
      ...coll,
    });
  }, [isLoggedIn, userid, coll, navigate]);

  if (isLoggedIn === null || isLoggedIn === undefined || !userid) {
    return <div>로딩중...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const byteLength = new Blob([collection.collectionTitle]).size;
    if (byteLength > 255) {
      alert("컬렉션 제목은 최대 255바이트까지만 입력 가능합니다.");
      return;
    }
    const data = new FormData();
    data.append("collectionid", coll.collectionid);
    data.append("authorid", coll.authorid);
    data.append("collectionTitle", collection.collectionTitle);
    data.append("readCount", coll.readCount);
    data.append("visibility", collection.visibility);
    data.append("titleEmbedding", coll.titleEmbedding);
    data.append("color", collection.color);

    try {
      await secureApiRequest("/archive/editColl", {
        method: "POST",
        body: data,
      });
      alert("컬렉션 수정 완료");
      navigate("/archive");
    } catch (error) {
      console.error("컬렉션 수정 실패", error);
      alert("컬렉션 수정에 실패했습니다");
    }
    navigate("/archive");
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
          <form className={styles.form} onSubmit={handleSubmit}>
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
              <input type="submit" value="변경하기" /> &nbsp; &nbsp;
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

export default ArchiveCollectionEdit;
