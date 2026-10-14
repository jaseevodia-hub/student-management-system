
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/students";

const initialFormData = {
  student_id: "",
  name: "",
  age: "",
  email: "",
  course: "",
  status: "Pending",
};

// Read the server response safely.
async function readResponse(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

// Use the backend's message first, with a fallback.
function getErrorMessage(result, fallback) {
  return result.message || result.error || fallback;
}

// Reusable React component demonstrating props.
function StudentSummary({ total, matching }) {
  return (
    <div className="student-count">
      <p>Total Students: {total}</p>
      <p>Matching Students: {matching}</p>
    </div>
  );
}

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [addingStudent, setAddingStudent] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  // Retrieve student records from the API.
  async function fetchStudents() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Failed to load students.")
        );
      }

      if (!Array.isArray(result)) {
        throw new Error("The server returned an unexpected response.");
      }

      setStudents(result);
    } catch (err) {
      setError(
        err.message ||
          "Could not load students. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Update form fields when the user types.
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  // Open the add-student modal.
  function openAddModal() {
    setFormData({ ...initialFormData });
    setEditingStudent(null);
    setError("");
    setAddingStudent(true);
  }

  // Open the edit modal with the selected student's details.
  function openEditModal(student) {
    setFormData({
      student_id: student.student_id ?? "",
      name: student.name ?? "",
      age: String(student.age ?? ""),
      email: student.email ?? "",
      course: student.course ?? "",
      status: student.status ?? "Pending",
    });

    setAddingStudent(false);
    setEditingStudent(student);
    setError("");
  }

  // Close the add or edit modal.
  function closeFormModal() {
    if (saving) return;

    setAddingStudent(false);
    setEditingStudent(null);
    setFormData({ ...initialFormData });
    setError("");
  }

  // Validate the form before sending data to the API.
  function validateForm() {
    if (!formData.student_id.trim()) {
      setError("Please enter the student ID.");
      return false;
    }

    if (!formData.name.trim()) {
      setError("Please enter the student's full name.");
      return false;
    }

    const age = Number(formData.age);

    if (
      formData.age.trim() === "" ||
      !Number.isInteger(age) ||
      age < 1 ||
      age > 120
    ) {
      setError("Age must be a whole number between 1 and 120.");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Please enter the student's email address.");
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!formData.course.trim()) {
      setError("Please enter the student's course.");
      return false;
    }

    if (!["Enrolled", "Pending"].includes(formData.status)) {
      setError("Please select a valid enrollment status.");
      return false;
    }

    return true;
  }

  // Add a new student or update an existing student.
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    const isEditing = Boolean(editingStudent);

    try {
      setSaving(true);

      const url = isEditing
        ? `${API_URL}/${editingStudent.id}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: formData.student_id.trim(),
          name: formData.name.trim(),
          age: Number(formData.age),
          email: formData.email.trim(),
          course: formData.course.trim(),
          status: formData.status,
        }),
      });

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            result,
            `Failed to ${isEditing ? "update" : "add"} student.`
          )
        );
      }

      setAddingStudent(false);
      setEditingStudent(null);
      setFormData({ ...initialFormData });

      await fetchStudents();
    } catch (err) {
      setError(err.message || "Could not save the student.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a student after confirmation.
  async function handleDelete() {
    if (!deletingStudent || saving) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/${deletingStudent.id}`,
        { method: "DELETE" }
      );

      const result = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Failed to delete student.")
        );
      }

      setDeletingStudent(null);
      await fetchStudents();
    } catch (err) {
      setError(err.message || "Failed to delete student.");
    } finally {
      setSaving(false);
    }
  }

  // Search by student ID, name, email, or course.
  const search = searchTerm.trim().toLowerCase();

  const filteredStudents = students.filter((student) =>
    [
      student.student_id,
      student.name,
      student.email,
      student.course,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(search)
    )
  );

  const totalStudents = students.length;
  const displayedStudents = filteredStudents.length;
  const isFormOpen = addingStudent || Boolean(editingStudent);

  return (
    <main className="students-page">
      <div className="students-heading">
        <div>
          <h1>Student Management System</h1>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          disabled={saving}
        >
          + Add Student
        </button>
      </div>

      <div className="student-search">
        <label htmlFor="student-search">Search Students</label>

        <input
          id="student-search"
          type="search"
          placeholder="Search by ID, name, email, or course..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {/* Props are passed from Students to StudentSummary. */}
      <StudentSummary
        total={totalStudents}
        matching={displayedStudents}
      />

      {error && !isFormOpen && !deletingStudent && (
        <div className="error-message" role="alert">
          <p>{error}</p>

          {!loading && (
            <button type="button" onClick={fetchStudents}>
              Retry
            </button>
          )}
        </div>
      )}

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        <p>No student records found. Click Add Student to get started.</p>
      ) : filteredStudents.length === 0 ? (
        <p>
          No students match &quot;{searchTerm}&quot;. Try another search.
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Age</th>
                <th>Email</th>
                <th>Course</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id}>
                  <td>{student.student_id}</td>
                  <td>{student.name}</td>
                  <td>{student.age}</td>
                  <td>{student.email}</td>
                  <td>{student.course}</td>
                  <td>{student.status}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => openEditModal(student)}
                      disabled={saving}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setDeletingStudent(student);
                      }}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add and edit student modal */}
      {isFormOpen && (
        <div
          className="modal-overlay"
          onClick={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              closeFormModal();
            }
          }}
        >
          <section
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-modal-title"
          >
            <h2 id="student-modal-title">
              {editingStudent ? "Edit Student" : "Add New Student"}
            </h2>

            <p>
              {editingStudent
                ? "Update the student's information below."
                : "Enter the details to register a new student."}
            </p>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <label htmlFor="student_id">Student ID</label>
              <input
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                maxLength="20"
                required
              />

              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength="100"
                required
              />

              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                step="1"
                value={formData.age}
                onChange={handleChange}
                required
              />

              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                maxLength="150"
                required
              />

              <label htmlFor="course">Course</label>
              <input
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                maxLength="100"
                required
              />

              <label htmlFor="status">Enrollment Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Pending">Pending</option>
              </select>

              <div className="modal-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingStudent
                      ? "Save Changes"
                      : "Add Student"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={closeFormModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingStudent && (
        <div className="modal-overlay">
          <section
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
          >
            <h2 id="delete-modal-title">Confirm Deletion</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>{deletingStudent.name}</strong>? This action
              cannot be undone.
            </p>

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <div className="modal-actions">
              <button
                type="button"
                disabled={saving}
                onClick={handleDelete}
              >
                {saving ? "Deleting..." : "Yes, Delete"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => {
                  setDeletingStudent(null);
                  setError("");
                }}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Students;
