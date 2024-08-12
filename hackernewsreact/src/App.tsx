import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Components/Register';
import HackerNews from './Components/Hackernews/HackerNews';
import Login from './Components/Login';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/hackernews" element={<HackerNews />} />
            </Routes>
        </Router>
    );
}

export default App;