# Standard Source and Structured Layers

The standards documentation has two separate layers.

| Layer | Files | Purpose |
|---|---|---|
| Complete source/extraction layer | `00-Standard-Source.md` | Preserve the local PDF/RFC extraction, formulas, pseudocode, tables, footnotes, page order, and extraction anomalies for factual trace-back. |
| Structured user/reference layer | `README.md`, entry pages, and primitive pages | Split independently reviewable standard units for users, Blockly mapping, implementation boundaries, and verification status. |

`00-Standard-Source.md` is input to the split, not proof that the split is
complete. PDF text extraction can damage mathematical glyphs, tables, and
font mappings; visual PDF review remains authoritative for those cases.

`00-Research-Source.md` is used for research/reference directories that do not
have one normative source artifact. For example, the Classic McEliece folder
records the NIST report, ISO publication record, source papers, and unavailable
or non-extractable text explicitly; it does not pretend those items are a
complete transcription of the paid ISO amendment.

The [Classic McEliece research-source index](./mceliece-goppa/00-Research-Source.md)
is evidence for public papers and status records, not a normative extract.

The entry-by-entry relationship to the source layer is tracked in
[SOURCE-SPLIT-INVENTORY.en.md](./SOURCE-SPLIT-INVENTORY.en.md). It is a
reproducible evidence index checked by `npm run standards:inventory`; section-level
anchors and unavailable originals remain explicit instead of being presented as
verbatim quotations.

The structured layer must retain the complete formula/pseudocode/algorithm or
table unit relevant to each page. It may remove only page furniture and must
link back to the source and local original. An implementation or demo must
never be used to reconstruct missing standard text.

Documentation i18n uses `.en.md` counterparts. Evidence formulas, pseudocode,
symbols, and original-language quotations stay unchanged; explanatory text is
localized. Missing English pages are shown as source-language fallback in the
English Docs view and are not labeled as translated.
