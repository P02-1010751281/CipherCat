# Block Overview and Evidence Entry Points


**Version**: 2.16 | **Date**: 2026-09-24 | **Total**: 194 unique custom block types (29 template registrations; 3 overlap; 220 types after deduplication)

This page is the block-document overview. Its length does not represent capability weight. Every category detail page uses the same evidence path: normative source and structured entries describe the standard, `src/blocks/` describes the registered implementation and generators, `demos/` and tests describe executable scope, and the coverage matrix records limits and missing evidence.

## Reading path

```text
Block overview (this page)
  → category details (symmetric/hash/public-key/stream/post-quantum/math)
    → normative source and structured entries
    → source code, demos, and tests
    → coverage matrix and boundary notes
```

## Category details and uniform evidence entry points

| Category | Detail page | Standards/source entry | Implementation and executable entry | Coverage boundary |
|----------|-------------|------------------------|-------------------------------------|-------------------|
| Block ciphers, modes, and AEAD | [symmetric.md](symmetric.en.md) | FIPS 197, GB/T 32907, SP 800-38 series | `src/blocks/symmetric/`, AES/SM4/mode demos | Atomic rounds, modes, and selected vectors; complete interfaces are checked per algorithm/mode |
| Hash, XOF, and sponge | [hash.md](hash.en.md) | FIPS 180-4, FIPS 202, GB/T 32905, FIPS 198-1 | `src/blocks/hash/`, SHA/SM3/HMAC demos | Hash, XOF, HMAC, and selected hash-based PQ components; parameters and wrappers are checked individually |
| Classical public-key and elliptic-curve cryptography | [ecc-sbox.md](ecc-sbox.en.md), [numtheory.md](numtheory.en.md) | FIPS 186-5, RFC 5903/7748/8032, GB/T 32918/38635, RFC 8017 | `src/blocks/ecc/`, `src/blocks/*dh/`, signature/encryption demos | Selected curves, encodings, and protocol chains; not all parameter sets |
| Stream cipher | [zuc.md](zuc.en.md) | GB/T 33133 and the relevant 3GPP EEA3/EIA3 material | `src/blocks/zuc/`, `demos/procedures/EEA3.json`, `EIA3.json` | ZUC keystream, EEA3 teaching chain, and EIA3 MAC vectors; no certification claim |
| Post-quantum cryptography | [post-quantum.md](post-quantum.en.md) | FIPS 203/204/205 and McEliece/Goppa references | `src/blocks/post-quantum/`, ML-KEM/ML-DSA/SLH-DSA/code-based demos | Shared components, selected algorithm chains, and teaching primitives; no claim of all parameter sets or certification |
| Math, encoding, and shared components | [bitwise-logic.md](bitwise-logic.en.md), [data-encoding.md](data-encoding.en.md), [ecc-sbox.md](ecc-sbox.en.md), [numtheory.md](numtheory.en.md) | Relevant standards and the [coverage matrix](../standards/COVERAGE.en.md) | `src/blocks/bitwise/`, `src/blocks/data/`, `src/blocks/numtheory/`, math demos | Composable components for multiple families, not a cryptosystem by themselves |

## What an evidence entry means

| Evidence layer | Entry | Supports | Does not support |
|----------------|-------|----------|------------------|
| Normative evidence | `docs/standards/<id>/00-Standard-Source.md`, PDF, and structured entries | Standard definitions, formulas, pseudocode, and clause locations | Complete project implementation or certification |
| Implementation evidence | `src/blocks/` and the category detail pages | Registration, input/output semantics, and generator mapping | All parameter sets, side-channel security, or formal certification |
| Executable evidence | `demos/`, `demos/tests.json`, and `npm run verify:all` | Registered demos, vectors, properties, and engineering regression | Production security, complete standard coverage, or backend assessment conclusions |
| Platform backend assessment report | Reports from `metacrypt_server` | Samples, parameters, results, and decision boundaries | Frontend screenshots, block existence, or a passing demo alone |

“Evidence entry” is navigation and claim scoping, not a decorative badge. The final normative location remains the standard directory's source, structured entry, and PDF; project behavior must not be used to reconstruct normative text.

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
| RFC 2315 | RFC 2315 (PKCS#7) | `rfc2315-pkcs7/` |
| RFC 4648 | RFC 4648 (Base64) | `rfc4648-base64/` |
| RFC 5903 | RFC 5903 (ECDH) | `rfc5903-ecdh/` |
| GM/T 0002 | GB/T 32907 (SM4) | `gbt32907-SM4/` |
| GM/T 0004 | GB/T 32905 (SM3) | `gbt32905-SM3/` |
| GB/T 33133 | GB/T 33133 (ZUC) | `gbt33133-ZUC/` |
| NIST SP 800-38 | SP 800-38 (block modes) | — |
| RFC 5869 | RFC 5869 (HKDF) | — |
| NIST SP 800-38A | SP 800-38A (block modes) | `sp800-38a-modes/` |
| NIST SP 800-38D | SP 800-38D (GCM) | `sp800-38d-gcm/` |
| FIPS 198-1 | FIPS 198-1 (HMAC) | `fips198-1-hmac/` |
| FIPS 186-5 | FIPS 186-5 (ECDSA) | `fips186-5-ecdsa/` |
| NIST SP 800-132 | SP 800-132 (PBKDF2) | `sp800-132-pbkdf2/` |
| SP 800-90A | SP 800-90A (DRBG) | `sp800-90a-drbg/` |
| SEC 2 | SEC 2 (ECC) | — |

## By Capability Family (organized across 17 runtime toolbox categories)

| Capability family / toolbox category | Representative scope | Doc |
|------|------|------|
| Control flow and Blockly-native blocks | Iteration, variables, math, arrays and logic | — |
| Data handling and conversion | Byte/bit/encoding/seed/length operations | [data-encoding.md](data-encoding.en.md) |
| Bitwise and S-Box | Logic, shifts, substitutions and algorithm presets | [bitwise-logic.md](bitwise-logic.en.md), [ecc-sbox.md](ecc-sbox.en.md) |
| Hash, XOF and padding | SHA-2, SHA-3, SHAKE, SM3 and HMAC | [hash.md](hash.en.md) |
| Symmetric cryptography and modes | AES, SM4, modes, MAC and AEAD | [symmetric.md](symmetric.en.md) |
| Public-key and elliptic-curve cryptography | RSA, ECDH, ECDSA, EdDSA, SM2 and SM9 | [ecc-sbox.md](ecc-sbox.en.md), [numtheory.md](numtheory.en.md) |
| Stream ciphers | ZUC state transformations, keystream, EEA3/EIA3 | [zuc.md](zuc.en.md) |
| Post-quantum cryptography | ML-KEM/ML-DSA, SLH-DSA and code-based teaching components | [post-quantum.md](post-quantum.en.md) |
| Math, encoding and function templates | NTT, finite fields, polynomials, common encodings and 29 template registrations | [numtheory.md](numtheory.en.md), [data-encoding.md](data-encoding.en.md) |

> This table groups capabilities and does not map one-to-one to toolbox categories or provide additive subtotals. Shared components such as NTT serve multiple algorithm families. The authoritative total is the recursively deduplicated `ALL_BLOCK_TYPES` list.
