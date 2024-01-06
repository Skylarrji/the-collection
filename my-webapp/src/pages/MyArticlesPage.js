import ArticlesList from '../components/ArticlesList';
import articles from './article-content';

const MyArticlesPage = () => {
    return (
        <>
        <h1>Articles</h1>
        <ArticlesList articles={articles} isMyArticles={true} />
        <div className="margin-div"></div>
        </>
    );
}

export default MyArticlesPage;
