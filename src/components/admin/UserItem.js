import React, { useContext } from "react";
import { AuthContext } from "../../AuthProvider";
import default_profile from "../../assets/images/default_profile.jpg";
import styles from "./UserItem.module.css";

function UserItem({ user, onUpdateUser }) {
  const { userid, secureApiRequest } = useContext(AuthContext);

  const handleMessageClick = () => {
    alert("메세지 기능은 아직 구현되지 않았습니다.");
  };

  const handleBanClick = async () => {
    if (user.role === "BAD") {
      if (!window.confirm("정말로 이 사용자의 차단을 해제하시겠습니까?"))
        return;
    } else if (user.role === "USER" || user.role === "ADMIN") {
      if (!window.confirm("정말로 이 사용자를 차단하시겠습니까?")) return;
    } else {
      alert("잘못된 접근입니다");
      return;
    }
    try {
      const newRole = user.role === "BAD" ? "USER" : "BAD";
      const formData = new FormData();
      formData.append("userid", user.userId);
      formData.append("role", user.role === "BAD" ? "USER" : "BAD");
      await secureApiRequest(`/admin/banUser`, {
        method: "POST",
        body: formData,
      });
      onUpdateUser({ ...user, role: newRole });
    } catch (error) {
      console.error("사용자 차단 실패:", error);
      alert("사용자 차단에 실패했습니다.");
    }
  };
  const handleAdminClick = async () => {
    if (user.role === "ADMIN") {
      if (!window.confirm("정말로 이 사용자를 일반유저로 변경하시겠습니까?"))
        return;
    } else if (user.role === "USER") {
      if (!window.confirm("정말로 이 사용자를 관리자로 승격하시겠습니까?"))
        return;
    } else {
      alert("잘못된 접근입니다");
      return;
    }
    try {
      const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
      const formData = new FormData();
      formData.append("userid", user.userId);
      formData.append("role", user.role === "ADMIN" ? "USER" : "ADMIN");

      await secureApiRequest(`/admin/makeAdmin`, {
        method: "POST",
        body: formData,
      });
      onUpdateUser({ ...user, role: newRole });
    } catch (error) {
      console.error("관리자 승격 실패:", error);
      alert("관리자 승격에 실패했습니다.");
    }
  };

  return (
    <div className={styles.useritem}>
      <div className={styles.userinfo}>
        <img src={user.profileImagePath || default_profile} alt="avatar" />
        <div className={styles.username}>{user.nickname}</div>
        <div className={styles.details}>제재횟수: {user.sanctionCount}번</div>
      </div>

      {user.userId !== userid && (
        <div className={styles.actions}>
          <button className={styles.msgbtn} onClick={handleMessageClick}>
            메세지
          </button>
          <button className={styles.banbtn} onClick={handleBanClick}>
            {user.role === "BAD" ? "차단 해제" : "회원 차단"}
          </button>
          {user.role !== "BAD" && (
            <button className={styles.banbtn} onClick={handleAdminClick}>
              {user.role === "ADMIN" ? "일반유저로" : "관리자로"}
            </button>
          )}

          <span className={styles.statusicon}>
            {user.role === "BAD" ? "🚩" : "✅"}
          </span>
        </div>
      )}
      {user.userId === userid && <div className={styles.actions}>본인</div>}
    </div>
  );
}

export default UserItem;
