import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import Appointments from '../../components/bookAppointments/Appointments.jsx'
import './AppointmentPage.scss'

const AppointmentPage = ({ setUserRole }) => {
  return (
    <div className='appointment-container'>
      <Sidebar setUserRole={setUserRole} />
      <div className="right">
        <div className="bottom">
          <Appointments />
        </div>
      </div>
    </div>
  )
}

export default AppointmentPage