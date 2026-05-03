import React, { useState, useEffect } from 'react';
import newRequest from '../../utils/newRequest.js';
import './FarmerProfile.scss';
import profileImg from '../../assets/profile.png';
import { Phone, LocationOn, Cloud, Agriculture, Landscape, Info, Mail, Person } from '@mui/icons-material';

const FarmerProfile = () => {
  const [user, setUser] = useState({});
  const [farmerDetails, setFarmerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await newRequest.get('/api/farmer-details/user/profile');
        setUser(userRes.data);
        
        if (userRes.data?._id) {
          try {
            const detailsRes = await newRequest.get(`/api/farmer-details/${userRes.data._id}`);
            setFarmerDetails(detailsRes.data);
          } catch (err) {
            console.error("Error fetching farmer details:", err);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="farmer-profile">
      <div className="profile-header">
        <div className="profile-img-container">
          <img src={profileImg} alt="Profile" className="profile-img" />
        </div>
        <div className="profile-info">
          <h1>{user.name}</h1>
          <div className="badge">{user.role?.toUpperCase()}</div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card basic-info">
          <h3><Person className="icon-header" /> Basic Information</h3>
          <div className="info-item">
            <Mail className="icon" />
            <div className="details">
              <label>Email</label>
              <span>{user.email}</span>
            </div>
          </div>
          <div className="info-item">
            <Phone className="icon" />
            <div className="details">
              <label>Phone</label>
              <span>{farmerDetails?.phone || 'Not provided'}</span>
            </div>
          </div>
          <div className="info-item">
            <LocationOn className="icon" />
            <div className="details">
              <label>Address</label>
              <span>{farmerDetails?.address || 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="profile-card farm-info">
          <h3><Agriculture className="icon-header" /> Farm Details</h3>
          <div className="info-item">
            <LocationOn className="icon" />
            <div className="details">
              <label>Region</label>
              <span>{farmerDetails?.region || 'Not provided'}</span>
            </div>
          </div>
          <div className="info-item">
            <Cloud className="icon" />
            <div className="details">
              <label>Climate</label>
              <span>{farmerDetails?.climate || 'Not provided'}</span>
            </div>
          </div>
          <div className="info-item">
            <Landscape className="icon" />
            <div className="details">
              <label>Land Size</label>
              <span>{farmerDetails?.amountOfLand ? `${farmerDetails.amountOfLand} Acres` : 'Not provided'}</span>
            </div>
          </div>
        </div>

        <div className="profile-card crops-info">
          <h3><Agriculture className="icon-header" /> Crops Cultivated</h3>
          <div className="crops-list">
            {farmerDetails?.cropNames && farmerDetails.cropNames.length > 0 ? (
              farmerDetails.cropNames.map((crop, index) => (
                <span key={index} className="crop-badge">{crop}</span>
              ))
            ) : (
              <span>No crops listed</span>
            )}
          </div>
        </div>

        <div className="profile-card other-info">
          <h3><Info className="icon-header" /> Other Details</h3>
          <p>{farmerDetails?.otherDetails || 'No additional details provided.'}</p>
        </div>
      </div>
    </div>
  );
};

export default FarmerProfile;
