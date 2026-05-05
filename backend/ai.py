import os
import time
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json"
}


def call_groq(prompt, timeout=30, max_retries=2):
    """
    Call the Groq API with automatic retry on transient failures.
    Raises RuntimeError if all attempts fail so callers can surface a clean error.
    """
    data = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are an academic assistant for MCA students."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
    }

    last_error = None
    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(
                GROQ_URL, headers=HEADERS, json=data, timeout=timeout
            )

            if response.status_code != 200:
                last_error = f"API returned HTTP {response.status_code}"
                logger.warning(
                    "Groq API error on attempt %d/%d — %s: %s",
                    attempt, max_retries, last_error, response.text[:200],
                )
                if attempt < max_retries:
                    time.sleep(1)
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
            # Unexpected payload shape — no point retrying
            logger.error("Groq API unexpected response shape: %s", exc)
            raise RuntimeError("AI service returned an unexpected response format") from exc

    logger.error("Groq API failed after %d attempts: %s", max_retries, last_error)
    raise RuntimeError(f"AI service unavailable after {max_retries} attempts: {last_error}")


# ---------------------------------
# NOTE GENERATION
# ---------------------------------
def generate_note(subject, topic):

    prompt = f"""
    You are an academic content writer for MCA students.

    Generate structured, university-exam oriented notes.

    Subject: {subject}
    Topic: {topic}

    STRICT REQUIREMENTS:

    1. 2–3 pages maximum.
    2. Paragraph-based explanations.
    3. Use clear numbered headings like:
        1. Introduction
        2. Key Concepts
        3. Types
        4. Working / Process
        5. Advantages
        6. Disadvantages
        7. Conclusion (if applicable)
    4. Do NOT use markdown symbols like ** or bullet stars.
    5. Avoid excessive bullet points.
    6. Write in simple, clear academic language.
    7. Suitable for 10–15 mark university answers.

    Output clean formatted text only.
    """

    return call_groq(prompt)


# ---------------------------------
# QUIZ GENERATION
# ---------------------------------
def generate_quiz(subject, topic, difficulty="medium", num_questions=5):
    difficulty_map = {
        "easy":   "basic recall and definition questions suitable for beginners",
        "medium": "conceptual understanding and application questions for intermediate learners",
        "hard":   "advanced analysis, edge cases, and tricky questions for expert learners"
    }
    diff_desc = difficulty_map.get(difficulty, difficulty_map["medium"])

    prompt = f"""
    Generate exactly {num_questions} multiple choice questions for the subject '{subject}'
    and topic '{topic}'.

    Difficulty: {difficulty.upper()} — {diff_desc}

    STRICT REQUIREMENTS:
    - Return ONLY valid JSON
    - No explanations
    - No extra text
    - No markdown formatting
    - No backticks

    JSON format must be:

    {{
      "questions": [
        {{
          "question": "Question text",
          "options": [
            "Option A",
            "Option B",
            "Option C",
            "Option D"
          ],
          "correct_answer": 0
        }}
      ]
    }}

    Rules:
    - Exactly {num_questions} questions
    - Exactly 4 options per question
    - correct_answer must be index number (0-3)
    - Match the {difficulty} difficulty level strictly
    """

    raw = call_groq(prompt)

    # Strip markdown code fences if the model wraps in ```json ... ```
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    return raw

# ---------------------------------
# QUIZ STRUCTURE VALIDATION
# ---------------------------------
def validate_quiz_structure(data):
    """
    Validate that a parsed quiz dict matches the expected schema:
        { "questions": [ { "question": str, "options": [4 strs], "correct_answer": 0-3 }, ... ] }

    Returns (True, None) on success or (False, reason_str) on failure.
    Mutates nothing — purely read-only inspection.
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


# ---------------------------------
# TOPIC GENERATION
# ---------------------------------
def generate_topics(subject):

    prompt = f"""
    Generate 10 important academic syllabus topics for MCA students in the subject:
    {subject}

    Only return topic names separated by new lines.
    """

    content = call_groq(prompt)

    return [t.strip() for t in content.split("\n") if t.strip()]

# ---------------------------------
# FYP GUIDE GENERATION
# ---------------------------------
def generate_fyp_guide(domain, interest, team_size=1):
    prompt = f"""
You are an expert MCA academic mentor helping 4th semester students plan their Final Year Project.

Student details:
- Domain of interest: {domain}
- Specific interest/idea: {interest}
- Team size: {team_size} member(s)

Generate a COMPLETE, DETAILED Final Year Project guide. Structure it EXACTLY as follows:

1. PROJECT TITLE IDEAS
List 3 specific, realistic project title suggestions based on their interest.

2. RECOMMENDED TECH STACK
List frontend, backend, database, and tools separately. Be specific and beginner-friendly.

3. PROJECT ROADMAP (Month-by-Month)
Month 1 - Planning & Setup
Month 2 - Core Development
Month 3 - Features & Testing
Month 4 - Deployment & Documentation

4. KEY FEATURES TO IMPLEMENT
List 6-8 must-have features for this type of project.

5. DATABASE DESIGN HINTS
Suggest 4-5 main tables/collections with key fields.

6. GITHUB REPOSITORY STRUCTURE
Show the recommended folder structure.

7. DOCUMENTATION CHECKLIST
List what documents are needed: SRS, project report chapters, PPT outline, etc.

8. EVALUATION CRITERIA (Common MCA viva questions)
List 5 important questions professors typically ask.

9. TIPS FOR HIGH MARKS
3-4 practical tips specific to MCA final year evaluation.

Write in clear, plain text. Use numbered lists and headings. No markdown symbols like ** or ##.
Be specific, practical, and encouraging.
"""
    return call_groq(prompt)


# ---------------------------------
# RESUME LATEX GENERATION
# ---------------------------------
def generate_resume_latex(user_data):
    """
    user_data: dict with keys:
      name, phone, email, linkedin,
      target_role, summary,
      skills (list of dicts: {category, items}),
      experience (list of dicts: {title, duration, company, tools, bullets}),
      projects (list of dicts: {title, tech, bullets}),
      certifications (list),
      education (list of dicts: {degree, status, institution, detail})
    """

    # Build a detailed prompt describing the user data
    skills_text = "\n".join([f"- {s['category']}: {s['items']}" for s in user_data.get('skills', [])])
    exp_text = ""
    for e in user_data.get('experience', []):
        exp_text += f"- Title: {e['title']}, Duration: {e['duration']}, Company: {e['company']}, Tools: {e['tools']}\n"
        for b in e.get('bullets', []):
            exp_text += f"  * {b}\n"
    proj_text = ""
    for p in user_data.get('projects', []):
        proj_text += f"- {p['title']} | Tech: {p['tech']}\n"
        for b in p.get('bullets', []):
            proj_text += f"  * {b}\n"
    certs_text = "\n".join([f"- {c}" for c in user_data.get('certifications', [])])
    edu_text = ""
    for ed in user_data.get('education', []):
        edu_text += f"- {ed['degree']} | {ed['status']} | {ed['institution']} | {ed.get('detail','')}\n"

    prompt = f"""
You are an expert resume writer and LaTeX developer. Generate a complete, compilable LaTeX resume.

TARGET ROLE: {user_data.get('target_role', 'Software Developer')}

PERSON DETAILS:
Name: {user_data.get('name', '')}
Phone: {user_data.get('phone', '')}
Email: {user_data.get('email', '')}
LinkedIn: {user_data.get('linkedin', '')}

SUMMARY:
{user_data.get('summary', '')}

SKILLS:
{skills_text}

EXPERIENCE:
{exp_text}

PROJECTS:
{proj_text}

CERTIFICATIONS:
{certs_text}

EDUCATION:
{edu_text}

Generate a COMPLETE LaTeX document using EXACTLY this template structure. Replace only the content, keep all formatting commands identical:

\\documentclass[letterpaper,11pt]{{article}}
\\usepackage{{latexsym}}
\\usepackage[empty]{{fullpage}}
\\usepackage{{titlesec}}
\\usepackage{{marvosym}}
\\usepackage[usenames,dvipsnames]{{color}}
\\usepackage{{verbatim}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage{{fancyhdr}}
\\usepackage[english]{{babel}}
\\usepackage{{tabularx}}
\\usepackage{{fontawesome5}}
\\usepackage{{multicol}}
\\setlength{{\\multicolsep}}{{-4.0pt}}
\\setlength{{\\columnsep}}{{-2pt}}
\\input{{glyphtounicode}}
\\pagestyle{{fancy}}
\\fancyhf{{}}
\\fancyfoot{{}}
\\renewcommand{{\\headrulewidth}}{{0pt}}
\\renewcommand{{\\footrulewidth}}{{0pt}}
\\addtolength{{\\oddsidemargin}}{{-0.6in}}
\\addtolength{{\\evensidemargin}}{{-0.5in}}
\\addtolength{{\\textwidth}}{{1.19in}}
\\addtolength{{\\topmargin}}{{-.7in}}
\\addtolength{{\\textheight}}{{1.4in}}
\\urlstyle{{same}}
\\raggedbottom
\\raggedright
\\setlength{{\\tabcolsep}}{{0in}}
\\titleformat{{\\section}}{{\\vspace{{-6pt}}\\scshape\\raggedright\\large\\bfseries}}{{}}{{0em}}{{}}[\\color{{black}}\\titlerule \\vspace{{-5pt}}]
\\pdfgentounicode=1
\\newcommand{{\\resumeItem}}[1]{{\\item\\small{{{{#1 \\vspace{{-2pt}}}}}}}}
\\newcommand{{\\resumeSubheading}}[4]{{\\vspace{{-2pt}}\\item\\begin{{tabular*}}{{1.0\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}\\textbf{{#1}} & \\textbf{{\\small #2}} \\\\\\textit{{\\small#3}} & \\textit{{\\small #4}} \\\\\\end{{tabular*}}\\vspace{{-6pt}}}}
\\newcommand{{\\resumeProjectHeading}}[2]{{\\item\\begin{{tabular*}}{{1.001\\textwidth}}{{l@{{\\extracolsep{{\\fill}}}}r}}\\small#1 & \\textbf{{\\small #2}}\\\\\\end{{tabular*}}\\vspace{{-6pt}}}}
\\newcommand{{\\resumeItemListStart}}{{\\begin{{itemize}}}}
\\newcommand{{\\resumeItemListEnd}}{{\\end{{itemize}}\\vspace{{-5pt}}}}
\\newcommand{{\\resumeSubHeadingListStart}}{{\\begin{{itemize}}[leftmargin=0.0in, label={{}}]}}
\\newcommand{{\\resumeSubHeadingListEnd}}{{\\end{{itemize}}}}

\\begin{{document}}

[INSERT FULL RESUME CONTENT HERE using the exact LaTeX commands above]

\\end{{document}}

RULES:
1. Output ONLY the complete LaTeX code, nothing else
2. No explanation, no markdown, no backticks
3. Optimize all bullet points with strong action verbs and quantified results for ATS
4. Keep it to ONE page
5. Use \\resumeSubheading, \\resumeProjectHeading, \\resumeItem, \\resumeItemListStart, \\resumeItemListEnd, \\resumeSubHeadingListStart, \\resumeSubHeadingListEnd exactly
6. Make the summary and bullets keyword-rich for the target role: {user_data.get('target_role', '')}
7. Escape special LaTeX characters: & becomes \\&, % becomes \\%, # becomes \\#
"""

    raw = call_groq(prompt)
    # Clean up any markdown fencing
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("latex") or raw.startswith("tex"):
            raw = raw[raw.index("\n")+1:]
    raw = raw.strip()
    return raw


# ---------------------------------
# RESUME IMPROVEMENT (from uploaded resume)
# ---------------------------------
def improve_resume_latex(existing_resume_text, target_role):
    prompt = f"""
You are an expert ATS resume optimizer and LaTeX developer.

TARGET ROLE: {target_role}

EXISTING RESUME TEXT:
{existing_resume_text}

Tasks:
1. Rewrite and improve ALL bullet points with stronger action verbs and quantified results
2. Optimize the summary for the target role with relevant keywords
3. Reorganize skills to highlight what matters most for {target_role}
4. Keep all real information — only improve wording, not fabricate data

Generate a COMPLETE compilable LaTeX document using this EXACT template structure:

\\documentclass[letterpaper,11pt]{{article}}
\\usepackage{{latexsym}}
\\usepackage[empty]{{fullpage}}
\\usepackage{{titlesec}}
\\usepackage{{marvosym}}
\\usepackage[usenames,dvipsnames]{{color}}
\\usepackage{{verbatim}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage{{fancyhdr}}
\\usepackage[english]{{babel}}
\\usepackage{{tabularx}}
\\usepackage{{fontawesome5}}
\\usepackage{{multicol}}
\\setlength{{\\multicolsep}}{{-4.0pt}}
\\setlength{{\\columnsep}}{{-2pt}}
\\input{{glyphtounicode}}
\\pagestyle{{fancy}}
\\fancyhf{{}}
\\fancyfoot{{}}
\\renewcommand{{\\headrulewidth}}{{0pt}}
\\renewcommand{{\\footrulewidth}}{{0pt}}
\\addtolength{{\\oddsidemargin}}{{-0.6in}}
\\addtolength{{\\evensidemargin}}{{-0.5in}}
\\addtolength{{\\textwidth}}{{1.19in}}
\\addtolength{{\\topmargin}}{{-.7in}}
\\addtolength{{\\textheight}}{{1.4in}}
\\urlstyle{{same}}
\\raggedbottom
\\raggedright
\\setlength{{\\tabcolsep}}{{0in}}
\\titleformat{{\\section}}{{\\vspace{{-6pt}}\\scshape\\raggedright\\large\\bfseries}}{{}}{{0em}}{{}}[\\color{{black}}\\titlerule \\vspace{{-5pt}}]
\\pdfgentounicode=1
\\newcommand{{\\resumeItem}}[1]{{\\item\\small{{{{#1 \\vspace{{-2pt}}}}}}}}
\\newcommand{{\\resumeSubheading}}[4]{{\\vspace{{-2pt}}\\item\\begin{{tabular*}}{{1.0\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}\\textbf{{#1}} & \\textbf{{\\small #2}} \\\\\\textit{{\\small#3}} & \\textit{{\\small #4}} \\\\\\end{{tabular*}}\\vspace{{-6pt}}}}
\\newcommand{{\\resumeProjectHeading}}[2]{{\\item\\begin{{tabular*}}{{1.001\\textwidth}}{{l@{{\\extracolsep{{\\fill}}}}r}}\\small#1 & \\textbf{{\\small #2}}\\\\\\end{{tabular*}}\\vspace{{-6pt}}}}
\\newcommand{{\\resumeItemListStart}}{{\\begin{{itemize}}}}
\\newcommand{{\\resumeItemListEnd}}{{\\end{{itemize}}\\vspace{{-5pt}}}}
\\newcommand{{\\resumeSubHeadingListStart}}{{\\begin{{itemize}}[leftmargin=0.0in, label={{}}]}}
\\newcommand{{\\resumeSubHeadingListEnd}}{{\\end{{itemize}}}}

\\begin{{document}}
[IMPROVED RESUME CONTENT]
\\end{{document}}

OUTPUT ONLY LaTeX code. No explanation. No markdown. No backticks.
"""
    raw = call_groq(prompt)
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("latex") or raw.startswith("tex"):
            raw = raw[raw.index("\n")+1:]
    raw = raw.strip()
    return raw
