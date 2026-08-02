# CipherCat Block Standard-Basis Reference

> [中文](./INDEX.md)

**Version**: 2.12 | **Date**: 2026-08-02 | **Total blocks**: 131 (plus 27 function templates)

## Legend

| Symbol | Meaning |
|------|------|
| **Layer** | 1-atomic primitive / 2-convenience composite / 3-one-click wrapper |
| **Connection** | `value(→)` output block / `stmt(→→)` statement block |
| **Type** | input→output setCheck/setOutput types |

## Standard Mapping

| Standard | Short name | Doc dir |
|--------|------|---------|
| FIPS 197 | FIPS 197 (AES) | `fips197-AES/` |
| FIPS 180-4 | FIPS 180-4 (SHA-2) | `fips180-4-SHA2/` |
| FIPS 202 | FIPS 202 (SHA-3) | `fips202-SHA3/` |
| FIPS 203 | FIPS 203 (ML-KEM) | `fips203-ML-KEM/` |
| FIPS 204 | FIPS 204 (ML-DSA) | `fips204-ML-DSA/` |
| GM/T 0002 | GB/T 32907 (SM4) | `gbt32907-SM4/` |
| GM/T 0004 | GB/T 32905 (SM3) | `gbt32905-SM3/` |
| GB/T 33133 | GB/T 33133 (ZUC) | `gbt33133-ZUC/` |
| NIST SP 800-38 | SP 800-38 (block modes) | — |
| RFC 4648 | RFC 4648 (Base64) | — |
| RFC 2315 | RFC 2315 (PKCS#7) | — |
| RFC 5869 | RFC 5869 (HKDF) | — |
| NIST SP 800-38A | SP 800-38A (block modes) | `sp800-38a-modes/` |
| NIST SP 800-38D | SP 800-38D (GCM) | `sp800-38d-gcm/` |
| FIPS 198-1 | FIPS 198-1 (HMAC) | `fips198-1-hmac/` |
| FIPS 186-5 | FIPS 186-5 (ECDSA) | `fips186-5-ecdsa/` |
| NIST SP 800-132 | SP 800-132 (PBKDF2) | `sp800-132-pbkdf2/` |
| SP 800-90A | SP 800-90A (DRBG) | `sp800-90a-drbg/` |
| SEC 2 | SEC 2 (ECC) | — |

## By Category

| Category | Doc | Blocks |
|------|------|------|
| Symmetric (AES+SM4) | [symmetric.md](symmetric.en.md) | 6 |
| Modes + padding | [symmetric.md](symmetric.en.md) | 6 |
| Hash (SHA-2/SM3/SHA-3/HMAC) | [hash.md](hash.en.md) | 18 |
| Post-quantum (ML-KEM) | [post-quantum.md](post-quantum.en.md) | 15 |
| Number theory + big int | [numtheory.md](numtheory.en.md) | 17 |
| Bit ops + logic | [bitwise-logic.md](bitwise-logic.en.md) | 11 |
| Data + encoding | [data-encoding.md](data-encoding.en.md) | 14 |
| ECC | [ecc-sbox.md](ecc-sbox.en.md) | 5 |
| S-Box | [ecc-sbox.md](ecc-sbox.en.md) | 4 |
| ZUC stream cipher | [zuc.md](zuc.en.md) | 5 |
| Arrays | — | 1 |
| Control flow | — | 1 |
| Function wrapping | [ecc-sbox.md](ecc-sbox.en.md) | 5 |

> Note: NTT blocks (`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_ntt_butterfly`) are listed once in both "Number theory + big int" and "Post-quantum" docs; after dedup the total is 103 custom blocks (see `ALL_BLOCK_TYPES` in `src/blocks/index.ts`). ZUC 5 blocks (`zuc_s0`/`zuc_s1`/`zuc_l1`/`zuc_l2`/`zuc_f`) added 2026-08-02 (GB/T 33133 atomic blocks).
