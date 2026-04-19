import React from "react";
import WeatherIcon from "@mui/icons-material/WbSunnyOutlined";
import FarmingIcon from "@mui/icons-material/AgricultureOutlined";
import TaskIcon from "@mui/icons-material/CalendarTodayOutlined";
import AppointmentIcon from "@mui/icons-material/PersonAddOutlined";
import RevenueIcon from "@mui/icons-material/AttachMoneyOutlined";
import CropIcon from "@mui/icons-material/LocalFloristOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutline";
import StorefrontIcon from "@mui/icons-material/StorefrontOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";
import ProfileIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutIcon from "@mui/icons-material/ExitToAppOutlined";
import "./Sidebar.scss";
import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/webLogo.png';
import newRequest from "../../utils/newRequest.js";

// commented out the following imports as they are not used in this component
const Sidebar = ({setUserRole}) => {

  const navigate = useNavigate();

  const handleLogout = async()=>{
    try{
      await newRequest.post("/api/auth/signout");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");
      if (typeof setUserRole === "function") {
        setUserRole(null);
      }
      navigate('/');
    }catch(err){
      console.error("Error logging out", err);
    }
  }
  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none", display: "flex", flexDirection: "row", alignItems: "center", gap: "15px" }}>
          <img src={logo} width={80} height={80} alt="" />
          <span className="logo">Agri-One</span>
        </Link>
      </div>
      <hr />
      <div className="bottom">
        <div className="card-container">
          <Link to="/weather_report" style={{ textDecoration: "none" }}>
            <div className="card">
              <WeatherIcon className="icon" />
              <span>Weather Report</span>
            </div>
          </Link>
          <Link to="/farming_recommendations" style={{ textDecoration: "none" }}>
            <div className="card">
              <FarmingIcon className="icon" />
              <span>Farming Recommendations</span>
            </div>
          </Link>
          <Link to="/task_scheduling" style={{ textDecoration: "none" }}>
            <div className="card">
              <TaskIcon className="icon" />
              <span>Task Scheduling</span>
            </div>
          </Link>
          <Link to="/appointments" style={{ textDecoration: "none" }}>
            <div className="card">
              <AppointmentIcon className="icon" />
              <span>Book Appointments</span>
            </div>
          </Link>
          <Link to="/revenue_record" style={{ textDecoration: "none" }}>
            <div className="card">
              <RevenueIcon className="icon" />
              <span>Revenue Recording</span>
            </div>
          </Link>
          <Link to="/crop_details_management" style={{ textDecoration: "none" }}>
            <div className="card">
              <CropIcon className="icon" />
              <span>Crop Details Management</span>
            </div>
          </Link>
          <Link to="/labour_directory" style={{ textDecoration: "none" }}>
            <div className="card">
              <PeopleIcon className="icon" />
              <span>Labour Directory</span>
            </div>
          </Link>
          <Link to="/advanced_features" style={{ textDecoration: "none" }}>
            <div className="card">
              <StorefrontIcon className="icon" />
              <span>Marketplace & Services</span>
            </div>
          </Link>
          <Link to="/marketplace" style={{ textDecoration: "none" }}>
            <div className="card">
              <ShoppingCartIcon className="icon" />
              <span>Equipment & Shop</span>
            </div>
          </Link>
        </div>

        <div className="profile-actions">
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <div className="action">
              <ProfileIcon className="icon" />
              <span>Profile</span>
            </div>
          </Link>
          {/* <Link to="/signout" style={{ textDecoration: "none" }}> */}
            <div onClick={handleLogout} className="action">
              <LogoutIcon className="icon" />
              <span>Logout</span>
            </div>
          {/* </Link> */}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
