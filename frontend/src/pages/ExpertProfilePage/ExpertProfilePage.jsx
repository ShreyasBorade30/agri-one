import React from 'react'
import ExpertProfile from '../../components/expertProfile/ExpertProfile.jsx'
import './ExpertProfilePage.scss'
import UpdateExpertProfileButton from '../../components/UpdateExpertProfileButton/UpdateExpertProfileButton.jsx'

import ExpertSidebar from '../../components/expertSidebar/ExpertSidebar.jsx'
import ExpertNavbar from '../../components/expertNavbar/ExpertNavbar.jsx'

const ExpertProfilePage = ({ setUserRole }) => {
  return (
    <div className='expert-profile-page'>
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
  )
}

export default ExpertProfilePage
