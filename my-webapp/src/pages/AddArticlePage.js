import React, { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';
import { useParams, useNavigate } from 'react-router-dom';
import AddArticleForm from '../components/AddArticleForm.js'

const AddArticlePage = () => {
  const { user } = useUser(); // determines whether or not a user can add an article or not
  const navigate = useNavigate(); // variable to utilize when navigating to another page

  return (
    <>
    <div className="margin-div-2"></div>
    {user ? <AddArticleForm/> : <p>Log in to add an Article!</p>} 
    </>
  );
};

export default AddArticlePage;
