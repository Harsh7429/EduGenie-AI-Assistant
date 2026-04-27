# EduGenie — Premium Redesign Package

## Files Included

```
edugenie_redesign/
└── frontend/
    ├── package.json          ← Clean deps (Tailwind v3, no @tailwindcss/vite conflict)
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json
    └── src/
        ├── main.jsx
        ├── index.css         ← Full design system: dark+light theme, skeletons, print, streak
        ├── App.jsx           ← ProtectedRoute + lazy loading
        ├── services/
        │   └── api.js        ← 401 interceptor, all API helpers
        ├── components/
        │   ├── Layout.jsx    ← Sidebar + mobile top bar + bottom nav + theme toggle + streak
        │   ├── Toast.jsx     ← Animated success/error/info toasts
        │   ├── PageHeader.jsx← Consistent page titles across all pages
        │   └── SkeletonCard.jsx ← Skeleton loaders for every loading state
        └── pages/
            ├── Login.jsx     ← Editorial left panel + clean form
            ├── Signup.jsx    ← Centered card form
            ├── Dashboard.jsx ← Stats grid + quick access cards + activity feed
            ├── Analytics.jsx ← Heatmap + trend chart + subject bars + KPI cards
            ├── MyQuizzes.jsx ← Search, sort, Retry mode, per-question Review
            ├── Notes.jsx     ← Expand/collapse, Copy, PDF export
            ├── GenerateQuiz.jsx ← Retry mode, timer, result banner, explanations
            ├── GenerateNote.jsx ← Copy + PDF export + "View in Notes" CTA
            └── ChatTutor.jsx ← Starter prompts, clear chat, auto-resize textarea
```

## How to Apply

1. Copy all files from this package into your existing project,
   replacing the originals (make a git commit first!).

2. Run:
   ```
   cd frontend
   npm install
   npm run dev
   ```

3. Set your environment variable:
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   ```

## New Features Added

| Feature | Where |
|---|---|
| Dark / Light mode toggle | Sidebar + mobile topbar |
| Study streak counter | Sidebar + mobile topbar |
| Mobile bottom navigation | Layout (visible on ≤860px) |
| Skeleton loaders | Dashboard, Analytics, MyQuizzes, Notes |
| Quiz Retry mode | MyQuizzes → Retry button |
| Quiz Review (all Q&A + explanations) | MyQuizzes → Review button |
| PDF export for Notes | Notes page + GenerateNote page |
| Copy to clipboard | Notes page + GenerateNote page |
| Activity heatmap (14 weeks) | Analytics page |
| Score trend chart | Analytics page |
| Subject performance ranked bars | Analytics page |
| Search + sort for quizzes | MyQuizzes page |
| Search for notes | Notes page |
| "View in Notes →" CTA after generation | GenerateNote page |
| Chat starter prompts | ChatTutor page |
| Chat clear button | ChatTutor page |
| Auto-resize chat textarea | ChatTutor page |
| Responsive bottom nav (5 key routes) | Mobile only |
| Light theme full palette | Toggle in sidebar |
| Print-optimised CSS | Notes PDF export |