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
  const [activeTab, setActiveTab] = useState('labours'); // 'labours' or 'jobs'
  const [jobs, setJobs] = useState([]);
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobFormData, setJobFormData] = useState({
    title: '', description: '', location: '', wage: '', workersNeeded: '', startDate: '', duration: '', skillsRequired: ''
  });
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

  const fetchJobs = async () => {
    try {
      const res = await newRequest.get('/api/jobs/all');
      setJobs(res.data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  useEffect(() => {
    fetchLabours();
    fetchMyProfile();
    fetchJobs();
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = jobFormData.skillsRequired.split(',').map(s => s.trim());
      await newRequest.post('/api/jobs/post', { ...jobFormData, skillsRequired: skillsArray });
      alert("Job posted successfully!");
      setShowPostJob(false);
      fetchJobs();
    } catch (err) {
      alert("Failed to post job");
    }
  };

  const handleApply = async (jobId) => {
    try {
      await newRequest.post(`/api/jobs/apply/${jobId}`);
      alert("Applied successfully!");
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || "Application failed");
    }
  };

  const handleUpdateStatus = async (jobId, workerId, status) => {
    try {
      await newRequest.post('/api/jobs/update-status', { jobId, workerId, status });
      alert(`Applicant ${status} successfully!`);
      fetchJobs();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getWorkerName = (workerId) => {
    // Try to find in the current labours list
    const worker = labours.find(l => l.userId === workerId);
    if (worker) return worker.name;
    
    // Check if it's the current user (case where dual role applies)
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser._id === workerId) return currentUser.name;

    return `Worker (${workerId.substring(0, 5)}...)`;
  };

  return (
    <div className="labour-directory-page">
      <Sidebar setUserRole={setUserRole} />
      <div className="labour-container">
        <Navbar />
        <div className="content">
          <div className="header">
          <div className="tab-group">
            <button className={`tab-btn ${activeTab === 'labours' ? 'active' : ''}`} onClick={() => setActiveTab('labours')}>
              Labours
            </button>
            <button className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
              Job Board
            </button>
          </div>
            <div className="button-group">
              {activeTab === 'labours' ? (
                <>
                  {myLabourProfile && (
                    <button className="stats-btn" onClick={() => { setShowMyStats(!showMyStats); setShowRegister(false); }}>
                      {showMyStats ? "View Directory" : "My Labour Status"}
                    </button>
                  )}
                  <button className="register-btn" onClick={() => { setShowRegister(!showRegister); setShowMyStats(false); }}>
                    {showRegister ? "View Directory" : (myLabourProfile ? "Update My Labour Info" : "Register as Labour")}
                  </button>
                </>
              ) : (
                <button className="register-btn" onClick={() => setShowPostJob(!showPostJob)}>
                  {showPostJob ? "View Jobs" : "Post a Job"}
                </button>
              )}
            </div>
          </div>

          {activeTab === 'labours' ? (
            <>
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
            </>
          ) : (
            <>
              {showPostJob ? (
                <div className="register-form">
                  <h2>Post a New Job</h2>
                  <form onSubmit={handlePostJob}>
                    <div className="input-field">
                      <label>Job Title</label>
                      <input type="text" placeholder="e.g. Wheat Harvesting" onChange={e => setJobFormData({...jobFormData, title: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Description</label>
                      <textarea placeholder="Tell workers about the job..." onChange={e => setJobFormData({...jobFormData, description: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Location</label>
                      <input type="text" placeholder="Where is the farm?" onChange={e => setJobFormData({...jobFormData, location: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Wage (₹)</label>
                      <input type="number" placeholder="Daily wage per person" onChange={e => setJobFormData({...jobFormData, wage: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Workers Needed</label>
                      <input type="number" placeholder="Number of workers" onChange={e => setJobFormData({...jobFormData, workersNeeded: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Start Date</label>
                      <input type="date" onChange={e => setJobFormData({...jobFormData, startDate: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Duration</label>
                      <input type="text" placeholder="e.g. 5 days" onChange={e => setJobFormData({...jobFormData, duration: e.target.value})} required />
                    </div>
                    <div className="input-field">
                      <label>Skills Required</label>
                      <input type="text" placeholder="e.g. Driving, Manual Labour" onChange={e => setJobFormData({...jobFormData, skillsRequired: e.target.value})} required />
                    </div>
                    <button type="submit">Post Opportunity</button>
                  </form>
                </div>
              ) : (
                <div className="labour-list">
                  <div className="cards">
                    {jobs.filter(job => job.farmerId._id !== localStorage.getItem('userId')).map(job => (
                      <div key={job._id} className="labour-card job-card">
                        <div className="job-header">
                          <h3>{job.title}</h3>
                          <span className="farmer-name">By: {job.farmerId.name}</span>
                        </div>
                        <p className="job-desc">{job.description}</p>
                        <div className="skills-container">
                          {job.skillsRequired.map((skill, i) => (
                            <span key={i} className="skill-badge job-skill">{skill}</span>
                          ))}
                        </div>
                        <div className="info-item">
                          <span className="label">Wage</span>
                          <span className="value">₹{job.wage} / day</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Workers</span>
                          <span className="value">{job.applicants.length} / {job.workersNeeded}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Location</span>
                          <span className="value">{job.location}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Starts</span>
                          <span className="value">{new Date(job.startDate).toLocaleDateString()}</span>
                        </div>
                        <button 
                          onClick={() => handleApply(job._id)}
                          className={job.applicants.some(a => a.workerId === localStorage.getItem('userId')) ? 'applied' : ''}
                        >
                          {job.applicants.some(a => a.workerId === localStorage.getItem('userId')) ? 'Applied' : 'Apply Now'}
                        </button>
                      </div>
                    ))}
                    {jobs.filter(job => job.farmerId._id !== localStorage.getItem('userId')).length === 0 && <div className="no-data">No job opportunities found from others.</div>}
                  </div>
                </div>
              )}
            </>
          )}
          
          {/* My Posted Jobs Section for Farmers */}
          {activeTab === 'jobs' && !showPostJob && (
            <div className="my-posted-jobs">
              <hr />
              <h2>Jobs Posted By Me</h2>
              <div className="cards">
                {jobs.filter(job => job.farmerId._id === localStorage.getItem('userId')).map(job => (
                  <div key={job._id} className="labour-card job-card my-job">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className={`status-badge ${job.status.toLowerCase().replace(' ', '-')}`}>{job.status}</span>
                    </div>
                    <div className="job-stats">
                      <div className="stat-box">
                        <span className="label">Workers Needed</span>
                        <span className="value">{job.workersNeeded}</span>
                      </div>
                      <div className="stat-box">
                        <span className="label">Total Applicants</span>
                        <span className="value">{job.applicants.length}</span>
                      </div>
                    </div>
                    
                    <div className="applicants-list">
                      <h4>Applicants <span className="count">{job.applicants.length}</span></h4>
                      {job.applicants.length > 0 ? (
                        job.applicants.map((app, i) => (
                          <div key={i} className="applicant-item">
                            <div className="worker-info">
                              <span className="name">{getWorkerName(app.workerId)}</span>
                              <span className={`status-text ${app.status.toLowerCase()}`}>{app.status}</span>
                            </div>
                            {app.status === 'Pending' && (
                              <div className="app-actions">
                                <button className="accept" onClick={() => handleUpdateStatus(job._id, app.workerId, 'Accepted')}>Accept</button>
                                <button className="reject" onClick={() => handleUpdateStatus(job._id, app.workerId, 'Rejected')}>Reject</button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="no-apps">No one has applied yet.</p>
                      )}
                    </div>
                  </div>
                ))}
                {jobs.filter(job => job.farmerId._id === localStorage.getItem('userId')).length === 0 && (
                  <div className="no-data">You haven't posted any jobs yet.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabourDirectory;
