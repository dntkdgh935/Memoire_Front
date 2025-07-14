// src/pages/library/ArchiveVisit.js
import React, { useState, useEffect, memo, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import axios from "axios";
import { useParams } from "react-router-dom";
import styles from "./LibCollDetailView.module.css"; // ✅
import VisitProfileCard from "../../components/library/VisitProfileCard";
import { useResetRecoilState } from "recoil";

function ArchiveVisit() {
  const { userid: ownerid } = useParams();
  const { userid: myid } = useContext(AuthContext);

  const [relStatus, setRelStatus] = useState("3");
  const [relBtnMsg, setRelBtnMsg] = useState(""); // 버튼에 나타날 텍스트

  // 해당 아카이브 소유자에 대한 팔로우 상태 가져옴
  useEffect(() => {
    if (!myid || !ownerid) return; // ⭐ 유효한 경우만 진행
    const fetchRelStatus = async () => {
      console.log("**myid: " + myid);
      try {
        // `http://localhost:8080/api/library/collection/${id}`
        const res = await apiClient.get(`api/library/getRelationshipStatus`, {
          params: { userid: myid, targetid: ownerid },
        });

        setRelStatus(String(res.data));
        // 상태에 따라 relStatus, relBtnMsg 설정

        console.log(
          "^^^팔로우 상태 확인 성공!~~:",
          relStatus,
          typeof relStatus
        );
      } catch (e) {
        console.error("팔로우 상태 확인 실패", e);
      }
    };
    fetchRelStatus();
  }, [ownerid, myid]); //[ownerid, myid]);

  //relStatus바뀔 때 메세지 바꿈
  useEffect(() => {
    switch (relStatus) {
      case "0":
        setRelBtnMsg("팔로우 요청됨");
        break;
      case "1":
        setRelBtnMsg("팔로잉");
        break;
      case "2":
        setRelBtnMsg("차단됨");
        break;
      case "3":
        setRelBtnMsg("팔로우 요청");
        break;
      default:
        setRelBtnMsg("상태 불명");
        break;
    }
  }, [relStatus]); // relStatus만 의존

  // 팔로우 상태 변경 (수정요망)
  const handleToggleFollow = async () => {
    try {
      // 0: 요청됨
      // 1: 팔로우중
      // 2: 차단
      // 3: 관계 없음 표시
      let nextStatus = null;
      switch (relStatus) {
        case "0":
          nextStatus = "3";

          break;
        case "1": //팔로잉 상태인 경우 버튼 누르면 -> 관계 삭제(3)
          nextStatus = "3";
          break;
        case "2": // 차단된 경우 버튼 누르면 -> 차단 해제
          nextStatus = "3";
          break;
        case "3": // 관계 없었던 경우 버튼(팔로우 요청) 누르면 -> 요청됨(0)
          nextStatus = "0";
          break;
        default:
          console.log("알 수 없는 상태");
          return; // 기본값을 처리하지 않음
      }

      await apiClient.post(`api/library/toggleFollow`, null, {
        params: {
          userid: myid,
          targetid: ownerid,
          nextRel: nextStatus,
        },
      });
      setRelStatus(nextStatus);
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
        relStatus={relStatus}
        relBtnMsg={relBtnMsg}
        onFollowBtnClick={handleToggleFollow}
      />
    </div>
  );
}

export default ArchiveVisit;
