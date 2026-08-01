# CipherCat Crypto Primitive Implementation Plan

> [中文](./IMPLEMENTATION-PLAN.md)

> Version v2.0 | 2026-07-18 | Three-layer primitive system + complete milestones

## 1. Current Baseline

- **77 blocks** (76 active + 1 deprecated), 11 categories
- **Type system**: Bytes / IntList / Number / SBox (just established)
- **Post-quantum is strongest** (full ML-KEM primitive coverage), **symmetric ciphers are completely missing**

## 2. Three-Layer Primitive System

Pure atomic primitives would make users drag 20 blocks just to perform a single AES encryption. The three layers coexist; choose the granularity as needed:

```
Layer 3: one-click wrappers ── "drag it out and use it" (quick validation, demos)
    │                          ML-KEM.KeyGen, SM3.Hash, SM2.Sign
    │
Layer 2: convenience composites ── "one block = a set of atomic operations" (everyday use)
    │                              aes_round, sm4_round, sponge_duplex, md_iterate
    │
Layer 1: atomic primitives ── "smallest indivisible operations" (expert debugging, custom algorithms)
                              aes_sub_bytes, nt_mod_pow, pq_ntt, bit_xor
```

### Design Principles

| Principle | Description |
|------|------|
| **No new semantics** | Layer 2/3 blocks must be ordered compositions of Layer 1 atomic blocks; generators inline-expand them into atomic-block code |
| **Auditable** | Right-click menu "Expand to atomic blocks" for teaching/verification |
| **Non-exclusive** | Shown in the same toolbox area as atomic blocks, tagged 🔧 convenience block / ⚡ one-click block |
| **Degradable** | Users can always manually replace convenience blocks with atomic blocks |

### Convenience Block Expansion Example

```typescript
// aes_round（层2）生成器内联展开为 4 个原子块
// SubBytes(state) → ShiftRows → MixColumns → AddRoundKey(state, rk)
// 等于用户在画布上拖 4 个块的效果，但一个块搞定
```

### Estimated Block Count per Layer

| Layer | Block count | Typical blocks |
|----|------|--------|
| Layer 1 atomic | ~80 | sub_bytes, mod_pow, ntt, hmac |
| Layer 2 convenience | ~25 | aes_round, sm4_round, sponge_duplex, md_iterate |
| Layer 3 one-click | ~20 | ml_kem_keygen, sm3_hash, ecdsa_sign |

> Final total ~125 blocks; ~55 are new (Layer 1/2/3 atomic, convenience, and one-click), and the remaining 70 are existing blocks

## 3. Implementation Roadmap

### Stage 0: Cleanup + Type Enhancements (do first)

| # | Operation | Block change | Layer |
|---|------|--------|-----|
| 0a | **Remove 6 non-generic composite blocks**: `pq_atr_intt_add_e1`, `pq_tr_intt_add_e2_mu`, `pq_vec_compress_encode`, `pq_sample_ntt_mat`, `pq_cbd_ntt_vec`, `pq_build_vec3` | **-6** | — |
| 0b | **Add `TYPE_BITS`**: `block-types.ts` + `encoding.ts` (3 places) | 0 | — |
| 0c | **Rename sponge/Keccak blocks**: `hash_sha3_*`→`sponge_*`/`keccak_*` (5 blocks + migration + 2 test JSONs) | 0 | — |
| 0d | **Add `TYPE_MATRIX` `TYPE_VECTOR` labels** | 0 | — |
| 0e | **S-box `updateShape` stub cleanup** `blocks/sbox/sbox.ts` | 0 | — |

> After Stage 0: **71 blocks**, 7 types

---

### Stage 1: Symmetric Ciphers — Atomic Layer (Layer 1, ~3 days)

| # | Block | Category | Description | Type |
|---|------|------|------|------|
| 1.1 | `aes_sub_bytes` | `symmetric/aes/` | SubBytes: S-box substitution of 16 bytes | IntList→IntList |
| 1.2 | `aes_shift_rows` | `symmetric/aes/` | ShiftRows: rotate row i left by i bytes | IntList→IntList |
| 1.3 | `aes_mix_columns` | `symmetric/aes/` | MixColumns: GF(2⁸) column mixing | IntList→IntList |
| 1.4 | `aes_add_round_key` | `symmetric/aes/` | AddRoundKey: state ⊕ round key | IntList×2→IntList |
| 1.5 | `sm4_round_func` | `symmetric/sm4/` | Round function F(x0,x1,x2,x3,rk) | IntList×2→IntList |
| 1.6 | `sm4_linear_transform` | `symmetric/sm4/` | L(B)=B⊕(B<<<2)⊕(B<<<10)⊕(B<<<18)⊕(B<<<24) | IntList→IntList |
| 1.7 | `pad_pkcs7` | `symmetric/padding/` | PKCS#7 padding | Bytes→Bytes |
| 1.8 | `pad_zero` | `symmetric/padding/` | Zero padding | Bytes→Bytes |
| 1.9 | `gf_mul` | `numtheory/` | GF(2⁸) field multiplication | Number×2→Number |

> After Stage 1: 80 blocks (+9 atomic blocks)

---

### Stage 2: Symmetric Ciphers — Convenience Layer + Modes (Layer 2, ~3 days)

| # | Block | Category | Description | Underlying atomic expansion |
|---|------|------|------|------------|
| 2.1 | `aes_round` | `symmetric/aes/` | Full AES round | SubBytes→ShiftRows→MixColumns→AddRoundKey |
| 2.2 | `aes_last_round` | `symmetric/aes/` | AES final round (skips MixColumns) | SubBytes→ShiftRows→AddRoundKey |
| 2.3 | `aes_key_schedule` | `symmetric/aes/` | Full key expansion 128/192/256 | RotWord→SubWord→Rcon→loop |
| 2.4 | `sm4_round` | `symmetric/sm4/` | Full SM4 round (incl. key XOR) | sm4_round_func + xor |
| 2.5 | `sm4_key_schedule` | `symmetric/sm4/` | SM4 32-round key generation | linear transform→loop |
| 2.6 | `mode_ecb` | `symmetric/modes/` | ECB electronic codebook | — |
| 2.7 | `mode_cbc` | `symmetric/modes/` | CBC cipher block chaining | — |
| 2.8 | `mode_ctr` | `symmetric/modes/` | CTR counter mode | — |
| 2.9 | `mode_gcm` | `symmetric/modes/` | GCM authenticated encryption | — |

> After Stage 2: **89 blocks** (+9 convenience blocks + modes)

---

### Stage 2.5: Post-Quantum Ciphers — Convenience Layer (Layer 2, ~3 days)

Post-quantum currently has 17 Layer 1 atomic blocks (11 remain after M0 removes the 6 composite blocks); Layer 2 convenience blocks are missing.
Everything is aligned to the algorithm steps in FIPS 203 ML-KEM.

| # | Block | Description | Atomic expansion | FIPS 203 |
|---|------|------|---------|----------|
| 2.5.1 | `pq_ntt_vec` | Vector NTT: apply NTT to k polynomials | `ctrl_iterate`×k + `pq_ntt` | Alg 14 step 6 |
| 2.5.2 | `pq_intt_vec` | Vector INTT: apply INTT to k polynomials | `ctrl_iterate`×k + `pq_intt` | Alg 14 step 12 |
| 2.5.3 | `pq_cbd_ntt_vec` | CBD sampling+NTT: k CBD polynomials→NTT | `ctrl_iterate`×k + `pq_sample_poly_cbd` + `pq_ntt` | Alg 14 step 5-6 |
| 2.5.4 | `pq_mat_vec_mul_ntt` | NTT-domain matrix×vector: Âᵀ∘r̂ | double loop + `pq_ntt_mul` + `pq_poly_add` | Alg 14 step 8-9 |
| 2.5.5 | `pq_vec_add` | Vector element-wise addition | `ctrl_iterate`×k + `pq_poly_add` | Alg 14 step 10,12 |
| 2.5.6 | `pq_vec_sub` | Vector element-wise subtraction | `ctrl_iterate`×k + field subtraction | verification steps |
| 2.5.7 | `pq_sample_ntt_mat` | NTT-domain matrix generation (k×k, with k parameter) | double loop + `pq_sample_ntt` | Alg 14 step 4 |

> After Stage 2.5: **96 blocks** (+7 post-quantum convenience blocks)

| # | Block | Category | Layer | Description |
|---|------|------|----|------|
| 3.1 | `nt_mod` | `numtheory/` | 1 | Generic modulus a mod n |
| 3.2 | `nt_mod_pow` | `numtheory/` | 1 | Modular exponentiation a^b mod n |
| 3.3 | `nt_div_rem` | `numtheory/` | 1 | Integer division + remainder |
| 3.4 | `bn_add` | `numtheory/bignum/` | 1 | Big-number addition |
| 3.5 | `bn_sub` | `numtheory/bignum/` | 1 | Big-number subtraction |
| 3.6 | `bn_mul` | `numtheory/bignum/` | 1 | Big-number multiplication |
| 3.7 | `bn_div` | `numtheory/bignum/` | 1 | Big-number division |
| 3.8 | `hash_hmac` | `hash/` | 1 | HMAC (switchable SHA-256/SM3/SHA-3) |
| 3.9 | `md_iterate` | `hash/` | 2 | Merkle-Damgård iteration framework |
| 3.10 | `sponge_duplex` | `hash/` | 2 | Sponge duplex: absorb+squeeze in one step |

> After Stage 3: **106 blocks** (+10)

---

### Stage 4: One-Click Wrappers + Protocol Layer (Layer 3, ~4 days)

| # | Block | Category | Description |
|---|------|------|------|
| 4.1 | `ml_kem_keygen` | `post-quantum/` | ML-KEM key generation (one-click) |
| 4.2 | `ml_kem_encaps` | `post-quantum/` | ML-KEM encapsulation (one-click) |
| 4.3 | `ml_kem_decaps` | `post-quantum/` | ML-KEM decapsulation (one-click) |
| 4.4 | `ecdh_key_exchange` | `ecc/` | ECDH key exchange |
| 4.5 | `ecdsa_sign` | `ecc/` | ECDSA signing |
| 4.6 | `ecdsa_verify` | `ecc/` | ECDSA signature verification |
| 4.7 | `sm2_sign` | `ecc/` | SM2 digital signature |
| 4.8 | `sm2_encrypt` | `ecc/` | SM2 public-key encryption |
| 4.9 | `sm3_hash` | `hash/` | SM3 one-click hash |
| 4.10 | `sm3_hmac` | `hash/` | HMAC-SM3 |
| 4.11 | `hmac_sha256` | `hash/` | HMAC-SHA-256 |
| 4.12 | `kdf_pbkdf2` | `hash/` | PBKDF2 |
| 4.13 | `kdf_hkdf` | `hash/` | HKDF |
| 4.14 | `base64_encode` | `data/` | Base64 encoding |
| 4.15 | `base64_decode` | `data/` | Base64 decoding |
| 4.16 | `hex_to_bytes` | `data/` | Hex→Bytes |
| 4.17 | `bytes_to_hex` | `data/` | Bytes→Hex |
| 4.18 | `endian_swap` | `data/` | Big-endian/little-endian |

> After Stage 4: **124 blocks** (+18 one-click blocks)

---

### Stage 5: Extended Ecosystem (P2, on demand)

| # | Block | Description |
|---|------|------|
| 5.1 | `sha1_pad` / `sha1_compress` | SHA-1 |
| 5.2 | `sha3_224` / `sha3_256` / `sha3_384` / `sha3_512` | SHA3 one-click wrappers |
| 5.3 | Full ML-DSA suite | Post-quantum signatures (~10+ blocks) |
| 5.4 | `sbox_analyze` | S-box nonlinearity analysis |
| 5.5 | Full ZUC suite | SM (Chinese national standard) stream cipher (~5-8 blocks) |
| 5.6 | `blake2b` / `argon2_hash` | Modern hash functions |

> Final: **~130 blocks**

---

## 4. Directory Structure (after M4 completes)

```
src/blocks/
├── ctrl/                    # 控制流
├── data/                    # 数据转换（+base64 +hex +endian）
├── array/                   # 数组
├── logic/                   # 逻辑
├── bitwise/                 # 位运算
├── sbox/                    # S-box
├── symmetric/               # ⭐ 新建：对称密码
│   ├── aes/                 #   层1原子 + 层2便利
│   │   ├── subbytes.ts
│   │   ├── shiftrows.ts
│   │   ├── mixcolumns.ts
│   │   ├── addroundkey.ts
│   │   ├── round.ts         # 层2便利
│   │   ├── last-round.ts    # 层2便利
│   │   └── key-schedule.ts  # 层2便利
│   ├── sm4/
│   │   ├── round-func.ts    # 层1
│   │   ├── linear-transform.ts
│   │   ├── round.ts         # 层2便利
│   │   └── key-schedule.ts  # 层2便利
│   ├── modes/               # 层2便利（AES+SM4共用）
│   │   ├── ecb.ts
│   │   ├── cbc.ts
│   │   ├── ctr.ts
│   │   └── gcm.ts
│   └── padding/             # 层1
│       ├── pkcs7.ts
│       └── zero.ts
├── hash/                    # 哈希
│   ├── hmac.ts              # 层1
│   ├── md-iterate.ts        # 层2便利
│   ├── sponge-duplex.ts     # 层2便利
│   ├── sm3-hash.ts          # 层3一键
│   ├── sm3-hmac.ts          # 层3一键
│   ├── hmac-sha256.ts       # 层3一键
│   └── ...（现有 sha256/sm3/sha3/shake 不变）
├── numtheory/               # 数论
│   ├── mod.ts / mod-pow.ts / div-rem.ts / gf-mul.ts
│   └── bignum/
│       ├── add.ts / sub.ts / mul.ts / div.ts
├── ecc/                     # ECC（+ecdh +ecdsa +sm2）
├── post-quantum/            # 后量子（+ml_kem_* 一键块）
└── procedure/               # 函数封装
```

---

## 5. Type System (after completion)

```
TYPE_BYTES   = 'Bytes'     # 字节序列
TYPE_INT_LIST = 'IntList'  # 整数列表/多项式系数
TYPE_BITS    = 'Bits'      # 比特数组 {0,1}
TYPE_NUMBER  = 'Number'    # 标量
TYPE_SBOX    = 'SBox'      # S-box 查找表
TYPE_MATRIX  = 'Matrix'    # 矩阵标签
TYPE_VECTOR  = 'Vector'    # 向量标签（可选）
```

**All blocks must declare type constraints**; the runtime types produced by generator code must match the declarations.

---

## 6. Block Design Conventions

### Three-Layer Tagging

| Layer | Toolbox tag | Color offset | Right-click menu |
|----|-----------|---------|---------|
| 1 Atomic | None | Default color | — |
| 2 Convenience | 🔧 | Default color +15 | "Expand to atomic blocks" |
| 3 One-click | ⚡ | Default color +30 | "Expand to atomic blocks" |

### Naming

```
原子块:   <category>_<operation>        aes_sub_bytes, nt_mod_pow
便利块:   <category>_<composite>        aes_round, sm4_key_schedule
一键块:   <algorithm>_<action>           ml_kem_keygen, sm3_hash
文件:     kebab-case.ts
常量:     UPPER_SNAKE_CASE
```

### Structure Template

```typescript
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST } from '@/constants/block-types';

export const AES_BLOCK_TYPES = ['aes_sub_bytes', 'aes_round'] as const;
export type AesBlockType = (typeof AES_BLOCK_TYPES)[number];

// 层1：原子原语
Blockly.Blocks['aes_sub_bytes'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('SubBytes(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('AES SubBytes: S-box 替换 16 字节状态 (FIPS 197 §5.1.1)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

// 层2：便利组合（一个块 = SubBytes+ShiftRows+MixColumns+AddRoundKey）
Blockly.Blocks['aes_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('🔧 AES Round(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);  // 180 + 15
    this.setTooltip(
      'AES 完整轮: SubBytes→ShiftRows→MixColumns→AddRoundKey\n' +
      '右键可展开为 4 个原子块'
    );
  },
};
```

---

## 7. Migration Handling

| Change | Mapping needed | Complexity |
|------|---------|--------|
| Remove 6 composite blocks | None | ⚪ |
| `hash_sha3_*` → `sponge_*`/`keccak_*` | **5 mappings** | 🟢 |
| TYPE_BITS / TYPE_MATRIX | None (does not affect serialization) | ⚪ |
| All new blocks | None | ⚪ |

**Total: 5 mapping lines + 2 test JSON block-name updates.**

---

## 8. Milestones

| Milestone | Blocks | Core content | Layer |
|--------|------|---------|-----|
| **Current** | 77 | 11 categories | — |
| **M0: Cleanup** | 71 | Remove 6 blocks + TYPE_BITS + renames + TYPE_MATRIX + S-box cleanup | — |
| **M1: Symmetric atomic** | 80 | AES atomic (4) + SM4 atomic (2) + padding (2) + GF(2⁸) (1) | Layer 1 |
| **M2: Symmetric convenience** | 89 | aes_round/last_round/key_schedule + sm4_round/key_schedule + 4 modes | Layer 2 |
| **M2.5: Post-quantum convenience** | 96 | ntt_vec/intt_vec/cbd_ntt_vec/mat_vec_mul/vec_add/vec_sub/sample_ntt_mat | Layer 2 |
| **M3: Math + utilities** | 106 | mod/mod_pow/div_rem/bignum (4)/HMAC/md_iterate/sponge_duplex | Layers 1+2 |
| **M4: One-click wrappers** | 110 | ML-KEM (1) + hashing (3) + KDF (2) + encoding (5) | Layer 3 |
| **M5: Extensions** | ~140 | SHA-1/SHA3/ML-DSA/ZUC/BLAKE2 | On demand |

---

## 9. Documentation System

See `docs/README.md` for the full index.

Documentation updates per milestone:

| Milestone | Documentation updates |
|--------|---------|
| M0 | ARCHITECTURE.md, DEVELOPMENT.md |
| M1-M2 | ARCHITECTURE.md (symmetric category), DEVELOPMENT.md, add `fips197-AES/` + `gmt-0002-SM4/` |
| M3 | ARCHITECTURE.md (numtheory expansion) |
| M4 | ARCHITECTURE.md, `gmt-0003-SM2/` |
| M5 | On demand |

Suggested additions: `USAGE.md` (P1 user manual), `BLOCK-REFERENCE.md` (P1 block reference). `TYPE-SYSTEM.md` ✅ already created.

---

## 10. Algorithm Specifications and Standard Document Download Index

### International Standards

| Algorithm | Standard | Download link |
|------|--------|---------|
| **AES** | FIPS 197 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf |
| **SHA-256/SHA-2** | FIPS 180-4 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf |
| **SHA-3** | FIPS 202 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf |
| **SHAKE** | FIPS 202 (§6) | Same as above |
| **ML-KEM** | FIPS 203 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf |
| **ML-DSA** | FIPS 204 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.204.pdf |
| **SLH-DSA** | FIPS 205 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.205.pdf |
| **HMAC** | FIPS 198-1 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.198-1.pdf |
| **PBKDF2** | NIST SP 800-132 | https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf |
| **HKDF** | RFC 5869 | https://www.rfc-editor.org/rfc/rfc5869 |
| **RSA** | PKCS#1 v2.2 (RFC 8017) | https://www.rfc-editor.org/rfc/rfc8017 |
| **ECDSA** | FIPS 186-5 | https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.186-5.pdf |
| **EdDSA/Ed25519** | RFC 8032 | https://www.rfc-editor.org/rfc/rfc8032 |
| **X25519/X448** | RFC 7748 | https://www.rfc-editor.org/rfc/rfc7748 |
| **AES-GCM** | NIST SP 800-38D | https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf |
| **AES-CBC/CTR** | NIST SP 800-38A | https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38a.pdf |
| **DRBG** | NIST SP 800-90A | https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-90Ar1.pdf |
| **Base64** | RFC 4648 | https://www.rfc-editor.org/rfc/rfc4648 |
| **PKCS#7 padding** | RFC 2315 (§10.3) | https://www.rfc-editor.org/rfc/rfc2315#section-10.3 |

### Chinese National Cryptographic (SM) Standards

| Algorithm | Standard | Download link |
|------|--------|---------|
| **SM2** | GM/T 0003-2012 | http://www.gmbz.org.cn/main/viewfile/2018011001400692565.html |
| **SM3** | GM/T 0004-2012 | http://www.gmbz.org.cn/main/viewfile/2018011002383823521.html |
| **SM4** | GM/T 0002-2012 | http://www.gmbz.org.cn/main/viewfile/2018011001400692566.html |
| **ZUC** | GM/T 0001-2016 | http://www.gmbz.org.cn/ |
| **SM9** | GM/T 0044-2016 | http://www.gmbz.org.cn/ |
| SM standards master index | — | https://www.oscca.gov.cn/sca/xxgk/bzgf.shtml |

### Reference Implementations

| Algorithm | Language | Repository |
|------|------|------|
| AES/SHA/RSA | Python | `pip install pycryptodome` (PyCryptodome) |
| SM2/SM3/SM4 | Python | `pip install gmssl` (GmSSL) |
| SM2/SM3/SM4/ SM9/ZUC | C | https://github.com/guanzhi/GmSSL |
| ML-KEM/ML-DSA | C | https://github.com/pq-crystals (reference implementation) |
| ML-KEM/ML-DSA | Python | https://github.com/GiacomoPope/kyber-py |
| SHA-3/Keccak | Python | `hashlib` (Python standard library) |
| BLAKE2 | Python | `hashlib` (Python standard library) |

### Spec Documents Already Included

Already included under CipherCat `docs/`:
- `fips202-SHA3/` — detailed algorithm steps for SHA-3/Keccak/SHAKE
- `fips203-ML-KEM/` — ML-KEM parameters + algorithm steps + build guide
- `fips204-ML-DSA/` — ML-DSA parameters + algorithm steps

Suggested future additions:
- `fips197-AES/` — synced at Stage M1
- `gmt-0002-SM4/` — synced at Stage M1
- `gmt-0003-SM2/` — synced at Stage M4
