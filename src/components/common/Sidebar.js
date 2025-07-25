// src/components/common/Sidebar.js

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../ThemeContext";
import styles from "./Sidebar.module.css";

// 아이콘 이미지 import
import libAct     from "../../assets/images/lib_act.svg";
import libDe      from "../../assets/images/lib_de.svg";
import archiveAct from "../../assets/images/archive_act.svg";
import archiveDe  from "../../assets/images/archive_de.svg";
import atelierAct from "../../assets/images/atelier_act.svg";
import atelierDe  from "../../assets/images/atelier_de.svg";
import chatAct    from "../../assets/images/chat_dark.png";
import chatDe     from "../../assets/images/chat_de.png";

// 다크 모드용 아이콘
import libDark      from "../../assets/images/lib_dark.svg";
import archiveDark  from "../../assets/images/archive_dark.svg";
import atelierDark  from "../../assets/images/atelier_dark.png";
import chatDark     from "../../assets/images/chat_dark.png";
import tarotDark    from "../../assets/images/tarot_dark.png";

// 추가된 타로 일반 모드 아이콘
import tarotAct     from "../../assets/images/tarot_act.png";
import tarotDe      from "../../assets/images/tarot_de.png";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { useVideo } = useTheme();

  const isActive = (path) => location.pathname === path;

  const chooseIcon = (path, actIcon, defIcon, darkIcon) => {
    if (useVideo) return darkIcon;
    return isActive(path) ? actIcon : defIcon;
  };

  return (
    <div className={styles.sidebar}>
      {/* 라이브러리 */}
      <div
        className={`${styles.menuWrapper} ${isActive("/library") ? styles.active : ""}`}
        onClick={() => navigate("/library")}
      >
        <img src={chooseIcon("/library", libAct, libDe, libDark)} alt="Library" />
      </div>

      {/* 아카이브 */}
      <div
        className={`${styles.menuWrapper} ${isActive("/archive") ? styles.active : ""}`}
        onClick={() => navigate("/archive")}
      >
        <img src={chooseIcon("/archive", archiveAct, archiveDe, archiveDark)} alt="Archive" />
      </div>

      {/* 아틀리에 */}
      <div
        className={`${styles.menuWrapper} ${isActive("/atelier") ? styles.active : ""}`}
        onClick={() => navigate("/atelier")}
      >
        <img src={chooseIcon("/atelier", atelierAct, atelierDe, atelierDark)} alt="Atelier" />
      </div>

      {/* 채팅 */}
      <div
        className={`${styles.menuWrapper} ${isActive("/chat") ? styles.active : ""}`}
        onClick={() => navigate("/chat")}
      >
        <img
          src={chooseIcon("/chat", chatAct, chatDe, chatDark)}
          alt="Chat"
          style={{ width: "40px", height: "40px" }}
        />
      </div>

      {/* AI 타로 */}
      <div
        className={`${styles.menuWrapper} ${isActive("/tarot") ? styles.active : ""}`}
        onClick={() => navigate("/tarot")}
      >
        <img src={chooseIcon("/tarot", tarotAct, tarotDe, tarotDark)} alt="Tarot" />
      </div>
    </div>
  );
}

export default Sidebar;