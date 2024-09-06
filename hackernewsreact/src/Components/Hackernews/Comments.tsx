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
    kids?: number[]; // Array of IDs
    storyId?: number;
    commentId?: number;
}

interface CommentsProps {
    storyId: number;
    visibleComments: Set<number>;
    onCommentAdded: (storyId: number) => void;
}

const Comments: React.FC<CommentsProps> = ({ storyId, visibleComments, onCommentAdded }) => {
    const [newComment, setNewComment] = useState<string>('');
    const [nickname, setNickname] = useState('');
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsMap, setCommentsMap] = useState<Map<number, Comment[]>>(new Map());
    const [repliesMap, setRepliesMap] = useState<Map<number, Comment[]>>(new Map());
    const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<string>('');
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userCookie = Cookies.get('user');
        if (userCookie) {
            const user = JSON.parse(userCookie);
            setNickname(user.nickname);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchComments = async () => {
        if (commentsMap.has(storyId)) return; // Skip fetching if already loaded

        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5234/api/Comment/byParentId/${storyId}`);
            setCommentsMap(prevMap => {
                const updatedMap = new Map(prevMap);
                updatedMap.set(storyId, response.data);
                return updatedMap;
            });
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
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
            const response = await axios.post('http://localhost:5234/api/Comment', {
                text: newComment,
                by: nickname,
                storyId: storyId,
                time: Math.floor(Date.now() / 1000)
            });

            setComments(prevComments => [...prevComments, response.data]);
            setNewComment('');
            onCommentAdded(storyId);
        } catch (error) {
            console.error('Error submitting comment:', error);
        }
    };

    useEffect(() => {
        // Debugging to ensure that replyToCommentId is being set correctly
        if (replyToCommentId !== null && replyToCommentId > 0) {
            console.log(`Replying to comment with id: ${replyToCommentId}`);
        }
    }, [replyToCommentId]);

    const handleReplyClick = (parentId: number) => {
        // Make sure we set the correct reply ID, regardless of new/old comment
        console.log('Setting replyToCommentId:', parentId);
        setReplyToCommentId(parentId);
        setReplyText('');
    };

    const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReplyText(event.target.value);
    };

    const handleReplySubmit = async () => {
        if (replyText.trim() === '' || replyToCommentId === null) return;

        console.log('Submitting reply with storyId:', storyId);
        console.log('Submitting reply with CommentId:', replyToCommentId);

        try {
            // Post reply to the API
            const response = await axios.post('http://localhost:5234/api/Comment/addReply', {
                text: replyText,
                by: nickname,
                storyId: storyId,
                commentId: replyToCommentId, // Ensure this is correct
                time: Math.floor(Date.now() / 1000),
            });

            const newReply = response.data;

            // Update the replies state with the new reply
            setRepliesMap(prevMap => {
                const updatedMap = new Map(prevMap);
                const replies = updatedMap.get(replyToCommentId) || [];
                updatedMap.set(replyToCommentId, [...replies, newReply]);
                return updatedMap;
            });

            // Update the parent comment's kids list
            setComments(prevComments => prevComments.map(comment => {
                if (comment.id === replyToCommentId) {
                    return {
                        ...comment,
                        kids: [...(comment.kids || []), newReply.id]
                    };
                }
                return comment;
            }));

            // Ensure descendants count is updated
            await onCommentAdded(storyId);

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
                if (!repliesMap.has(commentId)) {
                    fetchReplies(commentId);
                }
            }
            return newSet;
        });
    };

    const fetchReplies = async (commentId: number) => {
        try {
            const response = await axios.get(`http://localhost:5234/api/Comment/replies/byParentId/${commentId}`);
            setRepliesMap(prevMap => {
                const updatedMap = new Map(prevMap);
                updatedMap.set(commentId, response.data);
                return updatedMap;
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
                    const replies = repliesMap.get(comment.id) || [];

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
                                {renderComments(replies, depth + 1)}
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
                {loading ? <div>Loading comments...</div> : (
                    <div className="comments-display bg-white">
                        {renderComments(comments)}
                    </div>
                )}
            </div>
        )
    );
};

export default Comments;