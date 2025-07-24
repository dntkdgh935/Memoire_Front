import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthProvider";
import PageHeader from "../../components/common/PageHeader";
import styles from "./Chat.module.css";
import Modal from "../../components/common/Modal";
import FollowingFollower from "../../components/archive/FollowingFollower";

function Chat() {
  const { userid, role, isLoggedIn, secureApiRequest } =
    useContext(AuthContext);
  const [chatroomid, setChatroomid] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [users, setUsers] = useState([]);
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const roomIdFromPath = pathParts[pathParts.length - 1];
    setChatroomid(roomIdFromPath);
  }, [location]);

  useEffect(() => {
    if (!userid || !chatroomid) return;

    const fetchStuff = async () => {
      if (isLoggedIn === false) {
        alert("로그인을 하세요!");
        navigate("/");
        return;
      }
      if (role === "ADMIN") {
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
      }

      try {
        const response = await secureApiRequest(
          `/chat/users?userid=${userid}&chatroomid=${chatroomid}`,
          {
            method: "GET",
          }
        );
        console.log("채팅방 사용자 목록:", response.data.users);
        setUsers(response.data.users);
        console.log("단체 채팅방인지 확인:", response.data.isPrivate);
        setIsPrivate(response.data.isPrivate);
        if (!response.data.users.some((user) => user.userId === userid)) {
          alert("이 채팅방에 참여할 수 없습니다.");
          navigate("/");
        }
      } catch (error) {
        console.error("채팅방 사용자 목록 가져오기 실패:", error);
      }
    };

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

    fetchStuff();

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

  const handleInviteComplete = () => {
    setShowInviteModal(false);
  };

  const handleLeave = async () => {
    if (!window.confirm("채팅방에서 나가시겠습니까?")) return;

    try {
      const formData = new FormData();
      formData.append("chatroomid", chatroomid);
      formData.append("userid", userid);
      await secureApiRequest(`/chat/leave`, {
        method: "POST",
        body: formData,
      });
      alert("채팅방에서 나갔습니다.");
      navigate("/chat");
    } catch (error) {
      console.error("나가기 실패:", error);
      alert("채팅방 나가기 실패");
    }
  };

  return (
    <>
      <PageHeader pagename={`Chatroom`} />
      <div className={styles.chatContainer}>
        <h3 className={styles.chatHeader}>
          채팅방: {users.map((user) => `${user.name}`).join(", ")}
        </h3>
        <div className={styles.chatBox}>
          {messages.map((msg) => (
            <div
              key={msg.chatId}
              className={`${styles.messageRow} ${
                msg.userid === userid ? styles.messageRight : styles.messageLeft
              }`}
            >
              <span className={styles.username}>
                {users.find((u) => u.userId === msg.userid)?.name || msg.userid}
              </span>
              <br />
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
      {!isPrivate && (
        <div className={styles.chatActions}>
          <button
            onClick={() => setShowInviteModal(true)}
            className={styles.inviteButton}
          >
            초대하기
          </button>
          <button onClick={handleLeave} className={styles.leaveButton}>
            나가기
          </button>
        </div>
      )}

      {showInviteModal && (
        <Modal onClose={() => setShowInviteModal(false)}>
          <FollowingFollower
            mode="invite"
            excludeUserIds={users.map((u) => u.userId)}
            onInviteComplete={handleInviteComplete}
          />
        </Modal>
      )}
    </>
  );
}

export default Chat;
