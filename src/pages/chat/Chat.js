import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import PageHeader from "../../components/common/PageHeader";
import styles from "./Chat.module.css";

function Chat() {
  const { userid, role, isLoggedIn, secureApiRequest } =
    useContext(AuthContext);
  const [chatroomid, setChatroomid] = useState("");
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const roomIdFromPath = pathParts[pathParts.length - 1];
    setChatroomid(roomIdFromPath);
  }, [location]);

  useEffect(() => {
    if (!userid || !chatroomid) return;
    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/");
      return;
    }

    if (role === "ADMIN") {
      const fetchAdminStuff = async () => {
        try {
          await secureApiRequest(
            `/chat/admin/start?userid=${userid}&chatroomid=${chatroomid}`,
            {
              method: "GET",
            }
          );
        } catch (error) {
          console.error("Error fetching admin chatrooms:", error);
        }
      };
      fetchAdminStuff();
    }

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
    <>
      <PageHeader pagename={`Chatroom`} />
      <div className={styles.chatContainer}>
        <h3 className={styles.chatHeader}>채팅방: {chatroomid}</h3>
        <div className={styles.chatBox}>
          {messages.map((msg) => (
            <div
              key={msg.chatId}
              className={`${styles.messageRow} ${
                msg.userid === userid ? styles.messageRight : styles.messageLeft
              }`}
            >
              <div
                className={`${styles.messageBubble} ${
                  msg.userid === userid ? styles.myMessage : styles.otherMessage
                }`}
              >
                {msg.messageContent}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className={styles.inputRow}>
          <input
            className={styles.inputBox}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요"
          />
          <button onClick={handleSend} className={styles.sendButton}>
            전송
          </button>
        </div>
      </div>
    </>
  );
}

export default Chat;
