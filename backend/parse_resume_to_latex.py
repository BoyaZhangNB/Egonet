from __future__ import annotations

import json
from pathlib import Path
from typing import Any


LATEX_TEMPLATE_PREFIX = r"""%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------
\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\input{glyphtounicode}
\usepackage[bottom=0.5in, top=0.5in, left=0.3in, right=0.3in]{geometry} % Unified margin setup

%----------FONT OPTIONS----------
% sans-serif
% \usepackage[sfdefault]{FiraSans}
% \usepackage[sfdefault]{roboto}
% \usepackage[sfdefault]{noto-sans}
% \usepackage[default]{sourcesanspro}

% serif
% \usepackage{CormorantGaramond}
% \usepackage{charter}

% Page style
\pagestyle{fancy}
\fancyhf{} % Clear all header and footer fields
\fancyfoot{} % Clear footer
\renewcommand{\headrulewidth}{0pt} % No header rule
\renewcommand{\footrulewidth}{0pt} % No footer rule

% Ensure that generated PDF is machine-readable/ATS parsable
\pdfgentounicode=1

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Table adjustments
\setlength{\tabcolsep}{0in}

\raggedbottom
\raggedright

%-------------------------
% Custom commands
\newcommand{\resumeItem}[1]{
  \item\small{
    {#1 \vspace{-1pt}}
  }
}

\newcommand{\resumeItemR}[2]{
  \item\small{
    \begin{tabular}{|l|c|}
    \hline
    {#1 \vspace{-1pt}} & \textit{#2 \vspace{-1pt}} \\ \hline
    \end{tabular}

  }
}

\newcommand{\resumeSubheading}[4]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubheadingTwo}[2]{
  \vspace{-2pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubSubheading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \textit{\small#1} & \textit{\small #2} \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeProjectHeading}[2]{
    \item
    \begin{tabular*}{0.97\textwidth}{l@{\extracolsep{\fill}}r}
      \small#1 & #2 \\
    \end{tabular*}\vspace{-7pt}
}

\newcommand{\resumeSubItem}[1]{\resumeItem{#1}\vspace{-4pt}}

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}}
\newcommand{\resumeItemListStart}{\begin{itemize}}
\newcommand{\resumeItemListEnd}{\end{itemize}\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\begin{document}

%----------HEADING----------
\begin{center}
    \textbf{\Huge \scshape {NAME}} \\ \vspace{1pt}
    \small {PHONE} $|$ \href{mailto:{EMAIL}}{\underline{{EMAIL}}}
\end{center}
"""

LATEX_TEMPLATE_SUFFIX = r"""
%-------------------------------------------
\end{document}
"""


def _escape_latex(value: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "&": r"\&",
        "%": r"\%",
        "$": r"\$",
        "#": r"\#",
        "_": r"\_",
        "{": r"\{",
        "}": r"\}",
        "~": r"\textasciitilde{}",
        "^": r"\textasciicircum{}",
    }
    escaped = value
    for old, new in replacements.items():
        escaped = escaped.replace(old, new)
    return escaped


def _get_text(item: dict[str, Any], key: str, default: str = "") -> str:
    value = item.get(key, default)
    if value is None:
        return default
    return _escape_latex(str(value))


def _section_education(items: list[dict[str, Any]]) -> str:
    lines: list[str] = ["", "%-----------EDUCATION-----------", r"\section{Education}", r"  \resumeSubHeadingListStart"]
    for item in items:
        title = _get_text(item, "title")
        time = _get_text(item, "time")
        description = _get_text(item, "description")
        lines.extend(
            [
                r"    \resumeSubheading",
                f"      {{{title}}}{{}}",
                f"      {{{description}}}{{{time}}}",
            ]
        )
    lines.append(r"  \resumeSubHeadingListEnd")
    return "\n".join(lines)


def _section_experience(items: list[dict[str, Any]]) -> str:
    lines: list[str] = ["", "%-----------EXPERIENCE-----------", r"\section{Experience}", r"  \resumeSubHeadingListStart"]
    for item in items:
        title = _get_text(item, "title")
        time = _get_text(item, "time")
        description = _get_text(item, "description")
        lines.extend(
            [
                r"    \resumeSubheading",
                f"      {{{title}}}{{{time}}}",
                r"      {}{}",
                r"      \resumeItemListStart",
                f"        \\resumeItem{{{description}}}",
                r"      \resumeItemListEnd",
            ]
        )
    lines.append(r"  \resumeSubHeadingListEnd")
    return "\n".join(lines)


def _section_projects(items: list[dict[str, Any]]) -> str:
    lines: list[str] = ["", "%-----------PROJECTS-----------", r"\section{Projects}", r"    \resumeSubHeadingListStart"]
    for item in items:
        title = _get_text(item, "title")
        time = _get_text(item, "time")
        description = _get_text(item, "description")
        lines.extend(
            [
                r"    \resumeProjectHeading",
                f"      {{\\textbf{{{title}}}}} {{{time}}}",
                r"      \resumeItemListStart",
                f"        \\resumeItem{{{description}}}",
                r"      \resumeItemListEnd",
            ]
        )
    lines.append(r"    \resumeSubHeadingListEnd")
    return "\n".join(lines)


def _section_skills(items: list[dict[str, Any]]) -> str:
    skills = []
    for item in items:
        title = _get_text(item, "title")
        description = _get_text(item, "description")
        if description:
            skills.append(f"{title} ({description})")
        else:
            skills.append(title)

    skill_line = ", ".join(s for s in skills if s)

    lines = [
        "",
        "%-----------PROGRAMMING SKILLS-----------",
        r"\section{Skills}",
        r" \begin{itemize}[leftmargin=0.15in, label={}]",
        r"    \small{\item{",
        f"     \\textbf{{Skills}}{{: {skill_line}}} \\\\",
        r"    }}",
        r" \end{itemize}",
    ]
    return "\n".join(lines)


def parse_resume_path_to_latex(resume_path: str) -> str:
    """Convert a JSON resume path (under backend/resume/) into LaTeX text."""
    base_dir = Path(__file__).resolve().parent / "resume"
    candidate = Path(resume_path)
    if not candidate.is_absolute():
        candidate = (base_dir / candidate).resolve()

    if not candidate.exists():
        raise FileNotFoundError(f"Resume file not found: {candidate}")

    with candidate.open("r", encoding="utf-8") as file:
        resume = json.load(file)

    basics = resume.get("basics", {}) if isinstance(resume, dict) else {}
    name = _escape_latex(str(basics.get("name", "Your Name")))
    phone = _escape_latex(str(basics.get("phone", "000-000-0000")))
    email = _escape_latex(str(basics.get("email", "example@email.com")))

    latex = LATEX_TEMPLATE_PREFIX
    latex = latex.replace("{NAME}", name)
    latex = latex.replace("{PHONE}", phone)
    latex = latex.replace("{EMAIL}", email)

    latex += _section_education(resume.get("education", []))
    latex += "\n\n"
    latex += _section_experience(resume.get("experience", []))
    latex += "\n\n"
    latex += _section_projects(resume.get("projects", []))
    latex += "\n\n"
    latex += _section_skills(resume.get("skills", []))
    latex += "\n"
    latex += LATEX_TEMPLATE_SUFFIX

    return latex


def parse_resume_file_to_latex(resume_path: str, output_path: str | None = None) -> str:
    """Generate LaTeX from resume path and optionally write it to a file."""
    latex = parse_resume_path_to_latex(resume_path)
    if output_path:
        Path(output_path).write_text(latex, encoding="utf-8")
    return latex


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Convert resume JSON under backend/resume/ to LaTeX")
    parser.add_argument("resume_path", help="Path like 'resume.json' or full path to JSON")
    parser.add_argument("--output", "-o", help="Optional output .tex path", default=None)
    args = parser.parse_args()

    output = parse_resume_file_to_latex(args.resume_path, args.output)
    if not args.output:
        print(output)
