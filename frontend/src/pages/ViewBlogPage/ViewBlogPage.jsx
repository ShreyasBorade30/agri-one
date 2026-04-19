import React from 'react'
import ExpertSidebar from '../../components/expertSidebar/ExpertSidebar.jsx'

import './ViewBlogPage.scss';
import BlogListExpert from '../../components/blogListExpert/BlogListExpert.jsx';


const ViewBlogPage = ({ setUserRole }) => {
  return (
    <div className='view-blog-page'>
        <div className="left">
            <ExpertSidebar setUserRole={setUserRole} />
        </div>
        <div className="right">
            <div className="bottom">
                <BlogListExpert/>
            </div>
        </div>
    </div>
  )
}

export default ViewBlogPage