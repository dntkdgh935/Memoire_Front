import React, { useState, useEffect, useContext, useRef } from "react";
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
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [recommendedTags, setRecommendedTags] = useState([]);
  const debounceTimer = useRef(null);

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

    if (coll.collectionid) {
      const fetchStuff = async () => {
        try {
          const response = await secureApiRequest(
            `/archive/tags?collectionid=${coll.collectionid}`,
            {
              method: "GET",
            }
          );
          console.log(response.data);
          setTags(response.data);
        } catch (error) {
          console.error("태그 추천 불러오기 실패", error);
        }
      };
      fetchStuff();
    }
  }, [isLoggedIn, userid, coll, navigate]);

  useEffect(() => {
    if (tagInput.trim().length < 1) {
      setRecommendedTags([]);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const response = await secureApiRequest(
          `/archive/tags/search?keyword=${encodeURIComponent(tagInput)}`,
          {
            method: "GET",
          }
        );
        const result = await response.data;
        const filtered = result.filter((tag) => !tags.includes(tag));
        setRecommendedTags(filtered);
      } catch (e) {
        console.error("태그 자동완성 실패", e);
      }
    }, 300);
  }, [tagInput]);

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
    tags.forEach((tag) => {
      data.append("tags", tag);
    });

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

  const handleTagKeyDown = (e) => {
    if (
      (e.key === "Enter" || e.key === "," || e.key === "Tab") &&
      tagInput.trim() !== ""
    ) {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (/\s/.test(newTag)) {
        alert("태그에는 공백을 포함할 수 없습니다.");
        setTagInput("");
        return;
      }

      if (!/^[가-힣a-zA-Z0-9]+$/.test(newTag)) {
        alert("태그에는 특수문자를 포함할 수 없습니다.");
        setTagInput("");
        return;
      }

      if (new Blob([newTag]).size > 50) {
        alert("태그가 너무 깁니다");
        setTagInput("");
        return;
      }

      if (tags.length >= 15) {
        alert("태그는 최대 15개까지 입력할 수 있습니다.");
        setTagInput("");
        return;
      }

      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }

      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSuggestionClick = (tag) => {
    if (!tags.includes(tag)) {
      setTags((prev) => [...prev, tag]);
    }

    // 다음 tick에 tagInput 비우기
    setTimeout(() => {
      setTagInput("");
    }, 0);
  };

  return (
    <>
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <label className={styles.label}>컬렉션 제목</label>
          <label className={styles.label}>공유범위</label>
          <label className={styles.label}>테마</label>
          <label className={styles.label}>태그</label>
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
            <div className={styles.tagInputWrapper}>
              {tags.map((tag, index) => (
                <span key={index} className={styles.inlineTag}>
                  {tag}
                  <button
                    type="button"
                    className={styles.removeTagButton}
                    onClick={() => removeTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className={styles.inlineTagInput}
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="엔터로 태그 입력"
              />
            </div>
            {recommendedTags.length > 0 && (
              <ul className={styles.suggestionList}>
                {recommendedTags.map((tag, index) => (
                  <li
                    key={index}
                    className={styles.suggestionItem}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSuggestionClick(tag);
                    }}
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            )}
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
