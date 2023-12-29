import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const LoginPage = () => {
    const [email, setEmail] = useState(''); // defaults email to an empty string
    const [password, setPassword] = useState(''); // defaults password to an empty string
    const [error, setError] = useState(''); // error variable for when the password is wrong/username doesn't exist (will only display if error is not an empty string)

    const navigate = useNavigate();

    const logIn = async () => {
        try {
            await signInWithEmailAndPassword(getAuth(), email, password); // tries logging in the user through firebase
            navigate('/articles'); // redirects the user to the articles page if successfully logged in
        } 

        catch (e) { // set the error message to what firebase outputs as an error
            if (e.code === 'auth/user-not-found') {
                setError('User not found. Please check your credentials or create an account.');
            } 
            
            else if (e.code === 'auth/wrong-password') {
                setError('Incorrect password. Please try again.');
            } 
            
            else {
                setError(e.message);
              }
        }

    }

    return (
        <>
        <div className="centered-container">
        <h1>Welcome back!</h1>
        {error && <p className="error">{error}</p>}
        <input 
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)} />
        <input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)} />
            <div className="button-and-link-container">
            <button className="login-button" onClick={logIn}>Log In</button>
            <Link to="/create-account" className="link">No account? Create one here!</Link>
            </div>
        </div>
        </>
    );
}

export default LoginPage;