import React, { useState, useEffect } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import profileImg from '../../assets/profile.png';

import "./Navbar.scss";
import { Link } from "react-router-dom";


const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="navbar">
      <div className="navbarContainer">
        <div className="search">
          <input type="text" placeholder="search" />
          <SearchOutlinedIcon />
        </div>
        <div className="items">
          <div className="item" onClick={toggleTheme}>
            {theme === "light" ? <DarkModeIcon className="icon" /> : <LightModeIcon className="icon" />}
          </div>
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <div className="item profileImg">
              <img src={profileImg} alt="Profile" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
