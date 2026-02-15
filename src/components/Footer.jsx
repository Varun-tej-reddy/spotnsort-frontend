// src/components/Footer.jsx
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 text-gray-600 p-4 mt-auto text-center shadow-inner">
      &copy; {new Date().getFullYear()} SpotnSort. All rights reserved.
    </footer>
  );
};

export default Footer;
