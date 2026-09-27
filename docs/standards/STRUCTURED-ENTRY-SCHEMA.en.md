# Structured Standard-entry Schema

`00-Standard-Source.md` is the complete source-extraction layer and trace-back
entry point. A structured page is one independently reviewable standard
function, primitive, algorithm stage, formula family, or table family; it is
not a second copy of the PDF.

## Required fields

Each structured entry must contain:

- entry metadata: type, standard/version/section, source artifact, location, and project status;
- standard definition and preconditions;
- original location and citation, including PDF page and source line where reliable;
- the complete normative formula, pseudocode, algorithm block, or table unit;
- input/output types, lengths, domains, encoding, and error conditions;
- Blockly/source/template mapping;
- verification scope and remaining gaps.

Formula, pseudocode, algorithm steps, and tables must not be reduced to a
“short excerpt”, ellipsis, or project summary. Preserve the complete unit,
order, symbols, and boundaries; only PDF furniture such as headers, footers,
page numbers, and form-feed markers may be removed. If the text layer is
damaged, say so and point to the PDF instead of guessing.

Complete the formula or pseudocode normative unit owned by this entry; do not
replace it with a short excerpt or project summary. State symbols, word width,
modulus, and byte order. If this is a navigation/composite/boundary page with
no independently owned normative unit, write “this entry has no independent
formula/pseudocode unit” and link the owning complete entry. If the standard
itself does not define the field, write “not defined by the standard” and link
the complete source paragraph.

## Source exceptions

An RFC directory may use the complete locally stored RFC Editor `.txt` as its
normative evidence layer. Its structured page can serve as a section index,
vector list, and project mapping without duplicating the complete RFC, but it
must label itself as an RFC `.txt` evidence-layer entry and link the exact
section and local text location.

A research/reference directory whose manifest entry has `kind=reference` may
use `00-Research-Source.md` as a bibliography and context index, but that file
is not a normative-standard extraction. Its structured pages must label
paraphrases as “Source notes (paraphrase, not verbatim),” link accessible
original literature, standard records, or DOIs, and state access/transcription
limits. Such a citation must not count as a normative source-line anchor or
replace missing standard text. Directories for current standards still require
the complete normative units and fields above.

## Split grain

- One independently numbered algorithm per page.
- A primitive that is independently useful as a Blockly block or teaching intermediate gets its own page.
- An internal formula remains with its owning function.
- Closely coupled steps may be grouped only when the project mapping says they are implemented inside the parent block.
- If the standard does not define a requested field, write “not defined by the standard” or “not implemented”.

## i18n

Chinese pages use `.md`; translated pages use the matching `.en.md` path.
Formulas, pseudocode, symbols, identifiers, and original-language citations
are evidence and remain unchanged between locales. Explanations, labels, and
navigation may be translated. When an English counterpart is not available,
the Docs view shows the source-language page as an explicit fallback; it does
not claim that page is translated.
