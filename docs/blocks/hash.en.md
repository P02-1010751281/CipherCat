# Hash Block Reference (SHA + SM3 + Keccak + XOF)

## Document role and evidence entry points

This is the category detail page under the [block overview](INDEX.en.md). “Hash” here includes digests, XOFs, sponges, HMAC, and explicitly marked hash-based components; the complete FIPS 205 scheme remains in the post-quantum documentation.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 180-4 SHA-2](../standards/fips180-4-SHA2/), [FIPS 202 SHA-3](../standards/fips202-SHA3/), [GB/T 32905 SM3](../standards/gbt32905-SM3/), [FIPS 198-1 HMAC](../standards/fips198-1-hmac/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | the corresponding blocks in the toolbox and their code generators |
| Example workspaces | [Demo guide](../guides/DEMO.en.md), and SHA/SM3/HMAC/HKDF/PBKDF2/ARGON2 workspaces under `demos/procedures/` |
| Boundary | Registered algorithms, vectors, and hash-based PQ components are checked separately; a hash block does not imply a complete signature scheme or every parameter set |


## SHA-256 (FIPS 180-4)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_sha256_pad` | 1 | value(→) | null→Bytes | Byte-sequence padding; byte values must be `0` to `255`; strict UTF-8 text is accepted for compatibility |
| `hash_sha256_pad_text` | 1 | value(→) | null→Bytes | Strict UTF-8 text padding; rejects unpaired surrogates |
| `hash_sha256_pad_hex` | 1 | value(→) | null→Bytes | Strict hex padding; requires contiguous, even-length hexadecimal text with no whitespace |
| `hash_sha256_compress` | 1 | value(→) | IntList&Bytes→IntList | Requires 8 32-bit chaining words and exactly one 64-byte message block; expands the schedule and runs 64 rounds |
| `hash_sha224_hash` | 1 | value(→) | null→Bytes | SHA-224 one-shot hash (FIPS 180-4: sha256 core + SHA-224 IV, 28-byte output) |

## SHA-3 / Keccak (FIPS 202)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `keccak_state_init` | 1 | value(→) | —→IntList | Creates a state of 25 zero lanes for Keccak-f |
| `keccak_f` | 1 | value(→) | null→IntList | Keccak-f[200/400/800/1600], with 18/20/22/24 rounds; each lane is an unsigned `w`-bit value. SHA-3/SHAKE use only 1600/24; the other widths are permutation primitives |
| `sponge_pad` | 1 | value(→) | null→Bytes | pad10*1 padding; byte values must be `0..255`, text is strict UTF-8 |
| `sponge_absorb` | 1 | value(→) | IntList&Bytes→IntList | Sponge absorb; input length must be a whole multiple of the selected rate in bytes; partial tails are rejected |
| `sponge_squeeze` | 1 | value(→) | null&Number→Bytes | sponge squeeze |
| `hash_sha3_pad_text` | 1 | value(→) | null→Bytes | Strict UTF-8 SHA-3 text padding; rejects unpaired surrogates and non-text inputs |
| `hash_sha3_pad_hex` | 1 | value(→) | null→Bytes | SHA-3 strict hex padding; requires contiguous, even-length hexadecimal text |

## SM3 (GB/T 32905-2016)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_sm3_pad` | 1 | value(→) | null→Bytes | 512-bit block padding with a 64-bit big-endian length; byte values must be `0..255`; strict UTF-8 text is accepted for compatibility |
| `hash_sm3_pad_text` | 1 | value(→) | null→Bytes | Strict UTF-8 text padding; rejects unpaired surrogates and non-text inputs |
| `hash_sm3_pad_hex` | 1 | value(→) | null→Bytes | Strict hex padding; requires contiguous, even-length hexadecimal text |
| `hash_sm3_compress` | 1 | value(→) | null&null&null→IntList | 64-round compression; inputs are the state V and the padded block W |

## Key Derivation HKDF (RFC 5869)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `hkdf_extract` | 1 | value(→) | IntList&Bytes→Bytes | HKDF-Extract (RFC 5869 §2.2): PRK = HMAC-SHA256(salt, IKM); an empty salt falls back to 32 zero bytes |
| `hkdf_expand` | 1 | value(→) | Bytes&IntList&Number→Bytes | HKDF-Expand (RFC 5869 §2.3): T(i) = HMAC-SHA256(PRK, T(i-1)‖info‖i), concatenated and truncated; L ≤ 8160 |
| `hkdf` | 1 | value(→) | IntList&Bytes&IntList&Number→Bytes | HKDF(salt, ikm, info, keyLen) → derived key; Extract = HMAC-SHA256(salt, IKM), Expand = HMAC(PRK, T‖info‖i) concat-truncate; empty salt → 32 zero bytes; official vectors (RFC 5869 §A.1) |

## Password KDF PBKDF2 (RFC 8018 / SP 800-132)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `pbkdf2_f` | 1 | value(→) | Bytes&IntList&Number&Number→Bytes | PBKDF2 single-block function F (RFC 8018 §5.2): U_1 = PRF(P, S‖INT(i)), F = U_1⊕…⊕U_c; 32-byte output for SHA-256 |
| `pbkdf2` | 1 | value(→) | Bytes&IntList&Number&Number→Bytes | PBKDF2(password, salt, iter, keyLen, HASH) → derived key; compute U1 = PRF(P, S‖INT(i)) and Uc = PRF(P, U_{c-1}), then Ti = U1 ⊕ U2 ⊕ … ⊕ Uc before truncation; HASH dropdown SHA-256 (RFC 8018) / SM3 (GM/T 0091 equivalent); the PBKDF2-HMAC-SHA-256 expected value is recomputed with Python `hashlib` (RFC 6070 only provides HMAC-SHA1 appendix values, which do not apply here) |

## Random Number Generation DRBG (SP 800-90A)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `drbg_generate` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | HMAC-DRBG SHA-256 (SP 800-90A): entropy + nonce + perso → deterministic bytes; demos cover a few fixed instantiate/reseed regressions, not the full CAVP vector set |

## Deterministic RNG Example (GM/T 0103 Framework Context)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `gm_rng` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | Deterministic SM3-HMAC teaching path borrowing the HMAC_DRBG structure; output length is 0–65536 bytes. It is not a conformant GM/T 0103/0105 or SP 800-90A implementation and does not collect or assess real entropy; the finite OpenSSL cross-check is not an official vector |

## Memory-Hard KDF Argon2 (RFC 9106)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `argon2_hash` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Number&Number&Number&Number→Bytes | Argon2d/i/id v1.3: password + salt + secret + ad + mCost + tCost + lanes + tagLen with variant as a dropdown → derived key; integer parameters and mCost ≥8×lanes required. RFC 9106 limits each P/S/K/X input to 2^32−1 bytes; it recommends a 16-byte salt but sets no minimum. Project code accepts byte sequences or UTF-8 text, rejects arbitrary iterators, and limits each input to 1 MiB. Execution parameter limits are mCost ≤65,536 KiB, tCost ≤10, lanes ≤16, tagLen ≤1,024 bytes, and mCost×tCost ≤65,536 KiB-passes. This implementation does not support RFC-recommended production profiles. RFC 9106 §5.1–5.3 vectors run through Demo regression; this is not a complete test suite |

## XOF / PRF (SHAKE: FIPS 202 §6; ML-KEM PRFη: FIPS 203 §4.1, Eq. (4.3))

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `pq_xof` | 1 | value(→) | Bytes&Number→Bytes | SHAKE128/256 XOF; byte-aligned inputs only; strings are UTF-8 encoded and array values must be integer-valued numbers in `0..255`; `outLen` is bytes |
| `pq_prf` | 1 | value(→) | Bytes&Number&Number→Bytes | `SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. Only SHAKE256 with a 32-byte seed and `64·η`-byte output matches ML-KEM `PRFη`; other parameters and SHAKE128 are project extensions |

## HMAC (FIPS 198-1)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_hmac` | 1 | value(→) | Bytes&Bytes→Bytes | HMAC; SHA-256 uses an approved underlying hash within the FIPS 198-1 scope; SM3-HMAC is a project extension, not a NIST-approved option |

Regression coverage for HMAC checks generated JavaScript and Python against RFC 4231 SHA-256 cases 1 and 6, cross-checks SM3 with an OpenSSL-backed implementation, rejects malformed byte input and unpaired surrogates, and verifies output containers and cross-language results. SM3-HMAC is a project extension, not a NIST-approved option. These are project regressions, not a complete standard test set or certification.

## SHA-512 / SHA-384 (FIPS 180-4, 64-bit words)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `hash_sha512_pad` | 1 | value(→) | Bytes→Bytes | SHA-512 padding: 1024-bit blocks and a 128-bit length field |
| `hash_sha512_compress` | 1 | value(→) | IntList&Bytes→IntList | 64-bit word compression (80 rounds); schedule expansion is performed internally |
| `hash_sha512_hash` | 1 | value(→) | Bytes→Bytes | SHA-384/512 one-shot wrapper (`SIZE` dropdown), with the standard IV and output truncation; fixed `abc` regression in both languages |

## Standalone SHA-3 Wrapper (FIPS 202)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `sha3_hash` | 1 | value(→) | Bytes→Bytes | SHA3-224/256/384/512 (`SIZE` dropdown); byte-aligned inputs only; fixed results cover `abc` and each rate-minus-one-byte input in generated JavaScript and Python; not a complete official test suite |

The SHA-3 wrapper block is checked against fixed outputs and a native SHA-3 implementation. The project has not run the complete official FIPS 202 test set or algorithm validation.

Regression coverage for the padding and compression blocks includes SHA-2 and SM3 padding boundaries (including the SM3 64-bit length-field boundary at `2^32` bits), strict UTF-8/hex and malformed-byte rejection, whole and partial rate blocks in sponge absorption, the SHAKE byte-input contract, and SHA-256 compression state/block sizes with cross-language output parity. These are project regressions, not complete official test sets or formal validation.

## Hash-Based Cryptography Teaching Structures (SLH-DSA / FIPS 205 Reference)

> These are teaching/research blocks, not FIPS 205 algorithm implementations. The project's simplified SHAKE concatenation omits standard `PK.seed` inputs, function-specific `H/F/PRF/T_k` calls, and complete ADRS state updates. The hash chain and generic Merkle tree do not implement the WOTS+/XMSS/FORS procedures. FORS uses fixed project parameters `n=32, k=4, a=4`; its sign/verify round trip is an internal-consistency property, not evidence of SLH-DSA conformance.

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `hash_chain` | 1 | value(→) | Bytes&Number→Bytes | Repeated project SHAKE-256 digest; no FIPS 205 `F(PK.seed, ADRS, ·)` or chain-address updates |
| `merkle_leaf` | 1 | value(→) | Bytes&Bytes→Bytes | Generic teaching leaf `SHAKE256(ADRS‖MSG, 32)`, not XMSS/FORS leaf generation |
| `merkle_node` | 1 | value(→) | Bytes&Bytes&Bytes→Bytes | Generic teaching node `SHAKE256(ADRS‖L‖R, 32)`, not the standard `H/T_l` call |
| `merkle_root` | 1 | value(→) | Bytes&Number&Bytes→Bytes | Teaching Merkle root over a leaf sequence, not a FIPS 205 tree algorithm |
| `merkle_auth_path` | 1 | value(→) | Bytes&Number&Bytes&Number→Bytes | auth path: sibling of target idx concatenated per level — Merkle proof core |
| `fors_leaf_index` | 1 | value(→) | Bytes&Number→Number | FORS leaf selection: I-th 4-bit block of message → 0..15 (same convention as fors_sign) |
| `slh_addr` | 1 | value(→) | Number&Number&Number→Bytes | ADRS-prefix teaching encoding: layer/tree/leaf plus a type dropdown, final 8 bytes zero; not complete address semantics |
| `slh_adrs_full` | 1 | value(→) | Number&Number&Number&Number&Number→Bytes | Partial type-field layout; safe-integer input only, cannot represent the full 96-bit tree address, not a complete FIPS 205 encoder |
| `fors_root` | 1 | value(→) | Bytes&Bytes→Bytes | Project SHAKE concatenation root, not FIPS 205 `T_k(PK.seed, ADRS, roots)` |
| `wots_checksum` | 1 | value(→) | Bytes→IntList | WOTS+ checksum (w=16, 4-bit blocks); message block ↑ → csum ↓ (forgery prevention) |

`slh_adrs_full` writes its 32-byte output at standard word boundaries: `0..3` layer, `4..15` tree, `16..19` type, `20..23` word 4, `24..27` word 5, and `28..31` word 6. TREE (type 2) uses zero padding in word 4; other types write their key-pair address or zero as specified. Types 0/2/3/5/6 apply the WOTS_HASH, TREE, FORS_TREE, WOTS_PRF, and FORS_PRF rules for words 5 and 6; other types leave those words zero. Inputs are limited to non-negative integers exactly representable by JavaScript `Number`, so the block cannot represent every 96-bit tree value.

## FORS Teaching Variant (FIPS 205 §8 Reference)

The current code uses `SHAKE256(SK.seed‖ADRS)` for project-specific leaf derivation and custom node/root concatenation. It does not implement FIPS 205 `PRF(PK.seed, SK.seed, ADRS)`, standard `F/T_k` parameterized calls, or a standard parameter set. Treat it as a structural demonstration, not as standards-conformant or secure production code.

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `fors_sign` | 1 | value(→) | Bytes&Bytes→Bytes | Fixed teaching parameters `n=32,k=4,a=4`; 640-byte project signature, not FIPS 205-compatible |
| `fors_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | Rebuilds and compares the project root; internal-consistency check only |
| `fors_pk_from_sk` | 1 | value(→) | Bytes→Bytes | Public-key derivation for the project teaching variant |

> Evidence is limited to determinism, sign/verify round-trip, and tamper rejection; it is not an official vector. FIPS 205 KATs target full SLH-DSA, and the current project has no SLH-DSA KAT evidence supporting a conformance claim.
