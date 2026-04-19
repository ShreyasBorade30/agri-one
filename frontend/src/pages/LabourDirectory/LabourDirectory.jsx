import React, { useState, useEffect } from 'react';
import './LabourDirectory.scss';
import Sidebar from '../../components/sidebar/Sidebar.jsx';
import Navbar from '../../components/navbar/Navbar';
import newRequest from '../../utils/newRequest.js';

const LabourDirectory = ({ setUserRole }) => {
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
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

  useEffect(() => {
    fetchLabours();
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
            <button className="register-btn" onClick={() => setShowRegister(!showRegister)}>
              {showRegister ? "View Labours" : "Register as Labour"}
            </button>
          </div>

          {showRegister ? (
            <div className="register-form">
              <h2>Register as Labour</h2>
              <form onSubmit={handleRegister}>
                <div className="input-field">
                  <label>Skills</label>
                  <input type="text" placeholder="e.g. Harvesting, Plumping, Driving" onChange={e => setFormData({...formData, skills: e.target.value})} required />
                </div>
                <div className="input-field">
                  <label>Daily Wage (₹)</label>
                  <input type="number" placeholder="e.g. 500" onChange={e => setFormData({...formData, dailyWage: e.target.value})} required />
                </div>
                <div className="input-field">
                  <label>Contact Number</label>
                  <input type="text" placeholder="Your contact number" onChange={e => setFormData({...formData, contact: e.target.value})} required />
                </div>
                <div className="input-field">
                  <label>Location</label>
                  <input type="text" placeholder="Your village/city" onChange={e => setFormData({...formData, location: e.target.value})} required />
                </div>
                <div className="input-field">
                  <label>Experience (Years)</label>
                  <input type="number" placeholder="Years of experience" onChange={e => setFormData({...formData, experience: e.target.value})} required />
                </div>
                <button type="submit">Submit Registration</button>
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
