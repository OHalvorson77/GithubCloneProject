import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/CommentsList.css"; // <-- Import the CSS file

const categories = ["All", "General", "Bug", "Feature", "Feedback"];

const CommentsList = ({ repoId }) => {
  const [comments, setComments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredComments, setFilteredComments] = useState([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/repositories/commentsList`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };
    fetchComments();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredComments(comments);
    } else {
      setFilteredComments(comments.filter(c => c.category === selectedCategory));
    }
  }, [selectedCategory, comments]);

  return (
    <div className="comments-container">
      <h1 className="comments-title">Comments</h1>

      <div className="filter-container">
        <label className="filter-label">Filter by category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <ul className="comments-list">
        {filteredComments.length === 0 ? (
          <p className="no-comments">No comments to show.</p>
        ) : (
          filteredComments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.author}</span>
                <span className="comment-timestamp">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              <span className="comment-category">{comment.category}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CommentsList;
