import { useEffect, useState } from 'react';
import axios from 'axios';
import './Stories.css';
import Comments from './Comments';
import Options from './Options';
import Cookies from 'js-cookie';

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
    type: number;
    parts?: Part[];
}

// Update the component to accept the filter prop
interface StoriesProps {
    filter: FilterType;
    timePeriod: TimePeriod;
    sort: SortType;
    searchQuery: string;
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

const getUserIdFromCookie = (): string | undefined => {
    return Cookies.get('userId');
};

const Stories = ({ filter, timePeriod, sort, searchQuery }: StoriesProps) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedStories, setLikedStories] = useState<Set<number>>(new Set());
    const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set());
    const [error, setError] = useState('');
    const [selectedPollOption, setSelectedPollOption] = useState<Record<number, number | null>>({});
    const [visiblePolls, setVisiblePolls] = useState<Set<number>>(new Set());


    useEffect(() => {
        axios.get('http://localhost:5234/api/story')
            .then(response => {
                console.log(response.data)
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

                const currentTime = Date.now() / 1000;
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

                filteredStories = filteredStories.filter((story: Story) =>
                    story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    story.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    story.by.toLowerCase().includes(searchQuery.toLowerCase())
                );

                const fetchPollParts = async () => {
                    const updatedStories = await Promise.all(filteredStories.map(async (story: Story) => {
                        if (story.type === 3) {
                            const partsResponse = await axios.get(`http://localhost:5234/api/Part/byPollId/${story.id}`);
                            return { ...story, parts: partsResponse.data };
                        }
                        return story;
                    }));
                    setStories(updatedStories);
                };

                fetchPollParts();
            })
            .catch(error => {
                console.error('Error fetching stories:', error);
                setError('Failed to load stories');
            })
            .finally(() => setLoading(false));
    }, [filter, timePeriod, sort, searchQuery]);

    useEffect(() => {
        const fetchLikedStories = async () => {
            const userId = getUserIdFromCookie();
            if (userId) {
                try {
                    const response = await fetch(`/api/story/liked/${userId}`);
                    const likedStoryIds = await response.json();
                    setLikedStories(new Set(likedStoryIds));
                } catch (error) {
                    console.error('Error fetching liked stories:', error);
                }
            }
        };

        fetchLikedStories();
    }, []);

    const toggleLikeStory = async (storyId: number) => {
        const userId = getUserIdFromCookie();
        if (userId) {
            await fetch('/api/story/like', {
                method: 'POST',
                body: JSON.stringify({ userId, storyId }),
                headers: { 'Content-Type': 'application/json' }
            });
            fetchLikedStories(); // Refresh liked stories after action
        }
    };

    const fetchLikedStories = async () => {
        const userId = getUserIdFromCookie();
        if (userId) {
            try {
                const response = await fetch(`/api/story/liked/${userId}`);
                const likedStoryIds: number[] = await response.json();
                setLikedStories(new Set(likedStoryIds));
            } catch (error) {
                console.error('Error fetching liked stories:', error);
            }
        }
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

    const handleCommentAdded = (storyId: number) => {
        setStories(prevStories =>
            prevStories.map(story => {
                if (story.id === storyId) {
                    return { ...story, descendants: story.descendants + 1 };
                }
                return story;
            })
        );
    };

    const handlePollClick = (storyId: number) => {
        setVisiblePolls((prev: Set<number>) => {
            const newVisiblePolls = new Set(prev);
            if (newVisiblePolls.has(storyId)) {
                newVisiblePolls.delete(storyId);
            } else {
                newVisiblePolls.add(storyId);
            }
            return newVisiblePolls;
        });
    };

    const handlePollOptionChange = async (pollId: number, optionId: number) => {
        setSelectedPollOption(prevSelected => {
            const previousOptionId = prevSelected[pollId];

            if (previousOptionId !== undefined) {
                return prevSelected; // Prevent multiple votes
            }

            const newSelected = { ...prevSelected, [pollId]: optionId };

            // Optimistically update the UI
            setStories(prevStories => prevStories.map(story => {
                if (story.id === pollId && story.parts) {
                    return {
                        ...story,
                        parts: story.parts.map(part => {
                            if (part.id === optionId) {
                                return { ...part, score: part.score + 1, disabled: false };
                            } else {
                                return { ...part, disabled: true };
                            }
                        })
                    };
                }
                return story;
            }));

            // Call the API to update the score in the database
            axios.post(`http://localhost:5234/api/Part/vote/${optionId}`)
                .then(response => {
                    console.log("Vote recorded successfully", response.data);
                })
                .catch(error => {
                    console.error("Error recording vote:", error);
                });

            return newSelected;
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
                        <img className="story-img me-3" src="../photos/all.png" alt="Story Image" />
                        <div>
                            <p style={{ margin: 0 }}>{story.title}</p>
                            <div className="post-details" style={{ color: 'gray', fontSize: '0.9em' }}>
                                <span>
                                    <img
                                        className={`heart ${likedStories.has(story.id) ? 'active' : ''}`}
                                        src="../photos/heart.png"
                                        alt="Heart"
                                        onClick={() => toggleLikeStory(story.id)}
                                    />
                                    {story.score} points
                                </span> |
                                <span>
                                    <img src="../photos/user.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="User" />
                                    {story.by}
                                </span> |
                                <span>
                                    <img src="../photos/clock.png" style={{ width: '15px', verticalAlign: 'middle', marginRight: '5px' }} alt="Clock" />
                                    {formatTime(story.time)}
                                </span> |
                                <a href={story.url} target="_blank" rel="noopener noreferrer">
                                    {story.url}
                                </a>
                            </div>

                        </div>


                        <div className="ms-auto d-flex align-items-center">
                            {story.type === 3 && (
                                <div className="ms-auto d-flex align-items-center">
                                    <button
                                        className="vote-button"
                                        onClick={() => handlePollClick(story.id)}
                                    >
                                        Vote
                                    </button>
                                    {visiblePolls.has(story.id) && (
                                        <Options
                                            pollId={story.id}
                                            options={story.parts || []}
                                            selectedOption={selectedPollOption[story.id] || null}
                                            onOptionSelect={(optionId) => handlePollOptionChange(story.id, optionId)}
                                            onClose={() => handlePollClick(story.id)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="comment-section ms-auto d-flex align-items-center">
                            <div style={{ display: 'inline' }} className="comment-btn" onClick={() => handleCommentClick(story.id)}>
                                <img className="chat" src="../photos/chat.png" alt="Chat" />
                                <p style={{ display: 'inline' }} className="comment-button mb-0">{story.descendants || 0} comments</p>
                            </div>
                            <img className="share ms-2" src="../photos/share.png" alt="Share" />
                            <img className="star ms-2" src="../photos/star.png" alt="Star" />
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
