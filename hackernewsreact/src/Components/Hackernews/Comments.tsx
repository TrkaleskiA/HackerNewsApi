import React from 'react';
import './Comments.css'
interface CommentsProps {
    storyId: number;
    visibleComments: Set<number>;
    newComment: string;
    onCommentChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onCommentSubmit: () => void;
}

const Comments: React.FC<CommentsProps> = ({
    storyId,
    visibleComments,
    newComment,
    onCommentChange,
    onCommentSubmit
}) => {
    return (
        visibleComments.has(storyId) && (
            <div className="comments-section row">
                <div className="comment-input col-mb-4">
                    <textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={onCommentChange}
                    />
                    <button onClick={onCommentSubmit} className="submit-btn">Add Comment</button>
                </div> 
                <div className="comments-display col-mb-8">
                    <h1>Comments</h1>
                </div>
            </div>
        )
    );
};

export default Comments;
