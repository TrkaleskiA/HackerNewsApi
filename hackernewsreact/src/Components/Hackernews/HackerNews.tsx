import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import HackerNewsHeader from './HackerNewsHeader'; // Import the new header
import Sidebar from './Sidebar';
import './HackerNews.css';
import Topbar from './Topbar';
import Stories from './Stories';



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
            <HackerNewsHeader />
            <div className="container-fluid body">
                <div className="row">
                    <div className="col-lg-2 col-md-3 col-sm-12 mb-3 pt-3 div-list">
                        <Sidebar />
                    </div>
                    <div className="col-lg-10 col-md-9 col-sm-12 main-div">
                        <Topbar />
                        <Stories/>
                    </div>

                </div>
            </div>
            
            <div>
                <p>Hello {nickname}!</p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </>
    );
}

export default HackerNews;
