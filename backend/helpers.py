"""
helpers.py — Reusable, stateless utility functions for EduGenie backend.

Public API
----------
Core
  compute_percentage(score, total)                    -> float
  detect_weak_topic(percentage)                       -> bool
  evaluate_quiz(quiz_content, user_answers)           -> dict

Personalization
  classify_performance(percentage)                    -> str
  recommend_difficulty(percentage)                    -> str
  generate_smart_feedback(percentage, topic, subject) -> dict
  generate_study_plan(weak, trend, subjects)          -> list[dict]
  generate_insights(...)                              -> list[str]
  compute_streaks(attempt_dates)                      -> dict

Cache
  quiz_cache                                          -> _QuizCache singleton
"""

import time
import logging
from datetime import date, timedelta
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────
# THRESHOLDS  (single source of truth — update here, affects everywhere)
# ─────────────────────────────────────────────────────────────────────

WEAK_THRESHOLD        = 50.0
STRONG_THRESHOLD      = 80.0
HARD_DIFFICULTY_FLOOR = 75.0


# ─────────────────────────────────────────────────────────────────────
# 1. PERCENTAGE HELPER
# ─────────────────────────────────────────────────────────────────────

def compute_percentage(score: float, total: float) -> float:
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
    return percentage < WEAK_THRESHOLD


# ─────────────────────────────────────────────────────────────────────
# 3. QUIZ EVALUATOR
# ─────────────────────────────────────────────────────────────────────

def evaluate_quiz(quiz_content: Dict, user_answers: List[Optional[int]]) -> Dict:
    questions = quiz_content.get("questions", [])
    total     = len(questions)

    if total == 0:
        return {
            "score": 0, "total": 0, "percentage": 0.0, "is_weak": True,
            "correct_indices": [], "incorrect_indices": [], "unanswered": [],
        }

    answers = (list(user_answers) + [None] * total)[:total]
    correct_indices, incorrect_indices, unanswered = [], [], []

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

    logger.debug("evaluate_quiz: %d/%d (%.1f%%) is_weak=%s", score, total, percentage, is_weak)
    return {
        "score": score, "total": total, "percentage": percentage, "is_weak": is_weak,
        "correct_indices": correct_indices, "incorrect_indices": incorrect_indices,
        "unanswered": unanswered,
    }


# ─────────────────────────────────────────────────────────────────────
# 4. PERFORMANCE CLASSIFICATION
# ─────────────────────────────────────────────────────────────────────

def classify_performance(percentage: float) -> str:
    """
    < 50  -> "Beginner"
    50-74 -> "Intermediate"
    >= 75 -> "Advanced"
    """
    if percentage >= HARD_DIFFICULTY_FLOOR:
        return "Advanced"
    if percentage >= WEAK_THRESHOLD:
        return "Intermediate"
    return "Beginner"


# ─────────────────────────────────────────────────────────────────────
# 5. SMART DIFFICULTY RECOMMENDER
# ─────────────────────────────────────────────────────────────────────

def recommend_difficulty(percentage: float) -> str:
    """
    < 50  -> "easy"
    50-75 -> "medium"
    > 75  -> "hard"
    """
    if percentage > HARD_DIFFICULTY_FLOOR:
        return "hard"
    if percentage >= WEAK_THRESHOLD:
        return "medium"
    return "easy"


# ─────────────────────────────────────────────────────────────────────
# 6. SMART FEEDBACK GENERATOR
# ─────────────────────────────────────────────────────────────────────

def generate_smart_feedback(
    percentage: float,
    topic: Optional[str] = None,
    subject: Optional[str] = None,
) -> Dict:
    """
    Returns:
    { message, action, confidence_level, performance_level, next_difficulty }
    """
    topic_label   = f" on {topic}"  if topic   else ""
    subject_label = f" ({subject})" if subject else ""

    if percentage >= 90:
        message, action, confidence_level = (
            f"Outstanding{topic_label}{subject_label}! Near-perfect score.",
            "Challenge yourself with Hard difficulty next.",
            "high",
        )
    elif percentage >= 75:
        message, action, confidence_level = (
            f"Great work{topic_label}{subject_label}!",
            "Try Hard difficulty or explore an adjacent topic.",
            "high",
        )
    elif percentage >= 60:
        message, action, confidence_level = (
            f"Good attempt{topic_label}{subject_label}.",
            "Review the questions you got wrong and retry at Medium difficulty.",
            "medium",
        )
    elif percentage >= 40:
        message, action, confidence_level = (
            f"Needs improvement{topic_label}{subject_label}.",
            "Re-read your notes, then retry at Easy difficulty to build confidence.",
            "low",
        )
    else:
        message, action, confidence_level = (
            f"This topic needs serious revision{topic_label}{subject_label}.",
            "Study the notes thoroughly, ask the AI Tutor for help, then start with Easy.",
            "very_low",
        )

    return {
        "message":           message,
        "action":            action,
        "confidence_level":  confidence_level,
        "performance_level": classify_performance(percentage),
        "next_difficulty":   recommend_difficulty(percentage),
    }


# ─────────────────────────────────────────────────────────────────────
# 7. PERSONALIZED STUDY PLAN GENERATOR
# ─────────────────────────────────────────────────────────────────────

def generate_study_plan(
    weak_topics:       List[Dict],
    improvement_trend: str,
    subject_perf:      List[Dict],
    max_items:         int = 5,
) -> List[Dict]:
    """
    Build a prioritized study plan (max 5 items) from weak topics + trend.

    weak_topics  : sorted worst-first (avg ASC)
    subject_perf : sorted best-first  (avg DESC)
    Returns list of { topic, subject, priority, reason, action }
    """
    plan = []
    subject_avg = {s["subject"]: float(s["avg"]) for s in subject_perf}

    for item in weak_topics[:max_items]:
        avg      = float(item["avg"])
        topic    = item["topic"]
        subject  = item["subject"]
        attempts = int(item.get("attempts", 1))
        subj_avg = subject_avg.get(subject, avg)

        if avg < 30 or improvement_trend == "declining" or attempts >= 3:
            priority = "high"
            if avg < 30:
                reason = f"Critical gap: only {avg}% average across {attempts} attempt(s)"
            elif improvement_trend == "declining":
                reason = f"Overall trend is declining — {topic} needs urgent attention"
            else:
                reason = f"Attempted {attempts} times with average {avg}% — persistent weakness"
        elif (subj_avg - avg) >= 20:
            priority = "medium"
            reason   = (
                f"Below your {subject} average ({subj_avg}%) "
                f"by {round(subj_avg - avg, 1)} points"
            )
        else:
            priority = "low"
            reason   = f"Score {avg}% is below the {int(WEAK_THRESHOLD)}% pass threshold"

        action = (
            "Generate Easy quiz after reviewing notes"
            if priority == "high"
            else "Attempt a Medium quiz on this topic"
        )

        plan.append({"topic": topic, "subject": subject,
                     "priority": priority, "reason": reason, "action": action})

    priority_order = {"high": 0, "medium": 1, "low": 2}
    plan.sort(key=lambda x: priority_order[x["priority"]])
    logger.debug("generate_study_plan: %d items", len(plan))
    return plan


# ─────────────────────────────────────────────────────────────────────
# 8. LEARNING INSIGHTS GENERATOR
# ─────────────────────────────────────────────────────────────────────

def generate_insights(
    trend_data:        List[Dict],
    subject_perf:      List[Dict],
    weak_topics:       List[Dict],
    strong_topics:     List[Dict],
    total_attempts:    int,
    improvement_trend: str,
    current_streak:    int,
    overall_avg:       float,
) -> List[str]:
    """
    Produce up to 6 concise, human-readable learning insights.
    Never raises — returns [] on any error.
    """
    insights: List[str] = []

    try:
        # Trend
        if improvement_trend == "improving":
            insights.append("Your scores are trending upward — keep up the momentum!")
        elif improvement_trend == "declining":
            insights.append(
                "Your recent scores have dipped. Review weak topics before your next quiz."
            )

        # Subject performance
        if subject_perf:
            best  = subject_perf[0]
            worst = subject_perf[-1]
            if float(best["avg"]) >= STRONG_THRESHOLD:
                insights.append(
                    f"You are excelling in {best['subject']} "
                    f"with an average of {best['avg']}%."
                )
            if len(subject_perf) > 1 and float(worst["avg"]) < WEAK_THRESHOLD:
                insights.append(
                    f"You are struggling with {worst['subject']} "
                    f"(avg {worst['avg']}%) — it needs more attention."
                )

        # Weakest topic
        if weak_topics:
            w = weak_topics[0]
            insights.append(
                f'"{w["topic"]}" in {w["subject"]} is your lowest-scoring topic at {w["avg"]}%.'
            )

        # Strongest topic
        if strong_topics:
            s = max(strong_topics, key=lambda t: t["avg"])
            insights.append(
                f'You have mastered "{s["topic"]}" in {s["subject"]} with {s["avg"]}%.'
            )

        # Streak
        if current_streak >= 7:
            insights.append(
                f"Incredible! You have a {current_streak}-day learning streak. Consistency is key!"
            )
        elif current_streak >= 3:
            insights.append(f"You are on a {current_streak}-day streak — great consistency!")
        elif current_streak == 0 and total_attempts > 0:
            insights.append(
                "You haven't studied today yet — take a quiz to keep your streak alive!"
            )

        # Overall level
        level = classify_performance(overall_avg)
        if total_attempts >= 5:
            insights.append(
                f"Based on {total_attempts} attempts your performance level is "
                f"{level} ({overall_avg}% average)."
            )

    except Exception as exc:
        logger.warning("generate_insights error: %s", exc)

    return insights[:6]


# ─────────────────────────────────────────────────────────────────────
# 9. STREAK CALCULATOR
# ─────────────────────────────────────────────────────────────────────

def compute_streaks(attempt_dates: List[Any]) -> Dict:
    """
    Compute current and longest consecutive-day learning streaks.

    attempt_dates : list of date/datetime objects. Duplicates fine.
    Returns { "current": int, "longest": int }

    Current streak counts backwards from today.
    If user studied yesterday but not today the streak is still live.
    """
    if not attempt_dates:
        return {"current": 0, "longest": 0}

    try:
        unique_days: set = set()
        for d in attempt_dates:
            if hasattr(d, "date"):
                unique_days.add(d.date())
            elif isinstance(d, date):
                unique_days.add(d)

        if not unique_days:
            return {"current": 0, "longest": 0}

        sorted_days = sorted(unique_days)

        # Longest streak
        longest = run = 1
        for i in range(1, len(sorted_days)):
            if (sorted_days[i] - sorted_days[i - 1]) == timedelta(days=1):
                run    += 1
                longest = max(longest, run)
            else:
                run = 1

        # Current streak (back from today, or yesterday if not yet studied today)
        today   = date.today()
        current = 0
        check   = today
        while check in unique_days:
            current += 1
            check   -= timedelta(days=1)

        if current == 0:
            check = today - timedelta(days=1)
            while check in unique_days:
                current += 1
                check   -= timedelta(days=1)

        logger.debug(
            "compute_streaks: %d days, current=%d, longest=%d",
            len(unique_days), current, longest,
        )
        return {"current": current, "longest": longest}

    except Exception as exc:
        logger.warning("compute_streaks error: %s", exc)
        return {"current": 0, "longest": 0}


# ─────────────────────────────────────────────────────────────────────
# 10. IN-MEMORY QUIZ CACHE  (zero external dependencies)
# ─────────────────────────────────────────────────────────────────────

class _QuizCache:
    DEFAULT_TTL = 600  # 10 minutes

    def __init__(self) -> None:
        self._store: Dict[str, Tuple[float, Any]] = {}

    @staticmethod
    def make_key(subject: str, topic: str, difficulty: str, num_questions: int) -> str:
        return f"{subject.lower().strip()}|{topic.lower().strip()}|{difficulty}|{num_questions}"

    def get(self, key: str) -> Optional[Any]:
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


# Module-level singleton
quiz_cache = _QuizCache()
