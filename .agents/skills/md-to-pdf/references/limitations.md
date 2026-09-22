# Conversion Notes

The bundled script supports several backends.

## Preferred Backends

- `pandoc`: best general-purpose option when installed
- `mdpdf`: good markdown-aware PDF converter when installed
- `wkhtmltopdf`: good fallback when installed, using generated HTML

## Built-in Fallback

When no markdown-aware converter is installed, the script:

1. renders markdown into readable plain text
2. sends that plain text through macOS `cupsfilter`
3. writes a PDF

This fallback is reliable for:
- headings
- lists
- links
- block quotes
- code blocks
- simple tables rendered as plain text rows

This fallback is not pixel-perfect. It does not preserve:
- rich markdown styling
- syntax highlighting
- complex tables
- embedded HTML layout
- images

Use the fallback when the main goal is a readable PDF, not a visually faithful typeset document.
