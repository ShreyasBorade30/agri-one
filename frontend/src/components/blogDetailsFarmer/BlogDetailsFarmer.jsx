import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import newRequest from '../../utils/newRequest.js';
import './BlogDetailsFarmer.scss';

const BlogDetailsFarmer = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await newRequest.get(`/api/posts/${id}`);
                setPost(response.data);
            } catch (err) {
                console.error("Error fetching post details", err);
            }
        };
        fetchPost();
    }, [id]);

    return (
        <div className='blogDetails'>
            {post ? (
                <>
                    <h1>{post.title}</h1>
                    <p>{post.content}</p>
                </>
            ) : (
                <p>Loading post details...</p>
            )}
        </div>
    );
};

export default BlogDetailsFarmer;
