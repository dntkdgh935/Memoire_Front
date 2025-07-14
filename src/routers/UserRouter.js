// src/ routers // UserRouter.js
import React from "react";
import { Route, Routes } from "react-router-dom";

import Login from "../pages/user/Login";
import SignUp from "../pages/user/SignUp";
import SocialSignUp from "../pages/user/SocialSignUp";

function UserRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signUp" element={<SignUp />} />
      <Route path="socialSignUp" element={<SocialSignUp />} />
    </Routes>
  );
}

export default UserRouter;
