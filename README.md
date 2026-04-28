# EduGenie v3 — Premium Redesign

## What's in this package

```
edugenie_v3/
└── frontend/
    ├── index.html
    ├── package.json          ← Clean Tailwind v3 only
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json
    └── src/
        ├── index.css         ← Full dark+light design system
        ├── main.jsx
        ├── App.jsx           ← ProtectedRoute + lazy loading
        ├── services/api.js
        ├── components/
        │   ├── Layout.jsx    ← Sidebar + mobile top bar + bottom nav + theme + streak
        │   ├── Toast.jsx
        │   ├── PageHeader.jsx
        │   └── SkeletonCard.jsx
        └── pages/
            ├── Login.jsx     ← Full-height editorial hero panel + floating chips
            ├── Signup.jsx
            ├── Dashboard.jsx ← Score ring, icon blocks, hot stats
            ├── Analytics.jsx ← Heatmap, trend chart, subject bars
            ├── Notes.jsx     ← Read/Copy/PDF export
            ├── MyQuizzes.jsx ← Retry mode + Review panel
            ├── GenerateNote.jsx
            ├── GenerateQuiz.jsx ← Timer, retake mode, explanation on submit
            └── ChatTutor.jsx ← Starter chips, clear, auto-resize
```

## Key design changes vs previous version

| What changed | Why |
|---|---|
| Login: full-height dark hero with animated subject chips | Replaces generic split-panel template |
| Dashboard: circular score ring with gradient fill | Replaces flat number in a card |
| Dashboard: icon blocks per card (coloured bg + SVG) | Makes each card identifiable at a glance |
| Dark palette: `#0b0b0f` warm graphite, not cold black | Richer, less harsh on eyes |
| Light palette: `#f1efe9` warm parchment + `#1a1612` dark ink | Not the beige/grey washout anymore |
| Gold accent: `#d4922a` — deeper, richer than amber | More premium, less "warning sign" |
| Font: Cormorant Italic for display + Outfit for body | Editorial feel, not another Inter/Roboto |
| Floating subject chips on login with subtle float animation | Personality, not just text |
| Per-stat top accent line in 3 different colours | Differentiates cards instantly |
| Streak badge + flame animation in sidebar | Engagement mechanic |

## How to apply

```bash
# 1. Back up current work
git add -A && git commit -m "backup before v3 redesign"

# 2. Replace files (keep your existing FYPGuide, ResumeBuilder, Subjects pages)
# Copy everything from edugenie_v3/frontend/ into your project's frontend/

# 3. Install
cd frontend
npm install

# 4. Set env
echo "VITE_API_URL=https://your-backend.onrender.com" > .env

# 5. Run
npm run dev
```

## Existing pages NOT in this package
These pages work fine as-is — just add `import PageHeader from "../components/PageHeader"` at the top:
- `Subjects.jsx`
- `FYPGuide.jsx`  
- `ResumeBuilder.jsx`