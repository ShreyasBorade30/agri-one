import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import './CropDetailsManagement.scss'

import CropForm from '../../components/cropComponent/CropComponent.jsx'
import IrrigationForm from '../../components/irrigationComponent/IrrigationComponent.jsx'

import Navbar from '../../components/navbar/Navbar'

const CropDetailsPage = ({ setUserRole }) => {
  return (
    <div className='cropManagement-container'>
      <Sidebar setUserRole={setUserRole} />
      <div className="right">
        <Navbar />
        <div className="bottom">
          <CropForm />
          <IrrigationForm />
        </div>
      </div>
    </div>
  )
}

export default CropDetailsPage