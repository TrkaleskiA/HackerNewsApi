import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AddStory: React.FC = () => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState(1)// default type
    const [parts, setParts] = useState<{ text: string }[]>([{ text: '' }, { text: '' }]);
    const [nickname, setNickname] = useState('');
    const [isValid, setIsValid] = useState(true);
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

    useEffect(() => {
        // Validate poll: must have at least 2 options
        const valid = type !== 3 || parts.length >= 2;
        setIsValid(valid);
    }, [type, parts]);

    const handlePartChange = (index: number, value: string) => {
        const newParts = [...parts];
        newParts[index].text = value;
        setParts(newParts);
    };

    const addPart = () => {
        setParts([...parts, { text: '' }]);
    };

    const removePart = (index: number) => {
        if (parts.length > 2) {
            const newParts = parts.filter((_, i) => i !== index);
            setParts(newParts);
        }
    };

    const handleSubmit = async () => {
        const story = {
            title,
            url,
            by: nickname,
            time: Math.floor(Date.now() / 1000),
            type,
            parts: type === 3 ? parts.map(part => ({ ...part, type: 'pollopt', pollId: 0 })) : [] // Adjust parts for poll options
        };
        console.log('Submitting story:', story);
        try {
            await axios.post('http://localhost:5234/api/Story', story); // Adjust URL based on your API endpoint
            navigate('/hackernews'); // Redirect to HackerNews after adding story
        } catch (error) {
            console.error('Error adding story:', error);
        }
    };

    return (
        <div>
            <h2>Add New Story</h2>
            <form>
                <div className="form-group">
                    <label htmlFor="title">Title:</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="url">URL:</label>
                    <input type="text" id="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="type">Type:</label>
                    <select id="type" value={type} onChange={(e) => setType(Number(e.target.value))}>
                        <option value={1}>Story</option>
                        <option value={2}>Job</option>
                        <option value={3}>Poll</option>
                    </select>
                </div>
                {type === 3 && (
                    <div>
                        <h4>Poll Options</h4>
                        {parts.map((part, index) => (
                            <div key={index} className="form-group">
                                <input
                                    type="text"
                                    value={part.text}
                                    onChange={(e) => handlePartChange(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                />
                                <button type="button" onClick={() => removePart(index)}>Remove</button>
                                {index === parts.length - 1 && <button type="button" onClick={addPart}>Add Option</button>}
                            </div>
                        ))}
                    </div>
                )}
                <button type="button" onClick={handleSubmit} disabled={!isValid}>Add Story</button>
            </form>
        </div>
    );
};

export default AddStory;
