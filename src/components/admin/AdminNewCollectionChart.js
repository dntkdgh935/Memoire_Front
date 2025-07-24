// src/components/admin/AdminNewCollectionChart.js
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { AuthContext } from "../../AuthProvider";
// CSS 모듈 임포트
import styles from "./AdminNewCollectionChart.module.css";

function AdminNewCollectionChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role, isLoggedIn, secureApiRequest } = useContext(AuthContext);

  // 날짜 상태 추가
  const today = new Date();
  const defaultEndDate = today.toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(today); // today 객체를 복사하여 사용
  sevenDaysAgo.setDate(today.getDate() - 6); // 7일치 데이터를 위해 오늘 포함 6일 전
  const defaultStartDate = sevenDaysAgo.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  // 데이터 불러오기 함수를 useCallback으로 래핑
  const fetchCollectionData = useCallback(async () => {
    if (!isLoggedIn || role !== "ADMIN") {
      setError("관리자 권한이 필요합니다.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await secureApiRequest(
        `/admin/new-collections-daily?startDate=${startDate}&endDate=${endDate}`
      );

      setChartData(response.data);
    } catch (err) {
      console.error("신규 컬렉션 데이터 로딩 실패:", err);
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
  }, [startDate, endDate, role, isLoggedIn, secureApiRequest]); // 의존성 배열에 추가

  // 컴포넌트 마운트 시 및 날짜 변경 시 데이터 불러오기
  useEffect(() => {
    fetchCollectionData();
  }, [fetchCollectionData]); // fetchCollectionData가 변경될 때마다 실행

  // 날짜 변경 핸들러
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // 조회 버튼 클릭 핸들러
  const handleSearchClick = () => {
    fetchCollectionData(); // 날짜가 변경되면 데이터를 다시 불러옴
  };

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

  return (
    <div className={styles.chartContainer}>
      <div className={styles.datePickerContainer}>
        <label htmlFor="startDate">시작일:</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
          className={styles.dateInput}
        />
        <label htmlFor="endDate">종료일:</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={handleEndDateChange}
          className={styles.dateInput}
        />
      </div>
      {chartData.length === 0 ? (
        <div className={styles.message}>
          선택한 기간에 표시할 새로운 컬렉션 데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="newCollections"
              fill="#82ca9d"
              name="새로운 컬렉션 수"
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default AdminNewCollectionChart;
