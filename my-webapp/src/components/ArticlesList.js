import { Link } from 'react-router-dom';
import axios from 'axios';
import useUser from '../hooks/useUser';
import { useState, useEffect } from 'react'; // state allows react to store results of requests from the server

const ArticlesList = ({articles}) => { /* pass in articles as a prop to the reusable component*/
    const [articlesInfo, setArticlesInfo] = useState([]); // all articles
    const { user } = useUser();

    useEffect(() => { // runs every time the component is updated
        const loadArticlesInfo = async () => { // useEffect doesn't accept an async function as its first argument so you need to nest an async function inside its definition
            const token = user && await user.getIdToken(); // gets the user's auth id if it exists, token = null if the user's auth id doesn't exist
            const headers = token ? { authtoken: token } : {}; // sets headers to an empty object if the token is null
            const response = await axios.get(`/api/articles`, { headers }); // performs a get request to the url (remember to use backticks when referencing variables)
            const newArticleInfo = response.data; // fetches the data recieved from the get request for the specific article
            setArticlesInfo(newArticleInfo);
        }

        loadArticlesInfo();
        
    }); 

    return (
        <>
        {articlesInfo.map(article => (
            <Link key={article.name} className="article-list-item" to={`/articles/${article.name}`}> {/* use backticks and ${ } to convert a variable value to a string; you also need a unique key when displaying listed items using map in react */}
                <h3>{article.title}</h3>
                <p>{article.content.substring(0, 150)}...</p> {/* preview of first 150 chars of the first paragraph of the article */}
            </Link>
        

        ))}
        </>
    );
}

export default ArticlesList;