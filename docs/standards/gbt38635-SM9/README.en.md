# GB/T 38635 — SM9 Identity-Based Cryptographic Algorithms

Standard source references: [00-Standard-Source.md](./00-Standard-Source.md).

Source: GB/T 38635-2020, *Information security technology — SM9 identity-based cryptographic algorithms* (effective 2020-11-01). Part 1: [GBT+38635.1-2020.pdf](./GBT+38635.1-2020.pdf); Part 2: [GBT+38635.2-2020.pdf](./GBT+38635.2-2020.pdf).

## Parts and implementation status

| Standard section | Scope | Project status |
|---|---|---|
| Part 1 | General requirements | Reference material; see [parameters and H1/H2](./02-H1-H2-and-Parameters.en.md) |
| Part 2, Chapter 5 | Algorithm parameters and auxiliary functions | Parameters and H1/H2 are structured; completeness still requires source verification |
| Part 2, Chapter 6 | Digital-signature algorithm | `sm9_sign` and `sm9_verify`; see [signature entry](./03-Signature.en.md) for scope and limitations |
| Part 2, Chapter 7 | Key-exchange protocol | Not implemented |
| Part 2, Chapter 8 | Key-encapsulation mechanism | Not implemented |
| Part 2, Chapter 9 | Public-key encryption | Not implemented |

The standard defines a bilinear pairing `e: G1 × G2 → GT`. This project currently implements R-ate pairing on the BN curve; Weil and Tate are other pairing constructions and do not describe this code path.

The [`SM9-Sign` workspace](../../../demos/procedures/SM9-Sign.json) contains `sm9_master_key`, `sm9_user_key`, and `sm9_sign`. The bilingual regression drivers call `sm9_verify` directly for the Annex A vector; generated code and rejection paths for the Blockly verification block also have regression coverage.

## Structured entries

- [SM9 signature algorithm overview](./01-SM9.en.md)
- [Parameters and H1/H2, Part 2 §§5.2–5.3.2.3](./02-H1-H2-and-Parameters.en.md)
- [Signature generation and verification](./03-Signature.en.md)
- [Unimplemented protocols and verification gaps](./04-Protocol-Gaps.en.md)

Repository regression results are engineering evidence only. They are not a complete standards-conformance conclusion, independent algorithm validation, or product certification.
