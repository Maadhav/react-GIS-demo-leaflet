import React, { useState, useEffect } from "react";
import useMapStore from "../../store/useMapStore";

const StatusBar = () => {
  const [cursorPos, setCursorPos] = useState({ lat: 0, lng: 0 });
  const { features } = useMapStore();
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    // Get and format current date
    const now = new Date();
    setCurrentDate(now.toLocaleDateString());
  }, []);

  // Create animated text with each letter as a separate span element
  const renderAnimatedText = (text) => {
    return text.split("").map((letter, index) => (
      <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>
        {letter}
      </span>
    ));
  };

  return (
    <div className="status-bar">
      <div className="status-left">
        <div className="status-item">
          <span>Features: {features.length}</span>
        </div>

        <div className="status-item">
          <span>Ready</span>
        </div>

        <div className="status-item">
          <span>Date: {currentDate}</span>
        </div>
      </div>
      <div className="status-item">
        <span>Developed by </span>
        <a
          className="codedecoders-animated"
          href="https://codedecoders.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          {renderAnimatedText("CodeDecoders")}
        </a>
      </div>
      <div className="status-item">
        <span className="version-tag">v0.0.1-pre-alpha</span>
      </div>
    </div>
  );
};

export default StatusBar;
