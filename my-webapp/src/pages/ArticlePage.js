import { useState, useEffect } from 'react'; // state allows react to store results of requests from the server
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotFoundPage from './NotFoundPage';
import CommentsList from '../components/CommentsList';
import AddCommentForm from '../components/AddCommentForm';
import useUser from '../hooks/useUser';
import articles from './article-content';

const ArticlePage = () => {
    const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [], canUpvote: false }); // sets the default state for the component as well as its associated properties
    const { canUpvote } = articleInfo; 
    const { articleId } = useParams(); /* stores URL parameter as articleId */

    const { user, isLoading } = useUser(); // checks whether or not the user is logged in
    const navigate = useNavigate(); // variable to utilize when navigating to another page

    // useEffect(() => { // runs every time the component is updated
    //     const loadArticleInfo = async () => { // useEffect doesn't accept an async function as its first argument so you need to nest an async function inside its definition
    //         const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
    //         const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
    //         const response = await axios.get(`/api/articles/${articleId}`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
    //         const newArticleInfo = response.data; // fetches the data recieved from the get request for the specific article
    //         setArticleInfo(newArticleInfo);
    //     }
        
    //     if (!isLoading) { // only load the article info if the user is logged in 
    //         loadArticleInfo();
    //     }

    // }, [isLoading, user]); // dependencies for the useEffect hook

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

    const article = articles.find(article => article.name === articleId); /* returns the article json object whos name is the same as articleId */

    const addUpvote = async () => {
        const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
        const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
        await axios.put(`/api/articles/${articleId}/upvote`, null, { headers }); // sends a PUT request to the backend for adding a new upvote, second argument is null as it represents the req body
        const updated_response = await axios.get(`/api/articles/${articleId}`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
        const newArticleInfo = updated_response.data; // fetches the data recieved from the get request for the specific article
        setArticleInfo(newArticleInfo);
    }

    const removeUpvote = async () => {
        const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
        const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
        await axios.put(`/api/articles/${articleId}/remove-upvote`, null, { headers }); // sends a PUT request to the backend for adding a new upvote, second argument is null as it represents the req body
        const updated_response = await axios.get(`/api/articles/${articleId}`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
        const newArticleInfo = updated_response.data; // fetches the data recieved from the get request for the specific article
        setArticleInfo(newArticleInfo);
        console.log(newArticleInfo);
    }

    // if (!article) {
    //     return <NotFoundPage /> /* return error page if cannot find an article that matches */
    // } 
    console.log(articleInfo);

    return (
        <>
        <h1>{articleInfo.title}</h1>
        <div className="upvotes-section">
            <p>This article has {articleInfo.upvotes} upvote(s)!</p>
            {user ? 
                <button onClick={canUpvote ? addUpvote : removeUpvote}>{canUpvote ? 'Upvote!' : 'Remove Upvote'}</button>
                : <button onClick={() => { navigate('/login'); }}>Log in to upvote!</button>}
        </div>

        {/* {articleInfo.content.split('\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
        ))} */}

        <p>{articleInfo.content}</p>

        {user
            ? <AddCommentForm
                articleName={articleId}
                onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)} />
            : <button onClick={() => { navigate('/login'); }}>Log in to add a comment!</button>}
        <CommentsList comments={articleInfo.comments} articleName={articleId}onArticleUpdated={updatedArticle => setArticleInfo(updatedArticle)} />
        {articleInfo.comments.length === 0 && <p>Be the first to leave a comment!</p>}
        <div className="margin-div"></div>
        </>
    );
}

export default ArticlePage;


// import { useState, useEffect } from "react"; // state allows react to store results of requests from the server
// import { useParams } from "react-router-dom";
// import axios from 'axios';
// import articles from './article-content';
// import NotFoundPage from "./NotFoundPage";

// const ArticlePage = () => {
//     const [articleInfo, setArticleInfo] = useState({ upvotes: 0, comments: [] }); // sets the default state for the component as well as its associated properties
//     const { articleId } = useParams(); {/* stores URL parameter as articleId */}

//     useEffect(async () => { // runs every time the component is updated
//         const loadArticleInfo = async () => { // useEffect doesn't accept an async function as its first argument so you need to nest an async function inside its definition
//             const response = await axios.get(`http://localhost:8000/api/articles/${articleId}`); // performs a get request to the url (remember to use backticks when referencing variables)
//             const newArticleInfo = response.data; // fetches the data recieved from the get request for the specific article
//             setArticleInfo(newArticleInfo);
//         }

//         loadArticleInfo();
//     }, []); // useEffect is executed whenever the second argument (which is [] in this case) changes, but empty arrays never change so this useEffect will only run when the component is first mounted

//     const article = articles.find(article => article.name === articleId); {/* returns the article json object whos name is the same as articleId */}

        // const addUpvote = async () => {
        //     const response = await axios.put(`/api/articles/${articleId}/upvote`); // sends a PUT request to the backend for adding a new upvote
        // }

//     if (!article) {
//         return <NotFoundPage /> /* return error page if cannot find an article that matches */
//     }

//     return (
//         <> {/* need <> </> around everything if you need to return several element tags (e.g. <h1> and <p> tags) */}
//             <h1>{article.title}</h1>
//             <p>This article has {articleInfo.upvotes} upvote(s)!</p>
//             {article.content.map((paragraph, i) => (
//                 <p key={i}>{paragraph}</p> /* only use i as the key when the content is fixed */
//             ))}
//         </>
//     );
// }

// export default ArticlePage;