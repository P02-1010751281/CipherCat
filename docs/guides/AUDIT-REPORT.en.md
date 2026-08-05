# Primitive Completeness Audit Report

>
> Audit date: 2026-08-02 | Version: v3.0 (current-state reconciliation) | Previous: v2.0 (2026-07-18, pre-symmetric era)
>
> Counts last refreshed: 2026-08-05 (139 blocks + 29 templates, recursive expansion of `ALL_BLOCK_TYPES`).

## 1. Coverage Overview

**139 custom blocks + 29 function templates**, 17 toolbox categories (15 custom block categories + Function Wrapping + Crypto Templates; includes 4 Blockly native categories — Variables/Math/Arrays/Logic):

| Toolbox Category | Blocks | Assessment |
|----------|--------|------------|
| Control Flow | 12 | ✅ Basic (ctrl_iterate loop + native) |
| Data & Conversion | 20 | ✅ Good (bytes/bits/encoding/seed) |
| Bitwise | 8 | ✅ Excellent |
| Logic | 3 | Blockly native |
| S-Box | 4 | ✅ Excellent (CSV custom + 4 presets: AES/SM4/ZUC S0/S1) |
| Hash & Padding | 31 | ✅ **Complete** (SHA-256/SHA-3/SM3/SHAKE/HMAC/KDF family) |
| Symmetric Cipher | 18 | ✅ **Complete** (AES/SM4 full rounds + modes + CMAC/CCM/XTS/GCM/ASCON) |
| Number Theory & KDF | 37 | ✅ (NTT/GF(2^m)/mod-inverse/mod-pow/RSA/DRBG/Argon2) |
| Elliptic Curve | 19 | ✅ **Complete** (point ops + EdDSA/ECDSA/SM2 sig+enc + SM9 + ECDH + X25519) |
| ZUC Stream Cipher | 6 | ✅ (GB/T 33133 official vectors) |
| Post-Quantum Basic | 10 | ✅ (ML-KEM bottom + ML-DSA bottom) |
| Post-Quantum Advanced | 9 | ✅ (ML-KEM/ML-DSA top) |
| Arrays / Math / Variables | — | Blockly native categories |
| Function Wrapping | 3+ | ✅ Templated (29 algorithm templates with prefilled chains) |
| Crypto Templates | dynamic | ✅ (appears after Manager add) |

## 2. Coverage Assessment

### ✅ Fully covered (★ = new since v2.0)

- ★ **AES full rounds**: SubBytes/ShiftRows/MixColumns/AddRoundKey/KeyExpansion + full AES-128 enc/dec helpers inside `mode_*` blocks
- ★ **SM4 full rounds**: S-box (dedicated `sm4_sbox` block) / round function / key schedule + 32-round template
- ★ **Block modes**: ECB/CBC/CTR (atomic blocks + templates) + PKCS#7/Zero padding
- ★ **HMAC**: HMAC-SHA256 / HMAC-SM3 (JS/Python generators)
- ★ **KDF**: PBKDF2 (atomic `pbkdf2`, HASH dropdown SHA-256 official vectors + SM3 国密 iso, cross-language) / HKDF (atomic `hkdf`, RFC 5869 §A.1 official vectors); templates retained
- ★ **ML-KEM one-click wrappers**: KeyGen / Encaps templates (FIPS 203 atomic chains)
- ★ **Official-vector verification**: SM4-Sbox (GM/T 0002) / SM3 (GB/T 32905) / SM2 point-mul (GB/T 32918.5) / ML-KEM-512 Encaps (FIPS 203) — PASS in both languages (`scripts/verify-demo.ts` harness)
- Existing: bitwise family / CSV S-box / SHA-256 / Keccak-SHA-3 sponge / SM3 pad+compress / SHAKE / modular arithmetic / NTT-INTT / ECC point ops / ML-KEM low-level primitives / type system
- **Post-2026-08-02 batch (signature/KDF/DRBG family)**: EdDSA (RFC 8032), ECDSA (RFC 6979 deterministic P-256), SM2 signature (GB/T 32918.2), ML-DSA (FIPS 204 ACVP 30/30), SM9 4 blocks (GB/T 38635.2 bilinear pairing), DRBG (SP 800-90A CAVP 480 cases), Argon2 (RFC 9106), 国密 RNG (GM/T 0103 + SM3-HMAC-DRBG) — all official vectors, both languages
- **RSA closure (2026-08-02)**: 5 blocks (FIPS 186-4 keygen + PKCS#1 v1.5 enc/dec/sign), cryptography cross-validation — **standards gap fully closed**
- **PQC math foundations (2026-08-03)**: ML-DSA signature primitives (FIPS 204), hash-based structure blocks (SPHINCS+), coding-theory basics, multivariate + GF(2^m), LLL/Berlekamp-Massey/discrete Gaussian
- **Full algorithm-level batch (2026-08-04)**: FORS signature (FIPS 205 §8), GF(2^m) coefficient polynomials, Goppa Patterson decoding, PQC gap fills (`pq_rej_sample`/`pq_poly_mul`/`slh_adrs_full`/`wots_checksum`), Merkle auth path + FORS leaf index

### ⚠️ Partially covered

| Primitive | Present | Missing |
|-----------|---------|---------|
| SHA-2 family | SHA-256/384/512 (sha512 64-bit core) | SHA-224 (low priority, sha256 core reusable) |
| SHA-3 family | Keccak primitives + template + standalone `sha3_hash` (224-512) | — |
| ECC | curve ops + ECDH (RFC 5903 P-256, 2026-08-03) + SM2 enc | — |
| SM2 | point-mul / curve params (template) + sign/verify (`sm2_sign`/`sm2_verify`) + enc/dec (`sm2_encrypt`/`sm2_decrypt`) | key-exchange wrapper |
| ZUC | S0/S1 atomic + L1/L2 + nonlinear F + `zuc_keystream` | templated assembly |

### ❌ Missing (by priority)

| Priority | Primitive | Notes |
|----------|-----------|-------|
| P3 | Falcon full signature | FIPS 206, the only open complete-algorithm-level item (large; block-vs-blackbox form to be decided per user preference) |
| P2 | SHA-224 / SM2-KEX | low priority |
| P2 | SHA-1 / MD5 | textbook common, low priority |

## 3. GM Standards (v3.0 status)

| Algorithm | Standard | v2.0 | v3.0 |
|-----------|----------|------|------|
| **SM3** | GM/T 0004 / GB/T 32905 | ✅ pad+compress | ✅ + HMAC-SM3 + one-click hash (template) |
| **SM4** | GM/T 0002 / GB/T 32907 | ❌ P0 | ✅ full rounds + 32-round template + official vector |
| **SM2** | GM/T 0003 / GB/T 32918 | ⚠️ composable | ✅ point-mul + sign/verify (`sm2_sign`/`sm2_verify`, GB/T 32918.2 Appendix A vectors) + enc/dec (`sm2_encrypt`/`sm2_decrypt`, GB/T 32918.4); KEX pending |
| **ZUC** | GM/T 0001 / GB/T 33133 | ❌ | ✅ S0/S1/L1/L2/F atomic + `zuc_keystream` (official vectors both languages), template assembly pending |
| **SM9** | GM/T 0044 / GB/T 38635 | ❌ | ✅ 4 blocks (`sm9_master_key`/`sm9_user_key`/`sm9_sign`/`sm9_verify`, GB/T 38635.2 official vectors, BN curve R-ate pairing) |
| SM1 / SM7 | — | N/A | N/A (undisclosed algorithms) |

Domestic PQC: CAC post-quantum working group in progress; The full ML-KEM primitive set (lattice direction) will be largely reusable.

## 4. Roadmap Status

| Milestone | Planned blocks | Content | Status |
|-----------|------|---------|--------|
| **M1: Cleanup** | 71 | remove compound blocks, type-system consolidation | ✅ |
| **M2: Symmetric** | 85 | AES + SM4 + modes + padding | ✅ |
| **M3: Math+helpers** | 94 | mod-pow / GF(2^m) / HMAC | ✅ |
| **M4: Protocol wrappers** | 111 | ML-KEM wrappers / KDF / encoding | ✅ |
| **M5: Extensions** | ~130 | RSA / ZUC / ML-DSA / AEAD family | ✅ complete (139 blocks; standards gaps fully closed) |

## 5. Conclusion

- **v2.0's biggest gap (symmetric crypto) is closed**: AES/SM4/modes/padding/HMAC/KDF all present, with 4 core algorithms passing official test vectors in both languages.
- Strongest: full ML-KEM primitive set + official-vector verification (leading among visual programming platforms).
- **Standards gaps fully closed**: protocol wrappers closed 2026-08-03 (ECDH P-256 RFC 5903 §8.1 vectors + cryptography cross-check; SM2 enc/dec GB/T 32918.4 Appendix A vectors); RSA closed 2026-08-02 (5 blocks, cryptography cross-validated); signature/KDF/DRBG family closed 2026-08-02; AEAD family (CMAC/CCM/XTS/GCM/ASCON) + X25519/HKDF/PBKDF2 closed 2026-08-02 — all official vectors both languages.
- Remaining: Falcon full signature (FIPS 206, sole open complete-algorithm-level item), SHA-224 / SM2-KEX (low priority).
