import { Link } from 'react-router-dom';
import './Header.css'; // Create a CSS file for styling

const Header = () => {
    return (
        <nav className="navbar navbar-expand-lg">
            <div className="container-fluid d-flex align-items-center">
                <img style={{ width: '15%' }} src="photos/logo.png" alt="Hacker News Logo" />
                <div className="ml-auto">
                    <Link to="/login" className="btn btn-primary mx-2">Login</Link>
                    <Link to="/register" className="btn btn-secondary mx-2">Register</Link>
                </div>
            </div>
        </nav>
    );
};

export default Header;
