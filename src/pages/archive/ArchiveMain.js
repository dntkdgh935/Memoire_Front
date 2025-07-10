import React, { useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import ProfileCard from "../../components/archive/ProfileCard";

import { useNavigate } from "react-router-dom";

function ArchiveMain() {
  const { isLoggedIn, userid } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log(userid);
  useEffect(() => {
    if (!isLoggedIn) {
      alert("로그인을 하세요!");
      navigate("/");
    }

    const fetchUserCollections = async () => {
      try {
        const response = await apiClient.get(`/archive`, {
          // TODO: Add a method to call user info and add it to params
          params: { userid: userid },
        });
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserCollections();
  }, [isLoggedIn, userid, navigate]);
  return (
    <div>
      <ProfileCard />
    </div>
  );
}

export default ArchiveMain;
