import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AddStory: React.FC = () => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [type, setType] = useState(1); // Default type
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
        try {
            // Create the story object
            const story = {
                title,
                url,
                by: nickname,
                time: Math.floor(Date.now() / 1000),
                type,
                descendants: type === 2 ? null : 0 // Set descendants to null for Job type; 0 for Story and Poll
            };
            console.log('Submitting story:', story);

            // Post the story (poll or other)
            const storyResponse = await axios.post('http://localhost:5234/api/Story', story); // Adjust URL based on your API endpoint
            const newStoryId = storyResponse.data.id; // Get the ID of the created story

            // If it's a poll, post the poll options (parts)
            if (type === 3 && parts.length >= 2) {
                const pollParts = parts.map(part => ({    //TO TEST HERE POLL REQUIRED?
                    text: part.text,
                    type: 'pollopt',
                    pollId: newStoryId, // Set the pollId to the newly created story's ID
                    time: Math.floor(Date.now() / 1000),
                    by: nickname,
                    score: 0 // Initialize score to 0
                }));

                console.log('Submitting poll parts:', pollParts);

                // Post poll parts to the server
                await axios.post('http://localhost:5234/api/Part', pollParts);
            }

            // Redirect to HackerNews after adding story
            navigate('/hackernews');
        } catch (error) {
            // Cast the error to AxiosError to access response and other properties
            const axiosError = error as AxiosError;
            console.error('Error adding story:', axiosError.response ? axiosError.response.data : axiosError.message);
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
