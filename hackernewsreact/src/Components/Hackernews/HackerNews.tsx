import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function HackerNews() {
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            const user = JSON.parse(userCookie);
            setNickname(user.nickname);
        } else {
            navigate('/login'); // Redirect to login if not logged in
        }
    }, [navigate]);

    const handleLogout = () => {
        Cookies.remove('user');
        navigate('/login');
    };

    return (
        <>
            <div>
                <p>Hello {nickname}!</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </>
    );
}

export default HackerNews;