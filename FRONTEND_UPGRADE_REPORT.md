# EduGenie — Frontend Personalization Upgrade Report

**Files changed:** 4 (`Dashboard.jsx`, `Analytics.jsx`, `GenerateQuiz.jsx`, `api.js`)  
**Breaking changes:** Zero. All existing API calls preserved. New backend fields are read with optional chaining so old backends still work.

---

## `api.js` — 1 additive change

```js
// BEFORE
export const submitQuiz = (id, score, total_marks) =>
  api.post(`/quizzes/${id}/submit`, { score, total_marks });

// AFTER — old function preserved, new function added alongside it
export const submitQuiz            = (id,score,total_marks) =>
  api.post(`/quizzes/${id}/submit`, {score, total_marks});
export const submitQuizWithAnswers = (id,score,total_marks,user_answers) =>
  api.post(`/quizzes/${id}/submit`, {score, total_marks, user_answers});
```

**Why safe:** `submitQuiz` untouched. `submitQuizWithAnswers` is only used from `GenerateQuiz.jsx`.

---

## `Dashboard.jsx` — Full smart upgrade

### New: `getPersonalAnalytics()` called alongside existing requests

```js
// BEFORE — 3 parallel calls
Promise.all([getDashboardStats(), getPersonalDashboard(), getSubjectProgress()])

// AFTER — 4 parallel calls (analytics added)
Promise.all([getDashboardStats(), getPersonalDashboard(), getSubjectProgress(), getPersonalAnalytics()])
```

Analytics data is stored in a separate `analytics` state — the existing `global`, `personal`, `subjects` states are untouched.

### New: Performance level badge in header

```jsx
// BEFORE — just the name
<h1>{personal?.name?.split(" ")[0]}.</h1>

// AFTER — name + performance badge side by side
<h1>{personal?.name?.split(" ")[0]}.</h1>
{perfLevel && !loading && <PerfBadge level={perfLevel}/>}
```

### New: Real streak data replaces localStorage fallback

```jsx
// BEFORE — read from localStorage (unreliable, per-device only)
{ label:"🔥 Streak", v: localStorage.getItem("eg_streak") || 0 }

// AFTER — from backend learning_streak.current
{ label:"🔥 Streak", v: streak.current > 0 ? `${streak.current}d` : 0 }
```

The streak card also shows `longest` streak and a 7-day goal progress bar.

### New: Improvement trend badge on spark card

The "Score Trend" bento cell now shows a live badge — ↑ Improving / ↓ Declining / → Neutral — derived from `analytics.improvement_trend`.

### New: Weak topic tags on subject progress bars

Each subject row now shows a red `WEAK` badge if that subject appears in `analytics.weak_topics`.

### New: `WeakTopicsStrip` component

Shows all weak topics as clickable chips above the Insights panel, with the count and avg score. Each chip navigates to the quiz page.

### New: `InsightsPanel` component

Renders `analytics.insights` as a responsive grid of cards with icon prefixes. Hidden when empty.

### New: `StudyPlanSection` component

Renders `analytics.study_plan` as priority-coded cards (red/amber/blue top stripe). Each card has a "Start" action button that stores the topic/subject in `sessionStorage` and navigates to the quiz page.

---

## `Analytics.jsx` — 5 new sections added

All existing sections (KPI strip, trend chart, breakdown bars, heatmap, subject performance) are **100% preserved**. New sections are appended/inserted between existing ones.

### New: `StreakBanner`

Full-width card showing current streak with flame emoji, "Best" record, and a progress bar toward the 7-day goal. Color-coded: coral (≥7 days), amber (≥3), gray (0).

### New: `PerformanceCard`

Displays `performance_level` (Beginner/Intermediate/Advanced) with contextual message and recommended next difficulty. Shown only when backend provides this field.

### New: `InsightsPanel`

Same component pattern as Dashboard — responsive grid of AI-generated insight cards.

### New: Trend badge on Score Trend chart

Small pill next to the chart title showing ↑/↓/→ direction.

### New: `TopicGrid`

Two-column grid showing weak topics (red) and strong topics (green). Each row has the topic name, subject, attempt count, avg score, and an action button ("Improve →" / "Challenge →").

### New: WEAK/STRONG labels on subject performance rows

Each subject row in the existing Subject Performance section now shows inline badges derived from `weak_topics` and `strong_topics` arrays.

### New: `StudyPlanSection`

Full study plan card grid at the bottom of the page. Same design as Dashboard version.

---

## `GenerateQuiz.jsx` — 3 upgrades

### 1. Auto-suggested difficulty pre-fill

```jsx
// BEFORE — hardcoded "medium" default
const [difficulty, setDifficulty] = useState("medium");

// AFTER — reads from localStorage cache (set by analytics fetch)
const [difficulty, setDifficulty] = useState(
  () => localStorage.getItem("eg_rec_difficulty") || "medium"
);
```

When `recommended_difficulty` is returned by analytics, it's stored in `localStorage.eg_rec_difficulty`. On the next visit to the quiz page, that value pre-fills the difficulty selector with a visible "AI Suggested" badge. The user can reset it with a single button click.

### 2. Server-side answer submission

```js
// BEFORE — sent only score + total
await submitQuiz(quizId, score, total);

// AFTER — sends full answer array for server evaluation
const answersArr = qs.map((_, i) => answers[i] ?? null);
const resp = await submitQuizWithAnswers(quizId, score, total, answersArr);
setServerData(resp.data);
```

`serverData` is stored in component state and passed to the new result banner. If the call fails, the quiz still submits normally — the try/catch is non-fatal.

### 3. `SmartResultBanner` replaces the old basic result box

```jsx
// BEFORE — simple colored box with score
<div style={{ background: pct>=80?"var(--teal-dim)":... }}>
  <div>{results.score}/{results.total}</div>
  <div>{results.pct}%</div>
  <button>View Analytics</button>
  <button>New Quiz</button>
</div>

// AFTER — 3-section smart banner
// Section 1: score + performance level badge + next difficulty hint
// Section 2: AI feedback message + action text + confidence badge
// Section 3: context-aware action buttons
```

**Action button logic:**
| Condition | Button shown |
|-----------|-------------|
| `is_weak === true` | 🔴 Retry Quiz |
| `next_difficulty !== "easy"` | ↑ Try Medium / Hard |
| Not practice mode | View Analytics |
| Always | New Quiz |

After clicking "Try Hard", the difficulty selector is pre-filled with "hard" for the next quiz config.

---

## Deploy

```bash
git add frontend/src/pages/Dashboard.jsx \
        frontend/src/pages/Analytics.jsx \
        frontend/src/pages/GenerateQuiz.jsx \
        frontend/src/services/api.js
git commit -m "feat(frontend): personalized AI learning assistant UI — streaks, insights, study plan, smart quiz results"
git push
```
