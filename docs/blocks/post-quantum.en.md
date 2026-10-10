# Post-Quantum Block Reference (ML-KEM + ML-DSA)

## Document role and evidence entry points

This is the post-quantum detail page under the [block overview](INDEX.en.md). “Post-quantum” is a cryptosystem family classification; sampling, hashing, NTT, polynomial, and encoding components are shared primitives, not independent schemes.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 203 ML-KEM](../standards/fips203-ML-KEM/), [FIPS 204 ML-DSA](../standards/fips204-ML-DSA/), [FIPS 205 SLH-DSA](../standards/fips205-SLH-DSA/), [McEliece/Goppa references](../standards/mceliece-goppa/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | post-quantum blocks in the toolbox and their code generators |
| Example workspaces | [Demo guide](../guides/DEMO.en.md) and the ML-KEM / ML-DSA / SLH-DSA / FORS / Goppa workspaces |
| Boundary | Shared primitives, selected parameters, and teaching chains are marked separately; no claim is made for all parameter families, complete certification, side-channel resistance, or a formal post-quantum security proof |

> The current SLH-DSA/FORS hash-based structures are teaching demonstrations, not FIPS 205-compatible implementations. See the [FIPS 205 status](../standards/fips205-SLH-DSA/README.md) for the gaps.


## FIPS 204 ML-DSA Signature

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `mldsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ML-DSA-44 sign (FIPS 204): sk 2560B + msg → 2420B signature (deterministic, rnd=0 empty ctx); the repository regression uses the official ACVP ML-DSA-44 deterministic cases (tgId=1, tcId 5 and 8; 2 cases), not the complete ACVP suite or certification |
| `mldsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ML-DSA-44 verify: pk 1312B + msg + sig → true/false |

## FIPS 203 Encoding/Compression (§4.2.1)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|----------|
| `pq_bytes_to_bits` | 1 | value(→) | Bytes→Bits | Alg 4; expands each byte least-significant bit first; input elements must be integer values from 0 to 255 |
| `pq_bits_to_bytes` | 1 | value(→) | Bits→Bytes | Alg 3; packs least-significant bit first; bit count must be a multiple of 8 and each element must be 0 or 1 |
| `pq_byte_encode` | 1 | value(→) | IntList→Bytes | Alg 5 |
| `pq_byte_decode` | 1 | value(→) | Bytes→IntList | Alg 6 |
| `pq_compress` | 1 | value(→) | IntList→IntList | §4.2.1; `d=1..11` is the standard range, while `d=12` is a project extension |
| `pq_decompress` | 1 | value(→) | IntList→IntList | §4.2.1; `d=1..11` is the standard range, while `d=12` is a project extension |
| `pq_byte_concat` | 1 | value(→) | Bytes&Bytes→Bytes | — |
| `pq_bytes_slice` | 1 | value(→) | Bytes&Number&Number→Bytes | slice `[start, end)` |
| `pq_seed_with_nonce` | 1 | value(→) | Bytes&Number→Bytes | append a one-byte nonce to the seed |

Both `pq_compress` and `pq_decompress` operate on integer lists; they are not byte-encoding blocks. FIPS 203 §4.2.1 allows `1≤d<12`. The additional `d=12` option is a project-specific mathematical extension, not a parameter of the standardized compression algorithms and not conformance evidence.

## Post-Quantum Sampling Primitives

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|----------|
| `pq_sample_ntt` | 1 | value(→) | Bytes→IntList | q=3329 maps to FIPS 203 Alg 7; q=8380417 maps to FIPS 204 Alg 30. The implementation consumes a fixed 768 bytes; full sampling conformance remains to be checked. |
| `pq_sample_poly_cbd` | 1 | value(→) | Bytes→IntList | q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard ML-KEM parameter combination. |

## NTT / INTT Transforms

| Block | Layer | Connection | Input→Output | Notes |
|---|---|---|---|---|
| `pq_ntt` | 1 | value(→) | IntList→IntList | Fixed 256 coefficients: q=3329 is ML-KEM, q=8380417 is ML-DSA, q=12289 is a 256-point cyclic NTT for teaching |
| `pq_intt` | 1 | value(→) | IntList→IntList | Inverse transform; `n=256` and exactly 256 input coefficients; q=12289 inverts the teaching NTT |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | Both inputs require 256 coefficients; q=3329 half-NTT, q=8380417 pointwise |
| `pq_ntt_butterfly` | 1 | value(→) | Number&Number&Number→IntList | one butterfly step returning two result coefficients; modulus and CT/GS are dropdowns |

> The q=12289 transform is only a teaching example of cyclic NTT. It does not represent NewHope or another standardized algorithm and has no matching NTT-domain multiplication block.

> Bit/byte conversion validates the standard domains. JavaScript accepts integer-valued numbers and returns `Uint8Array`; Python accepts integers and integer-valued floats and returns `bytes`. For example, `1.0` is treated as the integer 1 in both generated languages.

## FIPS 204 ML-DSA Signature Primitives (atomic, composable)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `pq_power2round` | 1 | value(→) | IntList→IntList | Input: 256 coefficients in `[0,q)` (q=8380417); fixed d=13; returns the r1 or r0 vector (FIPS 204 Algorithm 35) |
| `pq_decompose` | 1 | value(→) | IntList→IntList | Input: 256 coefficients in `[0,q)` (q=8380417); fixed γ₂=95232; returns the r1 or r0 vector (Algorithm 36) |
| `pq_make_hint` | 1 | value(→) | IntList&IntList→IntList | Inputs: two 256-coefficient vectors in `[0,q)` (q=8380417); returns the coefficient-wise 0/1 hint vector (Algorithm 39) |
| `pq_use_hint` | 1 | value(→) | IntList&IntList→IntList | Inputs: a 256-entry 0/1 hint vector and a 256-coefficient vector in `[0,q)` (q=8380417); reconstructs the high parts (Algorithm 40) |
| `pq_sample_in_ball` | 1 | value(→) | Bytes→IntList | Input: 32-byte seed; fixed ML-DSA-44 τ=39 (FIPS 204 Alg 29) |

> `pq_power2round`, `pq_decompose`, `pq_make_hint`, `pq_use_hint`, and `pq_sample_in_ball` reuse implementation helpers from the ML-DSA signing/verification path. Existing direct assertions primarily cover parameter/rejection boundaries and output length; they do not establish the τ-sparsity property of `SampleInBall` or complete official vectors for these primitives. This is not a complete ML-DSA conformance proof.

## Generic Threshold Helper (Not a FIPS Algorithm)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `pq_rej_sample` | 1 | value(→) | Number&Number→Number | Returns caller-supplied X if `X < BOUND`, else -1. It only checks a threshold; it does not generate samples or retry, and is not FIPS 204 `RejBoundedPoly` (Algorithm 31). |
