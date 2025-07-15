// src/ routers // UserRouter.js
import React from "react";
import { Route, Routes } from "react-router-dom";

import Login from "../pages/user/Login";
import SignUp from "../pages/user/SignUp";
import SocialSignUp from "../pages/user/SocialSignUp";
import OAuth2CallbackSuccess from "../pages/user/OAuth2CallbackSuccess";

function UserRouter() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signUp" element={<SignUp />} />
      <Route path="socialSignUp" element={<SocialSignUp />} />
      <Route
        path="/oauth2/callback/success"
        element={<OAuth2CallbackSuccess />}
      />
    </Routes>
  );
}

export default UserRouter;
