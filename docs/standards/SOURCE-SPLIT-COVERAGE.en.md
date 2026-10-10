# Source-to-Entry Split Coverage Audit

Checked: 2026-09-30

The 25 local-PDF standard directories preserve their source evidence,
including multi-volume source sections. All 38 directories and 229 structured
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

## Additional named primitives

| Standard | Primitive/stage | Structured reference | Project mapping |
|---|---|---|---|
| SP 800-232 | `pC`, `pS`, `pL` | [`12-pC`](./sp800-232-ascon/12-pC.md), [`13-pS`](./sp800-232-ascon/13-pS.md), [`14-pL`](./sp800-232-ascon/14-pL.md) | Internal calls in the Ascon permutation |
| SP 800-38D | `inc32` | [`10-inc32`](./sp800-38d-gcm/10-inc32.md) | Internal GCM counter operation |
| FIPS 197 | SubBytes, ShiftRows, MixColumns, AddRoundKey | [AES transformation index](./fips197-AES/README.md) | Components of the AES round function |
| FIPS 205 | ADRS member functions, WOTS+/FORS tree components | [SLH-DSA implementation overview](./fips205-SLH-DSA/README.md) | Structural blocks or top-level internals; see Algorithms 1–25 |

Additional field acceptance: the inventory counts 229 structured entries:
222 with normative-source anchors and 7 with other evidence statuses (2 RFC
text items, 2 bibliography-only links, 1 official-record-only item, 1 scanned-
source gap, and 1 non-normative project note). The backend-evaluation note is
located in a standard-source directory but does not correspond to a normative
clause, so it is not counted among the 222 source anchors. Six entries also
have structured English counterparts. The formula checker covers all
235 Chinese/English pages; all have a `Formula or Pseudocode` field and 211
contain a Markdown code block. Twenty canonical entries explicitly identify
themselves as composite/boundary/gap pages or state that no single source
artifact can currently be verified; the page-level checker counts 22: 20 canonical
entries plus two English counterparts. The 222 normative-source anchors comprise
187 line and 35 exact physical PDF-page anchors.
Bibliography links do not count as normative-source anchors. Entry-by-entry
evidence status is recorded in
[SOURCE-SPLIT-INVENTORY.en.md](./SOURCE-SPLIT-INVENTORY.en.md).
This field coverage does not mean that every PDF table, figure, or distorted
formula has completed visual verification.

## Split acceptance

Each entry must link to the original and a traceable source location (line or
physical PDF page; preserve both links when available), preserve the complete
formula/pseudocode/algorithm/table unit, record input/output and project
mapping, and state verification and gaps. A short quote is allowed for a
normal explanatory citation, but never as a substitute for a complete formula
or pseudocode extract.

The acceptance sequence is:

```text
source artifact exists and is traceable
  → algorithm/primitive coverage has no identified gaps
  → entry has source location, complete normative unit, inputs/outputs,
    project mapping, and verification limits
  → visually inspect PDF formulas, tables, and page layout
  → npm run standards:check
  → npm run standards:split-check
  → npm run standards:formula-check
  → npm run docs:check-links
```

`standards:split-check` checks structural coverage and numbered headings; it
does not replace cryptographic semantic review, CAVP/KAT, platform certification,
or security assessment.

Four directories still have no `00-Standard-Source.md`: China’s public PQC
information tracker, GB/T 15852, GB/T 36624, and Classic McEliece. The tracker
has no single algorithm standard as its source; local full texts remain missing
for GB/T 15852 and GB/T 36624. Classic McEliece has a `00-Research-Source.md`
with a NIST status report and paper references, but the ISO amendment is
paywalled/copyright-protected and the scanned McEliece paper has no extractable
text layer. Neither is falsely transcribed, and project code is not used to
reconstruct normative text. Eight RFC directories use RFC Editor `.txt`
sources, so they are not counted as missing PDF source artifacts.

The inventory classifies 187 normative-source entries by source-line anchor
and 35 by exact physical PDF-page anchor; entries with both keep both links
but are classified by PDF page. This classification does not imply that every
linked page has been visually verified. Six GB/T 17964/GM/T 0091 entries were
checked page by page against rendered PDFs because their grade-C text-layer
font mappings prevent reliable text-line anchors; no section-only locations
remain.

The audit also records visual samples for AES, RSA/ECDSA, SM3, SM4, ZUC,
GB/T 17964, and GM/T 0005. The per-document pages and limits are listed in the
[source-quality audit](./SOURCE-QUALITY-AUDIT.en.md); these samples do not
claim full-PDF visual review.

Run:

```text
npm run standards:check
npm run standards:split-check
npm run standards:formula-check
npm run docs:check-links
```
