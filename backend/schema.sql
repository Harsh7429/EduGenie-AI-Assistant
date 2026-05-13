-- ============================================================
-- EduGenie PostgreSQL Schema
-- Version: 2.1 (Final Year Project)
-- Database: PostgreSQL 15+
-- Usage: psql -U postgres -d edugenie_db -f schema.sql
-- ============================================================


-- Users
CREATE TABLE IF NOT EXISTS users (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Semesters
CREATE TABLE IF NOT EXISTS semesters (
    id   SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);


-- Elective groups (for semester-wise elective subjects)
CREATE TABLE IF NOT EXISTS elective_groups (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    semester_id INT REFERENCES semesters(id) ON DELETE CASCADE
);


-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    code           VARCHAR(20),
    semester_id    INT REFERENCES semesters(id) ON DELETE SET NULL,
    type           VARCHAR(20) DEFAULT 'core',
    elective_group INT REFERENCES elective_groups(id) ON DELETE SET NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Units (each subject has multiple units)
CREATE TABLE IF NOT EXISTS units (
    id         SERIAL PRIMARY KEY,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Topics (each unit has multiple topics)
CREATE TABLE IF NOT EXISTS topics (
    id         SERIAL PRIMARY KEY,
    unit_id    INT REFERENCES units(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Notes (AI-generated study notes saved per user)
CREATE TABLE IF NOT EXISTS notes (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id   INT REFERENCES topics(id) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Quizzes (AI-generated MCQ quiz sets saved per user)
CREATE TABLE IF NOT EXISTS quizzes (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    topic_id   INT REFERENCES topics(id) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Quiz attempts (tracks every submitted quiz score)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id   INT,
    topic_id     INT,
    quiz_id      INT,
    score        FLOAT NOT NULL,
    total_marks  FLOAT NOT NULL,
    answers      JSONB DEFAULT NULL,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- User progress per subject (aggregated from quiz_attempts)
CREATE TABLE IF NOT EXISTS user_progress (
    id                  SERIAL PRIMARY KEY,
    user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id          INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    progress_percentage FLOAT DEFAULT 0,
    average_score       FLOAT DEFAULT 0,
    last_updated        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_subject UNIQUE (user_id, subject_id)
);


-- Topic-level progress (granular tracking per topic per user)
CREATE TABLE IF NOT EXISTS topic_progress (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id   INT NOT NULL,
    topic_id     INT NOT NULL,
    avg_score    DOUBLE PRECISION NOT NULL DEFAULT 0,
    attempts     INT NOT NULL DEFAULT 0,
    is_weak      BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_subject_topic UNIQUE (user_id, subject_id, topic_id)
);


-- Chat history (stores AI tutor conversations per user)
CREATE TABLE IF NOT EXISTS chat_history (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject    VARCHAR(100),
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
