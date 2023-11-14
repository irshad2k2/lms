# Learning Management System

This Learning Management System (LMS) is a web application designed for both educators and students. Educators can create courses, add chapters, and pages, while students can enroll in courses, view chapter lists, mark pages as complete, and change their passwords.The user can can also search a course. The application is built using Node.js, Express.js, Sequelize, Postgresql, and Passport for authentication.

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

Signup page:

![signup](https://github.com/irshad2k2/lms/blob/main/signup_lms.png)


Educator's home page:

![homeEducator](https://github.com/irshad2k2/lms/blob/main/homeEducator_lms.png)


Student's home page:

![homeStudent](https://github.com/irshad2k2/lms/blob/main/home_lms.png)


Chapters:

![chapters](https://github.com/irshad2k2/lms/blob/main/chapters_lms.png)


Pages:

![pages](https://github.com/irshad2k2/lms/blob/main/page_lms.png)



Demo video :
![DemoVideo](https://github.com/irshad2k2/lms/blob/main/Demo_video_LMS.mp4)

"https://www.loom.com/embed/7b09641c31f247f48c9057588fa2fff1?sid=97d15f5a-f54b-4de9-8bc1-8dde773a78c1"


[Watch Loom Recording](https://www.loom.com/share/7b09641c31f247f48c9057588fa2fff1?sid=21cac794-3834-4e09-81f8-56d18f87acf2)


[Live-app](https://lms-6t3q.onrender.com)

