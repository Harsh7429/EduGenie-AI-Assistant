# EduGenie — AI-Powered MCA Study Assistant

<div align="center">

![EduGenie Banner](https://img.shields.io/badge/EduGenie-AI%20Learning%20Platform-6366f1?style=for-the-badge&logo=openai&logoColor=white)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-22d3ee?style=for-the-badge)](https://edu-genie-ai-assistant.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-34d399?style=for-the-badge)](https://edugenie-ai-assistant.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-f472b6?style=for-the-badge)](LICENSE)

**Your AI-powered MCA study companion. Master every topic with smart notes, adaptive quizzes, and real-time progress tracking.**

</div>

---

## 🚀 Live Demo

🌐 **Frontend:** https://edu-genie-ai-assistant.vercel.app  
⚙️ **Backend API:** https://edugenie-ai-assistant.onrender.com

> ⚠️ The backend runs on a free Render instance — first request may take ~50 seconds to wake up.

---

## ✨ Features

### 🧠 AI-Powered Learning
- **Generate Notes** — Instant structured, exam-ready notes for any MCA topic powered by Groq LLaMA
- **Generate Quizzes** — Adaptive MCQs with Easy / Medium / Hard difficulty levels
- **AI Chat Tutor** — Conversational AI tutor focused on MCA syllabus with markdown-formatted responses

### 📊 Progress Tracking
- **Analytics Dashboard** — Visual performance charts, subject-wise breakdown, score trends
- **Subject Progress** — Track coverage across all 4 semesters and 19 subjects
- **Quiz History** — Review all past attempts with scores

### 🎓 Final Year Project Tools
- **FYP Guide** — AI-generated project roadmap based on your domain and interests
- **Resume Builder** — ATS-optimized LaTeX resume generator with PDF export

### 📱 Fully Responsive
- Mobile-friendly design with hamburger navigation
- Works seamlessly on phones, tablets, and desktops

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Python, Flask, Flask-JWT-Extended |
| **Database** | PostgreSQL (Neon.tech) |
| **AI Engine** | Groq API (LLaMA 3.1 8B Instant) |
| **Deployment** | Vercel (frontend) + Render (backend) |
| **Auth** | JWT (JSON Web Tokens) + bcrypt |

---

## 📁 Project Structure

```
EduGenie-AI-Assistant/
├── backend/
│   ├── app.py              # Flask API routes
│   ├── ai.py               # Groq AI integration
│   ├── db.py               # PostgreSQL connection
│   ├── config.py           # Configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # React page components
│   │   ├── components/     # Navbar, Layout, Toast
│   │   └── services/       # API service layer
│   ├── vercel.json         # SPA routing config
│   └── package.json
└── EduGenie_Project_Docs/
    ├── database_design.txt
    └── database_schema.sql
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (local or Neon.tech)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone the repo
```bash
git clone https://github.com/Harsh7429/EduGenie-AI-Assistant.git
cd EduGenie-AI-Assistant
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Create `backend/.env`:
```env
DB_HOST=127.0.0.1
DB_NAME=edugenie_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-api-key
```

```bash
python app.py
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:5000
```

```bash
npm run dev
```

### 4. Database
Run the schema from `EduGenie_Project_Docs/database_schema.sql` in your PostgreSQL client, then seed with the provided seed file.

---

## 🗄️ Database Schema

```
users           → id, name, email, password, created_at
semesters       → id, name
subjects        → id, name, code, semester_id, type, elective_group
units           → id, name, subject_id
topics          → id, name, unit_id
notes           → id, user_id, subject_id, topic_id, content, created_at
quizzes         → id, user_id, subject_id, topic_id, content (JSON), created_at
quiz_attempts   → id, user_id, subject_id, topic_id, quiz_id, score, total_marks, attempt_date
user_progress   → id, user_id, subject_id, average_score, progress_percentage
elective_groups → id, name, semester_id
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login & get JWT token |
| GET | `/semesters` | Get all semesters |
| GET | `/subjects/semester/:id` | Subjects by semester |
| GET | `/units/:subject_id` | Units for a subject |
| GET | `/topics/:unit_id` | Topics for a unit |
| POST | `/ai/generate-note` | Generate AI study note |
| POST | `/ai/generate-quiz` | Generate AI quiz |
| POST | `/ai/chat` | AI Chat Tutor |
| POST | `/ai/fyp-guide` | Generate FYP roadmap |
| POST | `/ai/resume/generate` | Generate LaTeX resume |
| GET | `/analytics/personal` | Personal performance stats |
| GET | `/dashboard/personal` | Dashboard stats |
| POST | `/quizzes/:id/submit` | Submit quiz & update progress |

---

## 🚀 Deployment

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set root directory to `frontend`
3. Add env var: `VITE_API_URL=https://your-backend.onrender.com`

### Backend → Render
1. Create Web Service on Render
2. Set root directory to `backend`
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn app:app`
5. Add all DB and API key env vars

---

## 👨‍💻 Author

**Harsh Kumar**  
MCA Final Year Project — 2025-26

[![GitHub](https://img.shields.io/badge/GitHub-Harsh7429-181717?style=flat&logo=github)](https://github.com/Harsh7429)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Made with ❤️ for MCA students everywhere
</div>
