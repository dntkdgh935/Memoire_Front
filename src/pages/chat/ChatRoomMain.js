import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./ChatRoomMain.module.css";

// TODO: 로그인 상태 및 상대와의 관계 확인
const ChatRoomMain = () => {
  const [chatrooms, setChatrooms] = useState([]);
  const { userid, secureApiRequest } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStuff = async () => {
      try {
        const chatroomsInfo = await secureApiRequest(
          `/chat/chatrooms?userid=${userid}`,
          {
            method: "GET",
          }
        );
        console.log(chatroomsInfo.data);
        setChatrooms(chatroomsInfo.data);
      } catch (error) {
        console.error("Error fetching user chatrooms:", error);
      }
    };
    fetchStuff();
  }, [userid]);

  const handleClick = (chatroomid) => {
    navigate(`/chat/room/${chatroomid}`);
  };

  const handleNewChatroom = () => {
    navigate("/chat/new");
  };

  return (
    <div className={styles.chatroombox}>
      <h3 className={styles.sectiontitle}>채팅방 목록</h3>
      <ul className={styles.chatroomlist}>
        {chatrooms.map((room, idx) => (
          <li
            key={idx}
            className={styles.chatroomitem}
            onClick={() => handleClick(room.chatroomid)}
          >
            <span className={styles.chatroomname}>
              {room.chatroomid}:{" "}
              {room.users.map((user) => `${user.name}`).join(", ")}
            </span>
          </li>
        ))}
      </ul>
      <button className={styles.newchatbtn} onClick={handleNewChatroom}>
        + 새로운 채팅방 만들기
      </button>
    </div>
  );
};

export default ChatRoomMain;
