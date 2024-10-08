import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Header from './Header';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
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
            Cookies.set('user', JSON.stringify(data), { expires: 1 }); // Save user data in cookie for 1 day
            navigate('/hackernews'); // Redirect to HackerNews.tsx
        } else {
            setMessage('Login failed. Please check your credentials.');
        }
    };

    return (
        <>
        <Header />
            <div>
                <h2 style={{ color: '#fc6025' }}>Login</h2>
                <h3>Username:<input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                /></h3>
            
                <h3>Password:<input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                /></h3>
            <button onClick={handleLogin}>Login</button>
            {message && <p>{message}</p>}
            </div>
        </>
    );
};

export default Login;
