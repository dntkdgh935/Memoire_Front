import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./FollowingFollower.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import default_profile from "../../assets/images/default_profile.jpg";

function FollowingFollower({ mode, excludeUserIds = [], onInviteComplete }) {
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
      const chatroomInfo = await secureApiRequest(`/chat/private/check`, {
        method: "POST",
        body: formData,
      });
      console.log(chatroomInfo.data);
      if (chatroomInfo.data === null || chatroomInfo.data === "") {
        const newChatroomInfo = await secureApiRequest(`/chat/private/new`, {
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

  const handleInviteToChatroom = async () => {
    if (selectedUsers.length === 0) {
      alert("초대할 사용자를 선택하세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("chatroomid", location.pathname.split("/").pop()); // 현재 chatroomid
      selectedUsers.forEach((id) => {
        formData.append("users", id);
      });

      await secureApiRequest(`/chat/invite`, {
        method: "POST",
        body: formData,
      });

      alert("사용자들을 채팅방에 초대했습니다.");
      setSelectedUsers([]);
      if (onInviteComplete) onInviteComplete(); // 모달 닫기
    } catch (err) {
      console.error("초대 실패:", err);
      alert("초대에 실패했습니다.");
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

  const filteredFollowing = following.filter(
    (user) => !excludeUserIds.includes(user.userId)
  );
  const filteredFollowers = followers.filter(
    (user) => !excludeUserIds.includes(user.userId)
  );

  return (
    <div className={styles.followcard}>
      <div className={styles.followtabs}>
        <button
          className={`${styles.tab} ${activeTab === "following" ? styles.active : ""}`}
          onClick={() => setActiveTab("following")}
        >
          팔로잉 (
          {mode === "invite" ? filteredFollowing.length : following.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === "follower" ? styles.active : ""}`}
          onClick={() => setActiveTab("follower")}
        >
          팔로워 (
          {mode === "invite" ? filteredFollowers.length : followers.length})
        </button>
      </div>

      <div className={styles.followlist}>
        {(activeTab === "following"
          ? mode === "invite"
            ? filteredFollowing
            : following
          : mode === "invite"
            ? filteredFollowers
            : followers
        ).length === 0 ? (
          <p>아직 유저가 없습니다.</p>
        ) : (
          (activeTab === "following"
            ? mode === "invite"
              ? filteredFollowing
              : following
            : mode === "invite"
              ? filteredFollowers
              : followers
          ).map((user) => (
            <div key={user.userId} className={styles.followuseritem}>
              <img
                src={
                  user.profileImagePath
                    ? `http://localhost:8080${user.profileImagePath}`
                    : default_profile
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
              {mode === "invite" || location.pathname === "/chat/new" ? (
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
        {(mode === "invite" || location.pathname === "/chat/new") && (
          <button
            className={styles.messagebtn}
            onClick={
              mode === "invite"
                ? handleInviteToChatroom
                : handleGroupMessageClick
            }
          >
            {mode === "invite"
              ? `초대하기 (${selectedUsers.length}명)`
              : `채팅방 초대하기: ${selectedUsers.length}명`}
          </button>
        )}
      </div>
    </div>
  );
}

export default FollowingFollower;
