import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import Pagination from "../../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/common/Modal";
import styles from "./AdminReports.module.css";

const PAGE_SIZE = 50;

function AdminReports() {
  const { secureApiRequest } = useContext(AuthContext);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reports, setReports] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportDetails, setReportDetails] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const queryString = new URLSearchParams({
          page,
          size: PAGE_SIZE,
        }).toString();
        const res = await secureApiRequest(`/admin/reports?${queryString}`, {
          method: "get",
        });

        setReports(res.data.content); // 리스트
        setTotalPages(res.data.totalPages); // 전체 페이지 수
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      }
    };

    fetchReports();
  }, [page]);

  const handleMemoClick = (collectionid) => {
    navigate(`/library/detail/${collectionid}`);
  };

  const handleReportCountClick = async (memoryId) => {
    try {
      const res = await secureApiRequest(
        `/admin/reportDetail?memoryid=${memoryId}`,
        {
          method: "get",
        }
      );
      console.log("내용: " + res.data);
      setReportDetails(res.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch report details:", error);
    }
  };

  return (
    <div className={styles.memoreportscontainer}>
      <table className={styles.memoreportstable}>
        <thead>
          <tr>
            <th>메모리 이름</th>
            <th>작성자</th>
            <th>신고 수</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={index}>
              <td>
                <span
                  className={styles.memolink}
                  onClick={() => handleMemoClick(report.collectionid)}
                >
                  {report.title}
                </span>
              </td>
              <td>{report.nickname}</td>
              <td>
                <span
                  className={styles.reportcountlink}
                  onClick={() => handleReportCountClick(report.memoryid)}
                >
                  {report.reportcount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <h3>신고 상세 내역</h3>
          {reportDetails.length === 0 ? (
            <p>신고 내역이 없습니다.</p>
          ) : (
            <table className={styles.reportDetailTable}>
              <thead>
                <tr>
                  <th>신고자</th>
                  <th>신고 사유</th>
                </tr>
              </thead>
              <tbody>
                {reportDetails.map((detail, index) => (
                  <tr key={index}>
                    <td>{detail.nickname}</td>
                    <td>{detail.reportReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
}

export default AdminReports;
