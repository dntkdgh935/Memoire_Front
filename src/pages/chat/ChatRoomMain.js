import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import { useNavigate } from "react-router-dom";
import styles from "./ChatRoomMain.module.css";
import PageHeader from "../../components/common/PageHeader";

// TODO: 로그인 상태 및 상대와의 관계 확인
const ChatRoomMain = () => {
  const [chatrooms, setChatrooms] = useState([]);
  const { userid, role, isLoggedIn, secureApiRequest } =
    useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userid || userid === "") return;

    if (isLoggedIn === false) {
      alert("로그인을 하세요!");
      navigate("/");
      return;
    }
    if (role === "ADMIN") {
      const fetchAdminStuff = async () => {
        try {
          const chatroomsInfo = await secureApiRequest(
            `/chat/admin/chatrooms?userid=${userid}`,
            {
              method: "GET",
            }
          );
          console.log(chatroomsInfo.data);
          setChatrooms(chatroomsInfo.data);
        } catch (error) {
          console.error("Error fetching admin chatrooms:", error);
        }
      };
      fetchAdminStuff();
    } else {
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
    }
  }, [userid]);

  const handleClick = (chatroomid) => {
    navigate(`/chat/room/${chatroomid}`);
  };

  const handleNewChatroom = () => {
    navigate("/chat/new");
  };

  const handleAdminChat = async () => {
    try {
      const formData = new FormData();
      formData.append("user", userid);
      const chatroomInfo = await secureApiRequest("/chat/admin/check", {
        method: "POST",
        body: formData,
      });
      console.log(chatroomInfo.data);
      if (chatroomInfo.data === null || chatroomInfo.data === "") {
        const newChatroomInfo = await secureApiRequest("/chat/admin/new", {
          method: "POST",
          body: formData,
        });
        console.log(newChatroomInfo.data);
        navigate(`/chat/room/${newChatroomInfo.data}`);
      } else {
        navigate(`/chat/room/${chatroomInfo.data}`);
      }
    } catch (err) {
      console.error("메시지 전송 페이지로 이동 실패:", err);
    }
  };

  return (
    <>
      <PageHeader pagename={`채팅방 목록`} />
      <div className={styles.chatroombox}>
        <h3 className={styles.sectiontitle}>채팅방 목록</h3>
        <ul className={styles.chatroomlist}>
          {chatrooms.map((room, idx) => (
            <li
              key={idx}
              className={styles.chatroomitem}
              onClick={() => handleClick(room.chatroomid)}
            >
              {room.chatroomid.startsWith("admin") && role !== "ADMIN" ? (
                <>
                  <div className={styles.chatroomname}>관리자 채팅</div>
                  <div className={styles.chatroomlastmsg}>
                    {room.lastMessage}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.chatroomname}>
                    {room.users.map((user) => `${user.name}`).join(", ")}
                  </div>
                  <div className={styles.chatroomlastmsg}>
                    {room.lastMessage}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <button className={styles.newchatbtn} onClick={handleNewChatroom}>
          + 새로운 채팅방 만들기
        </button>
        {role !== "ADMIN" && (
          <button className={styles.adminChatButton} onClick={handleAdminChat}>
            관리자와 채팅하기
          </button>
        )}
      </div>
    </>
  );
};

export default ChatRoomMain;
