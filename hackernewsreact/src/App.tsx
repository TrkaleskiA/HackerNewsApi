import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './Components/Register';
import HackerNews from './Components/Hackernews/HackerNews';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register/>} />
                <Route path="/hackernews" element={<HackerNews/>} />
            </Routes>
        </Router>
    );
}

export default App;
