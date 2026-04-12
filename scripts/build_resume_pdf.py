from __future__ import annotations

import re
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "Nathan's_Resume (1).txt"
OUTPUT = ROOT / "Nathan-Bashant-Resume.pdf"
PAGE_HEIGHT_POINTS = 11 * 72


def split_sections(lines: list[str]) -> tuple[str, str, dict[str, list[str]]]:
    name = lines[0].strip()
    contact = lines[1].strip()

    sections: dict[str, list[str]] = {}
    current = None
    buffer: list[str] = []

    for raw_line in lines[2:]:
        line = raw_line.rstrip()
        if line and line == line.upper() and not line.startswith("*"):
            if current is not None:
                sections[current] = buffer
            current = line
            buffer = []
            continue
        if current is not None:
            buffer.append(line)

    if current is not None:
        sections[current] = buffer

    return name, contact, sections


def parse_experience(lines: list[str]) -> list[dict[str, object]]:
    entries: list[dict[str, object]] = []
    i = 0
    while i < len(lines):
        if not lines[i].strip():
            i += 1
            continue

        header = lines[i].strip()
        company = lines[i + 1].strip()
        i += 2
        bullets: list[str] = []

        while i < len(lines) and lines[i].strip():
            bullet = lines[i].strip()
            bullets.append(bullet[2:].strip() if bullet.startswith("* ") else bullet)
            i += 1

        parts = re.split(r"\s{2,}", header)
        title = parts[0].strip()
        date_range = parts[-1].strip() if len(parts) > 1 else ""

        entries.append(
            {
                "title": title,
                "date_range": date_range,
                "company": company,
                "bullets": bullets,
            }
        )

    return entries


def parse_bullets(lines: list[str]) -> list[str]:
    items: list[str] = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        items.append(stripped[2:].strip() if stripped.startswith("* ") else stripped)
    return items


def wrap(text: str, width: int) -> list[str]:
    return textwrap.wrap(text, width=width, break_long_words=False, break_on_hyphens=False) or [""]


def draw_wrapped(
    fig: plt.Figure,
    y: float,
    text: str,
    *,
    x: float,
    width: int,
    fontsize: float,
    weight: str = "normal",
    color: str = "#111111",
    spacing: float = 1.25,
) -> float:
    for line in wrap(text, width):
        fig.text(
            x,
            y,
            line,
            fontsize=fontsize,
            fontweight=weight,
            family="DejaVu Sans",
            ha="left",
            va="top",
            color=color,
        )
        y -= (fontsize * spacing) / PAGE_HEIGHT_POINTS
    return y


def build_pdf() -> None:
    lines = SOURCE.read_text(encoding="utf-8-sig").splitlines()
    name, contact, sections = split_sections(lines)
    experience = parse_experience(sections.get("PROFESSIONAL EXPERIENCE", []))
    education = parse_bullets(sections.get("EDUCATION", []))
    skills = " ".join(line.strip() for line in sections.get("SKILLS", []) if line.strip())

    fig = plt.figure(figsize=(8.5, 11))
    fig.patch.set_facecolor("white")
    plt.axis("off")

    y = 0.965
    left = 0.07
    right = 0.93

    fig.text(left, y, name, fontsize=17, fontweight="bold", family="DejaVu Sans", ha="left", va="top")
    y -= 0.035
    fig.text(left, y, contact, fontsize=9.5, family="DejaVu Sans", ha="left", va="top", color="#333333")
    y -= 0.03

    fig.text(left, y, "PROFESSIONAL EXPERIENCE", fontsize=10.5, fontweight="bold", family="DejaVu Sans", ha="left", va="top")
    y -= 0.018

    for entry in experience:
        fig.text(left, y, str(entry["title"]), fontsize=10, fontweight="bold", family="DejaVu Sans", ha="left", va="top")
        fig.text(right, y, str(entry["date_range"]), fontsize=9.2, family="DejaVu Sans", ha="right", va="top", color="#333333")
        y -= 0.017
        fig.text(left, y, str(entry["company"]), fontsize=9.2, family="DejaVu Sans", ha="left", va="top", color="#333333")
        y -= 0.018

        for bullet in entry["bullets"]:
            y = draw_wrapped(fig, y, f"- {bullet}", x=left + 0.012, width=103, fontsize=8.6, spacing=1.18)
        y -= 0.01

    fig.text(left, y, "EDUCATION", fontsize=10.5, fontweight="bold", family="DejaVu Sans", ha="left", va="top")
    y -= 0.018
    for item in education:
        y = draw_wrapped(fig, y, f"- {item}", x=left + 0.012, width=103, fontsize=8.8, spacing=1.18)
    y -= 0.012

    fig.text(left, y, "SKILLS", fontsize=10.5, fontweight="bold", family="DejaVu Sans", ha="left", va="top")
    y -= 0.018
    y = draw_wrapped(fig, y, skills, x=left, width=106, fontsize=8.8, spacing=1.2)

    fig.savefig(OUTPUT, format="pdf", bbox_inches=None)
    plt.close(fig)


if __name__ == "__main__":
    build_pdf()
