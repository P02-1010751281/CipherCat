# Standard Source Quality Audit

Checked: 2026-09-30

The source layer is preserved from local PDFs with `pdftotext -layout` and is
used for search and trace-back. It is not a visual substitute for the PDF.
Font mapping, mathematical glyphs, tables, figures, and scanned pages require
PDF review.

The inventory contains 229 structured entries: 222 have normative-source
anchors and 7 have other evidence statuses (2 RFC text items, 2 bibliography
links, 1 official-record-only item, 1 scanned-source gap, and 1 non-normative
project note). Only 6 entries currently have structured
English counterparts. The formula checker covers 235 Chinese and English
pages, not 235 distinct standard entries. Of the canonical entries, 123
numbered algorithms preserve complete source algorithm blocks. Ascon
`pC/pS/pL` and GCM `inc32` are separate primitive entries.

All 235 Chinese/English pages have an explicit `Formula or Pseudocode` field;
211 contain a Markdown code block, 2 are RFC `.txt` evidence-layer pages that
link the complete local text, and 22 pages state that there is no independent
formula/pseudocode unit or no single source artifact can currently be verified
(20 canonical entries plus two English counterparts). All 123 numbered
algorithm entries are checked for complete source algorithm blocks. This field
coverage does not mean that every PDF table, figure, or distorted formula has
completed visual verification.

The citation inventory contains 222 normative-source entries: 187 classified
by source-line anchor and 35 by exact physical PDF-page anchor. When both are
present, the inventory classifies the entry by the exact PDF page while the
line link remains visible in its source-location field.

The source-layer grades are A: 8, B: 10, and C: 7. GB/T 32905 (SM3) and
GB/T 32907 (SM4) are grade B, not grade A: their prose remains searchable,
but mathematical glyphs, formula line breaks, or table layout are not reliably
preserved. Their relevant formula, algorithm, and table pages were visually
checked against the local PDFs and transcribed in the structured layer; the PDF
remains the layout authority.

## Per-standard quality findings

| Grade | Standard | Extraction signal | Use/handling |
|---|---|---|---|
| A | [FIPS 198-1 / HMAC](./fips198-1-hmac/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [FIPS 203 / ML-KEM](./fips203-ML-KEM/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [FIPS 204 / ML-DSA](./fips204-ML-DSA/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [NIST SP 800-232 / Ascon](./sp800-232-ascon/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [NIST SP 800-38A](./sp800-38a-modes/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [NIST SP 800-38C / CCM](./sp800-38c-ccm/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [NIST SP 800-38D / GCM](./sp800-38d-gcm/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| A | [NIST SP 800-38E / XTS](./sp800-38e-xts/00-Standard-Source.md) | Searchable text; no notable font-mapping issue identified | Use for search and initial locating; verify formulas and tables in the PDF |
| B | [FIPS 180-4 / SHA-2](./fips180-4-SHA2/00-Standard-Source.md) | 466 private-use glyphs | Use the PDF and structured SHA-2 entries for formulas |
| B | [FIPS 186-5 / DSS](./fips186-5-ecdsa/00-Standard-Source.md) | 66 private-use glyphs, no replacement characters; ECDSA sampled; RSA visual review limited to physical pages 27, 44–51, 65–68, and 76 | RSA key generation and primality-testing entries are structured separately; this is not a page-by-page review of the standard |
| B | [FIPS 197 / AES](./fips197-AES/00-Standard-Source.md) | Five extraction replacement characters were visually checked and corrected | Use the PDF and structured entries for AES formulas, tables, and vectors |
| B | [FIPS 202 / SHA-3](./fips202-SHA3/00-Standard-Source.md) | 33 private-use glyphs | Use the PDF and structured entries for Keccak formulas and bit ordering |
| B | [FIPS 205 / SLH-DSA](./fips205-SLH-DSA/00-Standard-Source.md) | No replacement characters; Figure 12 text layer repaired against the rendered page | Use the PDF for parameter tables and algorithm pseudocode |
| B | [GB/T 32905 / SM3](./gbt32905-SM3/00-Standard-Source.md) | Searchable prose; private-use glyphs for bitwise operators and wrapped formulas | Formulas were checked against physical PDF pages 5–7 and transcribed; the PDF remains the layout authority |
| B | [GB/T 32907 / SM4](./gbt32907-SM4/00-Standard-Source.md) | Searchable prose; formula symbols and S-box table wrap across lines | Sections 6–7 were checked against physical PDF pages 5–7; use the PDF for formulas, S-box, and constants |
| B | [NIST SP 800-132 / PBKDF2](./sp800-132-pbkdf2/00-Standard-Source.md) | 18 private-use glyphs | Use the PDF and structured entry for formulas |
| B | [NIST SP 800-38B / CMAC](./sp800-38b-cmac/00-Standard-Source.md) | 10 private-use glyphs | Use the PDF and structured entry for subkey formulas |
| B | [NIST SP 800-90A / DRBG](./sp800-90a-drbg/00-Standard-Source.md) | 28 private-use glyphs | Use the PDF and structured entries for DRBG state and pseudocode |
| C | [GB/T 17964](./gbt17964-modes/00-Standard-Source.md) | Severe Chinese-font mapping damage; 101 private-use glyphs | Use the PDF and [structured modes entry](./gbt17964-modes/01-Modes.md) |
| C | [GB/T 32918 / SM2](./gbt32918-SM2/00-Standard-Source.md) | Chinese-font mapping damage; 8 private-use glyphs | Use the PDF and structured SM2 entries |
| C | [GB/T 33133 / ZUC](./gbt33133-ZUC/00-Standard-Source.md) | Chinese-font mapping damage; 41 private-use glyphs | Use the PDF, [ZUC reference](./gbt33133-ZUC/01-ZUC.md), and primitive entries |
| C | [GB/T 38635 / SM9](./gbt38635-SM9/00-Standard-Source.md) | Severe Chinese-font mapping damage; 280 private-use glyphs | Use the PDF and structured SM9 entries |
| C | [GM/T 0005](./gmt0005-randomness/00-Standard-Source.md) | Severe Chinese-font mapping damage; 52 private-use glyphs | Use the PDF and [test entries 02–07](./gmt0005-randomness/02-Test-Suites.md) |
| C | [GM/T 0091](./gmt0091-kdf/00-Standard-Source.md) | Chinese-font mapping damage; 167 private-use glyphs | Use the PDF and [KDF entry](./gmt0091-kdf/02-KDF.md) |
| C | [GM/T 0103](./gmt0103-rng/00-Standard-Source.md) | Chinese-font mapping damage; 7 private-use glyphs | Use the PDF and structured GM/T 0103 entries |

The private-use-character counts are screening signals, not exact counts of
damaged characters. A private-use code point may represent a valid embedded
font glyph, but it is not guaranteed to render consistently in Markdown.

## Entries without a unified PDF extraction page

Six entries in the 229-entry inventory do not use a uniform
`00-Standard-Source.md` PDF-extraction page; they are not six additional gaps.
The [RFC 5903](./rfc5903-ecdh/rfc5903.txt) and
[RFC 8017](./rfc8017-pkcs1/rfc8017.txt) entries link to complete local RFC
Editor `.txt` sources. Two Classic McEliece entries cite research bibliographies; the full
ISO amendment is not stored locally. The GB/T 15852 entry has an official
record but no local full text. The GB/T 36624 entry links a local scanned PDF
with no reliable text layer. Their use is limited to the evidence available;
no normative text or clause locator is fabricated.

## Visual samples

- GB/T 17964-2021: physical PDF page 10; CBC formula, flowchart, and notes.
- GM/T 0005-2021: physical page 10; matrix-rank and binary-derivation formulas.
- GB/T 33133.1-2016: physical page 10; ZUC S-box table.
- FIPS 197: sampled AES vector and key-expansion table pages.
- FIPS 186-5: sampled ECDSA algorithm-description pages; the RSA visual review
  is limited to physical pages 27, 44–51, 65–68, and 76 (see the [supplemental
  report](./REEXTRACTION-REPORT.en.md)).
- GB/T 32905-2016: physical pages 5–7; SM3 constants, functions, and compression
  pseudocode.
- GB/T 32907-2016: physical pages 5–7; SM4 round function, S-box, and parameters.

These are samples, not a full visual audit of all source PDFs.

The Rijndael research source also retains unmapped PDF header/footer glyphs;
those characters are not normative text and must be checked against the PDF.

The structured pages split the currently inventoried functions, primitives,
algorithms, formulas, and project mappings. This does not mean that every
source-layer table, figure, or glyph has been visually checked: grade B/C and
scanned sources still require the PDF for normative verification. Structured
pages must preserve complete normative units and must not present a short
excerpt or a project-reconstructed formula as the original text.

### FIPS 186-5 visual-review scope (2026-09-30)

ECDSA was visually sampled. The RSA review is limited to physical PDF pages
27, 44–51, 65–68, and 76, as detailed in the [supplemental re-extraction
report](./REEXTRACTION-REPORT.en.md). These checks do not constitute a
page-by-page review of FIPS 186-5.
