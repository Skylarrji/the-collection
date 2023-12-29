import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import useUser from './hooks/useUser';

const NavBar = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    return (
        <>
        <nav>
            <div className="nav-left"> 
                <img src="logo.png" alt="logo" className="logo" onClick={() => { navigate('/'); }}/>
            </div>

            <ul>
                <li>
                    <Link to="/">Home</Link> {/* the Link component provided by react-router-dom allows for link navigation to the specified path as a prop when the inner text is clicked */}
                </li>
                <li>
                    <Link to="/about">About</Link> 
                </li>
                <li>
                    <Link to="/articles">Articles</Link> 
                </li>
            </ul>

            <div className="nav-right">
            {user ? <button onClick = {() => {
                signOut(getAuth());
            }}> Log Out </button> 
            : <button onClick={() => {
                navigate('/login');
            }}> Log In </button>}
            </div>

        </nav>
        </>
    );
}

export default NavBar;