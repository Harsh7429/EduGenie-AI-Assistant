import os
from dotenv import load_dotenv
load_dotenv()

from flask import Flask, request, jsonify
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from flask_cors import CORS
from datetime import timedelta
import bcrypt
import psycopg2.extras

from db import get_db_connection
from ai import generate_note, generate_quiz, generate_topics, GROQ_URL, HEADERS
import requests


app = Flask(__name__)

# ── CORS: restrict to your actual frontend domain in production ──────
# Replace the origin list with your deployed Vercel URL.
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", "*"),  # set FRONTEND_URL=https://your-app.vercel.app
]}}, supports_credentials=True)

# ── JWT ──────────────────────────────────────────────────────────────
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=6)
jwt = JWTManager(app)


# ── Helpers ──────────────────────────────────────────────────────────
def dict_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


def require_conn():
    """Get a DB connection or raise a 503 response."""
    conn = get_db_connection()
    if not conn:
        raise RuntimeError("db_unavailable")
    return conn


# ── Error handlers ───────────────────────────────────────────────────
@app.errorhandler(RuntimeError)
def handle_runtime(e):
    if str(e) == "db_unavailable":
        return jsonify({"error": "Database temporarily unavailable"}), 503
    return jsonify({"error": str(e)}), 500


# ── HOME ─────────────────────────────────────────────────────────────
@app.route("/")
def home():
    return "EduGenie Backend is Running!"


# ── SIGNUP ───────────────────────────────────────────────────────────
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json or {}
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    conn = require_conn()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed.decode("utf-8"))
        )
        conn.commit()
    except Exception:
        conn.rollback()
        return jsonify({"error": "An account with that email already exists"}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "User registered successfully"}), 201


# ── LOGIN ─────────────────────────────────────────────────────────────
@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    if not user or not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=str(user["id"]))
    return jsonify({"access_token": access_token}), 200


# ── PROFILE ───────────────────────────────────────────────────────────
@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = dict_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    # FIX: guard against deleted/missing user
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(dict(user)), 200


# =========================
# SUBJECT ROUTES
# =========================

@app.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("SELECT id, name FROM subjects ORDER BY name")
        subjects = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(s) for s in subjects]), 200


# NOTE: /subjects/<semester_id> removed — duplicate of /subjects/semester/<semester_id>
# Frontend uses /subjects/semester/<id>, so that route is the canonical one.


@app.route("/subjects/semester/<int:semester_id>", methods=["GET"])
@jwt_required()
def get_subjects_by_semester(semester_id):
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, name FROM subjects WHERE semester_id = %s ORDER BY name",
            (semester_id,)
        )
        subjects = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(s) for s in subjects]), 200


@app.route("/elective-group/<int:group_id>/subjects", methods=["GET"])
@jwt_required()
def get_subjects_by_elective_group(group_id):
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, name, code FROM subjects WHERE elective_group = %s ORDER BY name",
            (group_id,)
        )
        subjects = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(s) for s in subjects]), 200


@app.route("/semesters", methods=["GET"])
@jwt_required()
def get_semesters():
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("SELECT id, name FROM semesters ORDER BY id")
        semesters = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(s) for s in semesters]), 200


@app.route("/subjects", methods=["POST"])
@jwt_required()
def create_subject():
    data = request.json or {}
    name = data.get("name", "").strip()
    if not name:
        return jsonify({"error": "Subject name required"}), 400

    conn   = require_conn()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO subjects (name) VALUES (%s)", (name,))
        conn.commit()
    except Exception:
        conn.rollback()
        return jsonify({"error": "Subject already exists"}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Subject created successfully"}), 201


# =========================
# TOPIC / UNIT ROUTES
# =========================

@app.route("/topics/subject/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_topics_by_subject(subject_id):
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("""
            SELECT t.id, t.name, u.name AS unit_name
            FROM topics t
            JOIN units u ON t.unit_id = u.id
            WHERE u.subject_id = %s
            ORDER BY u.id, t.id
        """, (subject_id,))
        topics = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(t) for t in topics]), 200


@app.route("/topics/<int:unit_id>", methods=["GET"])
@jwt_required()
def get_topics(unit_id):
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, name FROM topics WHERE unit_id = %s ORDER BY id",
            (unit_id,)
        )
        topics = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(t) for t in topics]), 200


@app.route("/units/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_units(subject_id):
    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute(
            "SELECT id, name FROM units WHERE subject_id = %s ORDER BY id",
            (subject_id,)
        )
        units = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(u) for u in units]), 200


@app.route("/topics", methods=["POST"])
@jwt_required()
def create_topic():
    data    = request.json or {}
    # FIX: was incorrectly using subject_id; topics belong to a unit
    unit_id = data.get("unit_id")
    name    = data.get("name", "").strip()

    if not unit_id or not name:
        return jsonify({"error": "Unit ID and topic name required"}), 400

    conn   = require_conn()
    cursor = conn.cursor()
    try:
        # FIX: column is unit_id, not subject_id
        cursor.execute(
            "INSERT INTO topics (unit_id, name) VALUES (%s, %s)",
            (unit_id, name)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        return jsonify({"error": "Topic already exists"}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Topic created successfully"}), 201


# =========================
# PROGRESS
# =========================
@app.route("/progress/subjects", methods=["GET"])
@jwt_required()
def get_subject_progress():
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = dict_cursor(conn)
    try:
        cursor.execute("""
            SELECT
                s.id   AS subject_id,
                s.name AS subject_name,
                COALESCE(up.average_score,       0) AS average_score,
                COALESCE(up.progress_percentage, 0) AS progress_percentage
            FROM subjects s
            LEFT JOIN user_progress up
                   ON s.id = up.subject_id AND up.user_id = %s
            ORDER BY s.name
        """, (user_id,))
        subjects = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(s) for s in subjects]), 200


# =========================
# DASHBOARD
# =========================
@app.route("/dashboard/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    conn = require_conn()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM subjects")
        total_subjects = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM notes")
        total_notes = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM quizzes")
        total_quizzes = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return jsonify({
            "total_subjects": total_subjects,
            "total_notes":    total_notes,
            "total_quizzes":  total_quizzes,
            "total_users":    total_users,
        }), 200
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500


# ── AI NOTE GENERATION ────────────────────────────────────────────────
@app.route("/ai/generate-note", methods=["POST"])
@jwt_required()
def ai_generate_note():
    data = request.json or {}
    subject_id = data.get("subject_id")
    topic_id   = data.get("topic_id")

    if not subject_id or not topic_id:
        return jsonify({"error": "Subject and topic required"}), 400

    conn   = require_conn()
    cursor = dict_cursor(conn)
    try:
        cursor.execute("SELECT name FROM subjects WHERE id = %s", (subject_id,))
        subject = cursor.fetchone()
        cursor.execute("SELECT name FROM topics WHERE id = %s", (topic_id,))
        topic = cursor.fetchone()

        if not subject or not topic:
            return jsonify({"error": "Invalid subject or topic"}), 404

        # AI call happens outside the cursor but inside the try block
        ai_content = generate_note(subject["name"], topic["name"])

        user_id = int(get_jwt_identity())
        cursor.execute(
            "INSERT INTO notes (user_id, subject_id, topic_id, content) VALUES (%s, %s, %s, %s)",
            (user_id, subject_id, topic_id, ai_content)
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Note generation failed: {str(e)}"}), 500
    finally:
        # FIX: always close cursor and connection
        cursor.close()
        conn.close()

    return jsonify({"message": "AI note generated successfully", "content": ai_content}), 200


# ── AI QUIZ GENERATION ────────────────────────────────────────────────
@app.route("/ai/generate-quiz", methods=["POST"])
@jwt_required()
def ai_generate_quiz():
    import json
    user_id = int(get_jwt_identity())
    data    = request.json or {}

    subject_id    = data.get("subject_id")
    topic_id      = data.get("topic_id")
    subject_name  = data.get("subject_name")
    topic_name    = data.get("topic_name")
    difficulty    = data.get("difficulty", "medium")
    num_questions = max(3, min(15, int(data.get("num_questions", 5))))

    conn   = require_conn()
    cursor = dict_cursor(conn)

    try:
        if subject_id and topic_id:
            cursor.execute("SELECT name FROM subjects WHERE id = %s", (subject_id,))
            subj = cursor.fetchone()
            cursor.execute("SELECT name FROM topics WHERE id = %s", (topic_id,))
            top  = cursor.fetchone()
            if not subj or not top:
                return jsonify({"error": "Invalid subject or topic"}), 404
            subject_name = subj["name"]
            topic_name   = top["name"]
        elif subject_name and topic_name:
            subject_id = None
            topic_id   = None
        else:
            return jsonify({"error": "Provide either subject_id + topic_id or subject_name + topic_name"}), 400

        quiz_raw = generate_quiz(subject_name, topic_name, difficulty, num_questions)

        try:
            quiz_content = json.loads(quiz_raw)
        except (json.JSONDecodeError, TypeError):
            return jsonify({"error": "AI returned invalid JSON format"}), 500

        quiz_content_json = json.dumps(quiz_content)

        cursor.close()
        plain_cur = conn.cursor()
        plain_cur.execute("""
            INSERT INTO quizzes (user_id, subject_id, topic_id, content)
            VALUES (%s, %s, %s, %s) RETURNING id
        """, (user_id, subject_id, topic_id, quiz_content_json))
        quiz_id = plain_cur.fetchone()[0]
        conn.commit()
        plain_cur.close()

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Quiz generation failed: {str(e)}"}), 500
    finally:
        conn.close()

    return jsonify({
        "message": "Quiz generated successfully",
        "quiz":    quiz_content,
        "quiz_id": quiz_id,
    }), 200


# ── AI TOPIC GENERATION ───────────────────────────────────────────────
@app.route("/ai/generate-topics", methods=["POST"])
@jwt_required()
def ai_generate_topics():
    data         = request.json or {}
    subject_name = data.get("subject_name", "").strip()
    if not subject_name:
        return jsonify({"error": "Subject name required"}), 400
    try:
        topics_list = generate_topics(subject_name)
        return jsonify({"message": "Topics generated successfully", "topics": topics_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# NOTES
# =========================

@app.route("/notes", methods=["GET"])
@jwt_required()
def get_notes():
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = dict_cursor(conn)
    try:
        cursor.execute("""
            SELECT
                n.id, n.content, n.created_at,
                COALESCE(s.name, 'Custom') AS subject,
                COALESCE(t.name, 'Custom') AS topic
            FROM notes n
            LEFT JOIN subjects s ON n.subject_id = s.id
            LEFT JOIN topics   t ON n.topic_id   = t.id
            WHERE n.user_id = %s
            ORDER BY n.created_at DESC
        """, (user_id,))
        notes = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(n) for n in notes]), 200


@app.route("/notes/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM notes WHERE id = %s AND user_id = %s",
            (note_id, user_id)
        )
        conn.commit()
        # FIX: check if anything was actually deleted (was always returning 200 before)
        if cursor.rowcount == 0:
            return jsonify({"error": "Note not found or unauthorized"}), 404
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Note deleted successfully"}), 200


# =========================
# QUIZZES
# =========================

@app.route("/quizzes", methods=["GET"])
@jwt_required()
def get_quizzes():
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = dict_cursor(conn)
    try:
        cursor.execute("""
            SELECT
                q.id, q.content, q.created_at,
                COALESCE(s.name, 'Custom') AS subject,
                COALESCE(t.name, 'Custom') AS topic
            FROM quizzes q
            LEFT JOIN subjects s ON q.subject_id = s.id
            LEFT JOIN topics   t ON q.topic_id   = t.id
            WHERE q.user_id = %s
            ORDER BY q.created_at DESC
        """, (user_id,))
        quizzes = cursor.fetchall()
    finally:
        cursor.close()
        conn.close()
    return jsonify([dict(q) for q in quizzes]), 200


@app.route("/quizzes/<int:quiz_id>", methods=["DELETE"])
@jwt_required()
def delete_quiz(quiz_id):
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM quizzes WHERE id = %s AND user_id = %s",
            (quiz_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Quiz not found or unauthorized"}), 404
    finally:
        cursor.close()
        conn.close()
    return jsonify({"message": "Quiz deleted successfully"}), 200


# =========================
# SUBMIT QUIZ
# =========================
@app.route("/quizzes/<int:quiz_id>/submit", methods=["POST"])
@jwt_required()
def submit_quiz(quiz_id):
    user_id = int(get_jwt_identity())
    data    = request.json or {}

    score       = data.get("score")
    total_marks = data.get("total_marks")

    if score is None or total_marks is None:
        return jsonify({"error": "Score and total marks required"}), 400
    if not isinstance(score, (int, float)) or not isinstance(total_marks, (int, float)):
        return jsonify({"error": "Score and total marks must be numbers"}), 400
    if score < 0 or total_marks <= 0 or score > total_marks:
        return jsonify({"error": "Invalid score values"}), 400

    conn = require_conn()
    avg_score    = 0.0
    progress_pct = 0.0

    try:
        cur = dict_cursor(conn)
        cur.execute("SELECT subject_id, topic_id FROM quizzes WHERE id = %s", (quiz_id,))
        quiz = cur.fetchone()
        cur.close()

        if not quiz:
            return jsonify({"error": "Quiz not found"}), 404

        subject_id = quiz["subject_id"]
        topic_id   = quiz["topic_id"]

        cur = conn.cursor()
        cur.execute("""
            INSERT INTO quiz_attempts (user_id, subject_id, topic_id, quiz_id, score, total_marks)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, subject_id, topic_id, quiz_id, float(score), float(total_marks)))
        conn.commit()
        cur.close()

        if subject_id is None:
            return jsonify({"message": "Custom quiz submitted (no progress tracking)"}), 200

        cur = conn.cursor()
        cur.execute("""
            SELECT AVG(score) FROM quiz_attempts
            WHERE user_id = %s AND subject_id = %s
        """, (user_id, subject_id))
        row = cur.fetchone()
        cur.close()
        avg_score = float(row[0]) if (row and row[0] is not None) else float(score)

        cur = conn.cursor()
        cur.execute("""
            SELECT id FROM user_progress WHERE user_id = %s AND subject_id = %s
        """, (user_id, subject_id))
        existing = cur.fetchone()
        cur.close()

        cur = conn.cursor()
        if existing:
            cur.execute("""
                UPDATE user_progress SET average_score = %s
                WHERE user_id = %s AND subject_id = %s
            """, (avg_score, user_id, subject_id))
        else:
            cur.execute("""
                INSERT INTO user_progress (user_id, subject_id, average_score, progress_percentage)
                VALUES (%s, %s, %s, 0)
            """, (user_id, subject_id, avg_score))
        conn.commit()
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM topics t
            JOIN units u ON t.unit_id = u.id
            WHERE u.subject_id = %s
        """, (subject_id,))
        total_topics = cur.fetchone()[0]
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(DISTINCT topic_id) FROM quiz_attempts
            WHERE user_id = %s AND subject_id = %s AND topic_id IS NOT NULL
        """, (user_id, subject_id))
        attempted_topics = cur.fetchone()[0]
        cur.close()

        progress_pct = round((attempted_topics / total_topics * 100), 2) if total_topics > 0 else 0.0

        cur = conn.cursor()
        cur.execute("""
            UPDATE user_progress SET progress_percentage = %s
            WHERE user_id = %s AND subject_id = %s
        """, (progress_pct, user_id, subject_id))
        conn.commit()
        cur.close()

    except Exception as e:
        print("submit_quiz error:", e)
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Submission failed: {str(e)}"}), 500

    conn.close()
    return jsonify({
        "message":             "Quiz submitted successfully",
        "average_score":       round(avg_score, 2),
        "progress_percentage": progress_pct,
    }), 200


# =========================
# SUBMIT QUIZ V2
# =========================

def _grade_quiz(questions: list, answers: list) -> tuple:
    """
    Compare user answers against correct_answer indexes.

    Returns:
        correct_answers : list[bool]  — True if the user's answer matched
        score           : int         — total number of correct answers
    """
    correct_answers = [
        int(answers[i]) == int(q["correct_answer"])
        for i, q in enumerate(questions)
    ]
    return correct_answers, sum(correct_answers)


@app.route("/submit_quiz_v2", methods=["POST"])
@jwt_required()
def submit_quiz_v2():
    """
    POST /submit_quiz_v2

    Body (JSON):
        {
            "user_id":    int,
            "subject_id": int,
            "topic_id":   int,
            "quiz_id":    int,
            "answers":    [int, ...]   // selected option index per question
        }

    Response 200:
        { "score": int, "total": int, "correct_answers": [bool, ...] }
    """
    import json

    data = request.json or {}

    # ── 1. Validate required fields ───────────────────────────────────────────
    required = ["user_id", "subject_id", "topic_id", "quiz_id", "answers"]
    missing  = [f for f in required if data.get(f) is None]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    user_id    = data["user_id"]
    subject_id = data["subject_id"]
    topic_id   = data["topic_id"]
    quiz_id    = data["quiz_id"]
    answers    = data["answers"]

    for field, val in [("user_id", user_id), ("subject_id", subject_id),
                       ("topic_id", topic_id), ("quiz_id", quiz_id)]:
        if not isinstance(val, int):
            return jsonify({"error": f"'{field}' must be an integer"}), 400

    if not isinstance(answers, list) or not all(isinstance(a, int) for a in answers):
        return jsonify({"error": "'answers' must be a list of integers"}), 400

    # ── 2. Fetch quiz content from DB ─────────────────────────────────────────
    conn = require_conn()
    try:
        cur = dict_cursor(conn)
        cur.execute("SELECT content FROM quizzes WHERE id = %s", (quiz_id,))
        quiz_row = cur.fetchone()
        cur.close()

        if not quiz_row:
            return jsonify({"error": f"Quiz with id {quiz_id} not found"}), 404

        try:
            questions = json.loads(quiz_row["content"])
        except (json.JSONDecodeError, TypeError):
            return jsonify({"error": "Quiz content is corrupted or not valid JSON"}), 500

        if not isinstance(questions, list) or len(questions) == 0:
            return jsonify({"error": "Quiz has no questions"}), 500

        # ── 3. Validate answers length ────────────────────────────────────────
        total = len(questions)
        if len(answers) != total:
            return jsonify({
                "error": (
                    f"Answer count mismatch: quiz has {total} question(s), "
                    f"but {len(answers)} answer(s) were submitted"
                )
            }), 400

        # ── 4. Grade the quiz ─────────────────────────────────────────────────
        correct_answers, score = _grade_quiz(questions, answers)

        # ── 5. Normalize score to percentage for progress tracking ────────────
        normalized_score = round((score / total) * 100, 2)

        # ── 6. Persist result in quiz_attempts (with answers as JSONB) ────────
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO quiz_attempts
                (user_id, subject_id, topic_id, quiz_id, score, total_marks, answers, attempt_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb, NOW())
            """,
            (user_id, subject_id, topic_id, quiz_id, score, total, json.dumps(answers))
        )
        conn.commit()
        cur.close()

        # ── 7. Upsert topic_progress ──────────────────────────────────────────
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO topic_progress
                (user_id, subject_id, topic_id, avg_score, attempts, is_weak, last_updated)
            VALUES
                (%s, %s, %s, %s, 1, %s < 50, NOW())

            ON CONFLICT (user_id, subject_id, topic_id) DO UPDATE
            SET avg_score    = ((topic_progress.avg_score * topic_progress.attempts) + EXCLUDED.avg_score)
                               / (topic_progress.attempts + 1),
                attempts     = topic_progress.attempts + 1,
                is_weak      = ((topic_progress.avg_score * topic_progress.attempts) + EXCLUDED.avg_score)
                               / (topic_progress.attempts + 1) < 50,
                last_updated = NOW()
            """,
            (user_id, subject_id, topic_id, normalized_score, normalized_score)
        )
        conn.commit()
        cur.close()

    except Exception as e:
        conn.rollback()
        return jsonify({"error": f"Submission failed: {str(e)}"}), 500

    finally:
        conn.close()

    # ── 8. Return result (score/total unchanged as raw counts) ────────────────
    return jsonify({
        "score":           score,
        "total":           total,
        "correct_answers": correct_answers,
    }), 200


# =========================
# WEAK TOPICS
# =========================
@app.route("/weak_topics", methods=["GET"])
@jwt_required()
def get_weak_topics():
    user_id = int(get_jwt_identity())
    conn    = require_conn()
    cursor  = dict_cursor(conn)
    try:
        cursor.execute(
            """
            SELECT subject_id, topic_id, avg_score, attempts
            FROM   topic_progress
            WHERE  user_id = %s AND is_weak = TRUE
            ORDER  BY avg_score ASC
            """,
            (user_id,)
        )
        rows = cursor.fetchall()
    except Exception as e:
        return jsonify({"error": f"Failed to fetch weak topics: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify([dict(row) for row in rows]), 200


# =========================
# ANALYTICS
# =========================
@app.route("/analytics/personal", methods=["GET"])
@jwt_required()
def get_personal_analytics():
    user_id = int(get_jwt_identity())
    conn    = require_conn()

    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = %s", (user_id,))
        total_attempts = cur.fetchone()[0]
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT AVG(score / total_marks * 100) FROM quiz_attempts
            WHERE user_id = %s AND total_marks > 0
        """, (user_id,))
        row = cur.fetchone()
        overall_avg = round(float(row[0]), 1) if row and row[0] else 0.0
        cur.close()

        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM notes WHERE user_id = %s", (user_id,))
        total_notes = cur.fetchone()[0]
        cur.close()

        cur = dict_cursor(conn)
        cur.execute("""
            SELECT s.name AS subject_name, AVG(qa.score / qa.total_marks * 100) AS avg_pct
            FROM quiz_attempts qa
            JOIN subjects s ON qa.subject_id = s.id
            WHERE qa.user_id = %s AND qa.subject_id IS NOT NULL AND qa.total_marks > 0
            GROUP BY qa.subject_id, s.name ORDER BY avg_pct DESC LIMIT 1
        """, (user_id,))
        best = cur.fetchone()
        cur.close()

        cur = dict_cursor(conn)
        cur.execute("""
            SELECT qa.attempt_date,
                   ROUND(CAST(qa.score / qa.total_marks * 100 AS NUMERIC), 1) AS pct,
                   COALESCE(s.name, 'Custom') AS subject
            FROM quiz_attempts qa
            LEFT JOIN subjects s ON qa.subject_id = s.id
            WHERE qa.user_id = %s AND qa.total_marks > 0
            ORDER BY qa.attempt_date DESC LIMIT 10
        """, (user_id,))
        recent_raw = cur.fetchall()
        cur.close()

        trend = [{
            "date":    r["attempt_date"].strftime("%d %b") if r["attempt_date"] else "",
            "score":   float(r["pct"]),
            "subject": r["subject"],
        } for r in reversed(recent_raw)]

        cur = dict_cursor(conn)
        cur.execute("""
            SELECT s.name AS subject_name,
                   ROUND(CAST(AVG(qa.score / qa.total_marks * 100) AS NUMERIC), 1) AS avg_pct,
                   COUNT(*) AS attempts
            FROM quiz_attempts qa
            JOIN subjects s ON qa.subject_id = s.id
            WHERE qa.user_id = %s AND qa.subject_id IS NOT NULL AND qa.total_marks > 0
            GROUP BY qa.subject_id, s.name ORDER BY avg_pct DESC
        """, (user_id,))
        subject_perf = cur.fetchall()
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT
                SUM(CASE WHEN (score / total_marks * 100) >= 80 THEN 1 ELSE 0 END) AS strong,
                SUM(CASE WHEN (score / total_marks * 100) >= 50
                          AND (score / total_marks * 100) <  80 THEN 1 ELSE 0 END) AS average,
                SUM(CASE WHEN (score / total_marks * 100) <  50 THEN 1 ELSE 0 END) AS weak
            FROM quiz_attempts WHERE user_id = %s AND total_marks > 0
        """, (user_id,))
        diff_row = cur.fetchone()
        cur.close()

        return jsonify({
            "total_attempts":    total_attempts,
            "overall_avg":       overall_avg,
            "total_notes":       total_notes,
            "best_subject":      best["subject_name"] if best else None,
            "best_subject_score": round(float(best["avg_pct"]), 1) if best else 0,
            "trend":             trend,
            "subject_performance": [
                {"subject": r["subject_name"], "avg": float(r["avg_pct"]), "attempts": r["attempts"]}
                for r in subject_perf
            ],
            "difficulty_breakdown": {
                "strong":  int(diff_row[0] or 0),
                "average": int(diff_row[1] or 0),
                "weak":    int(diff_row[2] or 0),
            },
        }), 200

    except Exception as e:
        print("analytics error:", e)
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


# =========================
# PERSONAL DASHBOARD
# =========================
@app.route("/dashboard/personal", methods=["GET"])
@jwt_required()
def get_personal_dashboard():
    user_id = int(get_jwt_identity())
    conn    = require_conn()

    try:
        cur = dict_cursor(conn)
        cur.execute("SELECT id, name, email, created_at FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close()

        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = %s", (user_id,))
        my_quizzes = cur.fetchone()[0]
        cur.close()

        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM notes WHERE user_id = %s", (user_id,))
        my_notes = cur.fetchone()[0]
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT AVG(score / total_marks * 100) FROM quiz_attempts
            WHERE user_id = %s AND total_marks > 0
        """, (user_id,))
        row = cur.fetchone()
        avg_score = round(float(row[0]), 1) if row and row[0] else 0.0
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM user_progress WHERE user_id = %s AND progress_percentage > 0
        """, (user_id,))
        active_subjects = cur.fetchone()[0]
        cur.close()

        cur = dict_cursor(conn)
        cur.execute("""
            SELECT qa.attempt_date,
                   ROUND(CAST(qa.score / qa.total_marks * 100 AS NUMERIC), 1) AS pct,
                   COALESCE(s.name, 'Custom') AS subject
            FROM quiz_attempts qa
            LEFT JOIN subjects s ON qa.subject_id = s.id
            WHERE qa.user_id = %s AND qa.total_marks > 0
            ORDER BY qa.attempt_date DESC LIMIT 5
        """, (user_id,))
        recent = cur.fetchall()
        cur.close()

        return jsonify({
            "name":            user["name"] if user else "Student",
            "my_quizzes":      my_quizzes,
            "my_notes":        my_notes,
            "avg_score":       avg_score,
            "active_subjects": active_subjects,
            "recent_activity": [{
                "date":    r["attempt_date"].strftime("%d %b %H:%M"),
                "pct":     float(r["pct"]),
                "subject": r["subject"],
            } for r in recent],
        }), 200

    except Exception as e:
        print("personal dashboard error:", e)
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500

    finally:
        conn.close()


# =========================
# FYP GUIDE
# =========================
@app.route("/ai/fyp-guide", methods=["POST"])
@jwt_required()
def ai_fyp_guide():
    from ai import generate_fyp_guide
    data      = request.json or {}
    domain    = data.get("domain", "").strip()
    interest  = data.get("interest", "").strip()
    team_size = int(data.get("team_size", 1))

    if not domain or not interest:
        return jsonify({"error": "Domain and interest are required"}), 400

    try:
        guide = generate_fyp_guide(domain, interest, team_size)
        return jsonify({"guide": guide}), 200
    except Exception as e:
        print("FYP guide error:", e)
        return jsonify({"error": str(e)}), 500


# =========================
# RESUME BUILDER
# =========================
@app.route("/ai/resume/generate", methods=["POST"])
@jwt_required()
def ai_resume_generate():
    from ai import generate_resume_latex
    data = request.json or {}
    if not data.get("name") or not data.get("target_role"):
        return jsonify({"error": "Name and target role are required"}), 400
    try:
        latex = generate_resume_latex(data)
        return jsonify({"latex": latex}), 200
    except Exception as e:
        print("Resume generate error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/ai/resume/improve", methods=["POST"])
@jwt_required()
def ai_resume_improve():
    from ai import improve_resume_latex
    data        = request.json or {}
    resume_text = data.get("resume_text", "").strip()
    target_role = data.get("target_role", "").strip()
    if not resume_text or not target_role:
        return jsonify({"error": "Resume text and target role are required"}), 400
    try:
        latex = improve_resume_latex(resume_text, target_role)
        return jsonify({"latex": latex}), 200
    except Exception as e:
        print("Resume improve error:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/ai/resume/compile", methods=["POST"])
@jwt_required()
def ai_resume_compile():
    import subprocess, tempfile, base64, os as _os
    data       = request.json or {}
    latex_code = data.get("latex", "")
    if not latex_code:
        return jsonify({"error": "No LaTeX code provided"}), 400

    try:
        result = subprocess.run(
            ["pdflatex", "--version"], capture_output=True, text=True, timeout=10
        )
        has_pdflatex = result.returncode == 0
    except Exception:
        has_pdflatex = False

    if not has_pdflatex:
        return jsonify({
            "error":        "pdflatex not installed",
            "latex":        latex_code,
            "overleaf_url": "https://www.overleaf.com/latex/templates",
        }), 422

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            tex_path = _os.path.join(tmpdir, "resume.tex")
            pdf_path = _os.path.join(tmpdir, "resume.pdf")

            with open(tex_path, "w", encoding="utf-8") as f:
                f.write(latex_code)

            for _ in range(2):
                subprocess.run(
                    ["pdflatex", "-interaction=nonstopmode", "-output-directory", tmpdir, tex_path],
                    capture_output=True, timeout=60,
                )

            if not _os.path.exists(pdf_path):
                return jsonify({"error": "PDF compilation failed", "latex": latex_code}), 500

            with open(pdf_path, "rb") as f:
                pdf_b64 = base64.b64encode(f.read()).decode("utf-8")

            return jsonify({"pdf_base64": pdf_b64}), 200

    except Exception as e:
        print("LaTeX compile error:", e)
        return jsonify({"error": str(e), "latex": latex_code}), 500


# =========================
# AI CHAT TUTOR
# =========================
@app.route("/ai/chat", methods=["POST"])
@jwt_required()
def ai_chat():
    data         = request.json or {}
    user_message = data.get("message", "").strip()
    subject      = data.get("subject", "General MCA")
    history      = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    try:
        system_prompt = (
            f"You are EduGenie, an expert AI tutor for MCA (Master of Computer Applications) students. "
            f"The student is currently studying: {subject}. "
            f"Give clear, concise, exam-focused explanations. Use examples and bullet points where helpful. "
            f"Keep responses focused and academic. If asked something unrelated to academics, "
            f"politely redirect to study topics."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for msg in history[-6:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        response = requests.post(
            GROQ_URL, headers=HEADERS,
            json={"model": "llama-3.1-8b-instant", "messages": messages, "temperature": 0.7, "max_tokens": 1024},
        )

        if response.status_code != 200:
            return jsonify({"error": "AI service unavailable"}), 500

        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"reply": reply}), 200

    except Exception as e:
        print("Chat error:", e)
        return jsonify({"error": "Chat failed"}), 500


# ── Init & run ────────────────────────────────────────────────────────
from db import initialize_progress_tables
initialize_progress_tables()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
