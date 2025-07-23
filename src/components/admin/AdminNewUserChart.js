// src/components/admin/AdminNewUserChart.js
import React, { useState, useEffect, useContext } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import apiClient from "../../utils/axios"; // 기존 axios 인스턴스 (AuthContext에서 사용되는)
import { AuthContext } from "../../AuthProvider";

function AdminNewUserChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role, isLoggedIn } = useContext(AuthContext); // 권한 확인을 위해 AuthContext 사용

  useEffect(() => {
    // ADMIN 권한이 없거나 로그인되지 않았다면 API 호출하지 않음
    if (!isLoggedIn || role !== "ADMIN") {
      setError("관리자 권한이 필요합니다.");
      setLoading(false);
      return;
    }

    const fetchNewUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 현재 날짜를 기준으로 7일치 데이터를 요청 (백엔드 기본값과 일치)
        // 실제 운영에서는 사용자에게 기간을 선택하게 할 수 있습니다.
        const today = new Date();
        const endDate = today.toISOString().slice(0, 10); // 'YYYY-MM-DD'
        const sevenDaysAgo = new Date(today.setDate(today.getDate() - 6));
        const startDate = sevenDaysAgo.toISOString().slice(0, 10); // 'YYYY-MM-DD'

        // Spring Boot 백엔드의 통계 API 호출
        // AuthContext의 secureApiRequest를 사용하지 않고 직접 apiClient를 사용하는 경우,
        // 토큰이 자동으로 헤더에 포함되는지 확인해야 합니다.
        // 일반적으로 apiClient 인스턴스에 Interceptor가 설정되어 있을 것입니다.
        const response = await apiClient.get(
          `/admin/new-users-daily?startDate=${startDate}&endDate=${endDate}`
        );

        // 응답 데이터 포맷이 Recharts에 맞게 매핑되어야 합니다.
        // 백엔드에서 [{ "date": "YYYY-MM-DD", "newUsers": count }] 형태로 오므로 바로 사용 가능합니다.
        setChartData(response.data);
      } catch (err) {
        console.error("신규 유저 데이터 로딩 실패:", err);
        // 에러 상태에 따라 사용자에게 메시지 표시
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

    fetchNewUserData();
  }, [role, isLoggedIn]); // role 또는 isLoggedIn 변경 시 다시 데이터 로드

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        데이터 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
        오류: {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        표시할 신규 유저 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2>최근 7일간 신규 가입 유저 통계</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />{" "}
          {/* 백엔드에서 "date" 필드로 날짜가 넘어옴 */}
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="newUsers"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            name="신규 가입자 수"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default AdminNewUserChart;
