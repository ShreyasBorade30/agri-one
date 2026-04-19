import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import Navbar from '../../components/navbar/Navbar'
// import Weather from '../../components/Weather/Weather'
// import './WeatherReport.scss'
import './TaskSchedulingPage.scss'
import TaskSchedular from '../../components/taskSchedular/TaskSchedular.jsx'

const TaskSchedulingPage = ({ setUserRole }) => {
  return (
    <div className='taskScheduling-container'>
      <Sidebar setUserRole={setUserRole} />
      <div className="right">
        <Navbar />
        <div className="bottom">
          <TaskSchedular />
        </div>
      </div>
    </div>
  )
}

export default TaskSchedulingPage