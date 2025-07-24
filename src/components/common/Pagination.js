import React from "react";
import styles from "./Pagination.module.css";

const Pagination = ({ page, totalPages, onPageChange }) => {
  return (
    <div className={styles.pagination}>
      <button onClick={() => onPageChange(page - 1)} disabled={page === 0}>
        이전
      </button>
      <span>
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page + 1 >= totalPages}
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
