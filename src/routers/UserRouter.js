// src/ routers // UserRouter.js
import React from "react";
import { Route } from "react-router-dom";

import Login from "../pages/user/Login";

const userRouter = [<Route path="/Login" element={<Login />} />];

export default userRouter;
