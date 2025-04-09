import { useState } from "react";
import './css/ToDo.css';

export default function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, name: "Build a personal portfolio website", completed: false },
    { id: 2, name: "Create a CLI tool for Git-like repo management", completed: false },
    { id: 3, name: "Develop an AI image classifier", completed: false },
  ]);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim() !== "") {
      const newTask = {
        id: Date.now(),
        name: newTodo.trim(),
        completed: false,
      };
      setTodos([...todos, newTask]);
      setNewTodo("");
    }
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="todo-container">
      <h1>To-Do List</h1>

      <div className="todo-input">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new task..."
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <p className="empty-list-message">No tasks to show!</p>
        ) : (
          todos.map((todo) => (
            <li key={todo.id}>
              <span
                className="todo-item"
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                  color: todo.completed ? "#6B7280" : "#1F2937",
                }}
              >
                {todo.name}
              </span>
              <div className="todo-actions">
                <button onClick={() => toggleComplete(todo.id)}>
                  {todo.completed ? "Undo" : "Complete"}
                </button>
                <button className="delete" onClick={() => deleteTodo(todo.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
