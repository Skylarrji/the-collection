import { useState } from 'react';
import axios from 'axios';
import useUser from '../hooks/useUser';

const CommentsList = ({ comments, articleName, onArticleUpdated }) => { // takes in comments as a prop
    const { user } = useUser();

    const removeComment = async (commentId) => { // gets triggered when comment form is submitted
        const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
        const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
        await axios.delete(`/api/articles/${articleName}/comments/${commentId}`, { headers });
        const updated_response = await axios.get(`/api/articles/${articleName}`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
        const newArticleInfo = updated_response.data; // fetches the data recieved from the get request for the specific article
        onArticleUpdated(newArticleInfo); // adds the new comment to the article page
    }
    
    return (    
        <>
            <h3>Comments:</h3>
            {comments.map((comment, index) => ( // need to join together the username and the text with a : for a unique id; users are only allowed to delete their own comments
                <div className="comment" key={comment.postedBy + ': ' + comment.text}> 
                    <h4>{comment.postedBy}</h4>
                    {comment.text.split('\n').map((line, i) => ( <p key={i}>{line}</p> ))}
                    {(user && user.email) === comment.postedBy ? <button onClick={() => removeComment(index)}>Remove Comment</button> : <></>} 
                </div>
            ))}
        </>
    
    );    

};

export default CommentsList;

// const CommentsList = ({ comments }) => ( // takes in comments as a prop
//     <> 
//     <h3>Comments</h3>
//     {comments.map(comment => ( // need to join together the username and the text with a : for a unique id
//         <div className="comment" key={comment.postedBy + ': ' + comment.text}>
//             <h4>{comment.postedBy}</h4>
//             <p>{comment.text}</p>
//         </div>
//     ))}
//     </>
// );

// export default CommentsList;