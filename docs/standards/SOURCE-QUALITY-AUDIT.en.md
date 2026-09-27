# Standard Source Quality Audit

Checked: 2026-09-26

The source layer is preserved from local PDFs with `pdftotext -layout` and is
used for search and trace-back. It is not a visual substitute for the PDF.
Font mapping, mathematical glyphs, tables, figures, and scanned pages require
PDF review.

The 25 source-backed standard directories currently contain 221 canonical
entries; 6 additional entries belong to external or historical references,
for 227 canonical entries in total. Only 4 entries currently have structured
English counterparts. The formula checker covers 231 Chinese and English
pages, not 231 distinct standard entries. Of the canonical entries, 123
numbered algorithms preserve complete source algorithm blocks. Ascon
`pC/pS/pL` and GCM `inc32` are separate primitive entries.

All 231 Chinese/English pages have an explicit `Formula or Pseudocode` field;
207 contain a Markdown code block, 2 are RFC `.txt` evidence-layer pages that
link the complete local text, and 22 pages state that there is no independent
formula/pseudocode unit or no single source artifact can currently be verified
(20 canonical entries plus two English counterparts). All 123 numbered
algorithm entries are checked for complete source algorithm blocks. This field
coverage does not mean that every PDF table, figure, or distorted formula has
completed visual verification.

The citation inventory contains 220 normative-source entries: 185 classified
by source-line anchor and 35 by exact physical PDF-page anchor. When both are
present, the inventory classifies the entry by the exact PDF page while the
line link remains visible in its source-location field.

The source-layer grades are A: 8, B: 10, and C: 7. GB/T 32905 (SM3) and
GB/T 32907 (SM4) are grade B, not grade A: their prose remains searchable,
but mathematical glyphs, formula line breaks, or table layout are not reliably
preserved. Their relevant formula, algorithm, and table pages were visually
checked against the local PDFs and transcribed in the structured layer; the PDF
remains the layout authority.

The Rijndael research source also retains unmapped PDF header/footer glyphs;
those characters are not normative text and must be checked against the PDF.

The structured pages split the currently inventoried functions, primitives,
algorithms, formulas, and project mappings. This does not mean that every
source-layer table, figure, or glyph has been visually checked: grade B/C and
scanned sources still require the PDF for normative verification. Structured
pages must preserve complete normative units and must not present a short
excerpt or a project-reconstructed formula as the original text.
