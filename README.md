# Learning Management System

This Learning Management System (LMS) is a web application designed for both educators and students. Educators can create courses, add chapters, and pages, while students can enroll in courses, view chapter lists, mark pages as complete, and change their passwords. The application is built using Node.js, Express.js, Sequelize ORM, and Passport for authentication.

## Features

- **User Roles:**
  - **Educator:** Educators can create courses, add chapters, and pages.
  - **Student:** Students can enroll in courses, view chapter lists, and mark pages as complete.

- **Authentication and Authorization:**
  - Users can sign up, log in, and log out.
  - Passwords are securely hashed using bcrypt.
  - Educators can create courses only after authentication.
  - Students can enroll in courses only after authentication.

- **Course Management:**
  - Educators can create new courses with names and descriptions.
  - Chapters can be added to courses, each with its own name and description.
  - Pages can be added to chapters, containing content for students to read.

- **Enrollment:**
  - Students can enroll in available courses.
  - Educators can view the list of enrolled students for their courses.

- **Progress Tracking:**
  - Students can mark pages as complete, allowing them to track their progress.

- **Password Management:**
  - Users (both educators and students) can change their passwords securely.

## Technologies Used

- **Node.js:** JavaScript runtime for server-side development.
- **Express.js:** Web application framework for Node.js.
- **Sequelize:** ORM (Object-Relational Mapping) for database interactions.
- **Passport.js:** Authentication middleware for Node.js.
- **Bcrypt:** Library for securely hashing passwords.
- **EJS:** Template engine for rendering dynamic content in HTML.

![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%20(56).png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%20(57).png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%20(58).png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%20(59).png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%202023-11-07%20011033.png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%202023-11-07%20011124.png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%202023-11-07%20011155.png)
![signup](https://github.com/irshad2k2/lms/blob/main/Screenshot%202023-11-07%20100627.png)


