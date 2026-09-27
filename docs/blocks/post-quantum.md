# 后量子密码块参考 (ML-KEM + ML-DSA)

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的后量子密码分类详情页。这里的“后量子”按密码体制分类，不把采样、哈希、NTT、多项式和编码等公共构件误写成独立方案。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [FIPS 203 ML-KEM](../standards/fips203-ML-KEM/)、[FIPS 204 ML-DSA](../standards/fips204-ML-DSA/)、[FIPS 205 SLH-DSA](../standards/fips205-SLH-DSA/)、[McEliece/Goppa 参考](../standards/mceliece-goppa/)、[标准覆盖矩阵](../standards/COVERAGE.md) |
| 实现 | `src/blocks/post-quantum/`、`src/blocks/mldsa/`、`src/blocks/hash/` 中被明确复用的公共构件 |
| Demo 与测试 | [Demo 指南](../guides/DEMO.md)、[Demo 测试登记](../../demos/tests.json)、ML-KEM/ML-DSA/SLH-DSA/FORS/Goppa 工作区 |
| 边界 | 公共原语、选定参数和教学链分别标记；不宣称全部参数族、完整认证实现、抗侧信道或正式后量子安全证明 |


## FIPS 204 ML-DSA 签名

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `mldsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ML-DSA-44 签名（FIPS 204）：sk 2560B + msg → 签名 2420B（确定性，rnd=0 空 ctx）；NIST ACVP 30/30 双语言通过 |
| `mldsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ML-DSA-44 验签：pk 1312B + msg + sig → true/false |

## FIPS 203 编码/压缩 (§4.2.1)

| 块 | 层 | 连接 | 输入→输出 | FIPS 203 |
|----|----|------|----------|----------|
| `pq_bytes_to_bits` | 1 | value(→) | Bytes→Bits | Alg 4 |
| `pq_bits_to_bytes` | 1 | value(→) | Bits→Bytes | Alg 3 |
| `pq_byte_encode` | 1 | value(→) | IntList→Bytes | Alg 5 |
| `pq_byte_decode` | 1 | value(→) | Bytes→IntList | Alg 6 |
| `pq_compress` | 1 | value(→) | IntList→Bytes | §4.2.1 |
| `pq_decompress` | 1 | value(→) | Bytes→IntList | §4.2.1 |
| `pq_byte_concat` | 1 | value(→) | Bytes&Bytes→Bytes | — |
| `pq_bytes_slice` | 1 | value(→) | Bytes→Bytes | — |
| `pq_seed_with_nonce` | 1 | value(→) | Bytes→Bytes | — |

## FIPS 203 采样 (§4.2.2)

| 块 | 层 | 连接 | 输入→输出 | FIPS 203 |
|----|----|------|----------|----------|
| `pq_sample_ntt` | 1 | value(→) | Bytes→IntList | Alg 7 |
| `pq_sample_poly_cbd` | 1 | value(→) | Bytes→IntList | Alg 8 |

## FIPS 203 NTT 变换 (§4.3)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `pq_ntt` | 1 | value(→) | IntList→IntList | NTT（3329/8380417/12289，FIPS 204 分支 ζ=1753） |
| `pq_intt` | 1 | value(→) | IntList→IntList | INTT（FIPS 204 分支 × 256⁻¹） |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | NTT 域乘法（8380417 逐点乘） |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |


## FIPS 204 ML-DSA 签名原语（原子化，可拼装）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pq_power2round` | 1 | value(→) | Number&Number→IntList | 中心化 2¹³ 分解（r1/r0）——公钥 t1/t0 |
| `pq_decompose` | 1 | value(→) | Number&Number→IntList | 中心化 2γ₂ 分解（γ₂=95232）——签名 w1/w0 |
| `pq_make_hint` | 1 | value(→) | Number&Number→Number | hint 位（签名端舍入差异） |
| `pq_use_hint` | 1 | value(→) | Number&Number&Number→Number | hint 修复 r1（验证端重建 w1'） |
| `pq_sample_in_ball` | 1 | value(→) | IntList→IntList | SHAKE256 采样恰 τ=39 个 ±1 挑战多项式 |
| `pq_rej_sample` | 1 | value(→) | Number&Number→Number | 拒绝采样：X < BOUND 接受，否则 -1（RejBounded 单值版） |

> 原语复用 `mldsa_sign/verify` 内嵌闭包（同源一致）；性质向量：P2R 可逆、UseHint(MakeHint) 定理、InBall 39 个 ±1、Rej 边界排他。
