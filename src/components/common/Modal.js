import React from "react";
import ReactDom from "react-dom";
import styles from "./Modal.module.css";

const Modal = ({ children, onClose }) => {
  return ReactDom.createPortal(
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          X
        </button>
        {children}
      </div>
    </div>,
    document.getElementById("portal-root")
  );
};

export default Modal;
