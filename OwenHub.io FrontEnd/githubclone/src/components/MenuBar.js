import { Link } from "react-router-dom";
import { Search, User } from "lucide-react";
import "./css/MenuBar.css"; // Import the CSS file

export default function MenuBar() {
  return (
      <nav className="menu-bar">
        <div className="menu-items">
          <Link to="/overview">Overview</Link>
          <Link to="/repositories">Repositories</Link>
          <Link to="/todo-list">To-Do List</Link>
          <Link to="/help">Help</Link>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search..." />
          <Search className="search-icon" size={16} />
        </div>
        <div className="banner-header">
        <h1 className="banner-title">
          Owen Hub <span className="dot-io">.io</span>
        </h1>
        <span className="username-tag">#owenhalvie</span>
      </div>
        <User className="profile-icon" size={24} />
      </nav>

  );
}
