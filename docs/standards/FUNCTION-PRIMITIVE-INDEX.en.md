# Function and Primitive Split Index

The standards directory is organized as a complete source layer followed by a
structured reference layer:

The workflow starts by extracting and locating source text from the standard
PDF or RFC, then splits it into independently reviewable functions, primitive
families, or algorithm stages. Each structured page is finally mapped to the
implementation, Blockly blocks, demos, and verification boundaries.

## Rules

- One numbered algorithm per page.
- Independently useful primitives get separate pages.
- Internal formulas stay with their owning function.
- A grouped page must explicitly identify the parent block that implements its internal steps.
- Damaged or unavailable source text is a gap, not an invitation to infer from code.
- Formula, pseudocode, algorithm, and table sections are complete normative-unit extracts, not short excerpts.

## Current inventory

The seven source directories with independently numbered algorithms have
passed the mechanical split check: 123/123 algorithm entries. Ascon `pC/pS/pL`
and GCM `inc32` are also separate primitive pages.

This is not a claim that every standard clause has been transcribed verbatim.
All 38 directories and 227 structured entries now have a unified audit
inventory. There are 220 normative-source anchors (185 source-line and 35 exact
PDF-page anchors), plus 2 RFC full-text evidence items, 2 bibliography-only
links, and 2 entries without an original source. Bibliography links do not
count as normative-source anchors. See
[SOURCE-SPLIT-INVENTORY.en.md](./SOURCE-SPLIT-INVENTORY.en.md) and
[SOURCE-SPLIT-COVERAGE.en.md](./SOURCE-SPLIT-COVERAGE.en.md).
