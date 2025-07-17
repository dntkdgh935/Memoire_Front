import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import apiClient from "../../utils/axios";
import styles from "./FollowingFollower.module.css";
import { useNavigate } from "react-router-dom";

function FollowingFollower() {
  const { userid, secureApiRequest } = useContext(AuthContext);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activeTab, setActiveTab] = useState("following");

  const navigate = useNavigate();

  useEffect(() => {
    if (!userid) return;

    const fetchStuff = async () => {
      try {
        const followerInfo = await apiClient.get("/archive/follower", {
          params: { userid: userid },
        });
        console.log(followerInfo.data);

        setFollowers(followerInfo.data);

        const followingInfo = await apiClient.get(`/archive/following`, {
          params: { userid: userid },
        });
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
      formData.append("userid", userid);
      formData.append("otherUserid", otherUserId);
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
        navigate(`/chat/room/${chatroomInfo.data}`);
      } else {
        navigate(`/chat/room/${chatroomInfo.data}`);
      }
    } catch (err) {
      console.error("메시지 전송 페이지로 이동 실패:", err);
    }
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
            <div key={user.loginId} className={styles.followuseritem}>
              <img
                src={
                  user.profileImagePath
                    ? `http://localhost:8080/upload_files/user_profile/${user.profileImage}`
                    : "https://static.mothership.sg/1/2021/07/cat.jpg"
                }
                alt="Profile"
                className={styles.followavatar}
              />
              <div className={styles.followuserinfo}>
                <div className={styles.username}>{user.nickname}</div>
                <div className={styles.userid}>@{user.loginId}</div>
              </div>
              <button
                className={styles.messagebtn}
                onClick={() => handleMessageClick(user.userId)}
              >
                메시지
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FollowingFollower;
