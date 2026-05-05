"""
helpers.py — Reusable, stateless utility functions for EduGenie backend.

Public API
----------
compute_percentage(score, total)          → float
detect_weak_topic(percentage)             → bool
evaluate_quiz(quiz_content, user_answers) → dict
quiz_cache                                → _QuizCache singleton
"""

import time
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────
# THRESHOLDS  (single source of truth — update here, affects everywhere)
# ─────────────────────────────────────────────────────────────────────

WEAK_THRESHOLD   = 50.0   # below this → weak topic
STRONG_THRESHOLD = 80.0   # at or above this → strong topic


# ─────────────────────────────────────────────────────────────────────
# 1. PERCENTAGE HELPER
# ─────────────────────────────────────────────────────────────────────

def compute_percentage(score: float, total: float) -> float:
    """
    Return score as a percentage rounded to 1 decimal place.
    Returns 0.0 for invalid or zero-total inputs — never raises.
    """
    try:
        if total <= 0:
            return 0.0
        return round((score / total) * 100, 1)
    except (TypeError, ZeroDivisionError):
        return 0.0


# ─────────────────────────────────────────────────────────────────────
# 2. WEAK TOPIC DETECTOR
# ─────────────────────────────────────────────────────────────────────

def detect_weak_topic(percentage: float) -> bool:
    """Return True if the percentage score qualifies the topic as weak."""
    return percentage < WEAK_THRESHOLD


# ─────────────────────────────────────────────────────────────────────
# 3. QUIZ EVALUATOR
# ─────────────────────────────────────────────────────────────────────

def evaluate_quiz(
    quiz_content: Dict,
    user_answers: List[Optional[int]],
) -> Dict:
    """
    Compare user_answers against the correct answers in quiz_content.

    Parameters
    ----------
    quiz_content  : validated quiz dict { "questions": [ {...}, ... ] }
    user_answers  : list of ints (0-3) or None for unanswered questions,
                    one entry per question in order.
                    Shorter lists are automatically padded with None.

    Returns
    -------
    {
        "score":             int,    # number of correct answers
        "total":             int,    # total number of questions
        "percentage":        float,  # 0.0 – 100.0
        "is_weak":           bool,   # percentage < WEAK_THRESHOLD
        "correct_indices":   list,   # 0-based indices of correct answers
        "incorrect_indices": list,   # 0-based indices of wrong answers
        "unanswered":        list,   # 0-based indices of None answers
    }
    """
    questions = quiz_content.get("questions", [])
    total     = len(questions)

    if total == 0:
        return {
            "score": 0, "total": 0, "percentage": 0.0,
            "is_weak": True,
            "correct_indices": [], "incorrect_indices": [], "unanswered": [],
        }

    # Pad or trim to match question count — never crash on mismatched length
    answers = list(user_answers) + [None] * total
    answers = answers[:total]

    correct_indices   = []
    incorrect_indices = []
    unanswered        = []

    for idx, (question, answer) in enumerate(zip(questions, answers)):
        if answer is None:
            unanswered.append(idx)
        elif answer == question.get("correct_answer"):
            correct_indices.append(idx)
        else:
            incorrect_indices.append(idx)

    score      = len(correct_indices)
    percentage = compute_percentage(score, total)
    is_weak    = detect_weak_topic(percentage)

    logger.debug(
        "evaluate_quiz: score=%d/%d (%.1f%%) is_weak=%s",
        score, total, percentage, is_weak,
    )

    return {
        "score":             score,
        "total":             total,
        "percentage":        percentage,
        "is_weak":           is_weak,
        "correct_indices":   correct_indices,
        "incorrect_indices": incorrect_indices,
        "unanswered":        unanswered,
    }


# ─────────────────────────────────────────────────────────────────────
# 4. IN-MEMORY QUIZ CACHE  (zero external dependencies)
# ─────────────────────────────────────────────────────────────────────

class _QuizCache:
    """
    Lightweight TTL cache keyed by (subject, topic, difficulty, num_questions).
    Stores already-validated quiz dicts so callers can skip both the AI call
    and the JSON-parse/validate round on a hit.

    Thread-safety note
    ------------------
    Under Gunicorn each worker process has its own cache instance, so
    concurrent dict operations from the same process's greenlets/threads
    are the only concern. For the current synchronous Flask setup this is
    perfectly safe. Worst case on a race: two workers both miss the cache
    and both make an AI call — the last writer wins. No data corruption.
    """

    DEFAULT_TTL = 600  # 10 minutes

    def __init__(self) -> None:
        self._store: Dict[str, Tuple[float, Any]] = {}

    @staticmethod
    def make_key(subject: str, topic: str, difficulty: str, num_questions: int) -> str:
        return f"{subject.lower().strip()}|{topic.lower().strip()}|{difficulty}|{num_questions}"

    def get(self, key: str) -> Optional[Any]:
        """Return cached value or None if missing / expired."""
        entry = self._store.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if time.monotonic() > expires_at:
            del self._store[key]
            logger.debug("QuizCache EXPIRED  key=%s", key)
            return None
        logger.info("QuizCache HIT      key=%s", key)
        return value

    def set(self, key: str, value: Any, ttl: int = DEFAULT_TTL) -> None:
        """Store value with a TTL (seconds)."""
        self._store[key] = (time.monotonic() + ttl, value)
        logger.info("QuizCache SET      key=%s ttl=%ds", key, ttl)

    def invalidate(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()
        logger.info("QuizCache CLEARED")

    @property
    def size(self) -> int:
        return len(self._store)


# Module-level singleton — import as: from helpers import quiz_cache
quiz_cache = _QuizCache()
