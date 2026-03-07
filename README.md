# 🎓 EduGenie — AI-Powered Learning Assistant

> **MCA Final Year Project 2026** | Full-Stack AI Platform for Smart Learning

EduGenie is a full-stack AI-powered learning platform designed for MCA students. It uses **Groq Llama 3** to generate exam-ready notes, practice quizzes, track academic progress, and help plan final year projects — all in one place.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| 🖥️ Frontend | *Coming soon — Vercel* |
| ⚙️ Backend API | *Coming soon — Render* |

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **AI Note Generation** | Generates structured, exam-ready notes for any subject and topic |
| 🧠 **AI Quiz System** | MCQs with Easy/Medium/Hard difficulty, countdown timer, auto-submit |
| 💬 **AI Chat Tutor** | Ask any academic question and get instant AI-powered answers |
| 📊 **Progress Analytics** | Track scores, subject performance, and learning trends over time |
| 🏠 **Personal Dashboard** | See your stats — quizzes taken, notes generated, average score |
| 🎓 **FYP Guide** | AI-generated Final Year Project roadmap with tech stack and viva prep |
| 📄 **Resume Builder** | Build ATS-optimized LaTeX resume or improve your existing one with AI |

---

## 🛠️ Tech Stack

```
Frontend    →  React + Vite + Tailwind CSS
Backend     →  Flask (Python)
Database    →  PostgreSQL (psycopg2)
AI / LLM    →  Groq API — Llama 3
Auth        →  Flask-JWT-Extended + bcrypt
Deployment  →  Render (backend) + Vercel (frontend) + Neon.tech (database)
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           React Frontend (Vite)             │
│     Dashboard | Quiz | Notes | Analytics    │
└──────────────────┬──────────────────────────┘
                   │ REST API (axios)
                   ▼
┌─────────────────────────────────────────────┐
│           Flask REST API Backend            │
│    JWT Auth | Routes | Business Logic       │
└──────┬───────────────────────┬──────────────┘
       │                       │
       ▼                       ▼
┌─────────────┐     ┌──────────────────────┐
│  PostgreSQL │     │   Groq LLM API       │
│  (Neon.tech)│     │   Llama 3 Model      │
└─────────────┘     └──────────────────────┘
```

---

## 📁 Project Structure

```
EduGenie-AI-Assistant/
├── backend/
│   ├── app.py              ← All Flask routes
│   ├── ai.py               ← Groq AI functions
│   ├── db.py               ← PostgreSQL connection
│   ├── config.py           ← DB config (reads .env)
│   └── requirements.txt    ← Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/          ← All page components
│   │   ├── components/     ← Navbar, Layout, Toast
│   │   └── services/
│   │       └── api.js      ← All API calls
│   └── package.json
└── EduGenie_Project_Docs/
    ├── database_schema.sql ← PostgreSQL schema
    └── seed_data.sql       ← Semesters, subjects, topics
```

---

## 🚀 Run Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo
```bash
git clone https://github.com/Harsh7429/EduGenie-AI-Assistant.git
cd EduGenie-AI-Assistant
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```env
DB_HOST=localhost
DB_NAME=edugenie_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

```bash
python app.py
# Backend runs at http://localhost:5000
```

### 3. Database Setup
```bash
# Create database in PostgreSQL
psql -U postgres -c "CREATE DATABASE edugenie_db;"

# Run schema
psql -U postgres -d edugenie_db -f EduGenie_Project_Docs/database_schema.sql

# Load seed data (subjects, topics, semesters)
psql -U postgres -d edugenie_db -f EduGenie_Project_Docs/seed_data.sql
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_PORT` | PostgreSQL port (5432) |
| `JWT_SECRET_KEY` | Secret key for JWT tokens |
| `GROQ_API_KEY` | Get free at [console.groq.com](https://console.groq.com) |

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/signup` | POST | Register new user |
| `/login` | POST | Login, returns JWT |
| `/subjects` | GET | Get all subjects |
| `/units/:subject_id` | GET | Get units for subject |
| `/topics/subject/:id` | GET | Get topics for subject |
| `/ai/generate-note` | POST | Generate AI note |
| `/ai/generate-quiz` | POST | Generate AI quiz |
| `/quizzes/:id/submit` | POST | Submit quiz score |
| `/ai/chat` | POST | AI Chat Tutor |
| `/ai/fyp-guide` | POST | Generate FYP guide |
| `/ai/resume/generate` | POST | Build resume from form |
| `/analytics/personal` | GET | Personal analytics |
| `/dashboard/personal` | GET | Dashboard stats |

---

## 🗄️ Database Schema

```
users → semesters → subjects → units → topics
                                          ↓
                              notes (AI generated)
                              quizzes (AI generated)
                              quiz_attempts (scores)
                              user_progress (tracking)
```

---

## 👨‍💻 Developer

**Harsh** — MCA Final Year Student  
GitHub: [@Harsh7429](https://github.com/Harsh7429)

---

## 📄 License

This project is built as an MCA Final Year Project.
