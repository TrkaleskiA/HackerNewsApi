import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Comments.css';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
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

    return (
        visibleComments.has(storyId) && (
            <div className="comments-section row">
                <div className="comment-input col-mb-4">
                    <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={handleCommentChange}
                    />
                    <button onClick={handleCommentSubmit} className="submit-btn">Add Comment</button>
                </div>
                <div className="comments-display col-mb-8">
                    <h1>Comments</h1>
                    {/* Display comments here */}
                </div>
            </div>
        )
    );
};

export default Comments;
