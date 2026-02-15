// src/components/BubbleLayout.jsx
import React from "react";
import "../styles/main.css";

const BubbleLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen text-white">

      {/* Bubble Background */}
      <div className="bubbles-bg fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
        <ul className="bubbles">
          <li></li><li></li><li></li><li></li><li></li>
          <li></li><li></li><li></li><li></li><li></li>
        </ul>
      </div>

      {/* Page content above background */}
      <div className="relative z-10 min-h-screen flex justify-center items-center">
        {children}
      </div>
    </div>
  );
};

export default BubbleLayout;
