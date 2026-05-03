import React, { useState, useEffect } from 'react';
import './LabourDirectory.scss';
import Sidebar from '../../components/sidebar/Sidebar.jsx';
import Navbar from '../../components/navbar/Navbar';
import newRequest from '../../utils/newRequest.js';

const LabourDirectory = ({ setUserRole }) => {
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [myLabourProfile, setMyLabourProfile] = useState(null);
  const [showMyStats, setShowMyStats] = useState(false);
  const [formData, setFormData] = useState({
    skills: '',
    dailyWage: '',
    contact: '',
    location: '',
    experience: ''
  });

  const fetchLabours = async () => {
    try {
      const res = await newRequest.get('/api/labours/all');
      setLabours(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const res = await newRequest.get('/api/labours/my-profile');
      setMyLabourProfile(res.data);
      if (res.data) {
        setFormData({
          skills: res.data.skills.join(', '),
          dailyWage: res.data.dailyWage,
          contact: res.data.contact,
          location: res.data.location,
          experience: res.data.experience
        });
      }
    } catch (err) {
      console.error("Error fetching my labour profile:", err);
    }
  };

  useEffect(() => {
    fetchLabours();
    fetchMyProfile();
  }, []);

  const handleHire = async (labourId) => {
    try {
      await newRequest.post('/api/labours/hire', { labourId });
      alert("Labour hired successfully!");
      fetchLabours();
    } catch (err) {
      alert("Failed to hire labour");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim());
      await newRequest.post('/api/labours/register', { ...formData, skills: skillsArray });
      alert("Registered as Labour successfully!");
      setShowRegister(false);
      fetchLabours();
      fetchMyProfile();
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="labour-directory-page">
      <Sidebar setUserRole={setUserRole} />
      <div className="labour-container">
        <Navbar />
        <div className="content">
          <div className="header">
            <h1>Labour Directory</h1>
            <div className="button-group">
              {myLabourProfile && (
                <button className="stats-btn" onClick={() => { setShowMyStats(!showMyStats); setShowRegister(false); }}>
                  {showMyStats ? "View Directory" : "My Labour Status"}
                </button>
              )}
              <button className="register-btn" onClick={() => { setShowRegister(!showRegister); setShowMyStats(false); }}>
                {showRegister ? "View Directory" : (myLabourProfile ? "Update My Labour Info" : "Register as Labour")}
              </button>
            </div>
          </div>

          {showMyStats && myLabourProfile ? (
            <div className="my-labour-stats">
              <h2>My Labour Status & History</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Current Status</h3>
                  <span className={`status-badge ${myLabourProfile.status.toLowerCase()}`}>
                    {myLabourProfile.status}
                  </span>
                </div>
                <div className="stat-card">
                  <h3>Earnings</h3>
                  <p className="wage">₹{myLabourProfile.dailyWage} / day</p>
                </div>
                <div className="stat-card">
                  <h3>Experience</h3>
                  <p className="exp-value">{myLabourProfile.experience} Years</p>
                </div>
              </div>

              <div className="hire-history">
                <h3>Who Hired Me?</h3>
                {myLabourProfile.hiredBy ? (
                  <div className="hired-info">
                    <p><strong>Name:</strong> {myLabourProfile.hiredBy.name}</p>
                    <p><strong>Email:</strong> {myLabourProfile.hiredBy.email}</p>
                    <p className="note">Status: You are currently Busy with this employer.</p>
                  </div>
                ) : (
                  <p className="no-data">You are currently Available for hire.</p>
                )}
              </div>

              <div className="profile-details">
                <h3>My Details</h3>
                <p><strong>Skills:</strong> {myLabourProfile.skills.join(', ')}</p>
                <p><strong>Location:</strong> {myLabourProfile.location}</p>
                <p><strong>Contact:</strong> {myLabourProfile.contact}</p>
              </div>
            </div>
          ) : showRegister ? (
            <div className="register-form">
              <h2>{myLabourProfile ? "Update My Labour Info" : "Register as Labour"}</h2>
              <form onSubmit={handleRegister}>
                <div className="input-field">
                  <label>Skills</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Harvesting, Plumping, Driving" 
                    value={formData.skills}
                    onChange={e => setFormData({...formData, skills: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>Daily Wage (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 500" 
                    value={formData.dailyWage}
                    onChange={e => setFormData({...formData, dailyWage: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>Contact Number</label>
                  <input 
                    type="text" 
                    placeholder="Your contact number" 
                    value={formData.contact}
                    onChange={e => setFormData({...formData, contact: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>Location</label>
                  <input 
                    type="text" 
                    placeholder="Your village/city" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})} 
                    required 
                  />
                </div>
                <div className="input-field">
                  <label>Experience (Years)</label>
                  <input 
                    type="number" 
                    placeholder="Years of experience" 
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})} 
                    required 
                  />
                </div>
                <button type="submit">{myLabourProfile ? "Update Information" : "Submit Registration"}</button>
              </form>
            </div>
          ) : (
            <div className="labour-list">
              {loading ? <p className="no-data">Loading labours...</p> : (
                <div className="cards">
                  {labours.map(labour => (
                    <div key={labour._id} className="labour-card">
                      <h3>{labour.name}</h3>
                      <div className="skills-container">
                        {labour.skills.map((skill, i) => (
                          <span key={i} className="skill-badge">{skill}</span>
                        ))}
                      </div>
                      <div className="info-item">
                        <span className="label">Daily Wage</span>
                        <span className="value">₹{labour.dailyWage}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Location</span>
                        <span className="value">{labour.location}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Experience</span>
                        <span className="value">{labour.experience} Years</span>
                      </div>
                      <button onClick={() => handleHire(labour._id)}>Hire Now</button>
                    </div>
                  ))}
                  {labours.length === 0 && <div className="no-data">No available labours found.</div>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabourDirectory;
