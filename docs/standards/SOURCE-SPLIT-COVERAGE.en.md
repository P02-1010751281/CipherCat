# Source-to-Entry Split Coverage Audit

Checked: 2026-09-26

The 25 local-PDF standard directories preserve their source evidence,
including multi-volume source sections. All 38 directories and 227 structured
entries now have a unified inventory. The GB/T 32915 directory currently has
only a status entry; its source and structured split remain pending. This does not mean every clause has been
transcribed verbatim into its own page.

| Scope | Result |
|---|---:|
| FIPS 197 AES | 5/5 numbered algorithms |
| FIPS 202 SHA-3 | 11/11 numbered algorithms |
| FIPS 203 ML-KEM | 21/21 numbered algorithms |
| FIPS 204 ML-DSA | 49/49 numbered algorithms |
| FIPS 205 SLH-DSA | 25/25 numbered algorithms |
| SP 800-232 Ascon | 7/7 numbered algorithms |
| SP 800-38D GCM | 5/5 numbered algorithms |
| Total | 123/123 numbered algorithms |

The 123/123 figure covers only source headings that are independently numbered
`Algorithm N`; it does not claim that every function, primitive, formula, or
table in all 38 directories has been split.

Additional field acceptance: the inventory counts 227 canonical entries (221
in 25 normative-source directories and 6 external/historical reference pages);
4 also have structured English counterparts. The formula checker covers all
231 Chinese/English pages; all have a `Formula or Pseudocode` field and 207
contain a Markdown code block. Twenty canonical entries explicitly identify
themselves as composite/boundary/gap pages or state that no single source
artifact can currently be verified; the page-level checker counts 22: 20 canonical
entries plus two English counterparts. There are 220 normative-source anchors
(185 line and 35 exact physical PDF-page anchors), plus 2 RFC full-text evidence items, 2
bibliography-only links, and 2 entries without an original source.
The 221 entries in the 25 source directories include one non-normative backend-evaluation note, which is not a source anchor.
Bibliography links do not count as normative-source anchors. Entry-by-entry
evidence status is recorded in
[SOURCE-SPLIT-INVENTORY.en.md](./SOURCE-SPLIT-INVENTORY.en.md).
This field coverage does not mean that every PDF table, figure, or distorted
formula has completed visual verification.

## Split acceptance

Each entry must link to the original and source line, preserve the complete
formula/pseudocode/algorithm/table unit, record input/output and project
mapping, and state verification and gaps. A short quote is allowed for a
normal explanatory citation, but never as a substitute for a complete formula
or pseudocode extract.

Four directories still have no `00-Standard-Source.md`: China’s public PQC
information tracker, GB/T 15852, GB/T 36624, and Classic McEliece. The tracker
has no single algorithm standard as its source; local full texts remain missing
for GB/T 15852 and GB/T 36624. Classic McEliece has a `00-Research-Source.md`
with a NIST status report and paper references, but the ISO amendment is
paywalled/copyright-protected and the scanned McEliece paper has no extractable
text layer. Neither is falsely transcribed, and project code is not used to
reconstruct normative text. Eight RFC directories use RFC Editor `.txt`
sources, so they are not counted as missing PDF source artifacts.

The inventory classifies 185 normative-source entries by source-line anchor
and 35 by exact physical PDF-page anchor; entries with both keep both links
but are classified by PDF page. This classification does not imply that every
linked page has been visually verified. Six GB/T 17964/GM/T 0091 entries were
checked page by page against rendered PDFs because their grade-C text-layer
font mappings prevent reliable text-line anchors; no section-only locations
remain.

Run:

```text
npm run standards:check
npm run standards:split-check
npm run standards:formula-check
npm run docs:check-links
```
