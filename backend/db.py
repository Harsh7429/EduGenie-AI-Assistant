import psycopg2
import psycopg2.extras
from config import DB_CONFIG


def get_db_connection():
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        return connection
    except psycopg2.Error as err:
        print("Database connection error:", err)
        return None


def _col_exists(cursor, table, column):
    cursor.execute("""
        SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = %s AND column_name = %s
    """, (table, column))
    return cursor.fetchone()[0] > 0


def _col_nullable(cursor, table, column):
    cursor.execute("""
        SELECT is_nullable FROM information_schema.columns
        WHERE table_name = %s AND column_name = %s
    """, (table, column))
    row = cursor.fetchone()
    return row[0] == 'YES' if row else True


def _index_exists(cursor, index_name):
    cursor.execute("""
        SELECT COUNT(*) FROM pg_indexes
        WHERE indexname = %s
    """, (index_name,))
    return cursor.fetchone()[0] > 0


def initialize_progress_tables():
    connection = get_db_connection()
    if not connection:
        return

    connection.autocommit = False
    cursor = connection.cursor()

    try:
        # ── quiz_attempts table ───────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id           SERIAL PRIMARY KEY,
                user_id      INT NOT NULL,
                subject_id   INT NULL,
                topic_id     INT NULL,
                quiz_id      INT NULL,
                score        FLOAT NOT NULL,
                total_marks  FLOAT NOT NULL,
                attempt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Add quiz_id column if missing
        if not _col_exists(cursor, 'quiz_attempts', 'quiz_id'):
            cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN quiz_id INT NULL")
            print("Migration: added quiz_id to quiz_attempts")

        # Make subject_id nullable if not already
        if not _col_nullable(cursor, 'quiz_attempts', 'subject_id'):
            cursor.execute("ALTER TABLE quiz_attempts ALTER COLUMN subject_id DROP NOT NULL")
            print("Migration: made subject_id nullable in quiz_attempts")

        # Make topic_id nullable if not already
        if not _col_nullable(cursor, 'quiz_attempts', 'topic_id'):
            cursor.execute("ALTER TABLE quiz_attempts ALTER COLUMN topic_id DROP NOT NULL")
            print("Migration: made topic_id nullable in quiz_attempts")

        # ── user_progress table ───────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_progress (
                id                  SERIAL PRIMARY KEY,
                user_id             INT NOT NULL,
                subject_id          INT NOT NULL,
                progress_percentage FLOAT DEFAULT 0,
                average_score       FLOAT DEFAULT 0,
                last_updated        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        """)

        # Add unique constraint if missing
        if not _index_exists(cursor, 'unique_user_subject'):
            # Remove duplicates first (keep the row with the lowest id)
            cursor.execute("""
                DELETE FROM user_progress
                WHERE id NOT IN (
                    SELECT MIN(id) FROM user_progress
                    GROUP BY user_id, subject_id
                )
            """)
            cursor.execute("""
                ALTER TABLE user_progress
                ADD CONSTRAINT unique_user_subject UNIQUE (user_id, subject_id)
            """)
            print("Migration: added unique_user_subject to user_progress")

        connection.commit()
        print("Progress tracking tables ready.")

    except psycopg2.Error as err:
        connection.rollback()
        print("Error initializing tables:", err)

    finally:
        cursor.close()
        connection.close()
