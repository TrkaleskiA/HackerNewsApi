import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Components/Register';
import HackerNews from './Components/Hackernews/HackerNews';
import Login from './Components/Login';
import AddStory from './Components/Hackernews/AddStory';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/hackernews/:filterType" element={<HackerNews />} />
                <Route path="/hackernews" element={<HackerNews />} /> 
                <Route path="/addstory" element={<AddStory />} />
            </Routes>
        </Router>
    );
}

export default App;