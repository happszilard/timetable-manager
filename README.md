# 🗓️ Timetable Management App (Legacy Version)

This is the **legacy codebase** of a timetable management web application built with Node.js, Express, MySQL, and EJS.

## 📚 Project Overview

This application is used to manage course scheduling within an educational or organizational environment. It supports two roles:

- **Admins** can:
  - Create and manage courses
  - Enroll teachers in courses
  - Insert courses into the weekly timetable
  - Upload materials to courses

- **Teachers** can:
  - View their course schedule
  - Suggest time slots for their assigned courses
  - Upload materials to their courses

---

## 🏗️ Tech Stack (Legacy)

- **Backend**: Node.js, Express
- **Frontend**: EJS templating engine (planned upgrade to React)
- **Database**: MySQL
- **Authentication**: Role-based access with JWT authentication
- **Project Structure**:
  - **db**: Database connection with pooling and querying
  - **middleware**:
    - `auth`: Authorization with JWT
    - `validation`: Form validations
  - **routes**:
    - `API`: Web requests for AJAX
    - `auth`: Authentication (currently only login, registration will be added with the upgrade)
    - `views`: Pages created with EJS (to be replaced with React)
  - **static**: Static files and scripts for AJAX
  - **views**: Contains EJS files (the pages)

---

## ⚙️ Planned Upgrades (WIP)

The project is currently undergoing modernization and feature expansion. Planned upgrades include:

### ✅ UI/UX Improvements
- Integrate **Tailwind CSS** for styling.
- Make the app **responsive** and mobile-friendly.
- Rebuild the entire frontend with **React**, replacing the existing EJS-based structure.
- Enhance every aspect of the design, ensuring a modern and user-friendly experience.

### ✅ Backend Refactor
- Upgrade the backend to support **RESTful APIs** instead of the current EJS-based templating engine.
- Create endpoints for **CRUD operations** on courses, materials, and timetables.
- Use JSON for data exchange between frontend and backend.
- Add **registration functionality** to the existing authentication system.

### ✅ Deployment
- Prepare environment for deployment (Render, Railway, or similar).
- Set up environment variables (`.env`).
- Use free managed MySQL (e.g., PlanetScale) in production.

### 🔜 Optional Future Features
- Calendar view for the weekly schedule.
- Real-time notifications.
- File/material upload for courses.

---

## 🚧 Status

This repo reflects the original version of the app. The backend will be upgraded to RESTful APIs, and the frontend will be completely rebuilt with React. These updates will enhance both the functionality and user experience of the app. Stay tuned for updates! 🚀
