"use client";

import { useEffect, useMemo, useState } from "react";

const API_PATH = "/api/todos";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      setError("");
      const response = await fetch(API_PATH);
      if (!response.ok) throw new Error("Could not load your tasks");
      setTodos(await response.json());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function createTodo(event) {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;

    try {
      setSaving(true);
      setError("");
      const response = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      });
      if (!response.ok) throw new Error("Could not create this task");
      const newTodo = await response.json();
      setTodos((currentTodos) => [newTodo, ...currentTodos]);
      setTitle("");
      setDescription("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleTodo(todo) {
    try {
      const response = await fetch(`${API_PATH}/${todo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todo.title, description: todo.description, completed: !todo.completed }),
      });
      if (!response.ok) throw new Error("Could not update this task");
      const updatedTodo = await response.json();
      setTodos((currentTodos) => currentTodos.map((item) => item._id === updatedTodo._id ? updatedTodo : item));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeTodo(id) {
    try {
      const response = await fetch(`${API_PATH}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete this task");
      setTodos((currentTodos) => currentTodos.filter((todo) => todo._id !== id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function saveEdit(id) {
    if (!editForm.title.trim() || !editForm.description.trim()) return;
    const originalTodo = todos.find((todo) => todo._id === id);
    try {
      const response = await fetch(`${API_PATH}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editForm, title: editForm.title.trim(), description: editForm.description.trim(), completed: originalTodo.completed }),
      });
      if (!response.ok) throw new Error("Could not save this task");
      const updatedTodo = await response.json();
      setTodos((currentTodos) => currentTodos.map((todo) => todo._id === id ? updatedTodo : todo));
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  const visibleTodos = useMemo(() => todos.filter((todo) => {
    const matchesFilter = filter === "all" || (filter === "active" && !todo.completed) || (filter === "done" && todo.completed);
    return matchesFilter && `${todo.title} ${todo.description}`.toLowerCase().includes(query.toLowerCase());
  }), [filter, query, todos]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;

  return (
    <main className="app-shell">
      <div className="noise" />
      <section className="workspace">
        <header className="topbar">
          <div className="brand"><span className="brand-mark">T</span><span>tiny tasks</span></div>
          <span className="date-stamp">{new Intl.DateTimeFormat("en", { weekday: "long", month: "short", day: "numeric" }).format(new Date())}</span>
        </header>
        <div className="intro-row">
          <div><p className="eyebrow">YOUR DAILY DESK</p><h1>Make room for<br /><em>what matters.</em></h1></div>
          <div className="progress-note"><strong>{activeCount}</strong><span>things<br />in motion</span></div>
        </div>
        <section className="add-panel">
          <div className="panel-label"><span className="plus">+</span><span>ADD A NEW TASK</span></div>
          <form onSubmit={createTodo} className="task-form">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs your attention?" aria-label="Task title" />
            <div className="form-bottom"><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a little context..." aria-label="Task description" /><button type="submit" disabled={saving || !title.trim() || !description.trim()}>{saving ? "ADDING..." : "ADD TASK"}<span>-&gt;</span></button></div>
          </form>
        </section>
        <div className="list-toolbar">
          <div className="filters">{[["all", "ALL", todos.length], ["active", "IN PROGRESS", activeCount], ["done", "COMPLETED", completedCount]].map(([value, label, count]) => <button key={value} className={filter === value ? "filter active" : "filter"} onClick={() => setFilter(value)}>{label}<b>{count}</b></button>)}</div>
          <label className="search"><span>?</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" aria-label="Search tasks" /></label>
        </div>
        {error && <div className="error-banner">{error}<button onClick={() => setError("")} aria-label="Dismiss error">x</button></div>}
        <section className="todo-list" aria-live="polite">
          {loading ? <div className="empty-state"><span className="loader" />Loading your desk...</div> : visibleTodos.length === 0 ? <div className="empty-state"><span className="empty-icon">-</span><strong>{query || filter !== "all" ? "Nothing here yet." : "Your desk is clear."}</strong><span>{query || filter !== "all" ? "Try another view or search." : "Add a task above to get moving."}</span></div> : visibleTodos.map((todo, index) => <article className={todo.completed ? "todo-card completed" : "todo-card"} key={todo._id} style={{ "--delay": `${index * 60}ms` }}>
            <button className="check" onClick={() => toggleTodo(todo)} aria-label={todo.completed ? "Mark task active" : "Mark task complete"}>{todo.completed ? "x" : ""}</button>
            {editingId === todo._id ? <div className="edit-fields"><input value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} autoFocus /><input value={editForm.description} onChange={(event) => setEditForm({ ...editForm, description: event.target.value })} /><div className="edit-actions"><button onClick={() => saveEdit(todo._id)}>SAVE</button><button onClick={() => setEditingId(null)}>CANCEL</button></div></div> : <div className="todo-copy"><h2>{todo.title}</h2><p>{todo.description}</p></div>}
            {editingId !== todo._id && <div className="card-actions"><button onClick={() => { setEditingId(todo._id); setEditForm({ title: todo.title, description: todo.description }); }}>EDIT</button><button onClick={() => removeTodo(todo._id)} className="delete-action">DELETE</button></div>}
          </article>)}
        </section>
        <footer className="footer-note"><span>ONE THING AT A TIME.</span><span>{completedCount} of {todos.length} complete</span></footer>
      </section>
    </main>
  );
}
