import React, { useState } from "react";
import "./css/overviewC.css"; // Optional for additional styling

export default function Overview() {
  const [description, setDescription] = useState(""); // Store the editable description
  const [skills, setSkills] = useState(["JavaScript", "React", "Node.js"]); // Example skills

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const addSkill = (newSkill) => {
    setSkills([...skills, newSkill]);
  };

  return (
    <div className="overview">
    <div className="overview-container">
      <div className="profile-left">
        <img
          src="https://avatars.githubusercontent.com/u/113710013?v=4" // Placeholder for the profile picture
          alt="Profile"
          className="profile-picture"
        />
        <div className="profile-info">
          <h2 className="name">Owen Halvorson</h2>
          <p className="username">@owenhalvie</p>
          <p className="brief-description">
            A passionate software developer and open-source enthusiast.
          </p>
          <div className="metadata">
            <p>School: Unviersity of Ottawa</p>
            <p>Workplace: BMO</p>
          </div>
        </div>
      </div>
      <div className="profile-right">
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          className="description-textarea"
          placeholder="Write your detailed description here..."
        />
      </div>
      </div>
      
      {/* Bottom Row: Skills Section */}
      <div className="skills-section">
        
        <div className="skills-list">
          {skills.map((skill, index) => (
            <span key={index} className="skill">
              {skill}
            </span>
          ))}
          <button onClick={() => addSkill("New Skill")}>+</button>
        </div>
        
      </div>
    </div>
  );
}
