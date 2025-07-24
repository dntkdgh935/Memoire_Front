import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import axios from "axios";
import UserItem from "../../components/admin/UserItem";
import Pagination from "../../components/common/Pagination";

import styles from "./AdminUsers.module.css";

const PAGE_SIZE = 50;

const AdminUsers = () => {
  const { secureApiRequest } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [sort, setSort] = useState("loginId");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const fetchUsers = async () => {
    try {
      const queryString = new URLSearchParams({
        page,
        size: PAGE_SIZE,
        search,
        sort,
      }).toString();
      const res = await secureApiRequest(`/admin/users?${queryString}`, {
        method: "get",
      });
      console.log("유저들: " + res.data.content);
      console.log("총 페이지: " + res.data.totalPages);
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("유저 불러오기 실패", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, sort]);

  const handleInputChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch();
    }
  };

  const executeSearch = () => {
    setSearch(searchInput.trim());
    setPage(0);
  };

  return (
    <div className={styles.userlistcontainer}>
      <div style={{ margin: "16px 0" }}>
        <label>정렬: </label>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(0);
          }}
        >
          <option value="loginId">가나다순</option>
          <option value="sanctionCount">제재횟수순</option>
          <option value="role">권한순</option>
        </select>
      </div>

      <div className={styles.header}>
        <input
          type="text"
          placeholder="유저 검색"
          value={searchInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button onClick={executeSearch}>🔍</button>
      </div>

      <div className={styles.userlist}>
        {users.map((user) => (
          <UserItem
            key={user.userId}
            user={user}
            onUpdateUser={(updatedUser) => {
              setUsers((prevUsers) =>
                prevUsers.map((u) =>
                  u.userId === updatedUser.userId ? updatedUser : u
                )
              );
            }}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default AdminUsers;
