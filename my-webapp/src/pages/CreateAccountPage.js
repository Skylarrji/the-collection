import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const CreateAccountPage = () => {
    const [email, setEmail] = useState(''); // defaults email to an empty string
    const [password, setPassword] = useState(''); // defaults password to an empty string
    const [confirmPassword, setConfirmPassword] = useState(''); // prompts the user to retype their password
    const [error, setError] = useState(''); // error variable for when the password is wrong/username doesn't exist (will only display if error is not an empty string)

    const navigate = useNavigate();

    const createAccount = async () => {
        try {
            if (password !== confirmPassword) {
                setError('Oh no! Your password and your confirmed password do not match!');
                return;
            }

            await createUserWithEmailAndPassword(getAuth(), email, password); // creates a new user
            navigate('/articles');
        }

        catch (e) {
            if (e.code === 'auth/email-already-in-use') {
                setError("A user already exists with this email.");
            }

            else if (e.code === 'auth/weak-password') {
                setError("Your password should be at least 6 characters long.");
            }

            else {
                setError(e.message);
            }
        }
    }
 
    return (
        <>
        <div className="centered-container">
        <h1>Create Account</h1>
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

        <input 
            type="password"
            placeholder="Re-enter Your Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)} />

        <div className="button-and-link-container">
            <button className="create-account-button" onClick={createAccount}>Create Account</button>
            <Link to="/login" className="link">Already have an account? Log in here!</Link>
        </div>
        </div>
        </>
    );
}

export default CreateAccountPage;