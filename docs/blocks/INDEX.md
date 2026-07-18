# CipherCat 积木块标准依据参考

**版本**: 2.0 | **日期**: 2026-07-18 | **总块数**: ~110

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
| GM/T 0002 | GM/T 0002 (SM4) | `gmt-0002-SM4/` |
| GM/T 0004 | GM/T 0004 (SM3) | `gmt-0004-SM3/` |
| NIST SP 800-38 | SP 800-38 (分组模式) | — |
| RFC 4648 | RFC 4648 (Base64) | — |
| RFC 2315 | RFC 2315 (PKCS#7) | — |
| RFC 5869 | RFC 5869 (HKDF) | — |
| SEC 2 | SEC 2 (ECC) | — |

## 按类目

| 类目 | 文档 | 块数 |
|------|------|------|
| 对称密码 (AES+SM4) | [symmetric.md](symmetric.md) | ~15 |
| 模式 + 填充 | [symmetric.md](symmetric.md) | 6 |
| 哈希 (SHA/SM3/Keccak) | [hash.md](hash.md) | ~17 |
| 后量子 (ML-KEM) | [post-quantum.md](post-quantum.md) | ~18 |
| 数论 + 大数 | [numtheory.md](numtheory.md) | ~14 |
| 位运算 + 逻辑 | [bitwise-logic.md](bitwise-logic.md) | ~11 |
| 数据 + 编码 | [data-encoding.md](data-encoding.md) | ~15 |
| ECC + S-Box | [ecc-sbox.md](ecc-sbox.md) | ~9 |
| 控制流 + 函数 | [ctrl-procedure.md](ctrl-procedure.md) | ~6 |
