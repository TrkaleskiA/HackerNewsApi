import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Check if the user is already logged in
        const nickname = Cookies.get('nickname');
        if (nickname) {
            navigate('/hackernews'); // Redirect to HackerNews.tsx if logged in
        }
    }, [navigate]);

    const handleLogin = async () => {
        const response = await fetch('http://localhost:5234/User/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            const data = await response.json();
            Cookies.set('nickname', data.nickname, { expires: 1 }); // Save nickname in cookie for 1 day
            navigate('/hackernews'); // Redirect to HackerNews.tsx
        } else {
            setMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;