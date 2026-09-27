# Hash Block Reference (SHA + SM3 + Keccak + XOF)

## Document role and evidence entry points

This is the category detail page under the [block overview](INDEX.en.md). “Hash” here includes digests, XOFs, sponges, HMAC, and explicitly marked hash-based components; the complete FIPS 205 scheme remains in the post-quantum documentation.

| Entry | Contents |
|-------|----------|
| Normative source and structured entries | [FIPS 180-4 SHA-2](../standards/fips180-4-SHA2/), [FIPS 202 SHA-3](../standards/fips202-SHA3/), [GB/T 32905 SM3](../standards/gbt32905-SM3/), [FIPS 198-1 HMAC](../standards/fips198-1-hmac/), [coverage matrix](../standards/COVERAGE.en.md) |
| Implementation | `src/blocks/hash/`, `src/blocks/sha512/`, `src/blocks/hkdf/`, `src/blocks/pbkdf2/`, `src/blocks/argon2/` |
| Demos and tests | [Demo guide](../guides/DEMO.en.md), [demo test registry](../../demos/tests.json), and SHA/SM3/HMAC/HKDF/PBKDF2/ARGON2 workspaces under `demos/procedures/` |
| Boundary | Registered algorithms, vectors, and hash-based PQ components are checked separately; a hash block does not imply a complete signature scheme or every parameter set |


## SHA-256 (FIPS 180-4)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_sha256_pad` | 1 | value(→) | null→Bytes | MD padding |
| `hash_sha256_pad_text` | 1 | value(→) | null→Bytes | UTF-8 text padding |
| `hash_sha256_pad_hex` | 1 | value(→) | null→Bytes | hex padding |
| `hash_sha256_compress` | 1 | value(→) | null&null→null | 64-round compression |
| `hash_sha224_hash` | 1 | value(→) | null→Bytes | SHA-224 one-shot hash (FIPS 180-4: sha256 core + SHA-224 IV, 28-byte output, 2026-08-05) |

## SHA-3 / Keccak (FIPS 202)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `keccak_state_init` | 1 | value(→) | —→null | 25×64-bit zero state |
| `keccak_f` | 1 | value(→) | null→null | Keccak-f[b] permutation (24 rounds) |
| `sponge_pad` | 1 | value(→) | null→Bytes | pad10*1 padding |
| `sponge_absorb` | 1 | value(→) | null&Bytes→null | sponge absorb |
| `sponge_squeeze` | 1 | value(→) | null&Number→Bytes | sponge squeeze |
| `hash_sha3_pad_text` | 1 | value(→) | null→Bytes | SHA-3 text padding |
| `hash_sha3_pad_hex` | 1 | value(→) | null→Bytes | SHA-3 hex padding |

## SM3 (GM/T 0004)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_sm3_pad` | 1 | value(→) | null→Bytes | message padding |
| `hash_sm3_pad_text` | 1 | value(→) | null→Bytes | UTF-8 padding |
| `hash_sm3_pad_hex` | 1 | value(→) | null→Bytes | hex padding |
| `hash_sm3_compress` | 1 | value(→) | null&null→null | 64-round compression |

## Key Derivation HKDF (RFC 5869)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `hkdf` | 1 | value(→) | IntList&Bytes&IntList&Number→Bytes | HKDF(salt, ikm, info, keyLen) → derived key; Extract = HMAC-SHA256(salt, IKM), Expand = HMAC(PRK, T‖info‖i) concat-truncate; empty salt → 32 zero bytes; official vectors (RFC 5869 §A.1) |

## Password KDF PBKDF2 (RFC 8018 / SP 800-132)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `pbkdf2` | 1 | value(→) | Bytes&IntList&Number&Number→Bytes | PBKDF2(password, salt, iter, keyLen, HASH) → derived key; U1 = PRF(P, S‖INT(i)), Uc = PRF(P, U_{c-1}) concat-truncate; HASH dropdown SHA-256 (RFC 8018) / SM3 (GM/T 0091 equivalent, JS/Python cross-checked); official vectors (RFC 6070 / hashlib cross) |

## Random Number Generation DRBG (SP 800-90A)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `drbg_generate` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | HMAC-DRBG SHA-256 (SP 800-90A): entropy + nonce + perso → deterministic bytes; NIST CAVP 480 cases dual-language pass |

## National Crypto RNG GM-RNG (GM/T 0103 framework)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `gm_rng` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | SM3-instantiated HMAC-DRBG (GM/T 0103 framework + GM/T 0105 SW RNG guide): deterministic teaching semantics; SHA-256 variant cross-checked 480 cases + SM3 dual-language |

## Memory-Hard KDF Argon2 (RFC 9106)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `argon2_hash` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Number&Number&Number&Number&Number→Bytes | Argon2d/i/id v1.3: password + salt + secret + ad + mCost + tCost + lanes + tagLen + variant → derived key; official vectors (RFC 9106 §5 incl. pre-hash + intermediate blocks) |

## XOF / PRF (FIPS 202 §6)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `pq_xof` | 1 | value(→) | Bytes&Number→Bytes | SHAKE XOF |
| `pq_prf` | 1 | value(→) | Bytes&Number&Number→Bytes | SHAKE PRF |

## HMAC (FIPS 198-1)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_hmac` | 1 | value(→) | Bytes&Bytes→Bytes | HMAC (SHA-256/SM3 selectable) |

## Hash-Based Post-Quantum Structures (FIPS 205 / SPHINCS+)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `hash_chain` | 1 | value(→) | Bytes&Number→Bytes | WOTS+ hash chain cⁱ(x)=Hⁱ(x) (SHAKE-256 32B) |
| `merkle_leaf` | 1 | value(→) | Bytes&Bytes→Bytes | leaf = H(ADRS‖MSG) |
| `merkle_node` | 1 | value(→) | Bytes&Bytes&Bytes→Bytes | node = H(ADRS‖L‖R) |
| `merkle_root` | 1 | value(→) | Bytes&Number&Bytes→Bytes | whole-tree root (leaf concatenation, power of 2) |
| `merkle_auth_path` | 1 | value(→) | Bytes&Number&Bytes&Number→Bytes | auth path: sibling of target idx concatenated per level — Merkle proof core |
| `fors_leaf_index` | 1 | value(→) | Bytes&Number→Number | FORS leaf selection: I-th 4-bit block of message → 0..15 (same convention as fors_sign) |
| `slh_addr` | 1 | value(→) | Number&Number&Number&Number→Bytes | FIPS 205 ADRS 32B simplified (layer/tree/type/leaf) |
| `slh_adrs_full` | 1 | value(→) | Number&Number&Number&Number&Number→Bytes | full ADRS: type dropdown 0-6 + type-dependent fields (WOTS_HASH uses chain/hash, TREE/FORS_TREE uses height/index) — SHAKE domain separation |
| `fors_root` | 1 | value(→) | IntList&Bytes→Bytes | FORS forest root R=H(ADRS‖roots) |
| `wots_checksum` | 1 | value(→) | Bytes→IntList | WOTS+ checksum (w=16, 4-bit blocks); message block ↑ → csum ↓ (forgery prevention) |

## FORS Few-Time Signatures (FIPS 205 §8)

| Block | Layer | Connection | Input→Output | Notes |
|----|----|------|----------|------|
| `fors_sign` | 1 | value(→) | Bytes&Bytes→Bytes | FORS.SigGen: sk_seed 32B + M 2B (k=4/a=4) → 640B signature (black box, full FORS closure) |
| `fors_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | PkFromSig semantics: rebuild root, compare to public key |
| `fors_pk_from_sk` | 1 | value(→) | Bytes→Bytes | public key derivation (message-independent) |

> Property vectors: determinism / sign-verify round-trip / tamper detection (FORS has no standalone official vectors; FIPS 205 KAT is the full SLH-DSA).
