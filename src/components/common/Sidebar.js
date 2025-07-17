import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";

import libAct from "../../assets/images/lib_act.svg";
import libDe from "../../assets/images/lib_de.svg";
import archiveAct from "../../assets/images/archive_act.svg";
import archiveDe from "../../assets/images/archive_de.svg";
import atelierAct from "../../assets/images/atelier_act.svg";
import atelierDe from "../../assets/images/atelier_de.svg";
import chatAct from "../../assets/images/chat_act.png";
import chatDe from "../../assets/images/chat_de.jpg";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.sidebar}>
      <div
        className={`${styles.menuWrapper} ${isActive("/library") ? styles.active : ""}`}
        onClick={() => navigate("/library")}
      >
        <img src={isActive("/library") ? libAct : libDe} alt="Library" />
      </div>

      <div
        className={`${styles.menuWrapper} ${isActive("/archive") ? styles.active : ""}`}
        onClick={() => navigate("/archive")}
      >
        <img
          src={isActive("/archive") ? archiveAct : archiveDe}
          alt="Archive"
        />
      </div>

      <div
        className={`${styles.menuWrapper} ${isActive("/atelier") ? styles.active : ""}`}
        onClick={() => navigate("/atelier")}
      >
        <img
          src={isActive("/atelier") ? atelierAct : atelierDe}
          alt="Atelier"
        />
      </div>

      {/* TODO: 채팅 아이콘 수정 */}
      <div
        className={`${styles.menuWrapper} ${isActive("/chat") ? styles.active : ""}`}
        onClick={() => navigate("/chat")}
      >
        <img
          src={isActive("/chat") ? chatAct : chatDe}
          alt="Chat"
          style={{ width: "40px", height: "40px" }}
        />
      </div>
    </div>
  );
}

export default Sidebar;
