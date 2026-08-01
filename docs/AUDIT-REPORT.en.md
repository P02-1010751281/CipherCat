# CipherCat Crypto Primitive Completeness Audit

> [中文](./AUDIT-REPORT.md)

> Audit date: 2026-07-18 | Version: v2.0 (includes Chinese national standard (GM) special section)

## 1. Current Coverage Overview

**77 blocks** (76 active + 1 deprecated), distributed across 11 categories:

| Category | Block count | Coverage rating |
|----------|-------------|-----------------|
| Control flow (ctrl) | 1 | Basic |
| Data & conversion (data) | 9 | Good |
| Arrays (array) | 1 | Basic |
| Logic operations (logic) | 3 | Good |
| Bitwise operations (bitwise) | 8 | **Excellent** |
| S-box (sbox) | 4 | **Excellent** (customizable via CSV) |
| Hash (hash) | 17 | **Excellent** (SHA-256/SHA-3/SM3/SHAKE) |
| Number theory (numtheory) | 7 | **Solid** (NTT/INTT/field operations/modular inverse) |
| Elliptic curves (ecc) | 5 | Complete set of basic curve operations |
| Post-quantum (post-quantum) | 17 | **Strongest area** (full ML-KEM low-level coverage) |
| Function wrappers (procedure) | 5 | New, template-based |

## 2. Coverage Assessment

### ✅ Fully Covered

- Full bitwise family (AND/OR/XOR/NOT/shift/rotate/invert/byte substitution)
- Customizable S-box (CSV import/export + variable system)
- SHA-256 padding + compression function
- Keccak/SHA-3 sponge structure (state/padding/Keccak-f/absorb/squeeze)
- **SM3 padding + compression function** ✅
- SHAKE XOF/PRF
- Modular arithmetic (Z_q) / modular inverse
- NTT/INTT (supports Kyber q=3329)
- ECC curve point operations (load/double/add/scalar multiply)
- Full ML-KEM low-level suite (BytesToBits/ByteEncode/Compress/SampleNTT/CBD, etc.)
- Type constraint system (Bytes/IntList/SBox + TYPE_MAP)

### ⚠️ Partially Covered

| Primitive | Present | Missing |
|-----------|---------|---------|
| SHA-2 family | SHA-256 | SHA-224/384/512 |
| SHA-3 family | Keccak primitive blocks | One-click SHA3-xxx wrappers |
| Message padding | Hash padding | Block cipher padding (PKCS#7) |
| ECC | Curve operations | ECDH/ECDSA protocol wrappers |
| ML-KEM | All low-level primitives | One-click KeyGen/Encaps/Decaps |
| SM2 | ECC basics | Signature/encryption/key exchange wrappers |
| **SM4** | Generic S-box + bitwise operations | Dedicated round function/key schedule/encryption/decryption |
| SM3 | Complete pad + compress | One-click full hash + HMAC-SM3 |

### ❌ Completely Missing (by priority)

#### International Standard Gaps

| Priority | Primitive | Importance | Difficulty | Notes |
|----------|-----------|------------|------------|-------|
| **P0** | AES block cipher | Very high | Medium | Top priority for cryptography teaching |
| **P0** | Block cipher modes (ECB/CBC/CTR) | Very high | Medium | Cannot teach without modes |
| **P0** | Padding schemes (PKCS#7) | Very high | Low | Required by AES |
| **P0** | HMAC | High | Low | The most basic MAC |
| **P0** | RSA | High | Medium | Core of public-key cryptography |
| **P0** | Big integer arithmetic | High | Medium | Underpins RSA |
| P1 | ECDH/ECDSA wrappers | High | Low | ECC foundation already present |
| P1 | ML-KEM one-click wrapper | High | Medium | All low-level primitives present |
| P1 | PBKDF2/HKDF | High | Low | KDF basics |
| P1 | Base64 | Medium | Low | Common encoding |
| P1 | Hex ↔ Bytes | Medium | Low | Common conversion |
| P1 | SHA-1 | Medium | Low | Common in textbooks |
| P1 | Big/little-endian conversion | Medium | Low | Common in algorithms |
| P2 | BLAKE2/BLAKE3 | Medium | Medium | — |
| P2 | Argon2 | Medium | Medium | — |
| P2 | SHA-224/384/512 | Low | Low | SHA-256 already present |
| P2 | SHA3-xxx wrappers | Low | Low | Keccak already present |
| P2 | ML-DSA (Dilithium) | Medium | High | — |
| P2 | GF(2ⁿ) field operations | Medium | Medium | Needed by AES |
| P2 | CMAC/Poly1305 | Low | Medium | — |
| P2 | DRBG | Medium | Medium | — |
| P2 | MD5 | Low | Low | — |

#### Chinese National Standard (GM) Gaps

| Priority | Algorithm | Standard | New blocks needed | Dependencies | Difficulty |
|----------|-----------|----------|-------------------|--------------|------------|
| **P0** | **SM4** | GM/T 0002 | Round function, key schedule, encryption/decryption, ECB/CBC/CTR | Existing generic S-box + bitwise operations + loop control | Medium |
| **P1** | **SM2** | GM/T 0003 | Sign/verify, encryption/decryption, key exchange, KDF(SM3) | Existing generic ECC primitives + SM3 | High |
| **P1** | SM3-HMAC | GM/T 0004 extension | Dedicated HMAC-SM3 block | Existing SM3 pad + compress | Low |
| **P1** | SM3 one-click hash | GM/T 0004 | pad+compress combination block | Already present | Low |
| P2 | ZUC | GM/T 0001 | LFSR, bit reorganization, nonlinear function F | Requires fully new implementation | High |
| P3 | SM9 | GM/T 0044 | Bilinear pairing, identity-based signature/encryption/key exchange | Requires fully new implementation | Very high |
| — | SM1 | — | **Not implementable** (algorithm not public) | — | — |
| — | SM7 | — | **Not implementable** (algorithm not public) | — | — |

## 3. Chinese National Standard (GM) Special Analysis

### SM3 (GM/T 0004-2012) — ✅ Fully Covered

| Block name | Function | Rating |
|------------|----------|--------|
| `hash_sm3_pad` | Message padding (1\|\|0*\|\|64-bit length) | Standard implementation |
| `hash_sm3_pad_text` | UTF-8 text padding | — |
| `hash_sm3_pad_hex` | Hexadecimal padding | — |
| `hash_sm3_compress` | 64-round compression function (FF0/FF1, GG0/GG1, P0, P1, message expansion W/W', constants Tj) | Complete implementation |

**Missing**: one-click full hash block, dedicated HMAC-SM3 block.

### SM4 (GM/T 0002-2012) — ❌ No dedicated blocks, promoted to P0

SM4 is the Chinese commercial block cipher standard (128-bit block, 128-bit key, 32 rounds):

| Component | CipherCat existing support | To be added |
|-----------|----------------------------|-------------|
| S-box (16×16 fixed permutation) | ✅ Generic `sbox` block + `test/SM4轮密钥生成.json` contains the SM4 S-box | Reusable as-is |
| Linear transformation L(B) | ✅ Composable from `bit_rotate_left` + `bit_operation` | Dedicated block recommended |
| Round function F | ✅ All low-level primitives present | Needs dedicated wrapper block |
| Key schedule | ✅ CK/FK parameters available via `data_value` | Needs dedicated wrapper block |
| Encryption/decryption | — | To be added |
| Block cipher modes | — | To be added (ECB/CBC/CTR/GCM) |

**Historical note**: `crypto_sm4_sbox_sub` → `sbox_sub` in `migration.ts` shows that an older version had a dedicated SM4 S-box substitution block, which was merged into the generic S-box framework.

### SM2 (GM/T 0003-2012) — ⚠️ Composable Implementation

| Protocol | Blocks needed | Notes |
|----------|---------------|-------|
| Curve parameters | SM2-specific parameter preset block | Generic `ecc_load_curve_params` exists; needs preset p/a/b/G/n |
| Digital signature | Sign block + verify block | Needs SM3 hash + random number k + modular inverse |
| Public-key encryption | Encrypt block + decrypt block | Needs KDF(SM3) + SM3 hash |
| Key exchange | Key exchange block | Needs KDF(SM3) + two-party interaction |

### ZUC (GM/T 0001-2016) — ❌ Completely Missing

ZUC is a stream cipher containing an LFSR (16 stages of 31-bit), bit reorganization (BR), and a nonlinear function F (with S-boxes). Requires a fully new implementation; high difficulty.

### SM9 (GM/T 0044-2016) — ❌ Completely Missing

Identity-based cryptography based on bilinear pairings, including digital signatures, key exchange, and public-key encryption. Requires bilinear pairing operations (Weil/Tate pairing); very high implementation difficulty.

### Domestic Post-Quantum Cryptography Standardization Progress

- Working Group on Post-Quantum Cryptography Standardization of the Chinese Association for Cryptologic Research (established 2022)
- **As of mid-2026**: no official standard published yet
- Candidate directions: lattice-based and code-based
- CipherCat already has the full ML-KEM (FIPS 203) primitive suite, which aligns with the lattice-based direction and can be heavily reused at that point

## 4. Suggested Roadmap (Updated)

See [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md) for the detailed implementation plan.

### Milestone Overview

| Milestone | Block count | Contents | Status |
|-----------|-------------|----------|--------|
| **Current** | 77 | 11 categories, ML-KEM strongest, symmetric ciphers missing | ✅ |
| **M1: Cleanup** | 71 | Remove 6 composite blocks + TYPE_BITS + rename sponge blocks + TYPE_MATRIX | ⬜ |
| **M2: Symmetric ciphers** | 85 | AES(5) + SM4(3) + modes(4) + padding(2) = **+14** | ⬜ |
| **M3: Math + helpers** | 94 | Mod/repeated-squaring mod/div-rem/bigint(4)/HMAC/GF(2⁸) = **+9** | ⬜ |
| **M4: Protocol wrappers** | 111 | ML-KEM wrappers(3) + ECDH/ECDSA(3) + SM2(2) + KDF(2) + SM3-HMAC(2) + encoding(5) = **+17** | ⬜ |
| **M5: Extensions** | ~130 | SHA-1/BLAKE2/ML-DSA/ZUC on demand | ⬜ |

## 5. Core Conclusions

CipherCat is the strongest domestic visual programming platform in **post-quantum cryptography (ML-KEM)** and **Keccak/SHA-3 sponge structure**. SM3 coverage is complete, and the number theory foundation and ECC curve operations are solid.

**Symmetric cryptography is the biggest gap** — missing on both tracks:
- International track: no AES (top priority for cryptography teaching)
- Chinese national standard track: no SM4 (core Chinese commercial cryptography standard)

Adding AES + SM4 + block cipher modes + padding + HMAC + RSA would cover 90% of core cryptography course teaching needs, while satisfying both international and Chinese national standard teaching requirements.
