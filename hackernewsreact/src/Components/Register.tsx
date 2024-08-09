import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './Login.css';

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async () => {
        const response = await fetch('http://localhost:5234/User/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, nickname }),
        });

        if (response.ok) {
            setMessage('Registration successful!');
            navigate('/hackernews'); // Redirect to HackerNews.tsx
        } else {
            setMessage('Registration failed.');
        }
    };

    const checkUsernameAvailability = async () => {
        const response = await fetch(`http://localhost:5234/User/check-username/${username}`);
        if (response.ok) {
            const isAvailable = await response.json();
            setMessage(isAvailable ? 'Username is available.' : 'Username is already taken.');
        }
    };

    return (
        <>
            <Header/>
            <div>
                <h2 style={{ color: 'orange'}}>Register</h2>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onBlur={checkUsernameAvailability} // Check username availability on blur
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                />
                <button onClick={handleRegister}>Register</button>
                {message && <p>{message}</p>}
            </div>
        </>
    );
};

export default Register;
