# 积木块标准依据参考


**版本**: 2.13 | **日期**: 2026-08-03 | **总块数**: 134（另有 28 个函数模板）

## 图例

| 符号 | 含义 |
|------|------|
| **层** | 1-原子原语 / 2-便利组合 / 3-一键封装 |
| **连接形式** | `value(→)` 输出块 / `stmt(→→)` 语句块 |
| **类型** | 输入→输出 setCheck/setOutput 类型 |

## 标准映射

|| 标准号 | 简称 | 文档目录 |
|--------|------|---------|
|| FIPS 197 | FIPS 197 (AES) | `fips197-AES/` |
|| FIPS 180-4 | FIPS 180-4 (SHA-2) | `fips180-4-SHA2/` |
|| FIPS 202 | FIPS 202 (SHA-3) | `fips202-SHA3/` |
|| FIPS 203 | FIPS 203 (ML-KEM) | `fips203-ML-KEM/` |
|| FIPS 204 | FIPS 204 (ML-DSA) | `fips204-ML-DSA/` |
|| GM/T 0002 | GB/T 32907 (SM4) | `gbt32907-SM4/` |
|| GM/T 0004 | GB/T 32905 (SM3) | `gbt32905-SM3/` |
|| GB/T 33133 | GB/T 33133 (ZUC) | `gbt33133-ZUC/` |
|| NIST SP 800-38 | SP 800-38 (分组模式) | — |
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

## 按类目（2026-08-03 浏览器实测，工具箱 17 类目）

| 工具箱类目 | 块数 | 文档 |
|------|------|------|
| 控制流编排 | 12 | — |
| 基础变量 / 基础数学 / 数组空间 / 逻辑运算单元 | Blockly 原生 | — |
| 数据处理与转换 | 20 | [data-encoding.md](data-encoding.md) |
| 位运算单元 | 8 | [bitwise-logic.md](bitwise-logic.md) |
| 非线性运算单元（S-Box） | 4 | [ecc-sbox.md](ecc-sbox.md) |
| 哈希与填充单元 | 22 | [hash.md](hash.md) |
| 对称密码 | 18 | [symmetric.md](symmetric.md) |
| 数论与密钥推导单元 | 15 | [numtheory.md](numtheory.md) |
| 椭圆曲线运算单元 | 19 | [ecc-sbox.md](ecc-sbox.md) |
| 祖冲之序列密码 | 6 | [zuc.md](zuc.md) |
| 后量子基础块 | 9 | [post-quantum.md](post-quantum.md) |
| 后量子高级块 | 4 | [post-quantum.md](post-quantum.md) |
| 函数封装空间 | 3+（28 模板） | — |
| Crypto Templates | 动态（Manager 添加后） | — |
| 函数封装 | [ecc-sbox.md](ecc-sbox.md) | 5 |

> 注：NTT 变换块（`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_ntt_butterfly`）在「数论 + 大数」与「后量子」文档中各列一次，去重后合计 134 个自定义积木块（见 `src/blocks/index.ts` 的 `ALL_BLOCK_TYPES`）。2026-08-02 新增：ZUC 6 块 + CMAC/CCM/XTS/GCM/X25519/ASCON/HKDF/PBKDF2（SP 800-38B/C/D/E + RFC 7748/5869/8018 + SP 800-232）+ **签名/KDF/DRBG 族**：EdDSA 2（RFC 8032）、ECDSA 2（RFC 6979 确定性）、SM2 签名 2（GB/T 32918.2）、ML-DSA 2（FIPS 204）、SM9 4（GB/T 38635.2）、DRBG 1（SP 800-90A HMAC-DRBG）、Argon2 1（RFC 9106）、国密 RNG 1（GM/T 0103 框架 + SM3-HMAC-DRBG 实例化）；**RSA 5 块**（FIPS 186-4 密钥生成 + PKCS#1 v1.5 加解密/签名，RFC 8017，cryptography 交叉验证）——standards 缺口全部清零。
