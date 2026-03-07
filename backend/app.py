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
from ai import generate_note, generate_quiz, generate_topics


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# -------------------------
# JWT CONFIGURATION
# -------------------------
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=6)

jwt = JWTManager(app)


# ── Helper: dict cursor ───────────────────────────────────────────────
# Replaces MySQL's cursor(dictionary=True) with psycopg2 RealDictCursor
def dict_cursor(conn):
    return conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)


# ── Helper: get lastrowid via RETURNING ──────────────────────────────
# MySQL uses cursor.lastrowid; PostgreSQL needs RETURNING id
# Usage: append "RETURNING id" to INSERT, then call cursor.fetchone()[0]


# -------------------------
# HOME
# -------------------------
@app.route("/")
def home():
    return "EduGenie Backend is Running!"


# -------------------------
# SIGNUP
# -------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    name     = data.get("name")
    email    = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    conn   = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
            (name, email, hashed_password.decode("utf-8"))
        )
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({"error": "User already exists"}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "User registered successfully"}), 201


# -------------------------
# LOGIN
# -------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    email    = data.get("email")
    password = data.get("password")

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    ):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user["id"]))
    return jsonify({"access_token": access_token}), 200


# -------------------------
# PROFILE
# -------------------------
@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute(
        "SELECT id, name, email, created_at FROM users WHERE id = %s",
        (user_id,)
    )
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify(dict(user)), 200


# =========================
# SUBJECT ROUTES
# =========================

@app.route("/subjects", methods=["GET"])
@jwt_required()
def get_subjects():
    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("SELECT id, name FROM subjects ORDER BY name")
    subjects = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(s) for s in subjects]), 200


@app.route("/subjects/<int:semester_id>", methods=["GET"])
@jwt_required()
def get_subjects_with_groups(semester_id):
    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("""
        SELECT id, name, code
        FROM subjects
        WHERE semester_id = %s AND type = 'core'
        ORDER BY name
    """, (semester_id,))
    core_subjects = cursor.fetchall()

    cursor.execute("""
        SELECT id, name
        FROM elective_groups
        WHERE semester_id = %s
        ORDER BY id
    """, (semester_id,))
    elective_groups = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify({
        "core":            [dict(s) for s in core_subjects],
        "elective_groups": [dict(g) for g in elective_groups]
    }), 200


# =========================
# GET USER SUBJECT PROGRESS
# =========================
@app.route("/progress/subjects", methods=["GET"])
@jwt_required()
def get_subject_progress():
    user_id = int(get_jwt_identity())

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("""
        SELECT
            s.id   AS subject_id,
            s.name AS subject_name,
            COALESCE(up.average_score,       0) AS average_score,
            COALESCE(up.progress_percentage, 0) AS progress_percentage
        FROM subjects s
        LEFT JOIN user_progress up
               ON s.id = up.subject_id
              AND up.user_id = %s
        ORDER BY s.name
    """, (user_id,))

    subjects = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(s) for s in subjects]), 200


@app.route("/dashboard/stats", methods=["GET"])
@jwt_required()
def get_dashboard_stats():
    try:
        conn   = get_db_connection()
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
            "total_users":    total_users
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/elective-group/<int:group_id>/subjects", methods=["GET"])
@jwt_required()
def get_subjects_by_elective_group(group_id):
    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("""
        SELECT id, name, code
        FROM subjects
        WHERE elective_group = %s
        ORDER BY name
    """, (group_id,))
    subjects = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(s) for s in subjects]), 200


@app.route("/semesters", methods=["GET"])
@jwt_required()
def get_semesters():
    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("SELECT id, name FROM semesters ORDER BY id")
    semesters = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(s) for s in semesters]), 200


@app.route("/subjects", methods=["POST"])
@jwt_required()
def create_subject():
    data = request.json
    name = data.get("name")

    if not name:
        return jsonify({"error": "Subject name required"}), 400

    conn   = get_db_connection()
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
# TOPIC ROUTES
# =========================

@app.route("/topics/subject/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_topics_by_subject(subject_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = dict_cursor(conn)

    cursor.execute("""
        SELECT t.id, t.name, u.name AS unit_name
        FROM topics t
        JOIN units u ON t.unit_id = u.id
        WHERE u.subject_id = %s
        ORDER BY u.id, t.id
    """, (subject_id,))
    topics = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(t) for t in topics]), 200


@app.route("/topics/<int:unit_id>", methods=["GET"])
@jwt_required()
def get_topics(unit_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = dict_cursor(conn)

    cursor.execute(
        "SELECT id, name FROM topics WHERE unit_id = %s ORDER BY id",
        (unit_id,)
    )
    topics = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(t) for t in topics]), 200


@app.route("/units/<int:subject_id>", methods=["GET"])
@jwt_required()
def get_units(subject_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = dict_cursor(conn)

    cursor.execute(
        "SELECT id, name FROM units WHERE subject_id = %s ORDER BY id",
        (subject_id,)
    )
    units = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(u) for u in units]), 200


@app.route("/topics", methods=["POST"])
@jwt_required()
def create_topic():
    data       = request.json
    subject_id = data.get("subject_id")
    name       = data.get("name")

    if not subject_id or not name:
        return jsonify({"error": "Subject ID and topic name required"}), 400

    conn   = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "INSERT INTO topics (subject_id, name) VALUES (%s, %s)",
            (subject_id, name)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        return jsonify({"error": "Topic already exists"}), 409
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "Topic created successfully"}), 201


@app.route("/subjects/semester/<int:semester_id>", methods=["GET"])
@jwt_required()
def get_subjects_by_semester(semester_id):
    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute(
        "SELECT id, name FROM subjects WHERE semester_id = %s ORDER BY name",
        (semester_id,)
    )
    subjects = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(s) for s in subjects]), 200


# -------------------------
# AI NOTE GENERATION
# -------------------------
@app.route("/ai/generate-note", methods=["POST"])
@jwt_required()
def ai_generate_note():
    data = request.json

    subject_id = data.get("subject_id")
    topic_id   = data.get("topic_id")

    if not subject_id or not topic_id:
        return jsonify({"error": "Subject and topic required"}), 400

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("SELECT name FROM subjects WHERE id = %s", (subject_id,))
    subject = cursor.fetchone()

    cursor.execute("SELECT name FROM topics WHERE id = %s", (topic_id,))
    topic = cursor.fetchone()

    if not subject or not topic:
        cursor.close()
        conn.close()
        return jsonify({"error": "Invalid subject or topic"}), 404

    ai_content = generate_note(subject["name"], topic["name"])

    user_id = int(get_jwt_identity())

    cursor.execute(
        """
        INSERT INTO notes (user_id, subject_id, topic_id, content)
        VALUES (%s, %s, %s, %s)
        """,
        (user_id, subject_id, topic_id, ai_content)
    )
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({
        "message": "AI note generated successfully",
        "content": ai_content
    }), 200


# -------------------------
# AI QUIZ GENERATION
# -------------------------
@app.route("/ai/generate-quiz", methods=["POST"])
@jwt_required()
def ai_generate_quiz():
    import json

    user_id = int(get_jwt_identity())
    data    = request.json

    subject_id    = data.get("subject_id")
    topic_id      = data.get("topic_id")
    subject_name  = data.get("subject_name")
    topic_name    = data.get("topic_name")
    difficulty    = data.get("difficulty", "medium")
    num_questions = int(data.get("num_questions", 5))
    if num_questions < 3:  num_questions = 3
    if num_questions > 15: num_questions = 15

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    if subject_id and topic_id:
        cursor.execute("SELECT name FROM subjects WHERE id = %s", (subject_id,))
        subject = cursor.fetchone()

        cursor.execute("SELECT name FROM topics WHERE id = %s", (topic_id,))
        topic = cursor.fetchone()

        if not subject or not topic:
            cursor.close()
            conn.close()
            return jsonify({"error": "Invalid subject or topic"}), 404

        subject_name = subject["name"]
        topic_name   = topic["name"]

    elif subject_name and topic_name:
        subject_id = None
        topic_id   = None

    else:
        cursor.close()
        conn.close()
        return jsonify({"error": "Provide either subject_id + topic_id or subject_name + topic_name"}), 400

    try:
        quiz_raw = generate_quiz(subject_name, topic_name, difficulty, num_questions)
    except Exception as e:
        cursor.close()
        conn.close()
        return jsonify({"error": f"AI generation failed: {str(e)}"}), 500

    try:
        quiz_content = json.loads(quiz_raw)
    except (json.JSONDecodeError, TypeError):
        cursor.close()
        conn.close()
        return jsonify({"error": "AI returned invalid JSON format"}), 500

    quiz_content_json = json.dumps(quiz_content)

    try:
        cursor.close()  # close the dict cursor first
        # Use a plain cursor for INSERT RETURNING so fetchone()[0] works reliably
        plain_cur = conn.cursor()
        plain_cur.execute("""
            INSERT INTO quizzes (user_id, subject_id, topic_id, content)
            VALUES (%s, %s, %s, %s)
            RETURNING id
        """, (user_id, subject_id, topic_id, quiz_content_json))
        quiz_id = plain_cur.fetchone()[0]
        conn.commit()
        plain_cur.close()
    except Exception as e:
        conn.rollback()
        conn.close()
        return jsonify({"error": f"Failed to save quiz: {str(e)}"}), 500

    conn.close()

    return jsonify({
        "message":  "Quiz generated successfully",
        "quiz":     quiz_content,
        "quiz_id":  quiz_id
    }), 200


# -------------------------
# AI TOPIC GENERATION
# -------------------------
@app.route("/ai/generate-topics", methods=["POST"])
@jwt_required()
def ai_generate_topics():
    data         = request.json
    subject_name = data.get("subject_name")

    if not subject_name:
        return jsonify({"error": "Subject name required"}), 400

    try:
        topics_list = generate_topics(subject_name)
        return jsonify({
            "message": "Topics generated successfully",
            "topics":  topics_list
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# NOTES
# =========================

@app.route("/notes", methods=["GET"])
@jwt_required()
def get_notes():
    user_id = int(get_jwt_identity())

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("""
        SELECT
            n.id,
            n.content,
            n.created_at,
            COALESCE(s.name, 'Custom') AS subject,
            COALESCE(t.name, 'Custom') AS topic
        FROM notes n
        LEFT JOIN subjects s ON n.subject_id = s.id
        LEFT JOIN topics   t ON n.topic_id   = t.id
        WHERE n.user_id = %s
        ORDER BY n.created_at DESC
    """, (user_id,))

    notes = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(n) for n in notes]), 200


@app.route("/notes/<int:note_id>", methods=["DELETE"])
@jwt_required()
def delete_note(note_id):
    user_id = int(get_jwt_identity())

    conn   = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM notes WHERE id = %s AND user_id = %s",
        (note_id, user_id)
    )
    conn.commit()

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

    conn   = get_db_connection()
    cursor = dict_cursor(conn)

    cursor.execute("""
        SELECT
            q.id,
            q.content,
            q.created_at,
            COALESCE(s.name, 'Custom') AS subject,
            COALESCE(t.name, 'Custom') AS topic
        FROM quizzes q
        LEFT JOIN subjects s ON q.subject_id = s.id
        LEFT JOIN topics   t ON q.topic_id   = t.id
        WHERE q.user_id = %s
        ORDER BY q.created_at DESC
    """, (user_id,))

    quizzes = cursor.fetchall()

    cursor.close()
    conn.close()

    return jsonify([dict(q) for q in quizzes]), 200


@app.route("/quizzes/<int:quiz_id>", methods=["DELETE"])
@jwt_required()
def delete_quiz(quiz_id):
    user_id = int(get_jwt_identity())

    conn   = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM quizzes WHERE id = %s AND user_id = %s",
        (quiz_id, user_id)
    )
    conn.commit()

    if cursor.rowcount == 0:
        cursor.close()
        conn.close()
        return jsonify({"error": "Quiz not found or unauthorized"}), 404

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
    data    = request.json

    score       = data.get("score")
    total_marks = data.get("total_marks")

    if score is None or total_marks is None:
        return jsonify({"error": "Score and total marks required"}), 400
    if not isinstance(score, (int, float)) or not isinstance(total_marks, (int, float)):
        return jsonify({"error": "Score and total marks must be numbers"}), 400
    if score < 0 or total_marks <= 0 or score > total_marks:
        return jsonify({"error": "Invalid score values"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    avg_score   = 0.0
    progress_pct = 0.0

    try:
        # ── STEP 1: Get quiz metadata ──────────────────────────────────────
        cur = dict_cursor(conn)
        cur.execute("SELECT subject_id, topic_id FROM quizzes WHERE id = %s", (quiz_id,))
        quiz = cur.fetchone()
        cur.close()

        if not quiz:
            conn.close()
            return jsonify({"error": "Quiz not found"}), 404

        subject_id = quiz["subject_id"]
        topic_id   = quiz["topic_id"]

        # ── STEP 2: Record the attempt ─────────────────────────────────────
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO quiz_attempts
                (user_id, subject_id, topic_id, quiz_id, score, total_marks)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, subject_id, topic_id, quiz_id, float(score), float(total_marks)))
        conn.commit()
        cur.close()

        # ── STEP 3: Custom quiz — skip progress tracking ───────────────────
        if subject_id is None:
            conn.close()
            return jsonify({"message": "Custom quiz submitted (no progress tracking)"}), 200

        # ── STEP 4: Calculate new average score ────────────────────────────
        cur = conn.cursor()
        cur.execute("""
            SELECT AVG(score) FROM quiz_attempts
            WHERE user_id = %s AND subject_id = %s
        """, (user_id, subject_id))
        row = cur.fetchone()
        cur.close()
        avg_score = float(row[0]) if (row and row[0] is not None) else float(score)

        # ── STEP 5: Check if user_progress row already exists ─────────────
        cur = conn.cursor()
        cur.execute("""
            SELECT id FROM user_progress
            WHERE user_id = %s AND subject_id = %s
        """, (user_id, subject_id))
        existing = cur.fetchone()
        cur.close()

        # ── STEP 6: Insert or update progress row ──────────────────────────
        cur = conn.cursor()
        if existing:
            cur.execute("""
                UPDATE user_progress
                SET average_score = %s
                WHERE user_id = %s AND subject_id = %s
            """, (avg_score, user_id, subject_id))
        else:
            cur.execute("""
                INSERT INTO user_progress
                    (user_id, subject_id, average_score, progress_percentage)
                VALUES (%s, %s, %s, 0)
            """, (user_id, subject_id, avg_score))
        conn.commit()
        cur.close()

        # ── STEP 7: Count total topics in subject ──────────────────────────
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM topics t
            JOIN units u ON t.unit_id = u.id
            WHERE u.subject_id = %s
        """, (subject_id,))
        total_topics = cur.fetchone()[0]
        cur.close()

        # ── STEP 8: Count distinct attempted topics ────────────────────────
        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(DISTINCT topic_id) FROM quiz_attempts
            WHERE user_id = %s AND subject_id = %s AND topic_id IS NOT NULL
        """, (user_id, subject_id))
        attempted_topics = cur.fetchone()[0]
        cur.close()

        progress_pct = round((attempted_topics / total_topics * 100), 2) if total_topics > 0 else 0.0

        # ── STEP 9: Update progress percentage ────────────────────────────
        cur = conn.cursor()
        cur.execute("""
            UPDATE user_progress
            SET progress_percentage = %s
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
        "message":           "Quiz submitted successfully",
        "average_score":     round(avg_score, 2),
        "progress_percentage": progress_pct
    }), 200


# =========================
# PERSONAL ANALYTICS
# =========================
@app.route("/analytics/personal", methods=["GET"])
@jwt_required()
def get_personal_analytics():
    user_id = int(get_jwt_identity())
    conn    = get_db_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = %s", (user_id,))
        total_attempts = cur.fetchone()[0]
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT AVG(score / total_marks * 100)
            FROM quiz_attempts
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
            SELECT s.name AS subject_name,
                   AVG(qa.score / qa.total_marks * 100) AS avg_pct
            FROM quiz_attempts qa
            JOIN subjects s ON qa.subject_id = s.id
            WHERE qa.user_id = %s
              AND qa.subject_id IS NOT NULL
              AND qa.total_marks > 0
            GROUP BY qa.subject_id, s.name
            ORDER BY avg_pct DESC
            LIMIT 1
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
            ORDER BY qa.attempt_date DESC
            LIMIT 10
        """, (user_id,))
        recent_raw = cur.fetchall()
        cur.close()

        trend = []
        for r in reversed(recent_raw):
            trend.append({
                "date":    r["attempt_date"].strftime("%d %b") if r["attempt_date"] else "",
                "score":   float(r["pct"]),
                "subject": r["subject"]
            })

        cur = dict_cursor(conn)
        cur.execute("""
            SELECT s.name AS subject_name,
                   ROUND(CAST(AVG(qa.score / qa.total_marks * 100) AS NUMERIC), 1) AS avg_pct,
                   COUNT(*) AS attempts
            FROM quiz_attempts qa
            JOIN subjects s ON qa.subject_id = s.id
            WHERE qa.user_id = %s
              AND qa.subject_id IS NOT NULL
              AND qa.total_marks > 0
            GROUP BY qa.subject_id, s.name
            ORDER BY avg_pct DESC
        """, (user_id,))
        subject_perf = cur.fetchall()
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT
                SUM(CASE WHEN (score / total_marks * 100) >= 80 THEN 1 ELSE 0 END)  AS strong,
                SUM(CASE WHEN (score / total_marks * 100) >= 50
                          AND (score / total_marks * 100) <  80 THEN 1 ELSE 0 END)  AS average,
                SUM(CASE WHEN (score / total_marks * 100) <  50 THEN 1 ELSE 0 END)  AS weak
            FROM quiz_attempts
            WHERE user_id = %s AND total_marks > 0
        """, (user_id,))
        diff_row = cur.fetchone()
        cur.close()

        conn.close()

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
            }
        }), 200

    except Exception as e:
        print("analytics error:", e)
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500


# =========================
# DASHBOARD PERSONAL STATS
# =========================
@app.route("/dashboard/personal", methods=["GET"])
@jwt_required()
def get_personal_dashboard():
    user_id = int(get_jwt_identity())
    conn    = get_db_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500

    try:
        cur = dict_cursor(conn)
        cur.execute(
            "SELECT id, name, email, created_at FROM users WHERE id = %s",
            (user_id,)
        )
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
            SELECT AVG(score / total_marks * 100)
            FROM quiz_attempts
            WHERE user_id = %s AND total_marks > 0
        """, (user_id,))
        row = cur.fetchone()
        avg_score = round(float(row[0]), 1) if row and row[0] else 0.0
        cur.close()

        cur = conn.cursor()
        cur.execute("""
            SELECT COUNT(*) FROM user_progress
            WHERE user_id = %s AND progress_percentage > 0
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
            ORDER BY qa.attempt_date DESC
            LIMIT 5
        """, (user_id,))
        recent = cur.fetchall()
        cur.close()

        conn.close()

        return jsonify({
            "name":            user["name"] if user else "Student",
            "my_quizzes":      my_quizzes,
            "my_notes":        my_notes,
            "avg_score":       avg_score,
            "active_subjects": active_subjects,
            "recent_activity": [
                {
                    "date":    r["attempt_date"].strftime("%d %b %H:%M"),
                    "pct":     float(r["pct"]),
                    "subject": r["subject"]
                }
                for r in recent
            ]
        }), 200

    except Exception as e:
        print("personal dashboard error:", e)
        conn.rollback()
        conn.close()
        return jsonify({"error": str(e)}), 500


# =============================================
# FINAL YEAR PROJECT GUIDE
# =============================================
@app.route("/ai/fyp-guide", methods=["POST"])
@jwt_required()
def ai_fyp_guide():
    from ai import generate_fyp_guide
    data      = request.json
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


# =============================================
# RESUME BUILDER — Generate from form data
# =============================================
@app.route("/ai/resume/generate", methods=["POST"])
@jwt_required()
def ai_resume_generate():
    from ai import generate_resume_latex
    data = request.json
    if not data.get("name") or not data.get("target_role"):
        return jsonify({"error": "Name and target role are required"}), 400
    try:
        latex = generate_resume_latex(data)
        return jsonify({"latex": latex}), 200
    except Exception as e:
        print("Resume generate error:", e)
        return jsonify({"error": str(e)}), 500


# =============================================
# RESUME BUILDER — Improve uploaded resume
# =============================================
@app.route("/ai/resume/improve", methods=["POST"])
@jwt_required()
def ai_resume_improve():
    from ai import improve_resume_latex
    data        = request.json
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


# =============================================
# RESUME — Compile LaTeX to PDF
# =============================================
@app.route("/ai/resume/compile", methods=["POST"])
@jwt_required()
def ai_resume_compile():
    import subprocess, tempfile, base64
    data       = request.json
    latex_code = data.get("latex", "")
    if not latex_code:
        return jsonify({"error": "No LaTeX code provided"}), 400

    try:
        result = subprocess.run(
            ["pdflatex", "--version"],
            capture_output=True, text=True, timeout=10
        )
        has_pdflatex = result.returncode == 0
    except Exception:
        has_pdflatex = False

    if not has_pdflatex:
        return jsonify({
            "error":       "pdflatex not installed",
            "latex":       latex_code,
            "overleaf_url": "https://www.overleaf.com/latex/templates"
        }), 422

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            import os as _os
            tex_path = _os.path.join(tmpdir, "resume.tex")
            pdf_path = _os.path.join(tmpdir, "resume.pdf")

            with open(tex_path, "w", encoding="utf-8") as f:
                f.write(latex_code)

            for _ in range(2):
                subprocess.run(
                    ["pdflatex", "-interaction=nonstopmode",
                     "-output-directory", tmpdir, tex_path],
                    capture_output=True, timeout=60
                )

            if not _os.path.exists(pdf_path):
                return jsonify({"error": "PDF compilation failed", "latex": latex_code}), 500

            with open(pdf_path, "rb") as f:
                pdf_b64 = base64.b64encode(f.read()).decode("utf-8")

            return jsonify({"pdf_base64": pdf_b64}), 200

    except Exception as e:
        print("LaTeX compile error:", e)
        return jsonify({"error": str(e), "latex": latex_code}), 500


# -------------------------
# AI CHAT TUTOR
# -------------------------
@app.route("/ai/chat", methods=["POST"])
@jwt_required()
def ai_chat():
    data        = request.json
    user_message = data.get("message", "").strip()
    subject     = data.get("subject", "General MCA")
    history     = data.get("history", [])   # [{role, content}, ...]

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
        # Add last 6 messages of history for context
        for msg in history[-6:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})

        response = requests.post(
            GROQ_URL,
            headers=HEADERS,
            json={
                "model": "llama-3.1-8b-instant",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1024,
            }
        )

        if response.status_code != 200:
            return jsonify({"error": "AI service unavailable"}), 500

        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"reply": reply}), 200

    except Exception as e:
        print("Chat error:", e)
        return jsonify({"error": "Chat failed"}), 500

# -------------------------
# INITIALIZE & RUN  ← always last
# -------------------------
from db import initialize_progress_tables
initialize_progress_tables()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)