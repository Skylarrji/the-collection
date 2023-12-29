import Typed from 'react-typed';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
    <>
        <div className="parent-container">
        <div className="child-left">
            <h1 className="heading">A place where anyone can share&nbsp;           
                <Typed
                loop
                typeSpeed={75}
                backSpeed={50}
                strings={['ideas.', 'recipes.', 'crafts.', 'activities.', 'anything.']}
                shuffle={false}
                backDelay={2500}
                fadeOut={false}
                fadeOutDelay={100}
                loopCount={0}
                showCursor
                cursorChar="|"
                smartBackspace={false}
                />
            </h1>
            <p className="subheading">
                Explore a world of possibilities – all while sharing and discovering anything you love.
            </p>
            <button className="big-button" onClick={() => { navigate('/create-account'); }}>GET STARTED</button>
        </div>

        <div className="child-right">
            <img src="scrapbook.png" alt="scrapbook" className="scrapbook" />
        </div>

        </div>
        </>
    );
}

export default HomePage;