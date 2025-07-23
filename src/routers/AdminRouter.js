//src/routers/AdminRouter.js
import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminMain from "../pages/admin/AdminMain";

function AdminRouter() {
  return (
    <Routes>
      <Route path=" " element={<AdminMain />} />
    </Routes>
  );
}
export default AdminRouter;
