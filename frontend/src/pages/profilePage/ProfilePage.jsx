import React from 'react'
import './ProfilePage.scss'
import Profile from '../../components/profile/Profile.jsx'
import UpdateFarmerProfileButton from '../../components/UpdateFarmerProfileButton/UpdateFarmerProfileButton.jsx'
import AddFarmerProfile from '../../components/addProfile/AddProfile.jsx'

import Sidebar from '../../components/sidebar/Sidebar.jsx'
import Navbar from '../../components/navbar/Navbar.jsx'

const ProfilePage = ({ setUserRole }) => {
  return (
    <div className='profile-page'>
      <Sidebar setUserRole={setUserRole} />
      <div className="profile-container">
        <Navbar />
        <div className="content">
          <div className="profile-page-container">
            <Profile />
            <UpdateFarmerProfileButton />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage