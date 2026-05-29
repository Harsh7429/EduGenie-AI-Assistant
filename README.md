<div align="center">

<br/>

```
███████╗██████╗ ██╗   ██╗ ██████╗ ███████╗███╗   ██╗██╗███████╗
██╔════╝██╔══██╗██║   ██║██╔════╝ ██╔════╝████╗  ██║██║██╔════╝
█████╗  ██║  ██║██║   ██║██║  ███╗█████╗  ██╔██╗ ██║██║█████╗  
██╔══╝  ██║  ██║██║   ██║██║   ██║██╔══╝  ██║╚██╗██║██║██╔══╝  
███████╗██████╔╝╚██████╔╝╚██████╔╝███████╗██║ ╚████║██║███████╗
╚══════╝╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝
```

### Your AI-powered MCA Study Companion

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-edu--genie--ai--assistant.vercel.app-EF9F27?style=for-the-badge&labelColor=0d0d12)](https://edu-genie-ai-assistant.vercel.app/login)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=20232a)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white&labelColor=111)](https://flask.palletsprojects.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=1a1a2e)](https://postgresql.org)
[![Groq AI](https://img.shields.io/badge/Groq_AI-LLaMA_3-F54E42?style=for-the-badge&labelColor=1a0a09)](https://groq.com)

<br/>

> *"Every exam starts with a single note."*

<br/>

</div>

---

## 🎯 What is EduGenie?

**EduGenie** is an AI-powered study platform built specifically for **MCA (Master of Computer Applications)** students. It uses **Groq's LLaMA 3** model to generate exam-focused study notes, adaptive MCQ quizzes, and a 24/7 AI tutor — all personalised around the MCA syllabus.

Built as a final year MCA project, EduGenie combines a full-stack web application with a clean, data-rich interface that helps students track progress, identify weak subjects, and study smarter.

<br/>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📝 AI Study Notes
Generate comprehensive, exam-focused notes on any MCA topic in seconds. Notes are saved automatically, searchable, copyable, and exportable as PDF.

</td>
<td width="50%">

### 🧠 Adaptive Quizzes
AI-generated MCQs with difficulty levels (Easy / Medium / Hard), a live countdown timer, per-question explanations on submit, and a **Retry** mode for past quizzes.

</td>
</tr>
<tr>
<td width="50%">

### 💬 AI Tutor (24/7)
Chat with an LLM tutor trained on MCA topics. Supports multi-turn conversation, subject context switching, and markdown-formatted responses with code blocks.

</td>
<td width="50%">

### 📊 Performance Analytics
Score trend charts, 14-week activity heatmap, subject-wise ranked leaderboard, strong/average/weak breakdown — all from your actual quiz data.

</td>
</tr>
<tr>
<td width="50%">

### 🎓 FYP Guide
Get a personalised Final Year Project roadmap based on your domain, interests, and team size. Saves the last 5 guides locally, exportable as `.md`.

</td>
<td width="50%">

### 📄 Resume Builder
Multi-step ATS-optimised LaTeX resume builder with 12 target roles. Alternatively, paste any existing resume and the AI rewrites it for your target role. Download `.tex` or open directly in Overleaf.

</td>
</tr>
</table>

<br/>

---

## 🖥️ Interface

| Page | Description |
|------|------------|
| **Dashboard** | Bento grid with score ring, sparkline trend, subject progress bars, recent activity |
| **Subjects** | Progress rings, filter chips, coverage %, average score per subject |
| **My Notes** | Subject-colour-coded cards, expandable preview, Copy & PDF export |
| **Quiz History** | Search & sort, Retry mode, full per-question Review with correct answers |
| **Analytics** | KPI cards, SVG trend chart, 14-week heatmap, ranked subject bars |
| **AI Tutor** | Chat interface with starter prompts, subject context, auto-resize textarea |

> Dark mode and light mode supported — toggle in the sidebar.

<br/>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| React Router DOM | 6.x | Client-side routing |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.x | Utility styling |
| Axios | 1.x | HTTP client |
| React Markdown | 9.x | Chat message rendering |
| Geist Font | — | Typography |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Flask | 3.1 | REST API server |
| Flask-JWT-Extended | 4.x | Authentication |
| Flask-CORS | 6.x | Cross-origin support |
| psycopg2 | — | PostgreSQL driver |
| bcrypt | 5.x | Password hashing |
| Groq API (LLaMA 3.1 8B) | — | AI generation |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend deployment |
| **Render** | Backend deployment |
| **PostgreSQL** (Supabase / Render) | Database |

<br/>

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10
- PostgreSQL database
- Groq API key → [console.groq.com](https://console.groq.com)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/EduGenie-AI-Assistant.git
cd EduGenie-AI-Assistant
```

---

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit `.env` with your values:

```env
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET_KEY=your_secret_key_here

DB_HOST=localhost
DB_NAME=edugenie_db
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_PORT=5432

FRONTEND_URL=http://localhost:5173
```

Run the backend:

```bash
python app.py
# Server starts at http://localhost:5000
```

---

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000" > .env

# Start development server
npm run dev
# App opens at http://localhost:5173
```

---

### 4. Database

Run the SQL schema to create all required tables:

```bash
psql -U postgres -d edugenie_db -f backend/schema.sql
```

<br/>

---

## 🌐 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Set environment variable:
   ```
   VITE_API_URL = https://your-render-backend.onrender.com
   ```
4. Deploy — Vercel handles the rest

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set:
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `gunicorn app:app`
4. Add all environment variables from your `.env`

<br/>

---

## 📁 Project Structure

```
EduGenie-AI-Assistant/
│
├── backend/
│   ├── app.py              ← Flask routes (auth, notes, quizzes, AI)
│   ├── ai.py               ← Groq API integration (notes, quizzes, FYP, resume)
│   ├── db.py               ← PostgreSQL connection + table init
│   ├── config.py           ← Environment config
│   ├── requirements.txt
│   └── schema.sql          ← Database schema
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                     ← Routes + auth guard
        ├── index.css                   ← Design system tokens
        ├── services/
        │   └── api.js                  ← Axios instance + all API calls
        ├── components/
        │   ├── Layout.jsx              ← Sidebar, mobile nav, theme toggle
        │   ├── Toast.jsx               ← Notification toasts
        │   ├── PageHeader.jsx          ← Consistent page headings
        │   └── SkeletonCard.jsx        ← Loading skeletons
        └── pages/
            ├── Login.jsx / Signup.jsx
            ├── Dashboard.jsx           ← Bento grid overview
            ├── Subjects.jsx            ← Progress tracking
            ├── GenerateNote.jsx        ← AI note generation
            ├── GenerateQuiz.jsx        ← AI quiz with timer
            ├── MyQuizzes.jsx           ← History + retry + review
            ├── Notes.jsx               ← Saved notes
            ├── Analytics.jsx           ← Charts + heatmap
            ├── ChatTutor.jsx           ← AI chat interface
            ├── FYPGuide.jsx            ← Project roadmap generator
            └── ResumeBuilder.jsx       ← LaTeX resume builder
```

<br/>

---

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/signup` | Register new user |
| `POST` | `/login` | Login, returns JWT |
| `GET` | `/profile` | Get current user |

### AI Features *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ai/generate-note` | Generate study note |
| `POST` | `/ai/generate-quiz` | Generate MCQ quiz |
| `POST` | `/ai/chat` | Chat with AI tutor |
| `POST` | `/ai/fyp-guide` | Generate FYP roadmap |
| `POST` | `/ai/resume/generate` | Build LaTeX resume |
| `POST` | `/ai/resume/improve` | Improve existing resume |

### Data *(JWT required)*
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notes` | Get all notes |
| `DELETE` | `/notes/:id` | Delete note |
| `GET` | `/quizzes` | Get quiz history |
| `POST` | `/quizzes/:id/submit` | Submit quiz score |
| `GET` | `/analytics/personal` | Get analytics data |
| `GET` | `/progress/subjects` | Get subject progress |
| `GET` | `/dashboard/personal` | Get dashboard data |

<br/>

---

## 🎓 MCA Subjects Covered

```
Data Structures & Algorithms    Operating Systems
Database Management Systems     Computer Networks
Software Engineering            Theory of Computation
Web Technologies                Compiler Design
Artificial Intelligence & ML    Advanced Java
Python Programming              Problem Solving Using C
```

<br/>

---

## 📸 Demo

**🔗 Live:** [edu-genie-ai-assistant.vercel.app](https://edu-genie-ai-assistant.vercel.app/login)

**Demo account:**
```
Email:    demo@edugenie.app
Password: demo1234
```

<br/>

---

## 🤝 Contributing

This is an MCA final year project. If you find a bug or want to suggest an improvement:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

<br/>

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br/>

---

<div align="center">

Built with ❤️ for MCA students

**[⬆ Back to top](#)**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Try_EduGenie_Live-edu--genie--ai--assistant.vercel.app-EF9F27?style=for-the-badge&labelColor=0d0d12)](https://edu-genie-ai-assistant.vercel.app/login)

</div>
