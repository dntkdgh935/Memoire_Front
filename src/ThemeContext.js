// src/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [useVideo, setUseVideo] = useState(false);

  useEffect(() => {
    console.log('🪄 ThemeContext useEffect, useVideo=', useVideo);
    document.body.classList.toggle('theme-video', useVideo);
  }, [useVideo]);

  return (
    <ThemeContext.Provider value={{ useVideo, setUseVideo }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);