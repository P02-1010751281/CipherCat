# PQC 数学基础缺口清单（教学研究全覆盖，2026-08-04 盘点）

## 背景

教学研究用途，PQC 四大类尽可能全覆盖。现有 136 块：格基 ML-KEM/DSA 主线闭环（官方向量 PASS），其余三类仅通用数学层就位。本文为补全批次输入，按"数学基础 → 结构块 → 算法 demo + 官方向量"顺序实施。

## 现有底数（可复用）

有限域 `nt_field_add`/`gf2m_mul`/`nt_mod_inverse`/`nt_mod_pow`、单变量多项式 `pq_poly_add/sub`、NTT 域 `pq_ntt/intt/ntt_mul/butterfly`、`pq_mat_vec_mul`、采样（CBD/NTT/seed+nonce/PRF/XOF）、压缩编码（`pq_compress`/`byte_*`/`bits_*`/`bytes_slice`/`concat`）、哈希（SHA-2/3/SHAKE/SM3/HMAC）、位运算、ECC 全套（含 x25519/ecdh/ecdsa/eddsa/sm2/sm9）、对称密码（AES/SM4/ZUC/ASCON/CCM/GCM/XTS/CMAC）、RSA/DRBG/GM-RNG/HKDF/PBKDF2/Argon2、数据转换（hex/base64/endian）。

## 缺口矩阵

### 1. 格基（ML-KEM/DSA ✅，研究扩展）

| 块 | 用途 | 优先级 |
|---|---|---|
| ML-DSA 签名原语：power2round / decompose / hint / sample_in_ball | 签名原子化（现 mldsa_sign 内嵌黑盒） | 🔴 |
| rejection sampling（均匀采样） | ML-DSA 采样 | 🟡 |
| 模 8380417 域运算（现 mod_pow 下拉 3329/12289/65537/1e9） | ML-DSA q | 🟡 |
| 普通多项式乘法/求值（非 NTT 域） | 环 R_q 教学演示 | 🟡 |
| Gaussian 采样 | Falcon/FN-DSA、NTRU | 🟡 |
| 格约减 LLL/BKZ | 格困难性研究 | 🟡 |
| 向量内积/点积、poly 乘标量 | 通用 | 🟢 |

### 2. 哈希基（整层缺失）

| 块 | 用途 | 优先级 |
|---|---|---|
| Merkle 树（叶子哈希/节点组合/根） | 树签名核心 | 🔴 |
| 哈希链（WOTS+ 迭代） | WOTS+ 一次性签名 | 🔴 |
| FORS（森林签名） | SLH-DSA | 🔴 |
| ADRS 地址扩展（SHAKE 域分隔） | SLH-DSA 地址函数 | 🟡 |
| WOTS+ 校验和、树索引编码 | 结构件 | 🟡 |

### 3. 编码基（算法层缺失）

| 块 | 用途 | 优先级 |
|---|---|---|
| GF(2^m) 多项式运算（乘/除/欧几里得） | Goppa 码构造 | 🔴 |
| 二进制矩阵运算（GF(2) 乘/转置/秩/求逆） | 生成/校验矩阵 | 🔴 |
| Goppa 码（生成多项式/校验矩阵/syndrome） | McEliece 核心 | 🔴 |
| Berlekamp-Massey / 欧几里得译码 | 纠错译码 | 🟡 |
| 汉明重量/距离 | 编码理论 | 🟢 |

### 4. 多变量

| 块 | 用途 | 优先级 |
|---|---|---|
| 多元多项式（求值/加/乘） | MQ 系统教学 | 🟡 |
| 线性方程组/高斯消元 | 油醋结构、研究基础 | 🟡 |
| 矩阵求逆/行列式 | 通用 | 🟡 |
| GF(2^m) 加法/平方/求逆（现只有乘法） | 完整域运算 | 🟡 |

### 5. 同源（研究价值）

| 块 | 用途 | 优先级 |
|---|---|---|
| 同源计算 / 类数 CM | 后量子前沿 | 🟢 |

### 6. 通用数学（跨类）

| 块 | 用途 | 优先级 |
|---|---|---|
| 多项式 GCD/欧几里得（含扩展） | 编码基 + 数论 | 🔴 |
| 一般矩阵乘法 | 通用线性代数 | 🟡 |
| 组合数/二项式 | CBD 教学 | 🟢 |

## 实施建议

- 🔴 梯队补完 = NIST 三大标准（ML-KEM ✅/ML-DSA/SLH-DSA）+ McEliece 全部可原子链拼装
- 批次顺序建议：① ML-DSA 签名原语（4 块，复用现有 NTT/CBD）→ ② 哈希基（Merkle 树/哈希链/FORS，复用 SHAKE）→ ③ 编码基（GF(2^m) 多项式/二进制矩阵/Goppa，复用 gf2m）→ ④ 多变量/通用数学
- 每批按现有模式：块定义 + JS/Python 双生成器 + 注册 + 官方向量 harness（verify-demo 44/44 基线不回归）+ sync-to-metacrypt 镜像 + vitest
