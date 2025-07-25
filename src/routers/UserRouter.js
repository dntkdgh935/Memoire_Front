// src/ routers // UserRouter.js
import React from "react";
import { Route, Routes } from "react-router-dom";

import Login from "../pages/user/Login";
import SignUp from "../pages/user/SignUp";
import FindId from "../pages/user/FindId";
import FindPwd from "../pages/user/FindPwd";
import MyInfo from "../pages/user/MyInfo";
import FaceRegister from "../pages/user/FaceRegister";
import FaceLogin from "../pages/user/FaceLogin";
import UserExit from "../pages/user/UserExit";
import UserExitOk from "../pages/user/UserExitOk";

function UserRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signUp" element={<SignUp />} />
      <Route path="findId" element={<FindId />} />
      <Route path="findPWD" element={<FindPwd />} />
      <Route path="myInfo" element={<MyInfo />} />
      <Route path="face-register" element={<FaceRegister />} />
      <Route path="face-login" element={<FaceLogin />} />
      <Route path="exit" element={<UserExit />} />
      <Route path="exitOk" element={<UserExitOk />} />
    </Routes>
  );
}

export default UserRouter;
