import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './Login.css';
import Cookies from 'js-cookie';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null); // Track username availability
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            navigate('/hackernews'); // Redirect to HackerNews.tsx if logged in
        }
    }, [navigate]);

    const checkUsernameAvailability = async () => {
        const response = await fetch(`http://localhost:5234/User/check-username/${username}`);
        if (response.ok) {
            const isAvailable = await response.json();
            setIsUsernameAvailable(isAvailable);
            setMessage(isAvailable ? 'Username is available.' : 'Username is already taken.');
        } else {
            setMessage('Failed to check username availability.');
        }
    };

    const handleRegister = async () => {
        if (isUsernameAvailable === false) {
            setMessage('Username is already taken. Please choose another username.');
            return;
        }

        const response = await fetch('http://localhost:5234/User/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, nickname }),
        });

        if (response.ok) {
            const data = await response.json();
            Cookies.set('user', JSON.stringify(data), { expires: 1 }); // Save user data in cookie for 1 day
            setMessage('Registration successful!');
            navigate('/login');
        } else {
            setMessage('Registration failed.');
        }
    };

    return (
        <>
            <Header/>
            <div>
                <h2 style={{ color: '#fc6025'}}>Register</h2>
                <h3>Username:<input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={checkUsernameAvailability} // Check username availability on blur
                /></h3>
                <h3>Password:<input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /></h3>
                <h3>Name:<input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                /></h3>
                <button onClick={handleRegister}>Register</button>
                {message && <p>{message}</p>}
            </div>
        </>
    );
};

export default Register;
