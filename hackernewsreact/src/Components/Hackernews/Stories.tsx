import { useEffect, useState } from 'react';
import axios from 'axios';
import './Stories.css';

// Define the type for the filter
type FilterType = 'all' | 'hot' | 'show-hn' | 'ask-hn' | 'poll' | 'job' | 'starred';

interface Story {
    id: number;
    title: string;
    url: string;
    by: string;
    descendants: number;
    score: number;
    time: number;
    type: number; // Update type to number
}

// Update the component to accept the filter prop
interface StoriesProps {
    filter: FilterType;
}

const Stories = ({ filter }: StoriesProps) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get('http://localhost:5234/api/story') // Adjust the API URL as needed
            .then(response => {
                let filteredStories = response.data;

                // Apply the filter based on filter type
                switch (filter) {
                    case 'ask-hn':
                        filteredStories = response.data.filter((story: Story) => story.title.startsWith('Ask HN:'));
                        break;
                    case 'show-hn':
                        filteredStories = response.data.filter((story: Story) => story.title.startsWith('Show HN:'));
                        break;
                    case 'all':
                        // No additional filtering for 'all'
                        break;
                    case 'hot':
                        filteredStories = response.data.filter((story: Story) => story.type === 1);
                        break;
                    case 'poll':
                        filteredStories = response.data.filter((story: Story) => story.type === 3);
                        break;
                    case 'job':
                        filteredStories = response.data.filter((story: Story) => story.type === 2);
                        break;
                    case 'starred':
                        // Add any additional filtering logic for 'starred' if needed
                        break;
                }

                setStories(filteredStories);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching stories:', error);
                setError('Failed to load stories');
                setLoading(false);
            });
    }, [filter]); // Depend on filter to refetch when it changes

    if (loading) {
        return <div>Loading stories...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="list-all">
            {stories.length > 0 ? stories.map(story => (
                <div key={story.id} className="story d-flex flex-column mb-1" data-id={story.id}>
                    <div className="d-flex align-items-start bg-white p-3">
                        <img className="story-img me-3" src="photos/all.png" alt="Story Image" />
                        <div>
                            <p style={{ margin: 0 }}>{story.title}</p>
                            <div className="post-details" style={{ color: 'gray', fontSize: '0.9em' }}>
                                <span>
                                    <img src="photos/heart.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="Heart" />
                                    {story.score} points
                                </span> |
                                <span>
                                    <img src="photos/user.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="User" />
                                    {story.by}
                                </span> |
                                <span>
                                    <img src="photos/clock.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="Clock" />
                                    {new Date(story.time * 1000).toLocaleString()}
                                </span> |
                                <a href={story.url} target="_blank" rel="noopener noreferrer">
                                    {story.url}
                                </a>
                            </div>
                        </div>
                        <div className="comment-section ms-auto d-flex align-items-center">
                            <div style={{ display: 'inline' }} className="comment-btn" data-id={story.id}>
                                <img className="chat" src="photos/chat.png" alt="Chat" />
                                <p style={{ display: 'inline' }} className="comment-button mb-0">{story.descendants || 0} comments</p>
                            </div>
                            <img className="share ms-2" src="photos/share.png" alt="Share" />
                            <img className="star ms-2" src="photos/star.png" alt="Star" />
                        </div>
                    </div>
                    <div className="comments-container bg-white" style={{ display: 'block' }}></div>
                </div>
            )) : <p>No stories available</p>}
        </div>
    );
};

export default Stories;
