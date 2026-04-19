import React, { useState, useEffect } from "react";
import Navbar from "../../components/navbar/Navbar.jsx";
import Sidebar from "../../components/sidebar/Sidebar";
import Widget from "../../components/widget/Widget.jsx";
import "./FarmerHome.scss";
import support from '../../assets/sustainable.png';
import RevenueChart from "../../components/chart/Chart.jsx";
import TaskCompletionChart from '../../components/taskCompletion/TaskCompletion.jsx';
import FarmingNews from '../../components/farmingNews/FarmingNews';
import GrowthProgressTracker from "../../components/growthProgressTracker/GrowthProgressTracker.jsx";
import WaterUsageGraph from "../../components/WaterUsageComponent/WaterUsageComponent.jsx";
import newRequest from "../../utils/newRequest.js";
import { useNavigate } from "react-router-dom";
import Chatbot from '../../components/Chatbot/Chatbot';

import socket from "../../utils/socket.js";

const Home = ({ setUserRole }) => {
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState({ alerts: "" });
  const [year, setYear] = useState(new Date().getFullYear());
  const [completedTasks, setCompletedTasks] = useState(5);
  const [totalTasks, setTotalTasks] = useState(10);
  const [crops, setCrops] = useState([]);
  const [blogPosts, setBlogPosts] = useState([])
  const navigate = useNavigate();

  const handleReadMore = (postId)=>{
    navigate(`/posts/${postId}`);
  }

  const handleJoinCall = (appointmentId) => {
    socket.emit('join-call', { appointmentId, role: 'farmer' });
    navigate(`/video-call/${appointmentId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch DYNAMIC notifications based on User's Region (using default Kolkata for now)
      try {
        const notificationsResponse = await newRequest.get("/api/news?region=Kolkata"); 
        // Using AI generated alerts from our updated controller
        setNotifications(notificationsResponse.data || { alerts: "Stay updated with local farming alerts." });
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications({ alerts: "Monitor local weather for crop health." }); 
      }

      // 2. Fetch REAL appointments from database
      try {
        const appointmentsResponse = await newRequest.get("/api/appointments/farmer");
        // Only show upcoming (accepted) appointments on dashboard
        const upcoming = (appointmentsResponse.data || []).filter(app => app.status === 'accepted');
        setAppointments(upcoming);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }

      // 3. Fetch LATEST blog posts from experts
      try{
        const blogResponse = await newRequest.get('/api/posts/getPost');
        setBlogPosts(blogResponse.data || []);
      }catch(err){
        console.error("Error fetching blog posts", err);
      }
    };
    fetchData();

    // Socket listeners for real-time updates
    socket.on('appointmentAccepted', (data) => {
      setAppointments((prev) => 
        prev.map(app => app._id === data.appointmentId ? { ...app, status: 'accepted' } : app)
      );
    });

    return () => {
      socket.off('appointmentAccepted');
    };
  }, []);

  // const blogPosts = [
  //   { title: "Understanding Crop Rotation", excerpt: "Discover best practices of crop rotation..." },
  //   { title: "Pest Management Strategies", excerpt: "Learn how to manage pests effectively ..." },
  //   { title: "Sustainable Farming Practices", excerpt: "Explore sustainable ways to reduce costs..." },
  //   { title: "Maximizing Your Harvest", excerpt: "Tips to ensure a bountiful harvest season..." },
  // ];

  // Helper function to clean Markdown
  const cleanMarkdown = (text) => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // Remove bold (**) or (__) and leave the text
      .replace(/(\#\#)(.*?)$/g, "") // Remove headings (##)
      .replace(/\n/g, "") // Remove new lines
      .replace(/\*/g, "") // Remove other Markdown symbols like *
      .replace(/_/g, ""); // Remove underscores
  };

  return (
    <div className="home">
      <Sidebar setUserRole={setUserRole} />
      <div className="homeContainer">
        <Navbar />
        
        <div className="widgetsSection">
          <div className="heading">
            <img src={support} width={30} height={30} alt="" />
            <h2 className="widgetsHeading">What Experts Have to Say Today</h2>
          </div>
          <div className="widgetsContainer">
            {blogPosts.length > 0 ? (
              blogPosts.map((post, index) => (
                <Widget 
                  key={post._id || index} 
                  title={post.title} 
                  excerpt={post.content ? post.content.substring(0, 100) + "..." : ""}
                  onReadMore = {()=>handleReadMore(post._id)}
                />
              ))
            ) : (
              <p>No blog posts available</p>
            )}
          </div>
        </div>
        
        <div className="notifications-appointments">
          <section className="notifications1">
            <h2>Notifications</h2>
            <ul>
              {notifications.alerts ? (
                notifications.alerts
                  .split("\n")
                  .filter((alert) => alert.trim() !== "")
                  .map((alert, index) => (
                    <li key={index}>{cleanMarkdown(alert)}</li>
                  ))
              ) : (
                <li>No notifications available.</li>
              )}
            </ul>

          </section>
          
          <section className="appointments1">
            <h2>Upcoming Appointments</h2>
            <ul>
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <li key={appointment._id}>
                    <div className="appointment-details">
                      <span>{new Date(appointment.date).toLocaleDateString()} - {appointment.expertId?.name || 'Expert'}</span>
                      <span className={`status ${appointment.status}`}>{appointment.status}</span>
                    </div>
                    {appointment.status === 'accepted' && (
                      <button className="join-call-btn" onClick={() => handleJoinCall(appointment._id)}>
                        Join Video Call
                      </button>
                    )}
                  </li>
                ))
              ) : (
                <li>No appointments found.</li>
              )}
            </ul>
          </section>
        </div>
        
        <div className="chartSection">
          <div className="revenue-chart">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Enter year"
              min="2000"
              max="2100"
            />
            <RevenueChart year={year} />
          </div>
          <TaskCompletionChart completed={completedTasks} total={totalTasks} />
        </div>

        <div className="crop-stats">
          <GrowthProgressTracker/>
          
          {Array.isArray(crops) && crops.map((crop) => (
            <WaterUsageGraph key={crop._id} cropId={crop._id} cropName={crop.name} />
          ))}
        </div>

        {/* <div className="news">
          <FarmingNews/>
        </div> */}
        
      </div>
      <Chatbot />
    </div>
  );
};

export default Home;
