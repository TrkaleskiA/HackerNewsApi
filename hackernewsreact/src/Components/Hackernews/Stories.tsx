import axios from 'axios';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';
import Comments from './Comments';
import Options from './Options';
import './Stories.css';

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
    const userCookie = Cookies.get('user');
    return userCookie ? JSON.parse(userCookie).id : undefined;
};


const Stories = ({ filter, timePeriod, sort, searchQuery }: StoriesProps) => {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedStories, setLikedStories] = useState<Set<number>>(new Set());
    const [visibleComments, setVisibleComments] = useState<Set<number>>(new Set());
    const [error, setError] = useState('');
    const [selectedPollOption, setSelectedPollOption] = useState<Record<number, number | null>>({});
    const [visiblePolls, setVisiblePolls] = useState<Set<number>>(new Set());
    const [votedOptions, setVotedOptions] = useState<Set<number>>(new Set());
    const [starredStories, setStarredStories] = useState<Set<number>>(new Set());


    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await axios.get('http://localhost:5234/api/story');
                let filteredStories = response.data;

                const userId = getUserIdFromCookie();

                // Fetch liked stories if user is logged in
                if (userId) {
                    const likedStoriesResponse = await fetch(`http://localhost:5234/api/story/likedstories/${userId}`);
                    if (likedStoriesResponse.ok) {
                        const likedStoryIds: number[] = await likedStoriesResponse.json();
                        setLikedStories(new Set(likedStoryIds));
                    }

                    const votedOptionsResponse = await fetch(`http://localhost:5234/api/part/votedpolls/${userId}`)
                    if (votedOptionsResponse.ok) {
                        const votedoptionsIds: number[] = await votedOptionsResponse.json();
                        setVotedOptions(new Set(votedoptionsIds));
                    }

                    const starredStoriesResponse = await fetch(`http://localhost:5234/api/story/starredstories/${userId}`)
                    if (starredStoriesResponse.ok) {
                        const starredStoryIds: number[] = await starredStoriesResponse.json();
                        setStarredStories(new Set(starredStoryIds));
                    }
                }


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
                        filteredStories = response.data.filter((story: Story) => story.type === 1); //story type 1 are stories
                        break;
                    case 'poll':
                        filteredStories = response.data.filter((story: Story) => story.type === 3);
                        break;
                    case 'job':
                        filteredStories = response.data.filter((story: Story) => story.type === 2);
                        break;
                    case 'starred':
                        // Add any additional filtering logic for 'starred' if needed
                        filteredStories = response.data.filter((story: Story) => starredStories.has(story.id));
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


                // Fetch poll parts
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
            } catch (error) {
                console.error('Error fetching stories:', error);
                setError('Failed to load stories');
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, [filter, timePeriod, sort, searchQuery]);

 


    const toggleLikeStory = async (storyId: number) => {
        const userId = getUserIdFromCookie();
        if (userId) {
            try {
                // Make the POST request to toggle the like status
                const formData = new URLSearchParams();
                formData.append('userId', userId);
                formData.append('storyId', storyId.toString());

                const response = await fetch('http://localhost:5234/api/story/like', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString(),
                });

                if (response.ok) {
                    // Fetch the user's liked stories from the backend
                    
                    const likedStoriesResponse = await fetch(`http://localhost:5234/api/story/likedstories/${userId}`);
                    if (likedStoriesResponse.ok) {
                        const likedStoryIds: number[] = await likedStoriesResponse.json();
                        const isLiked = likedStoryIds.includes(storyId);

                        // Update the liked stories set
                        setLikedStories(new Set(likedStoryIds));

                        // Update the stories with the new score
                        setStories(prevStories =>
                            prevStories.map(story =>
                                story.id === storyId
                                    ? {
                                        ...story,
                                        score: isLiked ? story.score + 1 : story.score - 1
                                    }
                                    : story
                            )
                        );
                    }
                } else {
                    console.error('Failed to toggle like status');
                }
            } catch (error) {
                console.error('Error toggling like status:', error);
            }
        }
    };


    const toggleStarStory = async (storyId: number) => {
        const userId = getUserIdFromCookie();
        if (userId) {
            try {
                
                const formData = new URLSearchParams();
                formData.append('userId', userId);
                formData.append('storyId', storyId.toString());

                const response = await fetch('http://localhost:5234/api/story/star', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString(),
                });

                if (response.ok) {
               

                    const starredStoriesResponse = await fetch(`http://localhost:5234/api/story/starredstories/${userId}`);
                    if (starredStoriesResponse.ok) {
                        const starredStoryIds: number[] = await starredStoriesResponse.json();
                        //const isStarred = starredStoryIds.includes(storyId);
                        console.log(starredStoryIds)
                       
                        setStarredStories(new Set(starredStoryIds));

                    }
                } else {
                    console.error('Failed to toggle star status');
                }
            } catch (error) {
                console.error('Error toggling star status:', error);
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



    const toggleVoteStory = async (pollId: number, optionId: number) => {
        const userId = getUserIdFromCookie();
        if (userId) {
            try {
                // Make the POST request to toggle the vote status
                const formData = new URLSearchParams();
                formData.append('userId', userId);
                formData.append('optionId', optionId.toString());

                const response = await fetch('http://localhost:5234/api/Part/vote', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: formData.toString(),
                });

                if (response.ok) {
                    // Fetch the user's voted options from the backend
                    const voteOptionsResponse = await fetch(`http://localhost:5234/api/part/votedpolls/${userId}`);
                    if (voteOptionsResponse.ok) {
                        const votedOptionIds: number[] = await voteOptionsResponse.json();
                        setVotedOptions(new Set(votedOptionIds));
                        
                        // Update the UI based on whether the option is voted
                        const isVoted = votedOptionIds.includes(optionId);

                        // Update the options and their scores
                        setStories(prevStories =>
                            prevStories.map(story =>
                                story.id === pollId
                                    ? {
                                        ...story,
                                        parts: story.parts?.map(part =>
                                            part.id === optionId
                                                ? {
                                                    ...part,
                                                    score: isVoted ? part.score + 1 : part.score - 1,
                                                }
                                                : part
                                        )
                                    }
                                    : story
                            )
                        );

                        // Update the selected options state
                        setSelectedPollOption(prev => ({
                            ...prev,
                            [pollId]: isVoted ? null : optionId
                        }));
                    }
                } else {
                    console.error('Failed to toggle vote status');
                }
            } catch (error) {
                console.error('Error toggling vote status:', error);
            }
        }
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
                                            onOptionSelect={(optionId) => toggleVoteStory(story.id, optionId)}
                                            onClose={() => handlePollClick(story.id)}
                                            votedOptions={votedOptions}
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
                            <img
                                className={`star ${starredStories.has(story.id) ? 'starred' : ''}`} 
                                src="../photos/star.png" alt="Star"
                                onClick={() => toggleStarStory(story.id)}
                            />
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
