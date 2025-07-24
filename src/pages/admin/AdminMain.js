// src/pages/admin/AdminMain.js
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import AdminNewUserChart from "../../components/admin/AdminNewUserChart";

// 아직 구현되지 않은 컴포넌트들을 위한 더미 컴포넌트 (추후 실제 로직으로 교체)
const AdminNewCollectionChart = () => <div>새로운 컬렉션 그래프</div>;
const AdminTopLikesCollectionList = () => <div>TOP 좋아요 컬렉션</div>;
const AdminTopViewsCollectionList = () => <div>TOP 조회수 컬렉션</div>;

// AdminMain 컴포넌트
const AdminMain = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, secureApiRequest } = useContext(AuthContext);

  // 상단 통계 데이터를 위한 상태
  const [totalUsers, setTotalUsers] = useState(null);
  const [reportedPosts, setReportedPosts] = useState(null);

  useEffect(() => {
    // 관리자 권한 확인 로직 (기존 코드 유지)
    if (isLoggedIn !== null) {
      if (!isLoggedIn || role !== "ADMIN") {
        alert("관리자 권한이 필요합니다.");
        navigate("/");
      }
    }

    // 관리자 권한이 있을 때만 통계 데이터 API 호출
    if (isLoggedIn && role === "ADMIN") {
      // API 호출 함수
      const fetchAdminStats = async () => {
        try {
          // 총 유저 수 API 호출 (예시)
          const usersResponse = await secureApiRequest(
            "/admin/api/stats/total-users"
          );
          setTotalUsers(usersResponse.data.totalCount);

          // 신고된 게시물 수 API 호출 (예시)
          const reportedResponse = await secureApiRequest(
            "/admin/api/stats/reported-posts"
          );
          setReportedPosts(reportedResponse.data.reportedCount);
        } catch (error) {
          console.error("관리자 통계 데이터 로딩 실패:", error);
          setTotalUsers("오류");
          setReportedPosts("오류");
        }
      };

      fetchAdminStats();
    }
  }, [isLoggedIn, role, navigate, secureApiRequest]);

  // 권한이 없으면 렌더링하지 않음
  if (!isLoggedIn || role !== "ADMIN") {
    return null;
  }

  // 클릭 이벤트 핸들러 (예시)
  const handleUserClick = () => {
    navigate("/admin/users");
  };

  const handleReportClick = () => {
    navigate("/admin/reported");
  };

  return (
    <div className="admin-main-container" style={styles.container}>
      {/* 상단 통계 정보 영역 */}
      <div className="top-stats-row" style={styles.topRow}>
        {/* 총 유저 수 */}
        <div
          onClick={handleUserClick}
          style={{ ...styles.statBox, ...styles.clickableBox }}
        >
          <h2 style={styles.statTitle}>
            총 유저: {totalUsers !== null ? `${totalUsers}명` : "..."}
          </h2>
          <p style={styles.statText}>클릭하여 사용자 목록으로 이동</p>
        </div>

        {/* 신고된 게시물 수 */}
        <div
          onClick={handleReportClick}
          style={{ ...styles.statBox, ...styles.clickableBox }}
        >
          <h2 style={styles.statTitle}>
            신고된 게시물 수:{" "}
            {reportedPosts !== null ? `${reportedPosts}개` : "..."}
          </h2>
          <p style={styles.statText}>클릭하여 신고된 게시물 목록으로 이동</p>
        </div>
      </div>

      {/* 하단 그래프 및 목록 영역 */}
      <div className="bottom-charts-grid" style={styles.bottomGrid}>
        {/* 신규 가입 유저 그래프 */}
        <div style={styles.chartBox}>
          <h2 style={styles.chartTitle}>
            신규 가입 유저 그래프 (막대 그래프로 일, 월, 년 기준)
          </h2>
          <AdminNewUserChart />
        </div>

        {/* 새로운 컬렉션 그래프 */}
        <div style={styles.chartBox}>
          <h2 style={styles.chartTitle}>
            새로운 컬렉션 그래프 (막대 그래프로 일, 월, 년 기준)
          </h2>
          <AdminNewCollectionChart />
        </div>

        {/* TOP 좋아요 컬렉션 */}
        <div style={styles.chartBox}>
          <h2 style={styles.chartTitle}>TOP 좋아요 컬렉션</h2>
          <AdminTopLikesCollectionList />
        </div>

        {/* TOP 조회수 컬렉션 */}
        <div style={styles.chartBox}>
          <h2 style={styles.chartTitle}>TOP 조회수 컬렉션</h2>
          <AdminTopViewsCollectionList />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    marginBottom: "20px",
  },
  statBox: {
    flex: "1",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  clickableBox: {
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  statTitle: {
    fontSize: "24px",
    margin: "0 0 10px 0",
    color: "#333",
  },
  statText: {
    fontSize: "14px",
    color: "#666",
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
  },
  chartBox: {
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  chartTitle: {
    fontSize: "18px",
    margin: "0 0 15px 0",
    color: "#333",
  },
};

export default AdminMain;
