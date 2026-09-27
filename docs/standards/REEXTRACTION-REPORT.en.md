# Standards Re-extraction and Verification Report

Initial review: 2026-09-23
Inventory rechecked: 2026-09-26

## Goal

Check whether `docs/standards/` still presents damaged PDF text layers as user-facing references, re-extract the local PDFs, and verify titles, editions, tables of contents, key parameters, algorithm flows, and declared project mappings.

## Method

The local tools below were used without modifying the PDF originals:

```bash
pdfinfo <source.pdf>
pdftotext -raw <source.pdf> <raw.txt>
pdftotext -layout <source.pdf> <layout.txt>
pdftoppm -f <page> -l <page> -png -r 150 <source.pdf> <page.png>
```

`-raw` searches clauses and terms, `-layout` exposes table/column-order problems, and rendered pages distinguish PDF text-layer errors from problems in the source page. Original SHA-256 values are maintained in `standards-manifest.json`.

## Results

| Item | Count/status |
|---|---|
| Standards directories | 38; all have README and manifest entries. GB/T 32915 is currently a status entry only; obtaining and splitting its source remains pending. |
| Local PDFs | 37 (35 algorithm/reference directories + 2 under `standards/papers/`); directory PDFs are checked by the manifest and research material by its README |
| PDFs with a text layer | 35; quality grading covers the 25 normative-source directories (10 grade A, 8 grade B, 7 grade C); 7 Chinese standards still have severe font-mapping distortion, so a text layer does not necessarily mean readable source text |
| Scanned PDFs | 2: GB/T 36624-2018 and the 1978 McEliece paper have no reliable text layer |
| Broken Markdown links | 0 in the current `npm run docs:check-links` result |
| Source and research evidence | 25 standards have `00-Standard-Source.md` extracts; McEliece and the papers directory each have a `00-Research-Source.md` research index, not a full normative-standard extract. RFC `.txt` files and two historical `part1.txt` files remain raw evidence |
| Text-layer quality | Among the 25 source-backed standard directories: 10 grade A, 8 grade B, 7 grade C; GB/T 36624 is a grade-D gap | [SOURCE-QUALITY-AUDIT.en.md](./SOURCE-QUALITY-AUDIT.en.md) |
| Structured-entry fields | The canonical inventory counts 227 entries; 4 also have structured English counterparts. The formula checker covers all 231 Chinese/English pages, all with a `Formula or Pseudocode` field and 207 with a Markdown code block; 22 explicitly state that there is no independent formula/pseudocode unit or currently verifiable source artifact. The canonical entries include 220 normative-source anchors (185 line and 35 exact PDF-page anchors), 2 RFC full-text evidence items, and 2 bibliography-only links; one official-record-only entry, one scanned-source gap, and one non-normative project note are separately classified. Bibliography links do not count as normative-source anchors. | [SOURCE-SPLIT-COVERAGE.en.md](./SOURCE-SPLIT-COVERAGE.en.md), [STRUCTURED-ENTRY-SCHEMA.en.md](./STRUCTURED-ENTRY-SCHEMA.en.md) |

## Fixed anomaly classes

- Removed or rewrote reversed labels, pseudo-tables, garbled tokens, truncated headings, and broken pseudocode from user-facing structured reference pages; `00-Standard-Source.md` keeps the extraction as-is and is used according to its quality grade.
- Replaced the primary Markdown pages for AES, SM3, SM2, ZUC, SM4, SHA-2, ECDSA, HMAC, PBKDF2, CMAC, CCM, GCM, XTS, DRBG, Ascon, GM/T 0005, GM/T 0103, and ML-DSA Algorithm 48 with structured references, while restoring `00-*.md` source-extraction layers for the corresponding PDFs.
- Separated source artifacts, historical drafts, project subsets, demo vectors, and certification boundaries so that “has a demo” cannot be read as “full standards coverage.”
- Corrected the GM/T 0005 test list, the project’s SP 800-90A implementation label, and the SP 800-232 final-vs-IPD status.
- Docs navigation now includes root docs, research reports, standards indexes, nested guides, and paper indexes instead of silently dropping fixed-depth paths.
- Added [FUNCTION-PRIMITIVE-INDEX.en.md](./FUNCTION-PRIMITIVE-INDEX.en.md) and split thin overview pages into independently reviewable function/primitive-family entries; internal stages without a standalone block are explicitly marked as implemented inside a high-level block.

## Sample checks

- FIPS 197: rendered pages confirmed that the AES-128 vector and key-expansion table are readable in the source PDF; the reference keeps `001122…ff → 69c4e0…c55a`.
- GB/T 32905: checked the `abc` vector and the SM3 `W/W'`, `P0/P1`, and `FF/GG` structure.
- NIST SP 800-38D: checked the relationship between `H`, `J0`, GHASH, GCTR, and the tag.
- NIST SP 800-232: uses the 2025-08-13 Final PDF. Ascon-Hash256, Ascon-XOF128, and Ascon-CXOF128 are implemented as one-shot calls; official KAT and streaming-API gaps remain listed in the implementation boundary. The old IPD is no longer treated as current.
- Font-mapping review: GB/T 17964, GM/T 0005, and GB/T 33133 have visually readable PDF pages but distorted Chinese mappings in `pdftotext`/`pdftohtml`; alternative extractors do not preserve both formulas and table layout, so the raw extract is retained and structured pages provide the readable reference.

## Remaining manual/external work

- GB/T 36624's official record, publication and implementation dates, and 2025 review conclusion are verified. The official portal says copyright prevents it from providing text-reading service. The local 28-page scan has no text layer and its provenance is unverified; obtain a clear copy that may lawfully be used and verify it page by page. Existing GCM/CCM/Ascon pages cannot substitute for it.
- GB/T 15852's `.1-2020`, current `.2-2024`, and `.3-2019` records are identified, but local traceable artifacts, a separate `.1/.2/.3` clause matrix, and `.3` status verification remain open.
- Clause-by-clause compliance, independent differential testing, negative/rejection paths, entropy assessment, and CMVP/CAVP evidence are outside this Markdown cleanup.
- Full page-by-page OCR or manual transcription for grade-B/C sources is still open; the PDF visual source, structured entries, and source-line locations currently form the verifiable reference together.

See [DOCUMENT-STATUS.en.md](./DOCUMENT-STATUS.en.md) for the complete gap and implementation-boundary list.
