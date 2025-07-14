// src/pages/library/ArchiveVisit.js
import React, { useState, useEffect, memo, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "./LibCollDetailView.module.css"; // ✅
import VisitProfileCard from "../../components/library/VisitProfileCard";

function ArchiveVisit() {
  const { userid: ownerid } = useParams();
  const { userid: myid } = useContext(AuthContext);
  const [isFollowing, setIsFollowing] = useState(false);

  // 해당 아카이브 소유자에 대한 팔로우 상태 가져옴
  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const res = await apiClient.get(`/library/checkFollow`, {
          params: { userid: myid, targetid: ownerid },
        });
        setIsFollowing(res.data);
      } catch (e) {
        console.error("팔로우 상태 확인 실패", e);
      }
    };
    fetchFollowStatus();
  }, [ownerid, myid]);

  // 팔로우 상태 변경 (수정요망)
  const handleToggleFollow = async () => {
    try {
      const nextStatus = !isFollowing;
      await apiClient.post(`/library/toggleFollow`, null, {
        params: {
          userid: myid,
          targetid: ownerid,
          follow: nextStatus,
        },
      });
      setIsFollowing(nextStatus);
    } catch (e) {
      console.error("팔로우 토글 실패", e);
    }
  };
  console.log("방문한 아카이브 주인: " + ownerid);
  useEffect(() => {
    //console.log("방문한 아카이브 주인: " + userid);
  });
  return (
    <div>
      <VisitProfileCard
        ownerid={ownerid}
        onFollowBtnClick={handleToggleFollow}
      />
    </div>
  );
}

export default ArchiveVisit;
