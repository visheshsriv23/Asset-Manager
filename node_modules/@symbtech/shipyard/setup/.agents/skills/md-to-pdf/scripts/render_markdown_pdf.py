#!/opt/homebrew/bin/python3
from __future__ import annotations

import argparse
import html
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Convert markdown to PDF using available local tools."
    )
    parser.add_argument("input", help="Path to the source markdown file")
    parser.add_argument("output", nargs="?", help="Optional output PDF path")
    return parser.parse_args()


def default_output_path(input_path: Path) -> Path:
    return input_path.with_suffix(".pdf")


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True)


def try_pandoc(input_path: Path, output_path: Path) -> bool:
    pandoc = shutil.which("pandoc")
    if not pandoc:
      return False
    result = run([pandoc, str(input_path), "-o", str(output_path)])
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "pandoc failed")
    print("backend: pandoc")
    return True


def try_mdpdf(input_path: Path, output_path: Path) -> bool:
    mdpdf = shutil.which("mdpdf")
    if not mdpdf:
        return False
    result = run([mdpdf, str(input_path), "-o", str(output_path)])
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "mdpdf failed")
    print("backend: mdpdf")
    return True


def markdown_to_html(markdown_text: str) -> str:
    lines = markdown_text.splitlines()
    out: list[str] = []
    in_code = False
    in_ul = False
    in_ol = False
    in_blockquote = False

    def close_lists() -> None:
        nonlocal in_ul, in_ol
        if in_ul:
            out.append("</ul>")
            in_ul = False
        if in_ol:
            out.append("</ol>")
            in_ol = False

    def close_blockquote() -> None:
        nonlocal in_blockquote
        if in_blockquote:
            out.append("</blockquote>")
            in_blockquote = False

    def inline_format(text: str) -> str:
        escaped = html.escape(text)
        escaped = re.sub(
            r"\[([^\]]+)\]\(([^)]+)\)",
            lambda m: f'<a href="{html.escape(m.group(2), quote=True)}">{m.group(1)}</a>',
            escaped,
        )
        escaped = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)
        escaped = re.sub(r"__(.+?)__", r"<strong>\1</strong>", escaped)
        escaped = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", escaped)
        escaped = re.sub(r"(?<!_)_(?!\s)(.+?)(?<!\s)_(?!_)", r"<em>\1</em>", escaped)
        escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
        return escaped

    for raw_line in lines:
        line = raw_line.rstrip("\n")
        stripped = line.strip()

        if stripped.startswith("```"):
            close_lists()
            close_blockquote()
            if in_code:
                out.append("</code></pre>")
                in_code = False
            else:
                out.append("<pre><code>")
                in_code = True
            continue

        if in_code:
            out.append(html.escape(line))
            continue

        if not stripped:
            close_lists()
            close_blockquote()
            continue

        heading = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if heading:
            close_lists()
            close_blockquote()
            level = len(heading.group(1))
            out.append(f"<h{level}>{inline_format(heading.group(2))}</h{level}>")
            continue

        if stripped.startswith(">"):
            close_lists()
            if not in_blockquote:
                out.append("<blockquote>")
                in_blockquote = True
            quote_line = stripped[1:].lstrip()
            out.append(f"<p>{inline_format(quote_line)}</p>")
            continue

        unordered = re.match(r"^[-*]\s+(.*)$", stripped)
        if unordered:
            close_blockquote()
            if not in_ul:
                close_lists()
                out.append("<ul>")
                in_ul = True
            out.append(f"<li>{inline_format(unordered.group(1))}</li>")
            continue

        ordered = re.match(r"^\d+\.\s+(.*)$", stripped)
        if ordered:
            close_blockquote()
            if not in_ol:
                close_lists()
                out.append("<ol>")
                in_ol = True
            out.append(f"<li>{inline_format(ordered.group(1))}</li>")
            continue

        close_lists()
        close_blockquote()
        out.append(f"<p>{inline_format(stripped)}</p>")

    close_lists()
    close_blockquote()
    if in_code:
        out.append("</code></pre>")

    body = "\n".join(out)
    return f"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Markdown PDF</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.5;
      margin: 2rem;
      color: #111;
    }}
    pre {{
      white-space: pre-wrap;
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 6px;
    }}
    code {{
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }}
    blockquote {{
      border-left: 4px solid #ccc;
      margin-left: 0;
      padding-left: 1rem;
      color: #444;
    }}
  </style>
</head>
<body>
{body}
</body>
</html>
"""


def try_wkhtmltopdf(input_path: Path, output_path: Path) -> bool:
    wkhtmltopdf = shutil.which("wkhtmltopdf")
    if not wkhtmltopdf:
        return False
    html_text = markdown_to_html(input_path.read_text(encoding="utf-8"))
    with tempfile.NamedTemporaryFile(
        suffix=".html", delete=False, mode="w", encoding="utf-8"
    ) as handle:
        handle.write(html_text)
        temp_html = Path(handle.name)
    try:
        result = run([wkhtmltopdf, str(temp_html), str(output_path)])
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or "wkhtmltopdf failed")
    finally:
        temp_html.unlink(missing_ok=True)
    print("backend: wkhtmltopdf")
    return True


def render_markdown_to_text(markdown_text: str) -> str:
    lines = markdown_text.splitlines()
    out: list[str] = []
    in_code = False

    for raw_line in lines:
        line = raw_line.rstrip()
        stripped = line.strip()

        if stripped.startswith("```"):
            in_code = not in_code
            if in_code:
                out.append("")
                out.append("CODE BLOCK")
                out.append("-" * 10)
            else:
                out.append("-" * 10)
                out.append("")
            continue

        if in_code:
            out.append(line)
            continue

        if not stripped:
            out.append("")
            continue

        heading = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if heading:
            title = heading.group(2).strip().upper()
            out.append(title)
            out.append("=" * len(title))
            out.append("")
            continue

        blockquote = re.match(r"^>\s?(.*)$", stripped)
        if blockquote:
            out.append(f"> {blockquote.group(1)}")
            continue

        unordered = re.match(r"^[-*]\s+(.*)$", stripped)
        if unordered:
            out.append(f"- {unordered.group(1)}")
            continue

        ordered = re.match(r"^\d+\.\s+(.*)$", stripped)
        if ordered:
            out.append(f"1. {ordered.group(1)}")
            continue

        tableish = "|" in stripped and stripped.count("|") >= 2
        if tableish:
            cells = [cell.strip() for cell in stripped.strip("|").split("|")]
            out.append(" | ".join(cells))
            continue

        text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", stripped)
        text = text.replace("**", "").replace("__", "").replace("`", "")
        text = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"\1", text)
        text = re.sub(r"(?<!_)_(?!\s)(.+?)(?<!\s)_(?!_)", r"\1", text)
        out.append(text)

    return "\n".join(out).strip() + "\n"


def fallback_cupsfilter(input_path: Path, output_path: Path) -> bool:
    cupsfilter = shutil.which("cupsfilter")
    if not cupsfilter:
        raise RuntimeError("cupsfilter is not available for the fallback backend")

    rendered_text = render_markdown_to_text(input_path.read_text(encoding="utf-8"))
    with tempfile.NamedTemporaryFile(
        suffix=".txt", delete=False, mode="w", encoding="utf-8"
    ) as handle:
        handle.write(rendered_text)
        temp_text = Path(handle.name)

    try:
        with output_path.open("wb") as out_file:
            result = subprocess.run(
                [cupsfilter, "-m", "application/pdf", str(temp_text)],
                stdout=out_file,
                stderr=subprocess.PIPE,
                text=True,
            )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip() or "cupsfilter failed")
    finally:
        temp_text.unlink(missing_ok=True)

    print("backend: cupsfilter-fallback")
    return True


def main() -> int:
    args = parse_args()
    input_path = Path(args.input).expanduser().resolve()
    if not input_path.exists():
        print(f"Input file not found: {input_path}", file=sys.stderr)
        return 1
    if input_path.suffix.lower() != ".md":
        print("Input file should be a markdown file ending in .md", file=sys.stderr)
        return 1

    output_path = (
        Path(args.output).expanduser().resolve()
        if args.output
        else default_output_path(input_path)
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)

    for backend in (try_pandoc, try_mdpdf, try_wkhtmltopdf, fallback_cupsfilter):
        try:
            if backend(input_path, output_path):
                print(f"output: {output_path}")
                return 0
        except Exception as exc:
            print(f"{backend.__name__} failed: {exc}", file=sys.stderr)

    print("No conversion backend succeeded.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
