import React, { useState, useEffect } from "react";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import profileImg from '../../assets/profile.png';
import { useTranslation } from 'react-i18next';

import "./Navbar.scss";
import { Link } from "react-router-dom";


const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="navbar">
      <div className="navbarContainer">
        <div className="search">
          <input type="text" placeholder={t('search')} />
          <SearchOutlinedIcon />
        </div>
        <div className="items">
          <div className="item language-selector">
            <LanguageIcon className="icon" />
            <select onChange={changeLanguage} value={i18n.language}>
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">Hinglish (Hindi+Eng)</option>
            </select>
          </div>
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
