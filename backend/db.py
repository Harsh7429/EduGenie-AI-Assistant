import mysql.connector
from config import DB_CONFIG


def get_db_connection():
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except mysql.connector.Error as err:
        print("Database connection error:", err)
        return None


def _col_exists(cursor, table, column):
    cursor.execute("""
        SELECT COUNT(*) FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = %s
          AND COLUMN_NAME  = %s
    """, (table, column))
    result = cursor.fetchone()[0]
    return result > 0


def _col_nullable(cursor, table, column):
    cursor.execute("""
        SELECT IS_NULLABLE FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = %s
          AND COLUMN_NAME  = %s
    """, (table, column))
    row = cursor.fetchone()
    return row[0] == 'YES' if row else True


def _index_exists(cursor, table, key_name):
    cursor.execute("""
        SELECT COUNT(*) FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = %s
          AND INDEX_NAME   = %s
    """, (table, key_name))
    result = cursor.fetchone()[0]
    return result > 0


def initialize_progress_tables():
    connection = get_db_connection()
    if not connection:
        return

    # Use buffered=True so ALL result sets are consumed automatically
    # — this prevents "Unread result found" errors
    cursor = connection.cursor(buffered=True)

    try:
        # ── quiz_attempts table ───────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id           INT AUTO_INCREMENT PRIMARY KEY,
                user_id      INT NOT NULL,
                subject_id   INT NULL,
                topic_id     INT NULL,
                quiz_id      INT NULL,
                score        FLOAT NOT NULL,
                total_marks  FLOAT NOT NULL,
                attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Add quiz_id if missing
        if not _col_exists(cursor, 'quiz_attempts', 'quiz_id'):
            cursor.execute("ALTER TABLE quiz_attempts ADD COLUMN quiz_id INT NULL")
            print("Migration: added quiz_id to quiz_attempts")

        # Make subject_id nullable
        if not _col_nullable(cursor, 'quiz_attempts', 'subject_id'):
            cursor.execute("ALTER TABLE quiz_attempts MODIFY COLUMN subject_id INT NULL")
            print("Migration: made subject_id nullable in quiz_attempts")

        # Make topic_id nullable
        if not _col_nullable(cursor, 'quiz_attempts', 'topic_id'):
            cursor.execute("ALTER TABLE quiz_attempts MODIFY COLUMN topic_id INT NULL")
            print("Migration: made topic_id nullable in quiz_attempts")

        # ── user_progress table ───────────────────────────────────────────
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_progress (
                id                  INT AUTO_INCREMENT PRIMARY KEY,
                user_id             INT NOT NULL,
                subject_id          INT NOT NULL,
                progress_percentage FLOAT DEFAULT 0,
                average_score       FLOAT DEFAULT 0,
                last_updated        DATETIME DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
                FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
            )
        """)

        # Add UNIQUE key if missing (needed for safe upsert)
        if not _index_exists(cursor, 'user_progress', 'unique_user_subject'):
            # Clean up any duplicates first
            cursor.execute("""
                DELETE p1 FROM user_progress p1
                INNER JOIN user_progress p2
                WHERE p1.id > p2.id
                  AND p1.user_id = p2.user_id
                  AND p1.subject_id = p2.subject_id
            """)
            cursor.execute("""
                ALTER TABLE user_progress
                ADD CONSTRAINT unique_user_subject UNIQUE (user_id, subject_id)
            """)
            print("Migration: added unique_user_subject to user_progress")

        connection.commit()
        print("Progress tracking tables ready.")

    except mysql.connector.Error as err:
        print("Error initializing tables:", err)

    finally:
        cursor.close()
        connection.close()
