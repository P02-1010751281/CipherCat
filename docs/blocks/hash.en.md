# Hash Block Reference (SHA + SM3 + Keccak + XOF)

> [中文](./hash.md)

## SHA-256 (FIPS 180-4)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_sha256_pad` | 1 | value(→) | null→Bytes | MD padding |
| `hash_sha256_pad_text` | 1 | value(→) | null→Bytes | UTF-8 text padding |
| `hash_sha256_pad_hex` | 1 | value(→) | null→Bytes | hex padding |
| `hash_sha256_compress` | 1 | value(→) | null&null→null | 64-round compression |

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

## XOF / PRF (FIPS 202 §6)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `pq_xof` | 1 | value(→) | Bytes&Number→Bytes | SHAKE XOF |
| `pq_prf` | 1 | value(→) | Bytes&Number&Number→Bytes | SHAKE PRF |

## HMAC (FIPS 198-1)

| Block | Layer | Connection | Input→Output | Description |
|----|----|------|----------|------|
| `hash_hmac` | 1 | value(→) | Bytes&Bytes→Bytes | HMAC (SHA-256/SM3 selectable) |
