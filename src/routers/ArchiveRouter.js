// src/routers/ArchiveRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import ArchiveMain from "../pages/archive/ArchiveMain";
import ArchiveNewCollection from "../pages/archive/ArchiveNewCollection";
import ArchiveNewMemory from "../pages/archive/ArchiveNewMemory";
import ArchiveCollectionEdit from "../pages/archive/ArchiveCollectionEdit";
import ArchiveMemoryEdit from "../pages/archive/ArchiveMemoryEdit";

function ArchiveRouter() {
  return (
    <Routes>
      <Route path="/" element={<ArchiveMain />} />
      <Route path="/newcoll" element={<ArchiveNewCollection />} />
      <Route path="/newmem" element={<ArchiveNewMemory />} />
      <Route path="/editcoll" element={<ArchiveCollectionEdit />} />
      <Route path="/editmem" element={<ArchiveMemoryEdit />} />
    </Routes>
  );
}

export default ArchiveRouter;
