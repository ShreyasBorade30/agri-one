import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
// import Navbar from '../../components/navbar/Navbar'
import Weather from '../../components/Weather/Weather.jsx'
import './WeatherReport.scss'

const WeatherReport = ({ setUserRole }) => {
  return (
    <div className='weather-container'>
      <Sidebar setUserRole={setUserRole} />
      <div className="right">
        <div className="bottom">
          <Weather />
        </div>
      </div>
    </div>
  )
}

export default WeatherReport