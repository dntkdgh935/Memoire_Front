// src/components/user/UserVerification.js

import React from "react";
import Cleave from "cleave.js/react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import styles from "./UserVerification.module.css";

function UserVerification({ phone, setPhone }) {
  const handlePhoneChange = (e) => {
    const rawValue = e.target.rawValue;
    setPhone(rawValue);
  };

  const phoneNumber = parsePhoneNumberFromString(phone, "KR");
  const isValid = phoneNumber?.isValid() ?? false;

  return (
    <div className={styles.inputGroup}>
      <Cleave
        className={styles.input}
        placeholder="010-1234-5678"
        options={{
          delimiters: ["-", "-"],
          blocks: [3, 4, 4],
          numericOnly: true,
        }}
        value={phoneNumber?.formatNational() ?? phone}
        onChange={handlePhoneChange}
      />
      {!isValid && phone && (
        <span className={styles.errorText}>유효하지 않은 전화번호입니다.</span>
      )}
    </div>
  );
}

export default UserVerification;
