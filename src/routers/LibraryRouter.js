// src/routers/LibraryRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import LibraryMain from "../pages/library/LibraryMain";
import LibCollDetailView from "../pages/library/LibCollDetailView";
import ArchiveVisit from "../pages/library/ArchiveVisit";

function LibraryRouter() {
  return (
    <Routes>
      {/* <Route path="/library" element={<LibraryMain />} />
      <Route path="/library/detail/:id" element={<LibCollDetailView />} />
      <Route path="/library/archive/:id" element={<ArchiveVisit />} /> */}
      <Route path="/" element={<LibraryMain />} />
      <Route path="/detail/:id" element={<LibCollDetailView />} />
      <Route path="/archive/:id" element={<ArchiveVisit />} />
    </Routes>
  );
}

export default LibraryRouter;
