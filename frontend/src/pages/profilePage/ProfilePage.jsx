import React from 'react';
import Sidebar from '../../components/sidebar/Sidebar';
import Navbar from '../../components/navbar/Navbar';
import FarmerProfile from '../../components/farmerProfile/FarmerProfile';
import UpdateFarmerProfileButton from '../../components/UpdateFarmerProfileButton/UpdateFarmerProfileButton';
import ExpertSidebar from '../../components/expertSidebar/ExpertSidebar.jsx';
import ExpertNavbar from '../../components/expertNavbar/ExpertNavbar.jsx';
import ExpertProfile from '../../components/expertProfile/ExpertProfile.jsx';
import UpdateExpertProfileButton from '../../components/UpdateExpertProfileButton/UpdateExpertProfileButton.jsx';
import './ProfilePage.scss';

const ProfilePage = ({ setUserRole }) => {
  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  })();

  const role = localStorage.getItem('userRole') || storedUser?.role || null;

  if (role === 'expert') {
    return (
      <div className='profile-page expert'>
        <ExpertSidebar setUserRole={setUserRole} />
        <div className="profile-container">
          <ExpertNavbar />
          <div className="content">
            <div className="top">
              <ExpertProfile />
            </div>
            <div className="bottom">
              <UpdateExpertProfileButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='profile-page'>
      <Sidebar setUserRole={setUserRole} />
      <div className="profile-container">
        <Navbar />
        <div className="content">
          <div className="top">
            <FarmerProfile />
          </div>
          <div className="bottom">
            <UpdateFarmerProfileButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
