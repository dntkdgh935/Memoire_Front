// src/components/admin/AdminTopLikesCollectionList.js
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./AdminTopLikesCollectionList.module.css";

function AdminTopLikesCollectionList() {
  const [topCollections, setTopCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role, isLoggedIn, secureApiRequest } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn || role !== "ADMIN") {
      setError("관리자 권한이 필요합니다.");
      setLoading(false);
      return;
    }

    const fetchTopCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await secureApiRequest(
          `/admin/top-likes-collections?limit=10`
        );
        setTopCollections(response.data);
      } catch (err) {
        console.error("TOP 좋아요 컬렉션 데이터 로딩 실패:", err);
        if (err.response && err.response.status === 403) {
          setError("데이터를 조회할 관리자 권한이 없습니다.");
        } else {
          setError(
            "데이터를 불러오는 데 실패했습니다: " +
              (err.response?.data?.message || err.message)
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTopCollections();
  }, [role, isLoggedIn, secureApiRequest]);

  if (loading) {
    return <div className={styles.message}>데이터 로딩 중...</div>;
  }

  if (error) {
    return (
      <div className={`${styles.message} ${styles.errorMessage}`}>
        오류: {error}
      </div>
    );
  }

  if (topCollections.length === 0) {
    return <div className={styles.message}>표시할 데이터가 없습니다.</div>;
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>순위</th>
            <th>컬렉션 이름</th>
            <th>작성자</th>
            <th>좋아요 수</th>
          </tr>
        </thead>
        <tbody>
          {topCollections.map((collection, index) => (
            <tr
              key={collection.collectionId}
              className={styles.clickableRow}
              onClick={() =>
                navigate(`/library/detail/${collection.collectionId}`)
              }
            >
              <td>{index + 1}</td>
              <td>{collection.collectionTitle}</td>
              <td>{collection.authorName || "작성자 정보 없음"}</td>
              <td>❤️ {collection.likesCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTopLikesCollectionList;
