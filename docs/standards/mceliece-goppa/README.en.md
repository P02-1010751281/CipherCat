# Classic McEliece / Goppa Codes — Algorithm and Source Index

See [00-Research-Source.md](./00-Research-Source.md) for the source and standardization status. It separates original papers, the ISO publication record, and NIST process history.

## Standardization Status

| Organization | Verifiable status | Evidence boundary |
|---|---|---|
| ISO/IEC | ISO/IEC 18033-2:2006/Amd 2:2026 was published on 2026-06-05; the amendment adds the Classic McEliece KEM. | The ISO catalog confirms publication; the algorithm team page lists included algorithms and parameter sets. The full standard is copyright-protected and paywalled; it is not stored or transcribed here. |
| NIST | NIST IR 8545 and the 2025-03-11 announcement record that Classic McEliece was a fourth-round candidate but was not selected; HQC was selected for NIST standardization. NIST’s current PQC project page (updated 2026-08-05) says HQC standardization is underway. | The additional-signatures project page, despite its 2026-09-22 update date, retains obsolete text saying fourth-round KEM candidates are still under consideration. That text does not match the published fourth-round result and is treated as stale page content, not an unresolved current-process conclusion. |

## Implementation Boundary

> CipherCat’s code-based blocks (`src/blocks/numtheory/codebased.ts`, `gf2mpoly.ts`, and binary-matrix/Hamming blocks under `src/blocks/numtheory/`) cover Goppa-code construction, syndrome computation, and Patterson decoding as teaching primitives. They do not implement the ISO Classic McEliece KEM’s key generation, encapsulation/decapsulation interfaces, or selected parameter sets, and do not establish conformance.
>
> Fixed teaching parameters: GF(2^8) AES field with irreducible polynomial x^8+x^4+x^3+x+1 = 0x11B, t=2, n=14.

## Teaching Parameters

| Parameter | Value | Description |
|---|---|---|
| Field | GF(2^8) = GF(2)[x]/(x^8+x^4+x^3+x+1) | AES field; shared by the `goppa_gen_poly` and `gf2m` blocks |
| Support set L | Elements of a GF(16) subfield | In the AES field, 0x0d has order 15; `S = {0} ∪ {13^k}` is XOR-closed |
| n | 14 | Code length, equal to the support-set size |
| t | 2 | Degree of G(z); error-correction capability t |
| k | n − m′·t = 6 | m′=4 is the GF(16) subfield degree; parity-check rank is 8 in the tested instance |

## Algorithm Pages

| Page | Subject | Blockly implementation |
|---|---|---|
| [01-Goppa-Codes.md](./01-Goppa-Codes.md) | Goppa-code construction and syndrome | Yes |
| [02-Patterson.md](./02-Patterson.md) | Patterson algebraic decoding | Yes, teaching parameters |

## Block Mapping

| Primitive group | Blocks |
|---|---|
| GF(2^8) field arithmetic | `gf2m_mul`, `gf2m_add`, `gf2m_inv` |
| GF(2^8) coefficient polynomials | `gf2m_poly_add`, `gf2m_poly_mul`, `gf2m_poly_mod`, `gf2m_poly_xgcd`, `gf2m_poly_eval` |
| Goppa construction and syndrome | `goppa_gen_poly`, `syndrome_calc` |
| Binary polynomials and matrices | `gf2_poly_mul/div/mod/gcd`, `bin_mat_mul/inv` |
| Metrics and decoding | `ham_weight`, `ham_dist`, `goppa_decode`, `berlekamp_massey`, `arr_slice` |

The demo [`Goppa-Decode.json`](../../../demos/procedures/Goppa-Decode.json) checks root membership, an inverse identity, a known syndrome, error-free/single-error/double-error round trips, and rejection of a modified polynomial. See scenario 11 in [the post-quantum demo guide](../../demos/post-quantum.en.md).

These teaching primitives are not a complete Classic McEliece implementation. Do not describe them as ISO/IEC 18033-2:2006/Amd 2:2026 conformant.
