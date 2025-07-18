import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import PageHeader from "../../components/common/PageHeader";

function Chat() {
  const { userid } = useContext(AuthContext);
  const [chatroomid, setChatroomid] = useState("");
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!userid || userid === "") return;
    const pathParts = location.pathname.split("/");
    const roomIdFromPath = pathParts[pathParts.length - 1];
    setChatroomid(roomIdFromPath);
    if (!chatroomid || chatroomid === "") return;
    const socketUrl = `ws://localhost:8080/chat/${chatroomid}?userid=${userid}`;
    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      const accessToken = localStorage.getItem("accessToken");

      socketRef.current.send(
        JSON.stringify({
          type: "AUTH",
          accessToken: accessToken,
        })
      );
    };

    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "AUTH_SUCCESS") {
          console.log("WebSocket 인증 성공");
          console.log("WebSocket 연결됨");
        } else if (Array.isArray(data)) {
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
      console.log("WS Disconnected");
    };

    socketRef.current.onerror = (error) => {
      console.error("WS error:", error);
    };

    return () => {
      socketRef.current?.close();
    };
  }, [chatroomid, userid, location]);

  const handleSend = () => {
    if (
      !input.trim() ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }
    const message = {
      type: "CHAT",
      chatroomid: chatroomid,
      userid: userid,
      messageContent: input,
    };
    socketRef.current.send(JSON.stringify(message));
    setInput("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (

    <PageHeader pagename={`Chatroom`} />
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
        {messages.map((msg) => (
          <div
            key={msg.chatId}
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
    </>
  );
}

export default Chat;
