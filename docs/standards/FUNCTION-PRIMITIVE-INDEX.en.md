# Function and Primitive Split Index

> This English page is a summary. The Chinese page
> ([FUNCTION-PRIMITIVE-INDEX.md](./FUNCTION-PRIMITIVE-INDEX.md)) carries the
> full tables: covered directories, directories intentionally left as gaps,
> structured-entry review entry points, and the GB/T 17964 / GM/T 0091 page
> anchors.

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

FIPS 186-5 RSA references: [signature-key generation](./fips186-5-ecdsa/05-RSA-Key-Generation.en.md) and [Miller–Rabin primality testing](./fips186-5-ecdsa/06-RSA-Primality-Testing.en.md). Both document the standard boundary and the current educational implementation; neither is a conformance claim.

This is not a claim that every standard clause has been transcribed verbatim.
All 40 directories and 229 structured entries now have a unified audit
inventory. There are 222 normative-source anchors (187 source-line and 35 exact
PDF-page anchors), plus 2 RFC full-text evidence items, 2 bibliography-only
links, and 2 entries without an original source. Bibliography links do not
count as normative-source anchors. See
[SOURCE-SPLIT-INVENTORY.en.md](./SOURCE-SPLIT-INVENTORY.en.md) and
[SOURCE-SPLIT-COVERAGE.en.md](./SOURCE-SPLIT-COVERAGE.en.md).
