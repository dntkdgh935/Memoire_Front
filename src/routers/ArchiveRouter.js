// src/routers/ArchiveRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import ArchiveMain from "../pages/archive/ArchiveMain";
import ArchiveNewCollection from "../pages/archive/ArchiveNewCollection";
import ArchiveNewMemory from "../pages/archive/ArchiveNewMemory";

function ArchiveRouter() {
  return (
    <Routes>
      <Route path="/" element={<ArchiveMain />} />
      <Route path="/newcoll" element={<ArchiveNewCollection />} />
      <Route path="/newmem" element={<ArchiveNewMemory />} />
    </Routes>
  );
}

export default ArchiveRouter;
