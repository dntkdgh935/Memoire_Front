// src/components/common/Sidebar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../ThemeContext";
import styles from "./Sidebar.module.css";

// 1) 일반 모드용, active/disabled
import libAct     from "../../assets/images/lib_act.svg";
import libDe      from "../../assets/images/lib_de.svg";
import archiveAct from "../../assets/images/archive_act.svg";
import archiveDe  from "../../assets/images/archive_de.svg";
import atelierAct from "../../assets/images/atelier_act.svg";
import atelierDe  from "../../assets/images/atelier_de.svg";
import chatAct    from "../../assets/images/chat_act.png";
import chatDe     from "../../assets/images/chat_de.jpg";

// 2) 비디오 모드용 다크 아이콘
import libDark     from "../../assets/images/lib_dark.svg";
import archiveDark from "../../assets/images/archive_dark.svg";
import atelierDark from "../../assets/images/atelier_dark.png";
import chatDark    from "../../assets/images/chat_dark.png";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { useVideo } = useTheme();

  const isActive = (path) => location.pathname === path;

  // 아이콘을 결정하는 헬퍼
  const chooseIcon = (path, actIcon, defIcon, darkIcon) => {
    if (useVideo) return darkIcon;
    return isActive(path) ? actIcon : defIcon;
  };

  return (
    <div className={styles.sidebar}>
      {/* 라이브러리 */}
      <div
        className={`${styles.menuWrapper} ${
          isActive("/library") ? styles.active : ""
        }`}
        onClick={() => navigate("/library")}
      >
        <img
          src={chooseIcon("/library", libAct, libDe, libDark)}
          alt="Library"
        />
      </div>

      {/* 아카이브 */}
      <div
        className={`${styles.menuWrapper} ${
          isActive("/archive") ? styles.active : ""
        }`}
        onClick={() => navigate("/archive")}
      >
        <img
          src={chooseIcon("/archive", archiveAct, archiveDe, archiveDark)}
          alt="Archive"
        />
      </div>

      {/* 아틀리에 */}
      <div
        className={`${styles.menuWrapper} ${
          isActive("/atelier") ? styles.active : ""
        }`}
        onClick={() => navigate("/atelier")}
      >
        <img
          src={chooseIcon("/atelier", atelierAct, atelierDe, atelierDark)}
          alt="Atelier"
        />
      </div>

      {/* 채팅 */}
      <div
        className={`${styles.menuWrapper} ${
          isActive("/chat") ? styles.active : ""
        }`}
        onClick={() => navigate("/chat")}
      >
        <img
          src={chooseIcon("/chat", chatAct, chatDe, chatDark)}
          alt="Chat"
          style={{ width: "40px", height: "40px" }}
        />
      </div>
    </div>
  );
}

export default Sidebar;