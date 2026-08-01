# CipherCat 积木块标准依据参考

**版本**: 2.1 | **日期**: 2026-07-30 | **总块数**: 98（另有 27 个函数模板）

## 图例

| 符号 | 含义 |
|------|------|
| **层** | 1-原子原语 / 2-便利组合 / 3-一键封装 |
| **连接形式** | `value(→)` 输出块 / `stmt(→→)` 语句块 |
| **类型** | 输入→输出 setCheck/setOutput 类型 |

## 标准映射

| 标准号 | 简称 | 文档目录 |
|--------|------|---------|
| FIPS 197 | FIPS 197 (AES) | `fips197-AES/` |
| FIPS 180-4 | FIPS 180-4 (SHA-2) | `fips180-4-SHA2/` |
| FIPS 202 | FIPS 202 (SHA-3) | `fips202-SHA3/` |
| FIPS 203 | FIPS 203 (ML-KEM) | `fips203-ML-KEM/` |
| FIPS 204 | FIPS 204 (ML-DSA) | `fips204-ML-DSA/` |
| GM/T 0002 | GB/T 32907 (SM4) | `gbt32907-SM4/` |
| GM/T 0004 | GB/T 32905 (SM3) | `gbt32905-SM3/` |
| NIST SP 800-38 | SP 800-38 (分组模式) | — |
| RFC 4648 | RFC 4648 (Base64) | — |
| RFC 2315 | RFC 2315 (PKCS#7) | — |
| RFC 5869 | RFC 5869 (HKDF) | — |
| NIST SP 800-38A | SP 800-38A (分组模式) | `sp800-38a-modes/` |
| NIST SP 800-38D | SP 800-38D (GCM) | `sp800-38d-gcm/` |
| FIPS 198-1 | FIPS 198-1 (HMAC) | `fips198-1-hmac/` |
| FIPS 186-5 | FIPS 186-5 (ECDSA) | `fips186-5-ecdsa/` |
| NIST SP 800-132 | SP 800-132 (PBKDF2) | `sp800-132-pbkdf2/` |
| RFC 2315 | RFC 2315 (PKCS#7) | `rfc2315-pkcs7/` |
| RFC 4648 | RFC 4648 (Base64) | `rfc4648-base64/` |
| SP 800-90A | SP 800-90A (DRBG) | `sp800-90a-drbg/` |
| SEC 2 | SEC 2 (ECC) | — |

## 按类目

| 类目 | 文档 | 块数 |
|------|------|------|
| 对称密码 (AES+SM4) | [symmetric.md](symmetric.md) | 6 |
| 模式 + 填充 | [symmetric.md](symmetric.md) | 6 |
| 哈希 (SHA-2/SM3/SHA-3/HMAC) | [hash.md](hash.md) | 18 |
| 后量子 (ML-KEM) | [post-quantum.md](post-quantum.md) | 15 |
| 数论 + 大数 | [numtheory.md](numtheory.md) | 17 |
| 位运算 + 逻辑 | [bitwise-logic.md](bitwise-logic.md) | 11 |
| 数据 + 编码 | [data-encoding.md](data-encoding.md) | 14 |
| ECC | [ecc-sbox.md](ecc-sbox.md) | 5 |
| S-Box | [ecc-sbox.md](ecc-sbox.md) | 4 |
| 数组 | — | 1 |
| 控制流 | — | 1 |
| 函数封装 | [ecc-sbox.md](ecc-sbox.md) | 5 |

> 注：NTT 变换块（`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_ntt_butterfly`）在「数论 + 大数」与「后量子」文档中各列一次，去重后合计 98 个自定义积木块（见 `src/blocks/index.ts` 的 `ALL_BLOCK_TYPES`）。
