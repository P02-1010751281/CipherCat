# Block Overview and Evidence Entry Points


**Total**: 210 unique custom block types (29 template registrations; 3 overlap; 220 types after deduplication)

This page is the block-document overview. Its length does not represent capability weight. Every category detail page uses the same evidence path: normative source and structured entries describe the standard, the editor toolbox and code generators describe the blocks actually available, demo workspaces describe executable scope, and the coverage matrix records limits and missing evidence.

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
| Block ciphers, modes, and AEAD | [symmetric.md](symmetric.en.md) | FIPS 197, GB/T 32907, SP 800-38 series | the toolbox and AES/SM4/mode workspaces | Atomic rounds, modes, and selected vectors; complete interfaces are checked per algorithm/mode |
| Hash, XOF, and sponge | [hash.md](hash.en.md) | FIPS 180-4, FIPS 202, GB/T 32905, FIPS 198-1 | the toolbox and SHA/SM3/HMAC workspaces | Hash, XOF, HMAC, and selected hash-based PQ components; parameters and wrappers are checked individually |
| Classical public-key and elliptic-curve cryptography | [ecc-sbox.md](ecc-sbox.en.md), [numtheory.md](numtheory.en.md) | FIPS 186-5, RFC 5903/7748/8032, GB/T 32918/38635, RFC 8017 | the toolbox and signature/encryption workspaces | Selected curves, encodings, and protocol chains; not all parameter sets |
| Stream cipher | [zuc.md](zuc.en.md) | GB/T 33133 and the relevant 3GPP EEA3/EIA3 material | the toolbox and EEA3/EIA3 workspaces | ZUC keystream, EEA3 teaching chain, and EIA3 MAC vectors; no certification claim |
| Post-quantum cryptography | [post-quantum.md](post-quantum.en.md) | FIPS 203/204/205 and McEliece/Goppa references | the toolbox and ML-KEM/ML-DSA/SLH-DSA/code-based workspaces | Shared components, selected algorithm chains, and teaching primitives; no claim of all parameter sets or certification |
| Math, encoding, and shared components | [bitwise-logic.md](bitwise-logic.en.md), [data-encoding.md](data-encoding.en.md), [ecc-sbox.md](ecc-sbox.en.md), [numtheory.md](numtheory.en.md) | Relevant standards and the [coverage matrix](../standards/COVERAGE.en.md) | the toolbox and math/encoding workspaces | Composable components for multiple families, not a cryptosystem by themselves |

## What an evidence entry means

| Evidence layer | Entry | Supports | Does not support |
|----------------|-------|----------|------------------|
| Normative evidence | source, PDF, and structured entries in a standard directory | Standard definitions, formulas, pseudocode, and clause locations | Complete project implementation or certification |
| Implementation evidence | the editor toolbox and the category detail pages | Which blocks exist, their input/output semantics, and their code generation | All parameter sets, side-channel security, or formal certification |
| Executable evidence | demo workspaces and their registered basis | Sample inputs, vectors, properties, and fixed regressions | Production security, complete standard coverage, or backend assessment conclusions |
| Platform backend assessment report | platform backend task reports | Samples, parameters, results, and decision boundaries | Frontend pages, block existence, or a passing demo alone |

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
| GB/T 32907-2016 | Information security technology — SM4 block cipher algorithm | `gbt32907-SM4/` |
| GM/T 0002-2012 | SM4 block cipher algorithm (a separate industry-standard record; source text not included here) | — |
| GB/T 32905-2016 | Information security technology — SM3 cryptographic hash algorithm | `gbt32905-SM3/` |
| GM/T 0004-2012 | SM3 cryptographic hash algorithm (a separate industry-standard record; source text not included here) | — |
| GB/T 33133 | GB/T 33133 (ZUC) | `gbt33133-ZUC/` |
| NIST SP 800-38 | SP 800-38 (block modes) | — |
| RFC 5869 | RFC 5869 (HKDF) | — |
| NIST SP 800-38A | SP 800-38A (block modes) | `sp800-38a-modes/` |
| NIST SP 800-38D | SP 800-38D (GCM) | `sp800-38d-gcm/` |
| FIPS 198-1 | FIPS 198-1 (HMAC) | `fips198-1-hmac/` |
| FIPS 186-5 | FIPS 186-5 Digital Signature Standard (ECDSA, RSA key generation, and primality-test references) | `fips186-5-ecdsa/` |
| NIST SP 800-132 | SP 800-132 (PBKDF2) | `sp800-132-pbkdf2/` |
| SP 800-90A | SP 800-90A (DRBG) | `sp800-90a-drbg/` |
| SEC 2 | SEC 2 (ECC) | — |

The GB/T and GM/T entries are distinct standard records. The national standards information service lists them as related standards; that does not make their identifiers interchangeable, establish supersession, or make certification requirements automatically equivalent. This directory's SM4/SM3 source texts and structured extracts use GB/T 32907-2016 and GB/T 32905-2016, respectively. If a product-certification rule cites GM/T 0002 or GM/T 0004, verify the applicable edition and testing scope separately. See the official records: [GB/T 32907](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=7803DE42D3BC5E80B0C3E5D8E873D56A), [GM/T 0002](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=8B1827F22B99BB19E05397BE0A0AB44A), [GB/T 32905](https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=45B1A67F20F3BF339211C391E9278F5E), and [GM/T 0004](https://std.samr.gov.cn/hb/search/stdHBDetailed?id=8B1827F20133BB19E05397BE0A0AB44A).

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
