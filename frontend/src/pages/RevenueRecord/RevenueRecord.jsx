import React,{useState} from 'react'
import Sidebar from '../../components/sidebar/Sidebar.jsx'
import Navbar from '../../components/navbar/Navbar'
import AddRecord from '../../components/addRecord/AddRecord.jsx'
import MonthlySummary from '../../components/monthlySummary/MonthlySummary.jsx'
import './RevenueRecord.scss'

const RevenueRecord = ({ setUserRole }) => {
  return (
    <div className='revenue-container'>
      <Sidebar setUserRole={setUserRole} />
      <div className="right">
        <Navbar />
        <div className="bottom">
          <div className="bottom-left">
            <AddRecord onRecordAdded={() => { }} />
          </div>
          <div className="bottom-right">
            <MonthlySummary />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueRecord