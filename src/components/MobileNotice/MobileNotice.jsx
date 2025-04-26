import React from "react";
import "./MobileNotice.css";

const MobileNotice = () => {
  return (
    <div className="mobile-notice">
      <div className="mobile-notice-content">
        <div className="notice-icon">🗺️</div>
        <h1>Desktop View Recommended</h1>
        <p>
          This GIS application is designed for desktop environments and may not
          work properly on mobile devices.
        </p>
        <p>
          Please open this application on a desktop or laptop computer for the
          best experience.
        </p>
        <div className="notice-desktop-icon">💻</div>
      </div>
    </div>
  );
};

export default MobileNotice;
