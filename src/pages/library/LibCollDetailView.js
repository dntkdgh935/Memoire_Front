// src/pages/library/LibCollDetailView.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import LibCollCard from "../../components/library/LibCollCard";
import MemoryView from "../../components/common/MemoryView";

function LibCollDetailView() {
  const { id } = useParams(); // URL 파라미터로 컬렉션 ID를 받음

  const [collection, setCollection] = useState(null); // 컬렉션 정보 상태
  const [selectedMemory, setSelectedMemory] = useState(null); // 메모리 리스트에서 선택된 메모리(view에 나타날 메모리)
  const [memoryList, setMemoryList] = useState(null);

  //1.  컬렉션 정보 및 내부 메모리 목록 가져오기
  useEffect(() => {
    console.log("안녕!!");
    const fetchCollectionDetail = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/library/collection/${id}`
        );
        console.log(res.data);
        setCollection(res.data);
        // // 컬렉션에 속한 메모리 리스트 불러오기
        // console.log("** id는: " + collection.collectionid);
        console.log(collection);
        fetchMemoryList(res.data.collectionid); // 컬렉션에서 collectionId를 받아 메모리 리스트 불러오기
      } catch (err) {
        console.error("🚨 컬렉션 정보 불러오기 실패", err);
      }
    };
    fetchCollectionDetail();
  }, [id]);

  // 2. coll 내부의 메모리 리스트 불러오기 함수
  const fetchMemoryList = async (collectionid) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/library/collection/memories/${collectionid}`
      );
      console.log("메모리 리스트:", res.data);
    } catch (err) {
      console.error("🚨 메모리 리스트 불러오기 실패", err);
    }
  };

  // 메모리 선택 시 selectedMemory 상태를 업데이트하고, 해당 메모리를 axios로 불러와서 세팅
  const handleMemoryClick = async (memoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/library/memory/${memoryId}` // 메모리 아이디로 메모리 상세 요청
      );
      setSelectedMemory(res.data); // 응답 데이터를 selectedMemory에 저장
    } catch (err) {
      console.error("🚨 메모리 불러오기 실패", err); // 에러 핸들링
    }
  };

  // ****** 메모리 리스트 불러 요청하는 함수 위치

  // 메모리 선택 처리
  const handleMemorySelect = (memoryId) => {};

  if (!collection) {
    return <div>로딩 중...</div>; // 컬렉션 데이터가 없을 때 로딩 화면을 표시합니다.
  }

  // 좋아요/ 북마크 DB 변경 + 상태 변경 함수
  const handleActionChange = async (collectionId, actionType) => {
    // Spring에 DB 변경 요청
    const isLiked =
      actionType === "userlike" ? !collection.userlike : undefined;
    const isBookmarked =
      actionType === "userbookmark" ? !collection.userbookmark : undefined;

    if (actionType === "userlike") {
      await axios.post(
        `http://localhost:8080/api/library/togglelike?collectionId=${collectionId}&isLiked=${isLiked}`
      );
    }
    if (actionType === "userbookmark") {
      await axios.post(
        `http://localhost:8080/api/library/togglebm?collectionId=${collectionId}&isBookmarked=${isBookmarked}`
      );
    }
  };

  return (
    <div className={StyleSheet.Page}>
      <LibCollCard
        coll={collection}
        memoryList={memoryList}
        onMemoryClick={handleMemoryClick}
        onActionChange={handleActionChange}
      />
      <MemoryView memory={selectedMemory} />
    </div>
  );
}

export default LibCollDetailView;
