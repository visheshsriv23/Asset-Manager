# Shipyard MD to PDF

Convert markdown into PDF with the bundled script and save the result to a requested path.

## Inputs

Require:
- source markdown file path

Optional:
- output PDF path

If the user does not provide an output path, write the PDF next to the markdown file with the same basename and a `.pdf` extension.

## Workflow

1. Inspect the source markdown file first.
- Confirm the file exists.
- If the file does not exist, stop and tell the user what path was missing.

2. Prefer the bundled conversion script.
- Run `.agents/skills/md-to-pdf/scripts/render_markdown_pdf.py <input.md> [output.pdf]`.
- The script prefers higher-fidelity tools if installed:
  - `pandoc`
  - `mdpdf`
  - `wkhtmltopdf` with a generated temporary HTML file
- If none of those are available, it falls back to a built-in markdown-to-readable-text renderer and uses macOS `cupsfilter` to generate a PDF.

3. Explain output quality honestly.
- If the fallback renderer was used, say the PDF is text-focused and may not preserve full markdown styling.
- If a higher-fidelity external tool was used, mention which backend produced the PDF.

4. Return the output path to the user.

## Notes

- Use the limitations reference in `.agents/skills/md-to-pdf/references/limitations.md` when the user asks about formatting fidelity.
- Do not install dependencies unless the user explicitly asks.
- Do not overwrite unrelated files.
