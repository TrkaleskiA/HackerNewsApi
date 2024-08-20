import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Comments.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface Comment {
    id: number;
    text: string;
    by: string;
    time: number;
    kids?: Comment[];
    storyId?: number;
    commentId?: number;
}

interface CommentsProps {
    storyId: number;
    visibleComments: Set<number>;
    onCommentAdded: () => void; // Callback to refresh the comments or update descendants in the story
}

const Comments: React.FC<CommentsProps> = ({
    storyId,
    visibleComments,
    onCommentAdded
}) => {
    const [newComment, setNewComment] = useState<string>('');
    const [nickname, setNickname] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null); // Track which comment is being replied to
    const [replyText, setReplyText] = useState<string>(''); // Text for the reply
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
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

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:5234/api/Comment/byParentId/${storyId}`);
            console.log('Fetched comments:', response.data);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    useEffect(() => {
        if (visibleComments.has(storyId)) {
            fetchComments();
        }
    }, [storyId, visibleComments]);

    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewComment(event.target.value);
    };

    const handleCommentSubmit = async () => {
        if (newComment.trim() === '') return;

        try {
            await axios.post('http://localhost:5234/api/Comment', {
                text: newComment,
                by: nickname,
                storyId: storyId, // Ensure StoryId is set
                time: Math.floor(Date.now() / 1000)
            });

            // Call the callback to update the UI (descendants, kids)
            onCommentAdded();

            // Clear the textarea after submission
            setNewComment('');
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    const handleReplyClick = (parentId: number) => {
        setReplyToCommentId(parentId);
        setReplyText(''); // Clear previous reply text
    };

    const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReplyText(event.target.value);
    };

    const handleReplySubmit = async () => {
        if (replyText.trim() === '') return;

        try {
            await axios.post('http://localhost:5234/api/Comment', {
                text: replyText,
                by: nickname,
                storyId: storyId, // Ensure StoryId is set
                commentId: replyToCommentId, // Set the parent comment ID
                time: Math.floor(Date.now() / 1000)
            });

            // Call the callback to update the UI
            onCommentAdded();

            // Clear the reply textarea and reset replyToCommentId
            setReplyText('');
            setReplyToCommentId(null);
        } catch (error) {
            console.error('Error submitting reply:', error);
        }
    };

    const toggleRepliesVisibility = async (commentId: number) => {
        setExpandedComments(prev => {
            const newSet = new Set(prev);
            if (newSet.has(commentId)) {
                newSet.delete(commentId);
            } else {
                newSet.add(commentId);
                // Fetch replies if they are not already present
                fetchReplies(commentId);
            }
            return newSet;
        });
    };

    const fetchReplies = async (commentId: number) => {
        try {
            const response = await axios.get(`http://localhost:5234/api/Comment/byParentId/${commentId}`);
            setComments(prevComments => {
                return prevComments.map(comment =>
                    comment.id === commentId ? { ...comment, kids: response.data } : comment
                );
            });
        } catch (error) {
            console.error('Error fetching replies:', error);
        }
    };

    const renderComments = (comments: Comment[], depth = 0) => {
        return (
            <>
                {comments.map((comment) => {
                    const timeAgo = formatTime(comment.time);
                    const areRepliesVisible = expandedComments.has(comment.id);

                    return (
                        <div
                            key={comment.id}
                            className="comment"
                            data-id={comment.id}
                            style={{
                                marginLeft: `${depth * 20}px`,
                                borderLeft: '1px lightgray solid',
                                borderBottom: '1px #f8f6f6 solid',
                                padding: '10px',
                            }}
                        >
                            <div className="comment-header">
                                <span className="comment-author">{comment.by} </span>
                                <span className="comment-time">{timeAgo}</span>
                            </div>
                            <div className="comment-text">{comment.text}</div>
                            <div className="comment-actions">
                                {comment.kids && comment.kids.length > 0 && (
                                    <span
                                        className="replies-btn"
                                        onClick={() => toggleRepliesVisibility(comment.id)}
                                    >
                                        {areRepliesVisible ? `Hide Replies` : `Show Replies (${comment.kids.length})`}
                                    </span>
                                )}
                                <span className="reply-btn" onClick={() => handleReplyClick(comment.id)}>Reply</span>
                            </div>
                            {replyToCommentId === comment.id && (
                                <div className="reply-input">
                                    <textarea
                                        placeholder="Write your reply..."
                                        value={replyText}
                                        onChange={handleReplyChange}
                                    />
                                    <button onClick={handleReplySubmit} className="submit-btn">Submit Reply</button>
                                </div>
                            )}
                            <div className="replies-container" style={{ display: areRepliesVisible ? 'block' : 'none' }}>
                                {comment.kids && renderComments(comment.kids, depth + 1)}
                            </div>
                        </div>
                    );
                })}
            </>
        );
    };

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

    return (
        visibleComments.has(storyId) && (
            <div className="comments-section">
                <div className="comment-input">
                    <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={handleCommentChange}
                    />
                    <button onClick={handleCommentSubmit} className="submit-btn">Add Comment</button>
                </div>
                <div className="comments-display bg-white">
                    {renderComments(comments)}
                </div>
            </div>
        )
    );
};

export default Comments;
