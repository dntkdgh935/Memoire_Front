//src/routers/AdminRouter.js
import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminMain from "../pages/admin/AdminMain";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminReports from "../pages/admin/AdminReports";

function AdminRouter() {
  return (
    <Routes>
      <Route path="main" element={<AdminMain />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="reported" element={<AdminReports />} />
    </Routes>
  );
}
export default AdminRouter;
