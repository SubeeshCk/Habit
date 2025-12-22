# HABIT

HABIT is a premium, dark-mode-first routine tracker built with the MERN stack.  
It features strict history locking, smart reminders, and a distraction-free interface to help users build consistency.

## Features

- 🔐 User authentication (Signup/Login) with JWT
- 📅 Create and manage daily routines with time-based tasks
- ✅ Mark tasks as complete for specific dates
- 📊 Progress tracking with visual indicators
- 🌓 Dark mode & light mode support
- 💾 Secure data persistence with MongoDB

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS / Tailwind

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs

## Project Structure
Habit/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── context/
│ │ ├── services/
│ │ └── styles/
│ └── package.json
├── server/ # Express backend
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── config/
│ └── server.js
├── package.json
└── vercel.json
