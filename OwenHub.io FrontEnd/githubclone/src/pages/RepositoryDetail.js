import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./css/repositoryDetail.css";

export default function RepositoryDetail() {
  const { repoId, repoName } = useParams();
  const [repository, setRepository] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [selectedFilePath, setSelectedFilePath] = useState("");
  const [visibleFiles, setVisibleFiles] = useState([]);


  const [comments, setComments] = useState([]);



  
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [userName, setUserName] = useState("");
  const [folderPath, setFolderPath] =useState("");

  const handleClone = (repoName) => {
    const cloneCommand = `owen clone ${repoName}`;
    navigator.clipboard.writeText(cloneCommand);
    alert(`Clone command copied! Run:\n\n${cloneCommand}`);
  };

  const submitComment = async () => {
    if (!userName || !newComment) return;
  
    const comment = {
      author: userName,
      rating: newRating,
      content: newComment,
      date: new Date().toISOString(),
    };

    console.log(comment);
  
    try {
      const res = await fetch(`http://localhost:5000/repositories/${repoId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      });
  
      if (res.ok) {
        const savedComment = await res.json(); 
        console.log(savedComment);// Assume backend returns the saved comment
        setComments((prev) => [savedComment, ...prev]);
        setNewComment("");
        setNewRating(5);
        setUserName("");
      } else {
        console.error("Failed to save comment");
      }
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  useEffect(() => {
    const updatedFiles = files
      .filter((file) => file.name.includes(folderPath))
      .map((file) => {
        
        const startIndex = file.name.indexOf(folderPath) + folderPath.length;
        const slicedFileName = file.name.slice(startIndex);
  
        console.log(folderPath);
        return { ...file, name: slicedFileName };
      });
  
    setVisibleFiles(updatedFiles);
  }, [folderPath, files]); // Re-run this effect whenever `folderPath` or `files` changes
  
  

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/repositories/${repoId}/comments`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
      }
    };
    
    fetchComments();

   

    
    const fetchRepoDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/repositories/${repoId}`);
        const data = await res.json();
        setRepository(data);
      } catch (err) {
        console.error("Failed to fetch repository details:", err);
      }
    };

    const fetchRepoFiles = async (path = "") => {
      try {
        const res = await fetch(`http://localhost:5000/repositories/${repoId}/files?path=${path}`);
        const data = await res.json();
        console.log(data);
        setFiles(data);
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };

    fetchRepoDetails();
    fetchRepoFiles(currentPath);
  }, [repoId, currentPath]);

  const handleFolderClick = (folderName) => {

    const index = folderName.indexOf("\\");
    const partUpToBackslash = folderName.slice(0, index + 1);
    setFolderPath(folderPath+partUpToBackslash);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };


  const commitFileChanges = async () => {
    
    console.log(selectedFile.name);
    console.log(selectedFile.content);
    try {
      const res = await fetch(`http://localhost:5000/repositories/${repoId}/file`, {
        method: "POST", // ✅ match backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath: currentPath,
          fileName: selectedFile.name,
          content: selectedFile.content,
        }),
      });
      
  
      if (res.ok) {
        alert("Changes committed!");
      } else {
        alert("Failed to commit changes");
      }
    } catch (err) {
      console.error("Commit failed", err);
      alert("Error while committing changes");
    }
  };
  

  if (!repository) {
    return <p>Repository not found!</p>;
  }


  console.log("Visible Files");
  console.log(visibleFiles);

  return (
    <div className="repository-detail-container">
      <h2>{repository.name}</h2>
      <button className="code-button" onClick={() => handleClone(repoId)}>Code</button>

      <div className="file-grid">
        {visibleFiles.map((file, index) => (
          <div key={index} className="file-item">
            {file.name.includes("\\") ? (
              <div className="folder-item" onClick={() => handleFolderClick(file.name)}>
                <span>📁 {file.name.split("\\")[0]}</span>
              </div>
            ) : (
              <div className="file-item-content" onClick={() => handleFileClick(file)}>
                <span>📄 {file.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedFile && (
  <div className="file-preview">
    <h3>Editing: {selectedFile.name}</h3>
    <textarea
      value={selectedFile.content}
      onChange={(e) =>
        setSelectedFile((prev) => ({ ...prev, content: e.target.value }))
      }
      rows={20}
      style={{
        width: "100%",
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "14px",
        padding: "1rem",
        marginBottom: "1rem"
      }}
    />
    <button onClick={commitFileChanges} className="commit-button">
      💾 Commit Changes
    </button>
  </div>
)}

      <div className="comments-section">
        <h3>⭐ Comments & Ratings</h3>

        <div className="comment-form">
          <input
            type="text"
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <textarea
            placeholder="Leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div>
            <label>Rating:</label>
            <select value={newRating} onChange={(e) => setNewRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} Star{n > 1 && "s"}
                </option>
              ))}
            </select>
          </div>
          <button onClick={submitComment}>Submit</button>
        </div>

        <ul className="comment-list">
          {comments.map((c, i) => (
            <li key={i}>
              <strong>{c.author}</strong> - {"⭐".repeat(c.rating)} ({c.rating}/5)
              <p>{c.content}</p>
              <small>{new Date(c.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
