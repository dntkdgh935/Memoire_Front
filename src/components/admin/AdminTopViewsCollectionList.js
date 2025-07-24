// src/components/admin/AdminTopViewsCollectionList.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import styles from "./AdminTopViewsCollectionList.module.css";

function AdminTopViewsCollectionList() {
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
        const response = await secureApiRequest("/admin/collections/top-views");
        setTopCollections(response.data);
      } catch (err) {
        console.error("가장 많이 본 컬렉션 목록 로딩 실패:", err);
        if (err.response?.status === 403) {
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
    return (
      <div className={styles.message}>조회수가 높은 컬렉션이 없습니다.</div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>순위</th>
            <th>컬렉션 이름</th>
            <th>조회수</th>
          </tr>
        </thead>
        <tbody>
          {topCollections.map((collection, index) => (
            <tr
              key={collection.id}
              onClick={() => navigate(`/library/detail/${collection.id}`)}
              className={styles.clickableRow}
            >
              <td>{index + 1}</td>
              <td>{collection.name}</td>
              <td>{collection.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTopViewsCollectionList;
