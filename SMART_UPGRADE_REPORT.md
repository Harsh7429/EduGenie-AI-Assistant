# EduGenie — Smart Adaptive Learning Upgrade Report

**Status:** All 4 files pass syntax check. All 9 unit tests pass.  
**Contract:** Zero breaking changes — every existing API field preserved. New fields are purely additive.

---

## New file: `helpers.py`

A clean, stateless utility module imported by `app.py`. Nothing in the existing codebase was moved here — it is purely additive.

### Function 1 — `compute_percentage(score, total)`

```python
# BEFORE — percentage was computed inline in 4 different places,
#          inconsistently, with no zero-guard
#          e.g. score / total_marks * 100  ← crashes if total_marks is 0

# AFTER
def compute_percentage(score: float, total: float) -> float:
    try:
        if total <= 0:
            return 0.0
        return round((score / total) * 100, 1)
    except (TypeError, ZeroDivisionError):
        return 0.0
```

**Why safe:** Purely additive. Never raises. Returns 0.0 on any invalid input.

---

### Function 2 — `detect_weak_topic(percentage)`

```python
# BEFORE — no concept of weak topic existed in the codebase

# AFTER
WEAK_THRESHOLD   = 50.0
STRONG_THRESHOLD = 80.0

def detect_weak_topic(percentage: float) -> bool:
    return percentage < WEAK_THRESHOLD
```

**Why safe:** Pure function, no side effects. `WEAK_THRESHOLD` and `STRONG_THRESHOLD` are exported so `app.py` can reference them — single source of truth if you ever want to adjust thresholds.

---

### Function 3 — `evaluate_quiz(quiz_content, user_answers)`

```python
# BEFORE — score was always computed by the frontend; backend trusted it blindly

# AFTER
def evaluate_quiz(quiz_content, user_answers) -> dict:
    """
    Returns:
    {
        "score":             int,
        "total":             int,
        "percentage":        float,
        "is_weak":           bool,
        "correct_indices":   [0-based list],
        "incorrect_indices": [0-based list],
        "unanswered":        [0-based list],
    }
    """
    questions = quiz_content.get("questions", [])
    # Pads short answer lists with None — never crashes on length mismatch
    answers = (list(user_answers) + [None] * total)[:total]
    ...
```

**Unit test results (all 9 pass):**
| Test | Result |
|------|--------|
| `compute_percentage(4,5)` → 80.0 | ✓ |
| `compute_percentage(3,0)` → 0.0 (zero guard) | ✓ |
| `detect_weak_topic(49.9)` → True | ✓ |
| `detect_weak_topic(50.0)` → False (boundary) | ✓ |
| evaluate_quiz all correct → 100% not weak | ✓ |
| evaluate_quiz 1/4 correct → 25% weak | ✓ |
| evaluate_quiz with None answers | ✓ |
| evaluate_quiz short answer list padded | ✓ |
| evaluate_quiz empty quiz → 0/0 | ✓ |

---

### Class 4 — `_QuizCache` / `quiz_cache` singleton

```python
# BEFORE — every quiz request always hit the Groq API regardless of topic/difficulty

# AFTER — in-memory TTL cache, zero external dependencies
class _QuizCache:
    DEFAULT_TTL = 600   # 10 minutes

    def get(self, key)  → cached_value | None   # returns None if expired
    def set(self, key, value, ttl=600)           # stores with deadline
    def invalidate(self, key)                    # manual eviction
    def make_key(subject, topic, difficulty, n)  # canonical key builder

quiz_cache = _QuizCache()   # module-level singleton
```

**Cache key format:** `"dbms|normalization|medium|5"` — lowercased, pipe-separated.  
**TTL test:** set with `ttl=1`, sleep 1.1s, get returns None. ✓  
**No Redis. No threads. No locks.** Works identically under Gunicorn (each worker has its own cache — that is intentional and correct for this scale).

---

## `db.py` — Safe schema migration

### Change: `is_weak` column in `quiz_attempts`

```python
# BEFORE — quiz_attempts had no weak-topic signal

# AFTER — added inside initialize_progress_tables()
if not _col_exists(cursor, 'quiz_attempts', 'is_weak'):
    cursor.execute(
        "ALTER TABLE quiz_attempts ADD COLUMN is_weak BOOLEAN DEFAULT NULL"
    )
    logger.info("Migration: added is_weak to quiz_attempts")
```

**Why safe:**
- Uses the existing `_col_exists` guard — runs `ALTER TABLE` exactly once, never twice.
- `DEFAULT NULL` — existing rows keep `NULL` (meaning "evaluated by client"). No backfill needed.
- Runs inside the existing `initialize_progress_tables()` transaction. If it fails, it rolls back cleanly — no partial state.

---

## `app.py` — Three route upgrades

### Change 1 · `ai_generate_quiz` — In-memory cache integration

```python
# BEFORE
quiz_raw = generate_quiz(subject_name, topic_name, difficulty, num_questions)
# → always hits Groq API

# AFTER
cache_key    = quiz_cache.make_key(subject_name, topic_name, difficulty, num_questions)
quiz_content = quiz_cache.get(cache_key)    # ← check first

if quiz_content is not None:
    logger.info("Quiz served from cache: ...")    # no AI call
else:
    quiz_raw     = generate_quiz(...)             # AI call only on miss
    quiz_content = json.loads(quiz_raw)
    # ... validate ...
    quiz_cache.set(cache_key, quiz_content)       # store on success
```

**Why safe:** Cache misses fall through to the exact same AI path as before. A cache hit returns the exact same validated dict structure the DB insert and frontend already expect. The quiz is still saved to the database on every request (cache only skips the AI generation, not the DB record).

---

### Change 2 · `submit_quiz` — Server-side evaluation + `is_weak` tracking

```python
# BEFORE — accepted score/total_marks from frontend; stored them blindly
# INSERT INTO quiz_attempts (user_id, subject_id, topic_id, quiz_id, score, total_marks)

# AFTER — accepts optional user_answers for server-side verification
user_answers = data.get("user_answers")   # NEW — optional list[int|None]

if user_answers is not None and isinstance(user_answers, list):
    quiz_content = json.loads(quiz["content"])  # loaded from DB — authoritative
    evaluation   = evaluate_quiz(quiz_content, user_answers)
    score        = float(evaluation["score"])   # override client score
    total_marks  = float(evaluation["total"])
    is_weak      = evaluation["is_weak"]
else:
    # OLD path — client-provided score, derive is_weak from it
    percentage = compute_percentage(score, total_marks)
    is_weak    = detect_weak_topic(percentage)

# INSERT now stores is_weak
INSERT INTO quiz_attempts (..., is_weak) VALUES (..., %s)
```

**Backward-compatibility table:**

| Frontend sends | Backend does | is_weak stored |
|----------------|--------------|----------------|
| `score` + `total_marks` only (existing) | uses client score, derives is_weak | ✓ |
| `score` + `total_marks` + `user_answers` (new) | server overrides score, evaluates fully | ✓ |

**Existing response fields unchanged:**

```json
{
    "message":             "Quiz submitted successfully",  ← unchanged
    "average_score":       4.2,                           ← unchanged
    "progress_percentage": 66.67                          ← unchanged
}
```

**New additive fields** (older frontend ignores them automatically):

```json
{
    "is_weak":           true,
    "percentage":        40.0,
    "recommended_retry": true,
    "evaluation": {
        "score":             2,
        "total":             5,
        "percentage":        40.0,
        "is_weak":           true,
        "correct_indices":   [0, 2],
        "incorrect_indices": [1, 3, 4],
        "unanswered":        []
    }
}
```

---

### Change 3 · `/analytics/personal` — Weak/strong topics + trend + recommendations

```python
# BEFORE — returned 7 fields, no topic-level intelligence

# AFTER — adds 4 new fields, all existing 7 preserved exactly
```

**New query added (does not modify existing queries):**

```sql
SELECT t.name  AS topic_name,
       s.name  AS subject_name,
       ROUND(CAST(AVG(qa.score / qa.total_marks * 100) AS NUMERIC), 1) AS avg_pct,
       COUNT(*) AS attempts
FROM quiz_attempts qa
JOIN topics   t ON qa.topic_id   = t.id
JOIN subjects s ON qa.subject_id = s.id
WHERE qa.user_id = %s AND qa.topic_id IS NOT NULL AND qa.total_marks > 0
GROUP BY qa.topic_id, t.name, s.name
ORDER BY avg_pct ASC
```

This drives all three new fields:

**`weak_topics`** — topics where avg < 50%:
```json
"weak_topics": [
    { "topic": "Normalization", "subject": "DBMS", "avg": 34.0, "attempts": 3 },
    { "topic": "Deadlocks",     "subject": "OS",   "avg": 41.0, "attempts": 2 }
]
```

**`strong_topics`** — topics where avg ≥ 80%:
```json
"strong_topics": [
    { "topic": "OOP Concepts", "subject": "Java", "avg": 88.0, "attempts": 5 }
]
```

**`improvement_trend`** — compares older half vs newer half of last 10 attempts:
```json
"improvement_trend": "improving"   // or "declining" or "neutral"
```
Logic: if newer average − older average ≥ 5 points → `"improving"`, ≤ −5 → `"declining"`, else `"neutral"`. Requires at least 4 data points, otherwise defaults to `"neutral"`.

**`recommended_topics`** — top 5 weak topics with human-readable reason:
```json
"recommended_topics": [
    {
        "topic":   "Normalization",
        "subject": "DBMS",
        "avg":     34.0,
        "reason":  "Score 34.0% is below the 50% threshold — retry recommended"
    }
]
```

---

## Complete change summary

| # | File | Change | Type | Risk |
|---|------|--------|------|------|
| 1 | `helpers.py` | New file: `compute_percentage`, `detect_weak_topic`, `evaluate_quiz`, `_QuizCache` | Additive | None |
| 2 | `db.py` | `is_weak BOOLEAN DEFAULT NULL` migration in `quiz_attempts` | Safe migration | None — guarded by `_col_exists` |
| 3 | `app.py` | Import helpers + constants | Additive | None |
| 4 | `app.py` | `ai_generate_quiz` — cache check/set around AI call | Enhancement | None — miss path identical to before |
| 5 | `app.py` | `submit_quiz` — optional server-side eval, `is_weak` stored | Backward-compat enhancement | None — `user_answers` is optional |
| 6 | `app.py` | `submit_quiz` — fetch `content` column from quizzes | Enhancement | None — SELECT extended, not modified |
| 7 | `app.py` | `/analytics/personal` — 4 new additive fields | Additive | None — all 7 existing fields preserved |

**No routes renamed. No response fields removed. No frontend files touched. No new pip packages required.**
