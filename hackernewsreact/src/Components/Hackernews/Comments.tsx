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
            // Posting the comment
            await axios.post('http://localhost:5234/api/Comment', {
                text: newComment,
                by: nickname,
                parentId: storyId, // Comment belongs to this story or another comment
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

    const renderComments = (comments: Comment[]) => {
        return (
            <div>
                {comments.map(comment => (
                    <div key={comment.id} className="comment">
                        <p><strong>{comment.by}</strong> {formatTime(comment.time)}</p>
                        <p>{comment.text}</p>
                        {comment.kids && renderComments(comment.kids)} {/* Render replies */}
                    </div>
                ))}
            </div>
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
                <div className="comments-display">
                    <h1>Comments</h1>
                    {renderComments(comments)}
                </div>
            </div>
        )
    );
};

export default Comments;
