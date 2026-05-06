# EduGenie Upgrade Package

Extract this zip and copy the folders into your project root.
The structure mirrors your existing project exactly — just overwrite.

## What's included

### Backend  →  copy into your `backend/` folder
| File | Change |
|------|--------|
| `ai.py` | Timeout + retry on Groq calls, `validate_quiz_structure()` |
| `app.py` | Quiz validation, server-side eval, analytics with insights/streaks/study plan |
| `db.py` | `is_weak` migration, structured logging |
| `helpers.py` | **NEW FILE** — all personalization helpers (evaluate_quiz, study plan, insights, streaks, etc.) |

### Frontend  →  copy into your `frontend/src/` folder
| File | Change |
|------|--------|
| `index.css` | Full design system upgrade — animations, glass-hover, skeletons, a11y |
| `components/Layout.jsx` | Page titles, active nav bar, slide-in drawer, touch bottom nav |
| `components/SkeletonCard.jsx` | Rich skeletons: SkeletonDashboard, SkeletonAnalytics, LoadingDots |
| `components/PageHeader.jsx` | Badge + back-link props added |
| `components/Toast.jsx` | Slide-in animation, aria-live |
| `components/EmptyState.jsx` | **NEW FILE** — EmptyState + ErrorState components |
| `pages/Dashboard.jsx` | Smart dashboard: streaks, insights, study plan, weak topics |
| `pages/Analytics.jsx` | Full intelligence dashboard with all personalization sections |
| `pages/GenerateQuiz.jsx` | AI-suggested difficulty, server-side evaluation, smart result banner |
| `services/api.js` | Added `submitQuizWithAnswers` alongside existing `submitQuiz` |

## How to apply

```
your-project/
├── backend/          ← paste backend files here
│   ├── ai.py
│   ├── app.py
│   ├── db.py
│   └── helpers.py    ← new, place alongside the others
└── frontend/
    └── src/          ← paste frontend files here
        ├── index.css
        ├── components/
        │   ├── EmptyState.jsx   ← new
        │   ├── Layout.jsx
        │   ├── PageHeader.jsx
        │   ├── SkeletonCard.jsx
        │   └── Toast.jsx
        ├── pages/
        │   ├── Analytics.jsx
        │   ├── Dashboard.jsx
        │   └── GenerateQuiz.jsx
        └── services/
            └── api.js
```

Then push to git:
```bash
git add .
git commit -m "feat: EduGenie smart adaptive learning upgrade"
git push
```
