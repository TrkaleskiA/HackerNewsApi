import { useEffect, useState } from 'react';
import axios from 'axios';
import './Stories.css';
import './Comments'
import Comments from './Comments';

// Define the type for the filter
type FilterType = 'all' | 'hot' | 'show-hn' | 'ask-hn' | 'poll' | 'job' | 'starred';
type TimePeriod = 'last-24h' | 'past-week' | 'past-month' | 'forever';
type SortType = 'date' | 'popularity';


interface Part {
    id: number;
    text: string;
    pollId: number;
    score: number;
    time: number;
    by: string;
    type: string;
}
interface Story {
    id: number;
    title: string;
    url: string;
    by: string;
    descendants: number;
    score: number;
    time: number;
    type: number; // Update type to number
    parts?: Part[];
}

// Update the component to accept the filter prop
interface StoriesProps {
    filter: FilterType;
    timePeriod: TimePeriod;
    sort: SortType;
}

const formatTime = (timestamp: number) => {
    const now = Date.now() / 1000;
    let diff = Math.floor(now - timestamp);

    const units = [
        { label: 'second', value: 60 },
        { label: 'minute', value: 60 },
        { label: 'hour', value: 24 },
        { label: 'day', value: 30 },
        { label: 'month', value: 12 },
        { label: 'year', value: Number.MAX_SAFE_INTEGER }
    ];

    for (let i = 0; i < units.length; i++) {
        if (diff < units[i].value) {
            return `${diff} ${units[i].label}${diff > 1 ? 's' : ''} ago`;
        }
        diff = Math.floor(diff / units[i].value);
    }

    return 'a long time ago';
};

const Stories = ({ filter, timePeriod, sort }: StoriesProps) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedStories, setLikedStories] = useState<Set<number>>(new Set());
    const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set());
    const [visiblePolls, setVisiblePolls] = useState<Set<number>>(new Set());
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

                const currentTime = Date.now() / 1000; // Get current time in seconds
                console.log(currentTime)
                switch (timePeriod) {
                    case 'last-24h':
                        filteredStories = filteredStories.filter((story: Story) => currentTime - story.time <= 86400);
                        break;
                    case 'past-week':
                        filteredStories = filteredStories.filter((story: Story) => currentTime - story.time <= 604800);
                        break;
                    case 'past-month':
                        filteredStories = filteredStories.filter((story: Story) => currentTime - story.time <= 2592000);
                        break;
                    case 'forever':
                        // No additional filtering for 'forever'
                        break;
                }

                if (sort === 'date') {
                    filteredStories.sort((a: Story, b: Story) => b.time - a.time);
                } else if (sort === 'popularity') {
                    filteredStories.sort((a: Story, b: Story) => b.score - a.score);
                }

                console.log('Stories after time period filtering:', filteredStories);
                setStories(filteredStories);
                setLoading(false);


                const fetchPollParts = async () => {
                    const updatedStories = await Promise.all(filteredStories.map(async (story: Story) => {
                        if (story.type === 3) {
                            // Fetch parts for this poll
                            const partsResponse = await axios.get(`http://localhost:5234/api/Part/byPollId/${story.id}`);
                            return { ...story, parts: partsResponse.data };
                        }
                        return story;
                    }));
                    setStories(updatedStories);
                    setLoading(false);
                };

                fetchPollParts();
            })





            .catch(error => {
                console.error('Error fetching stories:', error);
                setError('Failed to load stories');
                setLoading(false);
            });
    }, [filter, timePeriod, sort]); // Depend on filter to refetch when it changes

    const handleHeartClick = (storyId: number) => {
        setLikedStories(prevLikedStories => {
            const newLikedStories = new Set(prevLikedStories);
            if (newLikedStories.has(storyId)) {
                newLikedStories.delete(storyId);
                setStories(prevStories => prevStories.map(story =>
                    story.id === storyId ? { ...story, score: story.score - 1 } : story
                ));
            } else {
                newLikedStories.add(storyId);
                setStories(prevStories => prevStories.map(story =>
                    story.id === storyId ? { ...story, score: story.score + 1 } : story
                ));
            }
            return newLikedStories;
        });
    };

    const handleCommentClick = (storyId: number) => {
        setVisibleComments(prev => {
            const newVisibleComments = new Set(prev);
            if (newVisibleComments.has(storyId)) {
                newVisibleComments.delete(storyId);
            } else {
                newVisibleComments.add(storyId);
            }
            return newVisibleComments;
        });
    };

    const handleCommentAdded = () => {
        setStories(prevStories => prevStories.map(story => {
            if (visibleComments.has(story.id)) {
                return { ...story, descendants: story.descendants + 1 };
            }
            return story;
        }));
    };


    const handlePollClick = (storyId: number) => { 
        setVisiblePolls(prev => {
            const newVisiblePolls = new Set(prev);
            if (newVisiblePolls.has(storyId)) {
                newVisiblePolls.delete(storyId);
            } else {
                newVisiblePolls.add(storyId);
            }
            return newVisiblePolls;
        });
    };

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
                                    <img
                                        className={`heart ${likedStories.has(story.id) ? 'active' : ''}`}
                                        src="photos/heart.png"
                                        alt="Heart"
                                        onClick={() => handleHeartClick(story.id)}
                                    />
                                    {story.score} points
                                </span> |
                                <span>
                                    <img src="photos/user.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="User" />
                                    {story.by}
                                </span> |
                                <span>
                                    <img src="photos/clock.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="Clock" />
                                    {formatTime(story.time)}
                                </span> |
                                <a href={story.url} target="_blank" rel="noopener noreferrer">
                                    {story.url}
                                </a>
                            </div>
                            
                        </div>
                   
                        {visiblePolls.has(story.id) && story.parts && (
                            <div className="poll-options bg-light p-3">
                                <h6>Poll Options:</h6>
                                <ul>
                                    {story.parts.map(part => (
                                        <li key={part.id}>
                                            <strong>{part.text}</strong> - {part.score} points
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <div className="ms-auto d-flex align-items-center">
                            {story.type === 3 && (
                                <button className="btn btn-outline-primary ms-2" onClick={() => handlePollClick(story.id)}>
                                    {visiblePolls.has(story.id) ? 'Hide Polls' : 'Polls'}
                                </button>
                            )}
                        </div>
                        <div className="comment-section ms-auto d-flex align-items-center">
                            <div style={{ display: 'inline' }} className="comment-btn" onClick={() => handleCommentClick(story.id)}>
                                <img className="chat" src="photos/chat.png" alt="Chat" />
                                <p style={{ display: 'inline' }} className="comment-button mb-0">{story.descendants || 0} comments</p>
                            </div>
                            <img className="share ms-2" src="photos/share.png" alt="Share" />
                            <img className="star ms-2" src="photos/star.png" alt="Star" />
                        </div>
                    </div>
                    <Comments
                        storyId={story.id}
                        visibleComments={visibleComments}
                        onCommentAdded={handleCommentAdded}
                    />
                </div>

            )) : <div>No stories found</div>}
        </div>
    );
};

export default Stories;
