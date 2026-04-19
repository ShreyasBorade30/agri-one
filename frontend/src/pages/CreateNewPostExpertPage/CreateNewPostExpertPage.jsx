import React from 'react'
import ExpertSidebar from '../../components/expertSidebar/ExpertSidebar.jsx'
import CreateNewPostExpert from '../../components/createNewPostExpert/CreateNewPostExpert.jsx'
import './CreateNewPostExpertPage.scss';


const CreateNewPostExpertPage = ({ setUserRole }) => {
  return (
    <div className='create-post-container-page'>
        <div className="left">
            <ExpertSidebar setUserRole={setUserRole} />
        </div>
        <div className="right">
            <div className="bottom">
                <CreateNewPostExpert/>
            </div>
        </div>
    </div>
  )
}

export default CreateNewPostExpertPage