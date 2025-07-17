import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";

function Chat() {
  const { userid } = useContext(AuthContext);
  const [chatroomid, setChatroomid] = useState("");
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const roomIdFromPath = pathParts[pathParts.length - 1]; // e.g., "/chat/room123" → "room123"
    setChatroomid(roomIdFromPath);
  }, [location]);

  useEffect(() => {
    const socketUrl = `ws://localhost:8080/chat/${chatroomid}?userid=${userid}`;
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          // 기존 채팅 내역 전체
          setMessages(data);
        } else {
          // 새 메시지
          setMessages((prev) => [...prev, data]);
        }
      } catch (e) {
        console.log("서버 메시지:", event.data); // 최초 연결 메시지 같은 경우
      }
    };

    socketRef.current.onclose = () => {
      console.log("❌ WebSocket disconnected");
    };

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [chatroomid, userid]);

  // ✅ 메시지 전송
  const handleSend = () => {
    if (!input.trim()) return;
    const message = {
      chatroomid: chatroomid,
      userid: userid,
      messageContent: input,
    };
    socketRef.current.send(JSON.stringify(message));
    setInput("");
  };

  // ✅ 메시지 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h3>채팅방: {chatroomid}</h3>
      <div
        style={{
          border: "1px solid #ccc",
          height: "400px",
          overflowY: "auto",
          padding: "10px",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.userid === userid ? "right" : "left",
              margin: "5px 0",
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: msg.userid === userid ? "#d1f8ce" : "#f0f0f0",
                padding: "8px 12px",
                borderRadius: "10px",
              }}
            >
              {msg.messageContent}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          style={{ flex: 1, padding: "10px" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="메시지를 입력하세요"
        />
        <button onClick={handleSend} style={{ marginLeft: 10 }}>
          전송
        </button>
      </div>
    </div>
  );
}

export default Chat;
