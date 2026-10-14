
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mysql = require("mysql2/promise");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Test the API
app.get("/", (req, res) => {
  res.json({
    message: "Student Management API is running!",
  });
});

// Test the MySQL connection
app.get("/api/db-test", async (req, res) => {
  try {
    const connection = await db.getConnection();
    connection.release();

    res.json({
      message: "Successfully connected to MySQL!",
    });
  } catch (error) {
    console.error("MySQL connection error:", error.message);

    res.status(500).json({
      message: "Could not connect to MySQL. Check your .env settings.",
    });
  }
});

// Get all students
app.get("/api/students", async (req, res) => {
  try {
    const [students] = await db.query(
      "SELECT * FROM students ORDER BY id DESC"
    );

    res.json(students);
  } catch (error) {
    console.error("Error fetching students:", error.message);

    res.status(500).json({
      message: "Failed to fetch students.",
    });
  }
});

// Get one student by database ID
app.get("/api/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid student record ID.",
      });
    }

    const [students] = await db.query(
      "SELECT * FROM students WHERE id = ?",
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.json(students[0]);
  } catch (error) {
    console.error("Error fetching student:", error.message);

    res.status(500).json({
      message: "Failed to fetch student.",
    });
  }
});

// Add a new student
app.post("/api/students", async (req, res) => {
  try {
    const { student_id, name, age, email, course, status } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      age === undefined ||
      age === null ||
      age === "" ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof course !== "string" ||
      !course.trim()
    ) {
      return res.status(400).json({
        message: "Name, age, email, and course are required.",
      });
    }

    const parsedAge = Number(age);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 120
    ) {
      return res.status(400).json({
        message: "Age must be a whole number between 1 and 120.",
      });
    }

    const studentStatus = status || "Pending";

    if (!["Enrolled", "Pending"].includes(studentStatus)) {
      return res.status(400).json({
        message: "Status must be Enrolled or Pending.",
      });
    }

    if (
      student_id != null &&
      (typeof student_id !== "string" || !student_id.trim())
    ) {
      return res.status(400).json({
        message: "Student ID must be a non-empty string when provided.",
      });
    }

    const [result] = await db.query(
      `INSERT INTO students
       (student_id, name, age, email, course, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        student_id?.trim() || null,
        name.trim(),
        parsedAge,
        email.trim(),
        course.trim(),
        studentStatus,
      ]
    );

    const [newStudents] = await db.query(
      "SELECT * FROM students WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newStudents[0]);
  } catch (error) {
    console.error("Error adding student:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "That student ID or email already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to add student.",
    });
  }
});

// Update an existing student
app.put("/api/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { student_id, name, age, email, course, status } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid student record ID.",
      });
    }

    if (
      typeof name !== "string" ||
      !name.trim() ||
      age === undefined ||
      age === null ||
      age === "" ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof course !== "string" ||
      !course.trim()
    ) {
      return res.status(400).json({
        message: "Name, age, email, and course are required.",
      });
    }

    const parsedAge = Number(age);

    if (
      !Number.isInteger(parsedAge) ||
      parsedAge < 1 ||
      parsedAge > 120
    ) {
      return res.status(400).json({
        message: "Age must be a whole number between 1 and 120.",
      });
    }

    const studentStatus = status || "Pending";

    if (!["Enrolled", "Pending"].includes(studentStatus)) {
      return res.status(400).json({
        message: "Status must be Enrolled or Pending.",
      });
    }

    if (
      student_id != null &&
      (typeof student_id !== "string" || !student_id.trim())
    ) {
      return res.status(400).json({
        message: "Student ID must be a non-empty string when provided.",
      });
    }

    const [result] = await db.query(
      `UPDATE students
       SET student_id = ?, name = ?, age = ?, email = ?, course = ?, status = ?
       WHERE id = ?`,
      [
        student_id?.trim() || null,
        name.trim(),
        parsedAge,
        email.trim(),
        course.trim(),
        studentStatus,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      const [existing] = await db.query(
        "SELECT id FROM students WHERE id = ?",
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Student not found.",
        });
      }
    }

    const [updatedStudents] = await db.query(
      "SELECT * FROM students WHERE id = ?",
      [id]
    );

    res.json(updatedStudents[0]);
  } catch (error) {
    console.error("Error updating student:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "That student ID or email already exists.",
      });
    }

    res.status(500).json({
      message: "Failed to update student.",
    });
  }
});

// Delete a student
app.delete("/api/students/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        message: "Invalid student record ID.",
      });
    }

    const [result] = await db.query(
      "DELETE FROM students WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.json({
      message: "Student deleted successfully.",
      id,
    });
  } catch (error) {
    console.error("Error deleting student:", error.message);

    res.status(500).json({
      message: "Failed to delete student.",
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
