"use strict";

// 1. Variable declarations
const schoolName = "DIWA Student Management System";
let studentCount = 0;
var systemActive = true;

// 2. JavaScript primitive data types
const studentName = "Refiloe";
const studentAge = 22;
const isEnrolled = true;

// 3. Non-primitive data types
const courses = ["Web Development", "Database", "Networking"];

const studentObject = {
  name: studentName,
  age: studentAge,
  enrolled: isEnrolled,
  courses: courses
};

// 4. User-defined function with a parameter and return value
function describeStudent(student) {
  return student.name + " is " + student.age + " years old.";
}

// 5. Function demonstrating conditional statements
function checkEnrollment(enrolled) {
  if (enrolled) {
    return "Student is enrolled.";
  } else {
    return "Student is not enrolled.";
  }
}

// 6. Array method: map()
const courseList = courses.map(function (course) {
  return course.toUpperCase();
});

// 7. Array method: filter()
const webCourses = courses.filter(function (course) {
  return course.includes("Web");
});

// 8. Conditional statement using if/else
if (studentAge >= 18) {
  console.log(studentName + " is an adult student.");
} else {
  console.log(studentName + " is a minor student.");
}

// 9. Display results
console.log("School:", schoolName);
console.log("Student count:", studentCount);
console.log("System active:", systemActive);
console.log("Student:", describeStudent(studentObject));
console.log(checkEnrollment(studentObject.enrolled));
console.log("All courses:", courses);
console.log("Uppercase courses:", courseList);
console.log("Web-related courses:", webCourses);
console.log("Student details:", studentObject);