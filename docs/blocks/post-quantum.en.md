# Post-Quantum Block Reference (ML-KEM + ML-DSA)

## Document role and evidence entry points

This is the post-quantum detail page under the [block overview](INDEX.en.md). “Post-quantum” is a cryptosystem family classification; sampling, hashing, NTT, polynomial, and encoding components are shared primitives, not independent schemes.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 203 ML-KEM](../standards/fips203-ML-KEM/), [FIPS 204 ML-DSA](../standards/fips204-ML-DSA/), [FIPS 205 SLH-DSA](../standards/fips205-SLH-DSA/), [McEliece/Goppa references](../standards/mceliece-goppa/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | `src/blocks/post-quantum/`, `src/blocks/mldsa/`, and explicitly reused shared components under `src/blocks/hash/` |
| Demos and tests | [Demo guide](../guides/DEMO.en.md), [demo test registry](../../demos/tests.json), and ML-KEM/ML-DSA/SLH-DSA/FORS/Goppa workspaces |
| Boundary | Shared primitives, selected parameters, and teaching chains are marked separately; no claim is made for all parameter families, complete certification, side-channel resistance, or a formal post-quantum security proof |


## FIPS 204 ML-DSA Signature

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `mldsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ML-DSA-44 sign (FIPS 204): sk 2560B + msg → 2420B signature (deterministic, rnd=0 empty ctx); NIST ACVP 30/30 dual-language pass |
| `mldsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ML-DSA-44 verify: pk 1312B + msg + sig → true/false |

## FIPS 203 Encoding/Compression (§4.2.1)

| Block | Layer | Connection | Input→Output | FIPS 203 |
|----|----|------|----------|----------|
| `pq_bytes_to_bits` | 1 | value(→) | Bytes→Bits | Alg 4 |
| `pq_bits_to_bytes` | 1 | value(→) | Bits→Bytes | Alg 3 |
| `pq_byte_encode` | 1 | value(→) | IntList→Bytes | Alg 5 |
| `pq_byte_decode` | 1 | value(→) | Bytes→IntList | Alg 6 |
| `pq_compress` | 1 | value(→) | IntList→Bytes | §4.2.1 |
| `pq_decompress` | 1 | value(→) | Bytes→IntList | §4.2.1 |
| `pq_byte_concat` | 1 | value(→) | Bytes&Bytes→Bytes | — |
| `pq_bytes_slice` | 1 | value(→) | Bytes→Bytes | — |
| `pq_seed_with_nonce` | 1 | value(→) | Bytes→Bytes | — |

## FIPS 203 Sampling (§4.2.2)

| Block | Layer | Connection | Input→Output | FIPS 203 |
|----|----|------|----------|----------|
| `pq_sample_ntt` | 1 | value(→) | Bytes→IntList | Alg 7 |
| `pq_sample_poly_cbd` | 1 | value(→) | Bytes→IntList | Alg 8 |

## FIPS 203 NTT Transform (§4.3)

| Block | Layer | Connection | Input→Output |
|----|----|------|----------|
| `pq_ntt` | 1 | value(→) | IntList→IntList | NTT (3329/8380417/12289, FIPS 204 branch ζ=1753) |
| `pq_intt` | 1 | value(→) | IntList→IntList | INTT (FIPS 204 branch × 256⁻¹) |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | NTT-domain multiply (8380417 pointwise) |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |

## FIPS 204 ML-DSA Signature Primitives (atomic, composable)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `pq_power2round` | 1 | value(→) | Number&Number→IntList | centered 2¹³ decomposition (r1/r0) — public key t1/t0 |
| `pq_decompose` | 1 | value(→) | Number&Number→IntList | centered 2γ₂ decomposition (γ₂=95232) — signature w1/w0 |
| `pq_make_hint` | 1 | value(→) | Number&Number→Number | hint bit (signer-side rounding difference) |
| `pq_use_hint` | 1 | value(→) | Number&Number&Number→Number | hint repairs r1 (verifier rebuilds w1') |
| `pq_sample_in_ball` | 1 | value(→) | IntList→IntList | SHAKE256 sampling of exactly τ=39 ±1 challenge polynomial |
| `pq_rej_sample` | 1 | value(→) | Number&Number→Number | rejection sampling: accept X < BOUND, else -1 (RejBounded single-value) |

> Primitives reuse the `mldsa_sign/verify` embedded closures (same source, consistent); property vectors: P2R reversible, UseHint(MakeHint) theorem, InBall exactly 39 ±1, Rej exclusive bound.
