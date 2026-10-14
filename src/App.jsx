import { useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Students from "./Students.jsx";
import "./App.css";

const API_URL = "http://localhost:5000/api/students";

function Registration() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    student_id: "",
    name: "",
    age: "",
    email: "",
    course: "",
    status: "Enrolled",
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, age: Number(form.age) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save student.");
      }

      setMessage("Student saved successfully in the database!");
      setForm({
        student_id: "",
        name: "",
        age: "",
        email: "",
        course: "",
        status: "Enrolled",
      });
    } catch (err) {
      setError(err.message || "Could not save student.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>Student Registration</h1>
        <p>Enter the student's information</p>
      </header>

      <section className="table-container">
        <h2>Add New Student</h2>

        <form onSubmit={handleSubmit} className="student-form">
          <label>
            Student ID (optional)
            <input
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              placeholder="e.g. STU001"
            />
          </label>

          <label>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
            />
          </label>

          <label>
            Age
            <input
              name="age"
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={handleChange}
              placeholder="Enter age"
              required
            />
          </label>

          <label>
            Email Address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </label>

          <label>
            Course
            <input
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Enter course"
              required
            />
          </label>

          <label>
            Status
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Enrolled">Enrolled</option>
              <option value="Pending">Pending</option>
            </select>
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Student"}
          </button>
        </form>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </section>
    </>
  );
}

function App() {
  return (
    <div className="app">
      <nav className="navigation">
        <Link to="/">Register Student</Link>
        <Link to="/students">View Students</Link>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/students" element={<Students />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
