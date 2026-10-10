# 后量子密码块参考 (ML-KEM + ML-DSA)

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的后量子密码分类详情页。这里的“后量子”按密码体制分类，不把采样、哈希、NTT、多项式和编码等公共构件误写成独立方案。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [FIPS 203 ML-KEM](../standards/fips203-ML-KEM/)、[FIPS 204 ML-DSA](../standards/fips204-ML-DSA/)、[FIPS 205 SLH-DSA](../standards/fips205-SLH-DSA/)、[McEliece/Goppa 参考](../standards/mceliece-goppa/)、[标准覆盖矩阵](../standards/COVERAGE.md) |
| 实现 | 工具箱中的后量子积木与对应代码生成器 |
| 示例工作区 | [Demo 指南](../guides/DEMO.md)、ML-KEM / ML-DSA / SLH-DSA / FORS / Goppa 工作区 |
| 边界 | 公共原语、选定参数和教学链分别标记；不宣称全部参数族、完整认证实现、抗侧信道或正式后量子安全证明 |

> SLH-DSA/FORS 当前工作区中的哈希基结构仅用于教学演示，尚非 FIPS 205 兼容实现；缺口见 [FIPS 205 说明](../standards/fips205-SLH-DSA/README.md)。


## FIPS 204 ML-DSA 签名

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `mldsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | ML-DSA-44 签名（FIPS 204）：sk 2560B + msg → 签名 2420B（确定性，rnd=0 空 ctx）；仓库回归取官方 ACVP ML-DSA-44 确定性用例（tgId=1 的 tcId 5、8，共 2 例），非完整 ACVP 验证或认证 |
| `mldsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | ML-DSA-44 验签：pk 1312B + msg + sig → true/false |

## FIPS 203 编码/压缩 (§4.2.1)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|----------|
| `pq_bytes_to_bits` | 1 | value(→) | Bytes→Bits | Alg 4；按每字节最低有效位优先展开；输入元素须为 0–255 的整数值 |
| `pq_bits_to_bytes` | 1 | value(→) | Bits→Bytes | Alg 3；按每字节最低有效位优先打包；比特数须为 8 的倍数且元素只能为 0 或 1 |
| `pq_byte_encode` | 1 | value(→) | IntList→Bytes | Alg 5 |
| `pq_byte_decode` | 1 | value(→) | Bytes→IntList | Alg 6 |
| `pq_compress` | 1 | value(→) | IntList→IntList | §4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展 |
| `pq_decompress` | 1 | value(→) | IntList→IntList | §4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展 |
| `pq_byte_concat` | 1 | value(→) | Bytes&Bytes→Bytes | — |
| `pq_bytes_slice` | 1 | value(→) | Bytes&Number&Number→Bytes | 取 `[start, end)` 区间 |
| `pq_seed_with_nonce` | 1 | value(→) | Bytes&Number→Bytes | 把单字节 nonce 拼到 seed 之后 |

`pq_compress` 与 `pq_decompress` 都处理整数列表，不是字节编码块。FIPS 203 §4.2.1 的参数范围为 `1≤d<12`；当前额外提供的 `d=12` 仅为项目数学扩展，不属于该标准压缩算法的参数集，不能据此宣称符合性。

## 后量子采样原语

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|----------|
| `pq_sample_ntt` | 1 | value(→) | Bytes→IntList | q=3329 对应 FIPS 203 Alg 7；q=8380417 对应 FIPS 204 Alg 30；实现固定吸收 768 字节，仍需对照完整采样规范核验 |
| `pq_sample_poly_cbd` | 1 | value(→) | Bytes→IntList | q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合 |

## NTT / INTT 变换

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|---|---|---|---|---|
| `pq_ntt` | 1 | value(→) | IntList→IntList | 固定 256 系数：q=3329 为 ML-KEM，q=8380417 为 ML-DSA，q=12289 为 256 点循环 NTT 教学分支 |
| `pq_intt` | 1 | value(→) | IntList→IntList | 逆变换；`n=256` 且输入 256 系数；q=12289 分支与教学 NTT 互逆 |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | 两输入均需 256 项；q=3329 half-NTT，q=8380417 逐点乘 |
| `pq_ntt_butterfly` | 1 | value(→) | Number&Number&Number→IntList | 单次蝶形运算，输出两个结果系数；模数、CT/GS 为下拉 |

> q=12289 变换仅用于展示循环 NTT，不表示 NewHope 或其他标准算法；该教学参数没有对应的 NTT 域乘法块。

> 位/字节转换按标准域校验；JS 接受整数值并返回 `Uint8Array`，Python 接受整数及整数值浮点数并返回 `bytes`。整数值浮点数（如 `1.0`）在两种生成语言中按对应整数处理。


## FIPS 204 ML-DSA 签名原语（原子化，可拼装）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pq_power2round` | 1 | value(→) | IntList→IntList | `Power2Round_d`，输入为 256 个 `[0,q)` 系数（q=8380417），d=13 固定；输出 r1 或 r0 向量（FIPS 204 Algorithm 35） |
| `pq_decompose` | 1 | value(→) | IntList→IntList | 输入为 256 个 `[0,q)` 系数（q=8380417）；`Decompose` 固定 γ₂=95232，输出 r1 或 r0 向量（Algorithm 36） |
| `pq_make_hint` | 1 | value(→) | IntList&IntList→IntList | 输入两个 256 项 `[0,q)` 系数向量（q=8380417）；逐项计算 0/1 hint（Algorithm 39） |
| `pq_use_hint` | 1 | value(→) | IntList&IntList→IntList | 输入 256 项 0/1 hint 向量和 256 项 `[0,q)` 系数向量（q=8380417），逐项重建高位部分（Algorithm 40） |
| `pq_sample_in_ball` | 1 | value(→) | Bytes→IntList | 输入 32 字节 seed；`SampleInBall`，固定 ML-DSA-44 的 τ=39（FIPS 204 Alg 29） |

> `pq_power2round`、`pq_decompose`、`pq_make_hint`、`pq_use_hint` 与 `pq_sample_in_ball` 复用 ML-DSA 签名/验签路径中的共享实现。现有直接断言以参数/拒绝边界和输出长度为主；尚未证明 `SampleInBall` 的 τ-稀疏性质或上述各原语的完整官方向量，不能视为完整 ML-DSA 符合性证明。

## 通用阈值辅助块（非 FIPS 算法）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pq_rej_sample` | 1 | value(→) | Number&Number→Number | 若调用者提供的 `X < BOUND` 则返回 X，否则返回 -1；只做阈值判断，不生成样本或重试，不是 FIPS 204 `RejBoundedPoly`（Algorithm 31） |
