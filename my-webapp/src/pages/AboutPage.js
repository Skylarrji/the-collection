import React, { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';

const AboutPage = () => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const { user } = useUser();

  const addArticle = async () => { // gets triggered when the add article button is triggered
    console.log('add article run');
    const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
    const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null

    const titleURL = title.replace(/\s+/g, '-');

    await axios.post(`/api/add-article`, { // adds the submitted article to the database
        name: titleURL,
        upvotes: 0,
        comments: [],
        upvoteIds: [],
        content: text,
        title: title
    }, { 
        headers, 
    });
    setTitle('');
    setText(''); // resets the article info to be empty
}

  const handleTextChange = (event) => {
    setText(event.target.value);
    autoTextResize();
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    autoTitleResize();
  };

  const autoTextResize = () => {
    const textarea = document.getElementById('articleTextarea');

    const scrollTop = textarea.scrollTop;

    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.style.overflowY = "hidden";
    textarea.scrollTop = scrollTop;
  };

  const autoTitleResize = () => {
    const textarea = document.getElementById('articleTitlearea');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    textarea.style.overflowY = "hidden";
  };

  return (
    <>
      <div className="page-container">
      <h1>Write a New Article</h1>
      <div className="content-wrap">     
        <textarea
        id="articleTitlearea"
        className="article-titlearea"
        style={{ whiteSpace: 'pre-wrap'}}
        placeholder="Write your title here..."
        value={title}
        onChange={handleTitleChange}
      />
      
      <textarea
        id="articleTextarea"
        className="article-textarea"
        style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }}
        placeholder="Write anything..."
        value={text}
        onChange={handleTextChange}
      />

     <button onClick={addArticle}>Add Article!</button>
     </div>
     </div>
    </>
  );
};

export default AboutPage;
