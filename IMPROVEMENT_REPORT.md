# EduGenie — Production Hardening Report

**Scope:** Backend only (`ai.py`, `app.py`, `db.py`)  
**Constraint:** Zero breaking changes — all existing API routes, response shapes, and frontend contracts preserved.  
**Verified:** All three files pass `ast.parse()` syntax check. `validate_quiz_structure` passes 5 unit tests.

---

## File 1 — `ai.py`

### Change 1 · Add `time` and `logging` imports + module logger

**Issue:** Module had no logging facility. Errors were surfaced only if the caller happened to `print()` them — or were silently swallowed.

```python
# BEFORE
import os
import requests
from dotenv import load_dotenv
load_dotenv()

# AFTER
import os
import time
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
```

**Why:** `logging.getLogger(__name__)` integrates with the root logger configured in `app.py`, so all AI-layer events appear in the same log stream with timestamps and levels. Zero cost when logging is at WARNING level in production.

---

### Change 2 · `call_groq` — timeout + retry + proper exception raising

**Issue (critical):** The original function had three serious flaws:

1. **No timeout** — a slow Groq API would hang the Flask worker thread indefinitely, eventually exhausting the Gunicorn pool and taking down the whole app.
2. **No retry** — transient 5xx or network blips caused instant failure.
3. **Silent failure** — on API error it returned the string `"Error generating content."` instead of raising, so `ai_generate_note` would silently save that string as note content to the database.

```python
# BEFORE
def call_groq(prompt):
    data = { ... }
    response = requests.post(GROQ_URL, headers=HEADERS, json=data)
    if response.status_code != 200:
        print("Groq Error:", response.text)
        return "Error generating content."           # ← silent failure
    return response.json()["choices"][0]["message"]["content"]

# AFTER
def call_groq(prompt, timeout=30, max_retries=2):
    data = { ... }
    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(
                GROQ_URL, headers=HEADERS, json=data, timeout=timeout   # ← 30s deadline
            )
            if response.status_code != 200:
                last_error = f"API returned HTTP {response.status_code}"
                logger.warning("Groq API error on attempt %d/%d — %s: %s",
                               attempt, max_retries, last_error, response.text[:200])
                if attempt < max_retries:
                    time.sleep(1)                                       # ← 1s back-off
                continue
            return response.json()["choices"][0]["message"]["content"]
        except requests.exceptions.Timeout:
            last_error = "Request timed out"
            logger.warning("Groq API timeout on attempt %d/%d", attempt, max_retries)
            if attempt < max_retries:
                time.sleep(1)
        except requests.exceptions.RequestException as exc:
            last_error = str(exc)
            logger.error("Groq API network error on attempt %d/%d: %s", attempt, max_retries, exc)
            if attempt < max_retries:
                time.sleep(1)
        except (KeyError, IndexError) as exc:
            logger.error("Groq API unexpected response shape: %s", exc)
            raise RuntimeError("AI service returned an unexpected response format") from exc
    logger.error("Groq API failed after %d attempts: %s", max_retries, last_error)
    raise RuntimeError(f"AI service unavailable after {max_retries} attempts: {last_error}")
```

**Why this is safe:** Every caller of `call_groq` is already wrapped in `try/except Exception` inside `app.py`, so raising `RuntimeError` is correctly caught and returned as a `{"error": "..."}` JSON response.

---

### Change 3 · `validate_quiz_structure` — new function

**Issue:** After `generate_quiz` returns, the JSON was parsed but never structure-checked. A quiz with missing `options`, a string `correct_answer`, or fewer than 4 options would reach the frontend and crash the quiz renderer silently.

```python
# BEFORE — no validation existed at all

# AFTER — added after generate_quiz
def validate_quiz_structure(data):
    """
    Returns (True, None) on success or (False, reason_str) on failure.
    Checks: top-level shape, each question has .question (str),
    .options (list of exactly 4 non-empty strings),
    .correct_answer (int 0-3).
    """
    if not isinstance(data, dict):
        return False, "Response is not a JSON object"
    questions = data.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        return False, "Missing or empty 'questions' array"
    for idx, q in enumerate(questions):
        prefix = f"questions[{idx}]"
        if not isinstance(q, dict):
            return False, f"{prefix} is not an object"
        if not isinstance(q.get("question"), str) or not q["question"].strip():
            return False, f"{prefix}.question is missing or empty"
        options = q.get("options")
        if not isinstance(options, list) or len(options) != 4:
            return False, f"{prefix}.options must be an array of exactly 4 items"
        if not all(isinstance(o, str) and o.strip() for o in options):
            return False, f"{prefix}.options must all be non-empty strings"
        ca = q.get("correct_answer")
        if not isinstance(ca, int) or ca not in (0, 1, 2, 3):
            return False, f"{prefix}.correct_answer must be an integer 0-3"
    return True, None
```

**Unit test results (all pass):**
- Valid quiz → `(True, None)` ✓
- Missing `questions` key → `(False, "Missing or empty 'questions' array")` ✓
- Only 2 options → `(False, "questions[0].options must be an array of exactly 4 items")` ✓
- `correct_answer = 5` → `(False, "questions[0].correct_answer must be an integer 0-3")` ✓
- `correct_answer = "0"` (string) → `(False, ...)` ✓

---

## File 2 — `app.py`

### Change 1 · Structured logging setup

**Issue:** No logging was configured at the application level. `print()` calls were scattered but invisible in most production setups (Gunicorn, Render, Railway, etc. all capture `logging` output but can suppress stdout).

```python
# BEFORE
import os
from dotenv import load_dotenv
load_dotenv()

# AFTER
import os
import logging
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
```

**Why:** Single `basicConfig` call at app startup configures the root logger. All child loggers (`ai.py`, `db.py`) automatically inherit it. Log lines now look like:

```
2025-05-05 14:32:11,042 [INFO] app: Quiz generated: subject=DBMS topic=Normalization difficulty=medium questions=5
2025-05-05 14:32:11,512 [ERROR] ai: Groq API timeout on attempt 1/2
```

---

### Change 2 · `ai_generate_quiz` — integrate structure validation + log success

**Issue:** After parsing the quiz JSON, no structural check was performed. A malformed AI response silently reached the INSERT and the frontend.

```python
# BEFORE
quiz_raw = generate_quiz(subject_name, topic_name, difficulty, num_questions)
try:
    quiz_content = json.loads(quiz_raw)
except (json.JSONDecodeError, TypeError):
    return jsonify({"error": "AI returned invalid JSON format"}), 500

# AFTER
quiz_raw = generate_quiz(subject_name, topic_name, difficulty, num_questions)
try:
    quiz_content = json.loads(quiz_raw)
except (json.JSONDecodeError, TypeError):
    logger.error("Quiz JSON parse failed for subject=%s topic=%s — raw snippet: %s",
                 subject_name, topic_name, str(quiz_raw)[:200])
    return jsonify({"error": "AI returned invalid JSON format"}), 500

valid, validation_error = validate_quiz_structure(quiz_content)
if not valid:
    logger.error("Quiz structure invalid for subject=%s topic=%s — reason: %s",
                 subject_name, topic_name, validation_error)
    return jsonify({"error": f"AI returned a malformed quiz: {validation_error}"}), 500

logger.info("Quiz generated: subject=%s topic=%s difficulty=%s questions=%d",
            subject_name, topic_name, difficulty, len(quiz_content.get("questions", [])))
```

**Why:** The DB insert and frontend serialisation now only happen when the quiz is provably well-formed. The logged snippet on parse failure makes debugging AI regressions fast.

---

### Change 3 · `ai_generate_quiz` — min-length validation for free-text names

**Issue:** A user could submit `subject_name="ab"` and the AI would generate nonsense or fail confusingly.

```python
# BEFORE
elif subject_name and topic_name:
    subject_id = None
    topic_id   = None

# AFTER
elif subject_name and topic_name:
    subject_name = subject_name.strip()
    topic_name   = topic_name.strip()
    if len(subject_name) < 3 or len(topic_name) < 3:
        return jsonify({"error": "Subject and topic names must each be at least 3 characters"}), 400
    subject_id = None
    topic_id   = None
```

---

### Change 4 · `ai_generate_topics` — min-length validation

**Issue:** Same problem — `subject_name="ab"` would reach the AI and produce garbage results.

```python
# BEFORE
if not subject_name:
    return jsonify({"error": "Subject name required"}), 400

# AFTER
if not subject_name:
    return jsonify({"error": "Subject name required"}), 400
if len(subject_name) < 3:
    return jsonify({"error": "Subject name must be at least 3 characters"}), 400
```

---

### Change 5 · `ai_chat` — add `timeout=30`

**Issue:** The direct `requests.post` in the chat handler had no timeout. A slow Groq response would block the worker indefinitely. This is the busiest endpoint — it's called on every chat message.

```python
# BEFORE
response = requests.post(
    GROQ_URL, headers=HEADERS,
    json={"model": ..., "messages": messages, "temperature": 0.7, "max_tokens": 1024},
)

# AFTER
response = requests.post(
    GROQ_URL, headers=HEADERS,
    json={"model": ..., "messages": messages, "temperature": 0.7, "max_tokens": 1024},
    timeout=30,   # ← never block a worker indefinitely
)
```

**Note:** Unlike `call_groq`, the chat handler does NOT get automatic retry — for chat, failing fast and letting the user retry is better UX than a 2×30s wait.

---

### Change 6 · Fix double `conn.close()` crash bug in `get_personal_analytics`

**Issue (critical):** The `except` block called `conn.close()` and then `return`ed, but the `finally` block **also** called `conn.close()`. Closing an already-closed psycopg2 connection raises `InterfaceError: connection already closed`, which would turn a handled error into an unhandled 500.

```python
# BEFORE
    except Exception as e:
        print("analytics error:", e)
        conn.rollback()
        conn.close()          # ← closes here
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()          # ← closes again → InterfaceError crash!

# AFTER
    except Exception as e:
        logger.error("analytics error for user_id=%s: %s", user_id, e)
        conn.rollback()
        return jsonify({"error": str(e)}), 500   # ← no close here
    finally:
        conn.close()          # ← single authoritative close
```

---

### Change 7 · Same double-close fix in `get_personal_dashboard`

Identical pattern, same fix applied.

---

### Change 8 · Replace all remaining `print()` error calls with `logger`

All `print("... error:", e)` calls in `submit_quiz`, `ai_fyp_guide`, `ai_resume_generate`, `ai_resume_improve`, `ai_resume_compile`, and `ai_chat` replaced with `logger.error(...)`.

**Why:** In production (Gunicorn + Render/Railway), stdout may not be surfaced in the log aggregator at all. `logging` output always is.

---

## File 3 — `db.py`

### Change 1 · Add `logging` import + module logger

### Change 2 · Replace `print()` in `get_db_connection` with `logger.error`

```python
# BEFORE
except psycopg2.Error as err:
    print("Database connection error:", err)
    return None

# AFTER
except psycopg2.Error as err:
    logger.error("Database connection failed: %s", err)
    return None
```

### Change 3 · Replace all `print()` migration messages with `logger.info` / `logger.error`

Every `print("Migration: ...")` replaced with `logger.info(...)` and the error handler's `print("Error initializing tables:", err)` replaced with `logger.error(...)`.

---

## Summary of all changes

| # | File | Change | Risk |
|---|------|--------|------|
| 1 | `ai.py` | Add `time`, `logging` imports + module logger | None |
| 2 | `ai.py` | `call_groq` — 30s timeout + 2-attempt retry + raises on failure | None — all callers already in try/except |
| 3 | `ai.py` | `validate_quiz_structure` — new exported function | None — additive |
| 4 | `app.py` | Logging setup at module level | None |
| 5 | `app.py` | Import `validate_quiz_structure` from `ai` | None |
| 6 | `app.py` | Quiz route: structure-validate after JSON parse, log success | None — returns existing 500 on failure |
| 7 | `app.py` | Quiz route: reject free-text names < 3 chars | None — new 400 only on clearly invalid input |
| 8 | `app.py` | Topics route: reject subject name < 3 chars | None |
| 9 | `app.py` | Chat handler: add `timeout=30` | None |
| 10 | `app.py` | **Fix crash bug**: remove extra `conn.close()` from analytics except | Bug fix |
| 11 | `app.py` | **Fix crash bug**: remove extra `conn.close()` from dashboard except | Bug fix |
| 12 | `app.py` | All `print()` errors → `logger` | None |
| 13 | `app.py` | Add `logger.info` for note generation success | None |
| 14 | `db.py` | Add logging import + module logger | None |
| 15 | `db.py` | All `print()` → `logger` | None |

**No routes renamed. No response shapes changed. No schema altered. No frontend files touched.**
