// src/routers/ArchiveRouter.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import ChatRoomMain from "../pages/chat/ChatRoomMain";
import Chat from "../pages/chat/Chat";
import NewChatRoom from "../pages/chat/NewChatRoom";

function ArchiveRouter() {
  return (
    <Routes>
      <Route path="/" element={<ChatRoomMain />} />
      <Route path="/room/:id" element={<Chat />} />
      <Route path="/new" element={<NewChatRoom />} />
    </Routes>
  );
}

export default ArchiveRouter;
