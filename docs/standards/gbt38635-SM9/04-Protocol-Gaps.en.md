# SM9 — Unimplemented Protocols and Verification Gaps

## Entry Metadata

| Field | Value |
|---|---|
| Type | Primitive / function; implementation-gap record |
| Standard position | SM9 — unimplemented protocols and verification gaps |
| Source evidence | [Part 2 source extraction](./00-Standard-Source.md); PDFs are listed on the source page |
| Source location | Part 2, §§7–9, extraction lines 2091–2290; this page records project boundaries, not a complete transcription |
| Project status | Partial implementation; see the open items below |

## Source location and citation

This page records the project gaps associated with the SM9 source sections; it is not a verbatim quotation. See the [source extraction](./00-Standard-Source.md) and [Part 1](./GBT+38635.1-2020.pdf) / [Part 2](./GBT+38635.2-2020.pdf) PDFs. The original PDF references are not represented as if they were missing extractions.

## Original excerpt

This is a project-boundary page and contains no standalone normative excerpt. Consult the source extraction and PDFs for the complete text.

## Formula or Pseudocode

No independent formula or pseudocode is included. The page tracks unimplemented protocols and verification gaps and does not present a project summary as a standards formula.

## Open gaps

- GB/T 38635 consists of Parts 1 and 2. The project does not implement Part 2, Chapter 7 (key exchange), Chapter 8 (key encapsulation), or Chapter 9 (public-key encryption).
- Part 2, Chapter 5 (parameters and auxiliary functions) has a [structured parameters and H1/H2 entry](./02-H1-H2-and-Parameters.en.md); its parameter, encoding, and table coverage still requires item-by-item comparison with Part 1, Annex A, and the original PDFs.
- `sm9_verify` has the Annex A vector regression and JavaScript/Python end-to-end negative cases for identity/message/hash mismatch, H/S encoding boundaries, and signature-point curve/subgroup checks. See [03-Signature](./03-Signature.en.md). This is not the complete official test suite.
- Canonical coordinates, the G2 curve equation, and subgroup membership for `Ppub-s` are now checked by both signing and verification. Negative tests cover non-canonical, off-curve, and on-curve but non-order-`N` public keys. Callers must still ensure that `DS` and `Ppub-s` belong to the same system parameters and key-generation process; point validation does not establish that relationship. Pairing-failure injection and the complete official G2 negative-test set remain open.

The current `sm9_*` path covers only the signature teaching flow; see the [implementation overview](./README.en.md).
