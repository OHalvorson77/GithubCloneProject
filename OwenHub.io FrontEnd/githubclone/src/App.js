import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MenuBar from "./components/MenuBar"; // Import the MenuBar component
import logo from "./logo.svg";
import "./App.css";
import Overview from "./pages/overview";
import Repositories from "./pages/repositories";
import RepositoryDetail from "./pages/RepositoryDetail";
import GettingStarted from "./pages/feedback";
import TodoList from "./pages/To-do-list";



function App() {
  return (
    <Router>
      <div className="App">
        <MenuBar /> {/* Menu bar stays at the top */}
  
        <main>
          {/* Define routes for each page */}
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/repositories/:repoId" element={<RepositoryDetail />} />

            <Route path="/todo-list" element={<TodoList />} />
            <Route path="/help" element={<GettingStarted />} />

            
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
