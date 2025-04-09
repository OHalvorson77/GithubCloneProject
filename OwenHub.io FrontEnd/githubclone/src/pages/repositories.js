import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./css/Repositories.css";

export default function Repositories() {
  const [repositories, setRepositories] = useState([]);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDesc, setNewRepoDesc] = useState("");

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const res = await fetch("http://localhost:5000/repositories");
      const data = await res.json();
      console.log(data);
      setRepositories(data);
    } catch (err) {
      console.error("Failed to fetch repositories:", err);
    }
  };

  const handleClone = (repoName) => {
    const cloneCommand = `owen clone ${repoName}`;
    navigator.clipboard.writeText(cloneCommand);
    alert(`Clone command copied! Run:\n\n${cloneCommand}`);
  };

  const handleCreateRepo = async () => {
    if (!newRepoName.trim()) {
      alert("Repository name is required!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/create-repo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRepoName, description: newRepoDesc }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`Repository '${newRepoName}' created!`);
        setNewRepoName("");
        setNewRepoDesc("");
        fetchRepositories(); // Refresh repo list
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Failed to create repository:", err);
    }
  };

  return (
    <div className="repositories-container">
      <h2>Repositories</h2>

     
      <div className="create-repo">
        <input
          type="text"
          placeholder="Repository Name"
          value={newRepoName}
          onChange={(e) => setNewRepoName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={newRepoDesc}
          onChange={(e) => setNewRepoDesc(e.target.value)}
        />
        <button onClick={handleCreateRepo}>Create Repository</button>
      </div>

      <ul className="repositories-list">
        {repositories.map((repo) => (
          <li key={repo.id} className="repository-item">
            <div className="repository-card">
            <h3>
  <Link to={`/repositories/${repo._id}`}>{repo.name}</Link>
</h3>
              <p>{repo.description}</p>
              <button class="clone-btn" onClick={() => handleClone(repo._id)}>Clone</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
