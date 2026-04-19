import React from 'react'
import ExpertSidebar from '../../components/expertSidebar/ExpertSidebar.jsx'
import './BlogDetailsExpertPage.scss';
import BlogDetailExpert from '../../components/blogDetailExpert/BlogDetailExpert.jsx';


const BlogDetailsExpertPage = ({ setUserRole }) => {
  return (
    <div className='blog-details-expert-page'>
        <div className="left">
            <ExpertSidebar setUserRole={setUserRole} />
        </div>
        <div className="right">
            <div className="bottom">
                <BlogDetailExpert/>
            </div>
        </div>
    </div>
  )
}

export default BlogDetailsExpertPage