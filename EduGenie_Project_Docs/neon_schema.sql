-- ============================================================
-- EduGenie PostgreSQL Schema
-- Run this in Neon SQL Editor FIRST, then run seed_data.sql
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

-- Elective groups
CREATE TABLE IF NOT EXISTS elective_groups (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    semester_id INT REFERENCES semesters(id) ON DELETE CASCADE
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20),
    semester_id     INT REFERENCES semesters(id) ON DELETE SET NULL,
    type            VARCHAR(20) DEFAULT 'core',
    elective_group  INT REFERENCES elective_groups(id) ON DELETE SET NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units
CREATE TABLE IF NOT EXISTS units (
    id         SERIAL PRIMARY KEY,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics
CREATE TABLE IF NOT EXISTS topics (
    id         SERIAL PRIMARY KEY,
    unit_id    INT REFERENCES units(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE CASCADE,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id   INT REFERENCES topics(id) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    topic_id   INT REFERENCES topics(id) ON DELETE SET NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz attempts (scores)
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id   INT,
    topic_id     INT,
    quiz_id      INT,
    score        FLOAT NOT NULL,
    total_marks  FLOAT NOT NULL,
    attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress per subject
CREATE TABLE IF NOT EXISTS user_progress (
    id                  SERIAL PRIMARY KEY,
    user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id          INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    progress_percentage FLOAT DEFAULT 0,
    average_score       FLOAT DEFAULT 0,
    last_updated        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_subject UNIQUE (user_id, subject_id)
);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT REFERENCES subjects(id) ON DELETE SET NULL,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Resume feedback
CREATE TABLE IF NOT EXISTS resume_feedback (
    id          SERIAL PRIMARY KEY,
    user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(50),
    resume_text TEXT NOT NULL,
    feedback    TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
