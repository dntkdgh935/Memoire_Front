import React, { useEffect } from "react";
import apiClient from "../../utils/axios";

function ArchiveMain() {
  useEffect(() => {
    const fetchStuff = async () => {
      try {
        const response = await apiClient.get(`/archive`);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStuff();
  });
  return <div>아카이브</div>;
}

export default ArchiveMain;
