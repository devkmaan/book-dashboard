import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      &copy; 2024 | Made by{" "}
      <a
        target="_blank"
        href="https://devkmaan.vercel.app"
        className="underline  hover:text-blue-500"
      >
        Dev Kumar Maan
      </a>{" "}
    </footer>
  );
};

export default Footer;
