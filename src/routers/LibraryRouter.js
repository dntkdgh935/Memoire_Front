// src/routers/LibraryRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import LibraryMain from "../pages/library/LibraryMain";
import LibCollDetailView from "../pages/library/LibCollDetailView";
import ArchiveVisit from "../pages/library/ArchiveVisit";
import SearchCollResult from "../pages/library/SearchCollResult";
import SearchUserResult from "../pages/library/SearchUserResult";
//searchCollection

function LibraryRouter() {
  return (
    <Routes>
      <Route path="/" element={<LibraryMain />} />

      {/* <Route path="/" element={<LibraryMain />} /> */}
      <Route path="/detail/:id" element={<LibCollDetailView />} />
      <Route path="/archive/:userid" element={<ArchiveVisit />} />
      <Route path="/searchCollection" element={<SearchCollResult />} />
      <Route path="/searchUser" element={<SearchUserResult />} />
    </Routes>
  );
}

export default LibraryRouter;
