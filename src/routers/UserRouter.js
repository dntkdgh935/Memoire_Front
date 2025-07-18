// src/ routers // UserRouter.js
import React from "react";
import { Route, Routes } from "react-router-dom";

import Login from "../pages/user/Login";
import SignUp from "../pages/user/SignUp";
import FindId from "../pages/user/FindId";
import FindPwd from "../pages/user/FindPwd";
import MyInfo from "../pages/user/MyInfo";

function UserRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signUp" element={<SignUp />} />
      <Route path="findId" element={<FindId />} />
      <Route path="findPWD" element={<FindPwd />} />
      <Route path="myInfo" element={<MyInfo />} />
    </Routes>
  );
}

export default UserRouter;
