# Block Standard-Basis Reference


**Version**: 2.15 | **Date**: 2026-08-05 | **Total blocks**: 141 (plus 29 function templates)

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
| FIPS 205 | FIPS 205 (SLH-DSA) | `fips205-SLH-DSA/` |
| McEliece | McEliece / Goppa codes | `mceliece-goppa/` |
| RFC 8017 | RFC 8017 (PKCS#1 RSA) | `rfc8017-pkcs1/` |
| RFC 5903 | RFC 5903 (ECDH) | `rfc5903-ecdh/` |
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

## By Category (browser-measured 2026-08-05, 17 toolbox categories)

| Toolbox Category | Blocks | Doc |
|------|------|------|
| Control Flow | 12 | — |
| Variables / Math / Arrays / Logic | Blockly native | — |
| Data & Conversion | 20 | [data-encoding.md](data-encoding.en.md) |
| Bitwise | 8 | [bitwise-logic.md](bitwise-logic.en.md) |
| S-Box | 4 | [ecc-sbox.md](ecc-sbox.en.md) |
| Hash & Padding | 32 | [hash.md](hash.en.md) |
| Symmetric Cipher | 18 | [symmetric.md](symmetric.en.md) |
| Number Theory & KDF | 37 | [numtheory.md](numtheory.en.md) |
| Elliptic Curve | 20 | [ecc-sbox.md](ecc-sbox.en.md) |
| ZUC Stream Cipher | 6 | [zuc.md](zuc.en.md) |
| Post-Quantum Basic | 10 | [post-quantum.md](post-quantum.en.md) |
| Post-Quantum Advanced | 9 | [post-quantum.md](post-quantum.en.md) |
| Function Wrapping | 3+ (29 templates) | — |
| Crypto Templates | dynamic (after Manager add) | — |

> Note: NTT blocks (`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_ntt_butterfly`) are listed in both "Number Theory" and "Post-Quantum" block docs; after dedup the toolbox holds **139 custom blocks** across 17 categories (see `ALL_BLOCK_TYPES` in `src/blocks/index.ts`). Counts measured 2026-08-05.
