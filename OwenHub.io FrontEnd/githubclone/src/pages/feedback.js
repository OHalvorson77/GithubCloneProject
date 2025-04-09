import React from "react";
import "./css/GettingStarted.css";

const GettingStarted = () => {
  return (
    <div className="getting-started-container">
      <h1 className="title">Getting Started</h1>
      <ol className="step-list">
        <li className="step">
          <h2 className="step-title">1. Create a repository</h2>
          <p className="step-description">
            Navigate to the <strong>Repositories</strong> tab and click <em>Create Repository</em>.
          </p>
        </li>
        <li className="step">
          <h2 className="step-title">2. Clone your repository</h2>
          <p className="step-description">
            Click on <strong>Clone</strong> and copy the provided command.
            <br />
            Run it inside the local directory where you want the repo folder.
            <br />
            It will be initialized with a <code>README.md</code>.
          </p>
        </li>
        <li className="step">
          <h2 className="step-title">3. Make and push changes</h2>
          <p className="step-description">
            Add or update files in the cloned folder.
            <br />
            Run: <code>owen push &lt;repoName&gt;</code> to push to the remote repository.
          </p>
        </li>
        <li className="step">
          <h2 className="step-title">4. Keep developing & get feedback</h2>
          <p className="step-description">
            Keep building! View comments and ratings from your peers in the <strong>Comments</strong> section of your repository.
            <br />
            <strong>Good luck!</strong> 🚀
          </p>
        </li>
      </ol>
    </div>
  );
};

export default GettingStarted;
