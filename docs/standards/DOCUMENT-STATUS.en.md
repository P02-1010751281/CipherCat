# Standards Documentation Integrity and Gap List

Review date: 2026-09-25

## Conclusion

The repository previously placed several PDF text-layer dumps directly in Markdown, which made headings, tables, formulas, and clause numbers unreliable. The current rule is:

- PDFs are evidence artifacts; `standards-manifest.json` records source, review date, and SHA-256.
- `00-Standard-Source.md` preserves the re-extracted source reference from local PDFs; `README.md`, `01-*.md`, and primitive pages provide structured user references checked against the source, code, and vectors.
- RFC `.txt` files and historical PDF text layers remain raw evidence, not algorithm reference pages.
- A directory, PDF, or successful demo does not imply complete implementation, compliance, or certification.

## Rechecked

| Scope | Current state | Evidence |
|---|---|---|
| Standards directories | 38; each has `README.md` and a manifest entry. The GB/T 32915 directory is currently a status entry only; its source and split remain pending. | `npm run standards:check` |
| Local standards PDFs | 37 total (35 in algorithm/reference directories + 2 under `standards/papers/`); directory PDFs are in the manifest and research PDFs record SHA-256 in their README | `standards-manifest.json`, `papers/README.md` |
| Separately stored research PDFs | 3 in `docs/research/sources/` and 19 in `paper/references/`. Across those locations and `docs/standards/`, there are 59 files, 6 duplicate groups, and 53 unique contents by SHA-256. | `docs/research/sources/README.md`, `paper/references/README.md` |
| PDFs with a text layer | 35; quality grading covers the 25 standard directories with normative source extracts: 10 grade A, 8 grade B, and 7 grade C; grade-C Chinese standards must not treat the extract as readable body text | `SOURCE-QUALITY-AUDIT.md`, `pdftotext`, rendered-page review |
| Scanned PDFs | 2: GB/T 36624-2018 and the 1978 McEliece paper; neither has a reliable text layer | `gbt36624-aead/README.md`, `mceliece-goppa/00-Research-Source.md` |
| Source and research evidence | 25 standard directories have `00-Standard-Source.md`; one Classic McEliece reference directory has `00-Research-Source.md`, with research papers indexed separately. Research indexes do not count as normative-source extracts; no text is fabricated for GB/T 36624 or GB/T 15852 | `SOURCE-LAYERS.en.md`, each directory's `00-*.md` |
| Structured primary pages | AES, SM3, SM2, ZUC, SM4, SHA-2, ECDSA, HMAC, PBKDF2, CMAC, CCM, GCM, XTS, DRBG, Ascon, GM/T 0005, GM/T 0103, and the ML-DSA NTT page were rewritten | Each directory's `01-*.md` |
| Structured-entry fields | The inventory counts 227 canonical entries (221 across the 25 normative-source directories, plus 2 RFC `.txt` evidence items, 2 bibliography-only links, and 2 entries without original sources); 4 entries also have structured English counterparts. The formula checker covers all 231 Chinese/English pages; all have a `Formula or Pseudocode` field and 207 contain a Markdown code block. Twenty canonical entries explicitly state that they have no independent formula/pseudocode unit or that no single source artifact can currently be verified; the page-level count is 22, including two English counterparts. The 123 numbered algorithm pages preserve complete algorithm blocks and point to source lines. | `SOURCE-QUALITY-AUDIT.en.md`, `SOURCE-SPLIT-COVERAGE.en.md`, `STRUCTURED-ENTRY-SCHEMA.en.md` |
| Function/primitive-family split | All 38 directories and 227 structured entries have a unified inventory; 123 numbered algorithms passed page-by-page checks. GB/T 32915 has no local source split yet. There are 220 normative-source anchors (185 line anchors and 35 exact physical PDF-page anchors). Entries containing both are classified by PDF page, while both links remain in the citation. There are also 2 RFC full-text evidence items, 2 bibliography-only links, 1 official-record-only entry, 1 scanned-PDF extraction gap, and 1 non-normative architecture note; no entry lacks a source/provenance link. | `FUNCTION-PRIMITIVE-INDEX.en.md`, `SOURCE-SPLIT-INVENTORY.en.md`, `SOURCE-SPLIT-COVERAGE.en.md` |
| Documentation navigation | Root docs, research reports, standards indexes, nested guides, and paper indexes are included in Docs | `src/views/DocsView.vue` |

## Remaining gaps

- GB/T 36624-2018 is current in the official registry (published 2018-09-17, effective 2019-04-01), but needs a searchable source or manual page-by-page transcription.
- GB/T 15852 has verified `.1-2020`, current `.2-2024`, and an official notification record for `.3-2019`; local source artifacts, a separate `.1/.2/.3` clause matrix, and `.3` status verification remain open.
- Eight RFC directories contain RFC Editor `.txt` sources rather than PDFs; they remain traceable through the RFC source and errata pages and are not counted as missing PDF source artifacts.
- ZUC 128-EIA3 now has a MAC block, two GB/T 33133.3-2021 Appendix B vectors (1-bit and 577-bit messages), and parameter-rejection regressions; broader interoperability, certification, and side-channel guarantees remain out of scope. The full DRBG lifecycle and broad negative/interop vector sets remain incomplete. Ascon Hash/XOF/CXOF and the AEAD tag-rejection path are implemented and covered by the extended dual-language demo; official Hash/XOF KAT coverage and streaming APIs are still open.
- Platform-side randomness assessment runs through the `metacrypt_server` Python sample-generation sandbox and Go detection pipeline. CipherCat is the user code-trial and report-display frontend; this assessment is not certification or proof of entropy-source quality.

## User-document illustration status

Screenshots explain real interface operations only; they do not replace normative source text, test output, or backend assessment evidence. The registered real-page screenshots now cover:

| Document | Current illustrations | Scope |
|---|---:|---|
| [USER-GUIDE.en.md](../guides/USER-GUIDE.en.md) | 2 | Workspace import and generated code |
| [BLOCKLY-GUIDE.en.md](../guides/BLOCKLY-GUIDE.en.md) | 3 | Editor layout, function definition, and code panel |
| [TUTORIALS.en.md](../guides/TUTORIALS.en.md) | 9 image references to 7 distinct images | Project list, import, code generation, and function Demo |
| [SETUP.en.md](../guides/SETUP.en.md) | 2 | Documentation groups and development-mode acceptance |
| [DEMO.en.md](../guides/DEMO.en.md) | 3 | Import entry, workspace, and generated code |

All of these screenshots have non-empty alt text, captions, and asset-index entries. The backend assessment page intentionally has no screenshot yet: add one only after capturing an authenticated `metacrypt_server` task-detail page and binding it to its parameters, versions, and raw results. Do not use a login page, 401 page, or fabricated report.

## Acceptance gate

```bash
npm run docs:check-links
npm run standards:check
npm run type-check
npm run test:unit
npm run build
```

“Covered” means that a traceable reference page, implementation mapping, or test asset exists. It is not a claim of CAVP, ACVTS, CMVP, formal-verification, or side-channel certification.
