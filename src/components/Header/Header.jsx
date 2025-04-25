import React from "react";

const Header = () => {
  return (
    <div className="app-header">
      <div className="logo">
        <span className="logo-text">
          <span role="img" aria-label="Map icon" className="header-icon">🗺️ </span>
          Custom GIS Explorer
        </span>
      </div>

      <div className="header-actions">
        <button>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
