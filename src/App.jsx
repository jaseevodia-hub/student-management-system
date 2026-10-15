
import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import Students from "./Students.jsx";
import "./App.css";

const initialStudents = [];

const initialFormData = {
  student_id: "",
  name: "",
  age: "",
  email: "",
  course: "",
  status: "Enrolled",
};

function Registration({ students, onAddStudent }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...initialFormData });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    const age = Number(form.age);

    if (!form.student_id.trim()) {
      setError("Please enter the student ID.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter the student's full name.");
      return;
    }

    if (
      form.age.trim() === "" ||
      !Number.isInteger(age) ||
      age < 1 ||
      age > 120
    ) {
      setError("Age must be a whole number between 1 and 120.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.course.trim()) {
      setError("Please enter the student's course.");
      return;
    }

    if (!["Enrolled", "Pending"].includes(form.status)) {
      setError("Please select a valid enrollment status.");
      return;
    }

    const duplicate = students.some(
      (student) =>
        student.student_id.toLowerCase() ===
          form.student_id.trim().toLowerCase() ||
        student.email.toLowerCase() ===
          form.email.trim().toLowerCase()
    );

    if (duplicate) {
      setError("A student with this ID or email already exists.");
      return;
    }

    const newStudent = {
      id: Date.now(),
      student_id: form.student_id.trim(),
      name: form.name.trim(),
      age,
      email: form.email.trim(),
      course: form.course.trim(),
      status: form.status,
    };

    onAddStudent(newStudent);

    setMessage("Student registered successfully!");
    setForm({ ...initialFormData });
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
            Student ID
            <input
              name="student_id"
              value={form.student_id}
              onChange={handleChange}
              placeholder="e.g. STU001"
              required
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
              step="1"
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
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Enrolled">Enrolled</option>
              <option value="Pending">Pending</option>
            </select>
          </label>

          <button type="submit">Save Student</button>
        </form>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}
      </section>
    </>
  );
}

function App() {
  // Load saved student records when the app starts.
  const [students, setStudents] = useState(() => {
    try {
      const savedStudents = localStorage.getItem("students");

      return savedStudents
        ? JSON.parse(savedStudents)
        : initialStudents;
    } catch {
      return initialStudents;
    }
  });

  // Automatically save student records whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem("students", JSON.stringify(students));
    } catch (error) {
      console.error("Unable to save student records:", error);
    }
  }, [students]);

  function handleAddStudent(newStudent) {
    setStudents((previousStudents) => [
      ...previousStudents,
      newStudent,
    ]);
  }

  return (
    <div className="app">
      <nav className="navigation">
        <Link to="/">Register Student</Link>
        <Link to="/students">View Students</Link>
      </nav>

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              <Registration
                students={students}
                onAddStudent={handleAddStudent}
              />
            }
          />

          <Route
            path="/students"
            element={
              <Students
                students={students}
                setStudents={setStudents}
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
