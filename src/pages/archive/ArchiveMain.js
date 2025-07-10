import React, { useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import ProfileCard from "../../components/archive/ProfileCard";

import { useNavigate } from "react-router-dom";

function ArchiveMain() {
  const { isLoggedIn, userid } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn === null || isLoggedIn === undefined) return;

    if (!isLoggedIn) {
      alert("로그인을 하세요!");
      navigate("/");
    }

    if (!userid) return;
  }, [isLoggedIn, userid, navigate]);
  return (
    <div>
      <ProfileCard />
    </div>
  );
}

export default ArchiveMain;
