import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./FollowingFollower.module.css";
import { useNavigate, useLocation } from "react-router-dom";

function FollowingFollower() {
  const { userid, secureApiRequest } = useContext(AuthContext);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState("following");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!userid || userid === "") return;

    const fetchStuff = async () => {
      try {
        const followerInfo = await secureApiRequest(
          `/archive/follower?userid=${userid}`,
          {
            method: "GET",
          }
        );
        console.log(followerInfo.data);

        setFollowers(followerInfo.data);

        const followingInfo = await secureApiRequest(
          `/archive/following?userid=${userid}`,
          {
            method: "GET",
          }
        );
        console.log(followingInfo.data);

        setFollowing(followingInfo.data);
      } catch (error) {
        console.error("Error fetching following/follower info:", error);
      }
    };

    fetchStuff();
  }, [userid]);

  const handleMessageClick = async (otherUserId) => {
    try {
      const formData = new FormData();
      formData.append("users", userid);
      formData.append("users", otherUserId);
      const chatroomInfo = await secureApiRequest(`/chat/check`, {
        method: "POST",
        body: formData,
      });
      console.log(chatroomInfo.data);
      if (chatroomInfo.data === null || chatroomInfo.data === "") {
        const newChatroomInfo = await secureApiRequest(`/chat/new`, {
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

  const handleGroupMessageClick = async () => {
    alert("그룹채팅방에 초대할 상대: " + selectedUsers);
    if (selectedUsers.length === 0) {
      alert("채팅방에 초대할 상대를 고르세요.");
    } else if (selectedUsers.length === 1) {
      handleMessageClick(selectedUsers[0]);
    } else {
      const formData = new FormData();
      formData.append("users", userid);
      selectedUsers.forEach((id) => {
        formData.append("users", id);
      });
      const newChatroomInfo = await secureApiRequest(`/chat/new`, {
        method: "POST",
        body: formData,
      });
      console.log(newChatroomInfo.data);
      navigate(`/chat/room/${newChatroomInfo.data}`);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleProfileClick = (userid) => {
    navigate(`/library/archive/${userid}`);
  };

  return (
    <div className={styles.followcard}>
      <div className={styles.followtabs}>
        <button
          className={`${styles.tab} ${activeTab === "following" ? styles.active : ""}`}
          onClick={() => setActiveTab("following")}
        >
          팔로잉 ({following.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "follower" ? styles.active : ""}`}
          onClick={() => setActiveTab("follower")}
        >
          팔로워 ({followers.length})
        </button>
      </div>

      <div className={styles.followlist}>
        {(activeTab === "following" ? following : followers).length === 0 ? (
          <p>아직 유저가 없습니다.</p>
        ) : (
          (activeTab === "following" ? following : followers).map((user) => (
            // TODO: 클릭 시 해당 유저의 프로필 페이지로 이동함
            <div key={user.userId} className={styles.followuseritem}>
              <img
                src={
                  user.profileImagePath
                    ? `http://localhost:8080/upload_files/user_profile/${user.profileImagePath}`
                    : "https://static.mothership.sg/1/2021/07/cat.jpg"
                }
                alt="Profile"
                className={styles.followavatar}
                onClick={() => handleProfileClick(user.userId)}
              />
              <div className={styles.followuserinfo}>
                <div
                  className={styles.username}
                  onClick={() => handleProfileClick(user.userId)}
                >
                  {user.nickname || "닉네임이 없습니다"}
                </div>
                <div
                  className={styles.userid}
                  onClick={() => handleProfileClick(user.userId)}
                >
                  @{user.loginId || "소셜로그인"}
                </div>
              </div>
              {location.pathname === "/chat/new" ? (
                <input
                  type="checkbox"
                  className={styles.userCheckbox}
                  checked={selectedUsers.includes(user.userId)}
                  onChange={() => toggleUserSelection(user.userId)}
                />
              ) : (
                <button
                  className={styles.messagebtn}
                  onClick={() => handleMessageClick(user.userId)}
                >
                  메시지
                </button>
              )}
            </div>
          ))
        )}
        {location.pathname === "/chat/new" && (
          <button
            className={styles.messagebtn}
            onClick={handleGroupMessageClick}
          >
            채팅방 초대하기: {selectedUsers.length}명
          </button>
        )}
      </div>
    </div>
  );
}

export default FollowingFollower;
