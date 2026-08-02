# CipherCat Primitive Completeness Audit Report

> [中文](./AUDIT-REPORT.md)
>
> Audit date: 2026-08-02 | Version: v3.0 (current-state reconciliation) | Previous: v2.0 (2026-07-18, pre-symmetric era)

## 1. Coverage Overview

**98 custom blocks + 27 function templates**, 13 categories (see [docs/blocks/INDEX.md](../blocks/INDEX.en.md) v2.1; `sm4_sbox` etc. added since):

| Category | Blocks | Assessment |
|----------|--------|------------|
| Symmetric (AES+SM4) | 6 | ✅ **Complete** (full AES + full SM4 rounds) |
| Modes + Padding | 6 | ✅ **Complete** (ECB/CBC/CTR + PKCS#7/Zero) |
| Hash (SHA-2/SM3/SHA-3/HMAC) | 18 | ✅ **Complete** (SHA-256/SHA-3/SM3/SHAKE/HMAC-SM3) |
| Post-quantum (ML-KEM) | 15 | ✅ **Strongest** (full primitives + official vectors) |
| Number theory | 17 | ✅ Solid (NTT/INTT/GF(2^m)/mod-inverse/mod-pow) |
| Bitwise + Logic | 11 | ✅ Excellent |
| Data + Encoding | 14 | ✅ Good |
| ECC | 5 | ⚠️ Curve ops complete, protocol wrappers pending |
| S-Box | 4 | ✅ Excellent (CSV custom) |
| Array / Control flow | 1+1 | Basic |
| Procedures | 5 | ✅ Templated (28 algorithm templates with prefilled chains) |

## 2. Coverage Assessment

### ✅ Fully covered (★ = new since v2.0)

- ★ **AES full rounds**: SubBytes/ShiftRows/MixColumns/AddRoundKey/KeyExpansion + full AES-128 enc/dec helpers inside `mode_*` blocks
- ★ **SM4 full rounds**: S-box (dedicated `sm4_sbox` block) / round function / key schedule + 32-round template
- ★ **Block modes**: ECB/CBC/CTR (atomic blocks + templates) + PKCS#7/Zero padding
- ★ **HMAC**: HMAC-SHA256 / HMAC-SM3 (JS/Python generators)
- ★ **KDF**: PBKDF2 / HKDF templates (PBKDF2 1000 rounds)
- ★ **ML-KEM one-click wrappers**: KeyGen / Encaps templates (FIPS 203 atomic chains)
- ★ **Official-vector verification**: SM4-Sbox (GM/T 0002) / SM3 (GB/T 32905) / SM2 point-mul (GB/T 32918.5) / ML-KEM-512 Encaps (FIPS 203) — PASS in both languages (`scripts/verify-demo.ts`)
- Existing: bitwise family / CSV S-box / SHA-256 / Keccak-SHA-3 sponge / SM3 pad+compress / SHAKE / modular arithmetic / NTT-INTT / ECC point ops / ML-KEM low-level primitives / type system

### ⚠️ Partially covered

| Primitive | Present | Missing |
|-----------|---------|---------|
| SHA-2 family | SHA-256 | SHA-224/384/512 |
| SHA-3 family | Keccak primitives + template | standalone SHA3-xxx wrapper blocks |
| ECC | curve ops | ECDH/ECDSA protocol wrappers |
| SM2 | point-mul / curve params (template) | signature / encryption / key-exchange wrappers |
| ZUC | — | LFSR / bit recombination / nonlinear F blocks |

### ❌ Missing (by priority)

| Priority | Primitive | Notes |
|----------|-----------|-------|
| **P0** | RSA | big-number + mod-pow ready; keygen/encrypt wrappers missing |
| P1 | AEAD family | ASCON (SP 800-232) / GCM atomization / CMAC / CCM / XTS (SP 800-38B/C/E docs only) |
| P1 | DRBG | SP 800-90A docs only, no blocks |
| P2 | Argon2 / BLAKE2 / SHA-1 / MD5 | textbook common, low priority |
| P3 | SM9 | bilinear pairing, extremely hard |

## 3. GM Standards (v3.0 status)

| Algorithm | Standard | v2.0 | v3.0 |
|-----------|----------|------|------|
| **SM3** | GM/T 0004 / GB/T 32905 | ✅ pad+compress | ✅ + HMAC-SM3 + one-click hash (template) |
| **SM4** | GM/T 0002 / GB/T 32907 | ❌ P0 | ✅ full rounds + 32-round template + official vector |
| **SM2** | GM/T 0003 / GB/T 32918 | ⚠️ composable | ⚠️ point-mul vector PASS; sig/enc/KEX pending |
| **ZUC** | GM/T 0001 / GB/T 33133 | ❌ | ❌ (stream cipher, hard) |
| **SM9** | GM/T 0044 / GB/T 38635 | ❌ | ❌ (bilinear pairing, extremely hard) |
| SM1 / SM7 | — | N/A | N/A (undisclosed algorithms) |

Domestic PQC: CAC post-quantum working group in progress; CipherCat's full ML-KEM primitives (lattice direction) will be largely reusable.

## 4. Roadmap Status


| Milestone | Planned blocks | Content | Status |
|-----------|------|---------|--------|
| **M1: Cleanup** | 71 | remove compound blocks, type-system consolidation | ✅ |
| **M2: Symmetric** | 85 | AES + SM4 + modes + padding | ✅ |
| **M3: Math+helpers** | 94 | mod-pow / GF(2^m) / HMAC | ✅ |
| **M4: Protocol wrappers** | 111 | ML-KEM wrappers / KDF / encoding | ✅ |
| **M5: Extensions** | ~130 | RSA / ZUC / ML-DSA / AEAD family | ⬜ pending |

## 5. Conclusion

- **v2.0's biggest gap (symmetric crypto) is closed**: AES/SM4/modes/padding/HMAC/KDF all present, with 4 core algorithms passing official test vectors in both languages.
- Strongest: full ML-KEM primitive set + official-vector verification (leading among visual programming platforms).
- Remaining gaps: RSA, protocol wrappers (ECDH/ECDSA/SM2), stream cipher (ZUC), AEAD family (ASCON/CMAC/CCM/XTS), DRBG — all P1/P2, not affecting the 90% teaching core.
