import { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';

const AddCommentForm = ({ articleName, onArticleUpdated }) => {
    const [name, setName] = useState(''); // state name is initially set to '', can be updated by calling the setName function
    const [commentText, setCommentText] = useState(''); // state commentText is initially set to '', can be updated by calling the commentText function
    const [isAlertVisible, setIsAlertVisible] = useState(false);    
    const { user } = useUser();

    const addComment = async () => { // gets triggered when comment form is submitted
        const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
        const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
        const response = await axios.post(`/api/articles/${articleName}/comments`, { // adds the submitted comment to the database
            postedBy: name,
            text: commentText,
        }, { 
            headers, 
        });
        const updated_response = await axios.get(`/api/articles/${articleName}`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
        const newArticleInfo = updated_response.data; // fetches the data recieved from the get request for the specific article
        onArticleUpdated(newArticleInfo); // adds the new comment to the article page
        setName('');
        setCommentText(''); // resets the name and comment text to empty

        // display notification when comment has been successfully submitted
        setIsAlertVisible(true);
        setTimeout(() => {
        setIsAlertVisible(false);
        }, 2000);
    }

    return (
        <div id="add-comment-form">
            <h3>Add a Comment</h3>
            {user && <p>You are posting as {user.email}</p>}
            <textarea 
                value={commentText}
                style={{ whiteSpace: 'pre-wrap' }}
                onChange={e => setCommentText(e.target.value)} // changes the component's state live as the user fills out their comment based on onChange e (event)
                rows="4" 
                cols="50" />
            <button onClick={addComment}>{!isAlertVisible ? "Add Comment!" : "Comment Successfully Added!"}</button>
        </div>
    )
}

export default AddCommentForm;