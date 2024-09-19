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
                descendants: type === 2 ? null : 0 
            };
            console.log('Submitting story:', story);

            // Post the story (poll or other)
            const storyResponse = await axios.post('http://localhost:5234/api/Story', story);
            const newStoryId = storyResponse.data.id; // Get the ID of the created story

            // If it's a poll, post the poll options (parts)
            if (type === 3 && parts.length >= 2) {
                const pollParts = parts.map(part => ({    
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
            
            const axiosError = error as AxiosError;
            console.error('Error adding story:', axiosError.response ? axiosError.response.data : axiosError.message);
        }
    };

    const fetchTopStoriesIds = async () => {
        const api = 'https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty';

        try {
            const response = await fetch(api);
            return await response.json();
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchComments = async (id:number) => {
        const api = `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`
        try {
            const response = await fetch(api);
            return await response.json();
        } catch (error) {
            console.log(`Error fetching data!`)
        }
    }

    const fetchTopStories = async (id:number) => {
        const api = `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`;
        try {
            const response = await fetch(api);
            return await response.json()
        } catch (error) {
            console.log(`Error fetching data!`)
        }
    }
    const mapApiTypeToBackendType = (type: string): number => {
        switch (type) {
            case 'story':
                return 1; 
            case 'poll':
                return 3; 
            case 'job':
                return 2; 
            default:
                return 1; 
        }
    }
    const fetchStories = async () => {
        const topStories = await fetchTopStoriesIds();
        //console.log(topStories);
        for (let i = 0; i < 10; i++) { 
            const story = await fetchTopStories(topStories[i]);
            console.log(story);
            if (story) {
                const storyObject = {
                    by: story.by || '',    
                    title: story.title || '',  
                    url: story.url || '',    
                    score: story.score || 0,   
                    time: story.time || 0,    
                    /*descendants: story.descendants, */  
                    type: mapApiTypeToBackendType(story.type || 'story'),  
                       
                };
                const kids = story.kids;
                console.log(storyObject)
                console.log(kids)

                try {
                    const response = await axios.post('http://localhost:5234/api/Story/fetchstories', storyObject);
                    console.log('Story successfully added:', response.data);
                } catch (error) {
                    console.error('Error adding story to the database:', error);
                }

                const lastStoryId = await axios.get('http://localhost:5234/api/Story/getlaststory');
                console.log(lastStoryId.data)
                

                for (let j = 0; j < /*kids.length*/ 5; j++) {
                    const comment = await fetchComments(kids[j])
                    console.log(comment);
                    if (comment) {
                        const commentObject = {
                            text: comment.text,
                            by: comment.by,
                            storyId: lastStoryId.data,
                            time: comment.time,
                            type: comment.type,
                            
                        };
                        console.log(commentObject);
                        console.log(comment.kids);
                        try {
                            const response = await axios.post('http://localhost:5234/api/Comment', commentObject);
                            console.log('Comment successfully added:', response.data);
                            const lastCommentId = await axios.get('http://localhost:5234/api/Comment/getlastcomment')
                            console.log(lastCommentId.data)
                            if (comment.kids && comment.kids.length > 0) {
                                await insertReplies(comment.kids, lastCommentId.data, lastStoryId.data);
                            }
                        } catch (error) {
                            console.error('Error adding comment to the database:', error);
                        }
                    };
                }

            }
            
        }
        

    }

    const insertReplies = async (replyIds: Array<number>, parentCommentId: number, storyId: number) => {
        for (let k = 0; k < /*replyIds.length*/ 5; k++) {
            const reply = await fetchComments(replyIds[k]);

            if (reply) {
                const replyObject = {
                    text: reply.text,
                    by: reply.by,
                    storyId: storyId,           // Link to the same story
                    commentId: parentCommentId, // Link to the parent comment
                    time: reply.time,
                    type: reply.type,
                };

                try {
                    const replyResponse = await axios.post('http://localhost:5234/api/Comment/addReply', replyObject);
                    console.log('Reply successfully added:', replyResponse.data);
                    const lastCommentId = await axios.get('http://localhost:5234/api/Comment/getlastcomment')
                    console.log(lastCommentId.data)
                    // Handle nested replies (reply.kids)
                    if (reply.kids && reply.kids.length > 0) {
                        await insertReplies(reply.kids, lastCommentId.data, storyId);
                    }
                } catch (error) {
                    console.error('Error adding reply to the database:', error);
                }
            }
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
                <button type="button" id="addStory" onClick={handleSubmit} disabled={!isValid}>Add Story</button>
                <button type="button" id="fetchStory" onClick={fetchStories} className={nickname.toLowerCase() == "admin" ? '' : 'hide'}> Fetch Stories</button>
            </form>
        </div>
    );
};

export default AddStory;
