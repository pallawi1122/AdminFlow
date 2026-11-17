# AdminFlow – Admin Dashboard & User Management System

## 📌 Project Overview

AdminFlow is a full-stack web application designed to manage users through an admin dashboard. It provides secure authentication, user management, profile management, and analytics in a simple and user-friendly interface.

The application allows administrators to manage user accounts, monitor dashboard statistics, and maintain user information.

## 🚀 Features

### 1. Authentication
- User Registration
- User Login
- JWT-based Authentication
- Protected Routes

### 2. Admin Dashboard
- Total Users Count
- Total Admins Count
- Regular Users Count
- System Status
- Analytics Dashboard

### 3. User Management
- Add New Users
- View All Users
- Edit User Details
- Delete Users
- Search Users by Name or Email
- Filter Users by Role
- Pagination

### 4. Profile Management
- View My Profile
- Update Name and Email
- Change Password

## 🛠️ Technologies Used

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Vite

**Backend**
- Node.js
- Express.js
- REST API
- JWT Authentication
- bcrypt

**Database**
- MongoDB
- Mongoose

**Development Tools**
- Visual Studio Code
- Git & GitHub
- npm
- Postman (API testing, if used)

## 📁 Project Structure

```text
AdminFlow/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Installation & Setup

### Step 1: Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### Step 2: Open the Project

```bash
cd AdminFlow
```

### Step 3: Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

`http://localhost:5000`

### Step 4: Setup Frontend

Open another terminal:

```bash
cd AdminFlow/frontend
npm install
npm run dev
```

Frontend runs at:

`http://localhost:5173`

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/profile` | Get profile |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Admin User Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/users` | Get all users |
| POST | `/api/admin/users` | Add a new user |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |

## 🔐 Security

- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- Admin-only access to user management
- Environment variables for sensitive configuration

## 🎯 Project Objective

The main objective of AdminFlow is to develop a secure and user-friendly admin management system that simplifies user administration and provides useful dashboard insights.

## 👩‍💻 Author

**Your Name**

MCA Student

**Project:** AdminFlow – Admin Dashboard & User Management System
