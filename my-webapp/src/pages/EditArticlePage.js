import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';
import { useParams, useNavigate } from 'react-router-dom';
import EditArticleForm from '../components/EditArticleForm.js'

const EditArticlePage = () => {
  const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [], canUpvote: false }); // sets the default state for the component as well as its associated properties
  const { user, isLoading } = useUser(); // determines whether or not a user can add an article or not
  const navigate = useNavigate(); // variable to utilize when navigating to another page
  const { articleId } = useParams(); /* stores URL parameter as articleId */

  useEffect(() => {
    const loadArticleInfo = async () => {
      try {
        const token = user && (await user.getIdToken());
        const headers = token ? { authtoken: token } : {};
        const response = await axios.get(`/api/articles/${articleId}`, {
          headers,
        });

        const newArticleInfo = response.data;
        setArticleInfo(newArticleInfo);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Navigate to the 404 page when a 404 error occurs
          navigate('/404');
        } else {
          // Handle other errors as needed
          console.error('Error loading article info:', error);
        }
      }
    };

    if (!isLoading) {
      loadArticleInfo();
    }
  }, [isLoading, user, articleId, navigate]);

  return (
    <>
    <div className="margin-div-2"></div>
    {(user && user.email) === articleInfo.postedBy ? <EditArticleForm articleInfo={articleInfo}/> : <p>Oops! Make sure that you are logged in and have permission to edit this ericle!</p>} 
    </>
  );
};

export default EditArticlePage;
