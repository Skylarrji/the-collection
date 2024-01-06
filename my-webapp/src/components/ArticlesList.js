import { Link } from 'react-router-dom';
import axios from 'axios';
import useUser from '../hooks/useUser';
import { useState, useEffect } from 'react'; // state allows react to store results of requests from the server

const ArticlesList = ({articles, isMyArticles}) => { /* pass in articles as a prop to the reusable component*/
    const [articlesInfo, setArticlesInfo] = useState([]); // all articles
    const { user } = useUser();

    useEffect(() => { // runs every time the component is updated
        const loadArticlesInfo = async () => { // useEffect doesn't accept an async function as its first argument so you need to nest an async function inside its definition
            const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
            const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
            const response = await axios.get(`/api/articles`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
            let newArticlesInfo = response.data; // fetches the data recieved from the get request for all articles

            if (isMyArticles) { // isolate articles that the user has written if isMyArticles is true
                newArticlesInfo = user ? newArticlesInfo.filter(article => article.postedBy === user.email) : [];
            }
            setArticlesInfo(newArticlesInfo);
        }

        loadArticlesInfo();
    }); 

    const removeArticle = async (articleId) => { 
        const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
        const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
        await axios.delete(`/api/articles/${articleId}`, { headers });
        const response = await axios.get(`/api/articles`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
        const newArticleInfo = response.data; // fetches the data recieved from the get request for all articles
        setArticlesInfo(newArticleInfo);
    }

    return (
        <>
        {articlesInfo.length === 0 ? <h4>Write an article to fill this place up!</h4> : <></>}
        {articlesInfo.map(article => (
            <>
            <Link key={article.name} className="article-list-item" to={`/articles/${article._id}`}> {/* use backticks and ${ } to convert a variable value to a string; you also need a unique key when displaying listed items using map in react */}
                <h3>{article.title}</h3>
                {!isMyArticles ? <h4>Written by {article.postedBy}</h4> : <> </>} 
                <p>{article.content.substring(0, 150)}...</p> {/* preview of first 150 chars of the first paragraph of the article */}
                
                <div className="article-parent-container">
                <p className="article-child-container">{article.upvotes} {article.upvotes === 1 ? "Upvote" : "Upvotes"} </p>
                <p className="article-child-container">{article.comments.length} {article.comments.length === 1 ? "Comment" : "Comments"} </p>
                </div>
            </Link>
            <div className="buttons">
                {(user && user.email) === article.postedBy ? <button onClick={() =>  { if (window.confirm('Are you sure you wish to remove this article?')) removeArticle(article._id)} }>Remove Article</button> : <></>} 
                <Link key={article.name} to={`/articles/${article._id}/edit`}> {/* use backticks and ${ } to convert a variable value to a string; you also need a unique key when displaying listed items using map in react */}
                    {(user && user.email) === article.postedBy ? <button>Edit Article</button> : <></>}
                </Link>
            </div>
            <hr></hr>
            </>
        

        ))}
        </>
    );
}

export default ArticlesList;