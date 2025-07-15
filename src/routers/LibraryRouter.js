// src/routers/LibraryRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import LibraryMain from "../pages/library/LibraryMain";
import LibCollDetailView from "../pages/library/LibCollDetailView";
import ArchiveVisit from "../pages/library/ArchiveVisit";

function LibraryRouter() {
  return (
    <Routes>
      <Route path="/" element={<LibraryMain />} />
      {/* <Route path="/" element={<LibraryMain />} /> */}
      <Route path="/detail/:id" element={<LibCollDetailView />} />
      <Route path="/archive/:userid" element={<ArchiveVisit />} />
    </Routes>
  );
}

export default LibraryRouter;
