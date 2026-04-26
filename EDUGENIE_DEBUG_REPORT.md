# EduGenie — Full Debug Report & Design Improvement Guide

---

## PART 1: BUGS FOUND & FIXED

### 🔴 CRITICAL — Breaks Core Functionality

---

#### Bug #1 — `create_topic()` uses wrong column name  
**File:** `backend/app.py`  
**Severity:** Critical — every topic creation request fails with a PostgreSQL error  

**Root Cause:**  
The `topics` table stores `unit_id` (topics belong to units, units belong to subjects).
The original code incorrectly tried to insert into a non-existent `subject_id` column.

```python
# BEFORE (broken):
cursor.execute(
    "INSERT INTO topics (subject_id, name) VALUES (%s, %s)",
    (subject_id, name)
)

# AFTER (fixed):
cursor.execute(
    "INSERT INTO topics (unit_id, name) VALUES (%s, %s)",
    (unit_id, name)
)
```
The API endpoint also now accepts `unit_id` in the request body instead of `subject_id`.

---

#### Bug #2 — `profile()` crashes if user is deleted  
**File:** `backend/app.py`  
**Severity:** Critical — unhandled `TypeError` crashes the server process  

If a user's account is deleted from the DB but their JWT is still valid (within 6 hours),
calling `/profile` runs `dict(user)` on `None`, crashing with `TypeError`.

```python
# BEFORE (broken):
return jsonify(dict(user)), 200   # crashes if user is None

# AFTER (fixed):
if not user:
    return jsonify({"error": "User not found"}), 404
return jsonify(dict(user)), 200
```

---

#### Bug #3 — No authentication guard on protected frontend routes  
**File:** `frontend/src/App.jsx`  
**Severity:** Critical — anyone can navigate to `/dashboard`, `/notes`, etc. without logging in  

The original code had no route protection. Any user who knew the URL could reach any page.
The page would render and then silently fail as every API call returned 401.

**Fix:** Added a `ProtectedRoute` component that checks `localStorage` for a token and
redirects to `/login` if absent.

```jsx
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
```

---

#### Bug #4 — Token expiry causes silent failures, no redirect  
**File:** `frontend/src/services/api.js`  
**Severity:** Critical — expired sessions silently break the app with no user feedback  

When a JWT expires (after 6 hours), every API call returns 401. The original code had
no response interceptor, so the user saw blank pages and broken UI with no indication
they needed to log in again.

**Fix:** Added an Axios response interceptor that catches 401, clears the token,
and redirects to `/login`.

```js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 🟠 SIGNIFICANT — Wrong Behavior / Data Issues

---

#### Bug #5 — `ai_generate_note()` leaks DB connection on AI error  
**File:** `backend/app.py`  
**Severity:** High — connection pool exhaustion over time  

The original route had no `try/finally`. If `generate_note()` threw an exception
(e.g., Groq API down), the database connection was never closed. Over time this
exhausts the connection pool and makes the entire backend unresponsive.

**Fix:** Wrapped the entire route body in `try/except/finally` with `cursor.close()`
and `conn.close()` in the `finally` block.

---

#### Bug #6 — `delete_note()` always returns 200 even if note doesn't exist  
**File:** `backend/app.py`  
**Severity:** Medium — misleading API contract  

Unlike `delete_quiz()` which correctly checks `cursor.rowcount`, `delete_note()` was
returning a success response even when the note ID didn't exist or belonged to another user.

```python
# AFTER (fixed):
if cursor.rowcount == 0:
    return jsonify({"error": "Note not found or unauthorized"}), 404
```

---

#### Bug #7 — Multiple routes missing null check on `get_db_connection()`  
**File:** `backend/app.py`  
**Severity:** High — unhandled crash when DB is briefly unavailable  

`get_db_connection()` returns `None` on failure. Many routes (`get_subjects`, `get_notes`,
`get_quizzes`, `get_semesters`, etc.) called `.cursor()` directly on the result without
checking for `None`, causing an unhandled `AttributeError` that crashes the route handler.

**Fix:** Introduced a `require_conn()` helper that raises a typed `RuntimeError` if the
connection fails, which is caught by a registered error handler returning a clean 503 JSON.

---

#### Bug #8 — Dead/duplicate route `/subjects/<int:semester_id>`  
**File:** `backend/app.py`  
**Severity:** Medium — namespace confusion, unreachable via frontend  

The route `GET /subjects/<int:semester_id>` was defined alongside
`GET /subjects/semester/<int:semester_id>`. The frontend exclusively uses the
`/semester/` version. The bare `/<id>` version was dead code that could clash
with future routes. **Removed.**

---

### 🟡 MINOR — Security / Configuration Issues

---

#### Bug #9 — `config.py` prints DB credentials to logs  
**File:** `backend/config.py`  
**Severity:** Security — leaks DB host/name to server logs and stdout  

```python
# BEFORE (removed):
print("DB_HOST:", os.getenv("DB_HOST"))
print("DB_NAME:", os.getenv("DB_NAME"))
```

On Render (or any hosted environment), stdout is captured and often accessible to
team members, CI logs, or third-party log aggregators. Removed both print statements.

---

#### Bug #10 — `requirements.txt` saved in UTF-16 encoding  
**File:** `backend/requirements.txt`  
**Severity:** High — `pip install -r requirements.txt` may fail on some systems  

The file contained null bytes between every character (classic UTF-16 encoding).
Re-saved as clean UTF-8 ASCII.

---

#### Bug #11 — CORS allows all origins (`"*"`)  
**File:** `backend/app.py`  
**Severity:** Medium security issue for production  

```python
# BEFORE:
CORS(app, resources={r"/*": {"origins": "*"}})

# AFTER: restrict to your actual frontend URL
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", "*"),  # set this to your Vercel URL
]}})
```

Set the environment variable `FRONTEND_URL=https://your-app.vercel.app` on Render.

---

#### Bug #12 — Conflicting Tailwind versions in `package.json`  
**File:** `frontend/package.json`  
**Severity:** Medium — can cause build failures or Tailwind not working  

The project had both `tailwindcss: ^3.4.4` (v3) AND `@tailwindcss/vite: ^4.1.18`
(a v4-only plugin). These are incompatible. The project's CSS uses v3 `@tailwind`
directives and has a `tailwind.config.js`, so v3 is the correct setup.

**Fix:** Removed `@tailwindcss/vite` from `devDependencies`. The project works correctly
with v3 + PostCSS (which is already configured via `postcss.config.js`).

---

### ⚪ MINOR CODE QUALITY

---

**Bug #13** — `signup` / `login` don't sanitize input (no `.strip()` / `.lower()` on email)  
Fixed: email is now `.strip().lower()` before DB insert/lookup to prevent duplicate accounts
with different casing (e.g., `User@Gmail.com` vs `user@gmail.com`).

**Bug #14** — `signup` has no minimum password length check  
Fixed: Added `if len(password) < 6` check returning a 400 error.

**Bug #15** — `ai_generate_note()` cursor not closed before `conn.close()`  
Fixed as part of Bug #5's `try/finally` refactor.

---

## PART 2: DESIGN IMPROVEMENTS

You're right — the current UI has a strong "AI-generated template" feel.
Here's a breakdown of what causes it and how to fix it.

---

### Why It Looks AI-Made Right Now

The design isn't bad — it's actually quite polished. The problem is it's too *systematic*.
Every card looks the same. Every color is the same amber. Every section has the same
glass background, the same border radius, the same fade-up animation.
It has no personality, no hierarchy, no surprise.

Specific culprits:
- The "AI-POWERED LEARNING PLATFORM" badge with the green dot pulse — this literally
  looks like every SaaS AI template from 2023
- Unicode icons (◈, ✎, ◉, ∿) instead of real SVGs — they render differently across
  browsers and look like placeholder characters
- All pages share the exact same visual language with no differentiation
- The login page split layout is the #1 most cloned SaaS login design on GitHub
- Every stat card is identical (amber gradient top bar, italic number, uppercase label)
- The ambient background orbs that slowly float — overused in AI products

---

### Fix #1 — Replace Unicode Icons With Real SVG Icons

Install heroicons or lucide-react:
```bash
npm install lucide-react
```

Replace this throughout the app:
```jsx
// BEFORE: looks like a typo
{ icon: "◈", label: "Subjects" }

// AFTER: crisp, professional
import { BookOpen, PenLine, CircleDot, BarChart3, Star, FileText } from "lucide-react";
{ icon: <BookOpen size={18} />, label: "Subjects" }
```

---

### Fix #2 — Differentiate Pages Visually

Right now, Generate Note, Generate Quiz, Analytics, and FYP Guide all look
identical at first glance. Give each page its own color identity:

```jsx
// Each page gets its own accent color applied to the heading and key UI elements

// Generate Note  → teal (#2dd4bf)   — "writing" vibes
// Generate Quiz  → violet (#a78bfa) — "thinking" vibes
// Analytics      → rose (#fb7185)   — "performance" vibes
// Chat Tutor     → emerald          — "conversation" vibes
// FYP Guide      → amber            — "roadmap" vibes
```

Change the page title color to match the accent, and tint the main action button
to match. This alone makes each page feel intentional.

---

### Fix #3 — Break the Login Page Template Look

The current split layout (left: branding + feature list, right: form) is
the most overused SaaS layout pattern. Some alternatives:

**Option A — Full-width form with floating cards:**
Put the form in the center. Let the background show abstract floating "subject cards"
(Data Structures, DBMS, etc.) that softly blur behind the form.

**Option B — Academic/editorial style:**
Use a serif headline in a different size hierarchy. Make the left panel look like a
college notebook or textbook page rather than a SaaS product page.

**Option C — Dark minimal:**
Single centered form, no left panel at all. Let the ambient background do the work.
Add a subtle divider line above the logo. Much more confident, less "I built this with
a template."

---

### Fix #4 — Remove or Restyle the "AI-POWERED" Badge

```jsx
// BEFORE — screams SaaS template:
<div style={{ background: "var(--amber-dim)", border: "1px solid rgba(245,158,11,0.25)" }}>
  <span className="dot-pulse" />
  <span>AI-POWERED LEARNING PLATFORM</span>
</div>

// AFTER — understated, confident:
<div style={{
  display: "inline-flex", alignItems: "center", gap: 6,
  fontSize: "0.72rem", color: "var(--ink-3)", letterSpacing: "0.12em",
  textTransform: "uppercase", fontWeight: 500,
}}>
  <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--emerald)" }}/>
  MCA Study Companion
</div>
```

The new badge says less and conveys more trust.

---

### Fix #5 — Vary the Stat Cards on the Dashboard

Currently all 4 stats cards use the same layout. Add a "featured" large card for
the most important stat (Average Score) and make the other 3 smaller:

```jsx
// One wide card for the avg score (shows a tiny spark bar too)
// Three compact cards side by side for quizzes, notes, subjects
```

This creates a hierarchy that guides the eye and looks designed rather than templated.

---

### Fix #6 — Add a Real Empty State for New Users

When a user first signs up, the dashboard shows all "—" values and a blank
Recent Activity box. That's jarring. Add a proper onboarding empty state:

```jsx
{!personal?.my_quizzes && !personal?.my_notes && (
  <div style={{ padding: "32px", textAlign: "center", border: "2px dashed var(--border)" }}>
    <h3>Welcome to EduGenie 👋</h3>
    <p>Start by generating your first note or quiz below.</p>
    <button onClick={() => navigate("/generate-note")} className="btn-glow">
      Generate Your First Note →
    </button>
  </div>
)}
```

---

### Fix #7 — Add a Breadcrumb to Subjects → Units → Topics Flow

The Subjects → Units → Topics drill-down currently has no navigation context.
Users get "lost" in the hierarchy. Add a simple breadcrumb:

```jsx
// e.g. in the Units page: Subjects > Data Structures > Units
<div style={{ display: "flex", gap: 8, fontSize: "0.78rem", color: "var(--ink-3)", marginBottom: 20 }}>
  <span onClick={() => navigate("/subjects")} style={{ cursor: "pointer", color: "var(--amber)" }}>
    Subjects
  </span>
  <span>/</span>
  <span>{subjectName}</span>
</div>
```

---

### Fix #8 — Make the Chat Tutor Feel Like a Real Chat App

The chat UI is functional but the subject dropdown at the top feels like a form.
Suggestions:

- Move the subject selector into the chat input area (a small chip/tag before the
  text input, like Slack's `/` commands)
- Add message timestamps
- Add a "Clear chat" button
- Show the AI typing indicator earlier (immediately after user sends, not after API responds)

---

### Fix #9 — Polish the Analytics Page Charts

The custom SVG TrendChart is minimal. A few quick wins:

- Add X-axis gridlines with subtle date labels
- Show a tooltip on hover with the subject name and score
- The bar chart for subjects would benefit from a horizontal layout with ranked bars
  (like a leaderboard) rather than just the current text list

---

### Recommended New Features

1. **Study Streak Tracker** — Show a GitHub-style contribution grid of daily activity.
   Students love streaks. This alone would increase daily engagement significantly.

2. **Bookmark / Favorite Notes** — Let users star important notes.
   Starred notes appear in a "Quick Review" section on the dashboard.

3. **Quiz Retry / Practice Mode** — Let users retake a quiz from Quiz History.
   Currently there's no way to practice with saved quizzes.

4. **Export Notes as PDF** — The note download only saves `.txt`.
   Add a "Download as PDF" option using the browser's `window.print()` API with
   a print-specific CSS media query.

5. **Subject Progress Heatmap on Dashboard** — Show a mini grid of all subjects
   with color-coded progress percentage. At a glance, students can see which
   subjects need more attention.

6. **Timed Quiz Review After Submit** — After the timer runs out or the user submits,
   show a review screen: which questions were wrong, the correct answers, and a
   brief explanation. This is the most valuable educational feature missing.

7. **Dark/Light Mode Toggle** — The design is fully dark-mode only.
   Even a basic system preference detection (`prefers-color-scheme`) would improve
   accessibility for many users.

---

## Summary of Fixed Files

| File | Changes |
|------|---------|
| `backend/config.py` | Removed debug `print` statements |
| `backend/app.py` | Fixed 8 bugs: wrong column in `create_topic`, null user in `profile`, missing null checks, connection leak in `ai_generate_note`, `delete_note` always 200, email sanitization, dead route removed, CORS restricted |
| `backend/requirements.txt` | Re-encoded as UTF-8 (was UTF-16) |
| `frontend/src/App.jsx` | Added `ProtectedRoute` component guarding all authenticated routes |
| `frontend/src/services/api.js` | Added 401 response interceptor for token expiry → auto-redirect to login |
| `frontend/package.json` | Removed `@tailwindcss/vite` (v4 plugin incompatible with Tailwind v3 setup) |
