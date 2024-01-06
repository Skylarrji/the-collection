import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; /* need npm install react-router-dom to link the pages together w different urls (no {} allowed sometimes for comments) */
import NavBar from './NavBar';
import Footer from './Footer';
import HomePage from './pages/HomePage';
import AddArticlePage from './pages/AddArticlePage';
import EditArticlePage from './pages/EditArticlePage';
import ArticlesListPage from './pages/ArticlesListPage';
import MyArticlesPage from './pages/MyArticlesPage';
import ArticlePage from './pages/ArticlePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <div className="allButFooter">
        <NavBar />
        <div id="page-body">
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* homepage gets rendered when the site is localhost:3000/ (i.e. when path = "/", render the HomePage component) */}
            <Route path="/add-article" element={<AddArticlePage />} /> {/* addArticlepage gets rendered when the site is localhost:3000/add-article */}
            <Route path="/articles" element={<ArticlesListPage />} />
            <Route path="/articles/:articleId" element={<ArticlePage />} /> {/* articleId is a URL parameter that identifies a unique article */}
            <Route path="/articles/:articleId/edit" element={<EditArticlePage />} /> {/* articleId is a URL parameter that identifies a unique article */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/create-account" element={<CreateAccountPage />} />
            <Route path="/my-articles" element={<MyArticlesPage />} />
            <Route path="/404" element={<NotFoundPage />} /> {/* display the error page for all other paths */}
          </Routes>
        </div>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
