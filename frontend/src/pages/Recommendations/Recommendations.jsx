import React from 'react'
import './Recommendations.scss'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import Navbar from '../../components/navbar/Navbar'
import Recommendation from '../../components/Recommendation/Recommendation.jsx'


const Recommendations = ({ setUserRole }) => {
  return (
    <div className='recommendation-container'>
      <Sidebar setUserRole={setUserRole} />
      <div className="right">
        <div className="bottom">
          <Recommendation />
        </div>
      </div>
    </div>
  )
}

export default Recommendations