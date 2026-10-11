# FIPS 202 — 全算法索引

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 202 — SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions
      https://csrc.nist.gov/pubs/fips/202/final      (2015-08)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf

## KECCAK-p 参数

| b    | w  | l = log₂(b/25) | nr = 12+2l |
|------|:--:|:--------------:|:----------:|
| 25   | 1  | 0              | 12         |
| 50   | 2  | 1              | 14         |
| 100  | 4  | 2              | 16         |
| 200  | 8  | 3              | 18         |
| 400  | 16 | 4              | 20         |
| 800  | 32 | 5              | 22         |
| 1600 | 64 | 6              | 24         |

KECCAK-f[b] = KECCAK-p[b, 12+2l]  (e.g., KECCAK-f[1600] = KECCAK-p[1600, 24])

## SHA-3 / SHAKE 参数

| Function    | r (bits) | c (bits) | Output | Domain Suffix |
|------------|:--------:|:--------:|:------:|:------------:|
| SHA3-224   | 1152     | 448      | 224    | 01           |
| SHA3-256   | 1088     | 512      | 256    | 01           |
| SHA3-384   | 832      | 768      | 384    | 01           |
| SHA3-512   | 576      | 1024     | 512    | 01           |
| SHAKE128   | 1344     | 256      | arb.   | 1111         |
| SHAKE256   | 1088     | 512      | arb.   | 1111         |

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | — | **KECCAK-p 步映射** (§3.2) | | |
| 1 | `01-Theta.md` | θ(A) | 步映射 | `keccak_f` 内部 |
| 2 | `02-Rho.md` | ρ(A) | 步映射 | `keccak_f` 内部 |
| 3 | `03-Pi.md` | π(A) | 步映射 | `keccak_f` 内部 |
| 4 | `04-Chi.md` | χ(A) | 步映射 | `keccak_f` 内部 |
| 5 | `05-rc.md` | rc(t) | 轮常数 | `keccak_f` 内部 |
| 6 | `06-Iota.md` | ι(A, ir) | 步映射 | `keccak_f` 内部 |
| — | — | **KECCAK-p 置换** (§3.3) | | |
| 7 | `07-KECCAK-p.md` | KECCAK-p[b, nr](S) | 置换 | 部分：`keccak_f` 支持 KECCAK-f[200/400/800/1600]；海绵与 SHA-3/SHAKE 仍使用 [1600,24] |
| — | — | **海绵结构** (§4) | | |
| 8 | `08-SPONGE.md` | SPONGE[f, pad, r](N, d) | 海绵 | 部分：吸收/挤出阶段块，仅 KECCAK-f[1600] |
| 9 | `09-pad10star1.md` | pad10\*1(x, m) | 填充 | `hash_sha3_pad_text` · `hash_sha3_pad_hex` · `sponge_pad`（通用 rate/suffix 配置） |
| — | — | **SHA-3 定义** (§6) | | |
| — | `SHA3-functions.md` | SHA3-224/256/384/512 | 哈希 | 部分：四档有限端点回归，非完整官方测试集 |
| — | `SHAKE-functions.md` | SHAKE128/256 | XOF | 部分：`pq_xof`；rate−1 边界回归，非完整官方测试集 |
| — | — | **进制转换** (附录 B) | | |
| 10 | `10-h2b.md` | h2b(H, n) | hex→bits | — |
| 11 | `11-b2h.md` | b2h(S) | bits→hex | — |

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 202 — 全算法索引**，按标准条款拆分为 13 个结构化条目，覆盖 「§3.2.1」、「§3.2.2」、「§3.2.3」、「§3.2.4」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [Algorithm 1  θ(A)](./01-Theta.md) | §3.2.1 | 已实现（不代表完整标准覆盖） |
| [Algorithm 2  ρ(A)](./02-Rho.md) | §3.2.2 | 已实现（不代表完整标准覆盖） |
| [Algorithm 3  π(A)](./03-Pi.md) | §3.2.3 | 已实现（不代表完整标准覆盖） |
| [Algorithm 4  χ(A)](./04-Chi.md) | §3.2.4 | 已实现（不代表完整标准覆盖） |
| [Algorithm 5  rc(t)](./05-rc.md) | §3.2.5 | 已实现（不代表完整标准覆盖） |
| [Algorithm 6  ι(A, ir)](./06-Iota.md) | §3.2.5 | 已实现（不代表完整标准覆盖） |
| [Algorithm 7  KECCAK-p[b, nr](S)](./07-KECCAK-p.md) | §3.3 | 部分实现：Blockly `keccak_f` 支持 KECCAK-f[200/400/800/1600] 的规范轮数；未提供任意 KECCAK-p[b, nr] 参数接口，也未实现 25/50/100 位宽度 |
| [Algorithm 8  SPONGE[f, pad, r](N, d)](./08-SPONGE.md) | §4 | 部分实现：吸收/挤出阶段固定使用 KECCAK-f[1600]，挤出长度须为非负安全整数值且受运行时内存限制 |
| [Algorithm 9  pad10*1(x, m)](./09-pad10star1.md) | §5.1 | 已映射并有定向回归（不代表完整标准验证） |
| [Algorithm 10  h2b(H, n)](./10-h2b.md) | Appendix B | 仅参考（未映射为块实现） |
| [Algorithm 11  b2h(S)](./11-b2h.md) | Appendix B | 仅参考（未映射为块实现） |
| [SHA-3 Hash Functions (§6.1)](./SHA3-functions.md) | §6.1 | 工程实现覆盖 SHA3-224/256/384/512；目前为有限回归证据，不是完整官方测试集 |
| [SHA-3 XOFs (§6.2–6.3)](./SHAKE-functions.md) | §6.2–6.3 | 部分实现：SHAKE128/256 的 XOF 入口；置换限定为 KECCAK-f[1600]，尚无完整官方测试集证据 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `keccak_f`(200/18、400/20、800/22、1600/24；SHA-3/SHAKE 仍固定用 1600/24) | FIPS 202 §3.3；项目支持 `KECCAK-f[200/400/800/1600]`（18/20/22/24 轮），状态均为 25 个 `w` 位 lane；SHA-3/SHAKE 构造仍固定使用 `[1600,24]` | `keccak-block-contract.test.ts` 从真实 Blockly 块生成并运行 JavaScript/Python；四种宽度均比对 XKCP 全零状态向量，并拒绝错误 lane 数/越界 lane | 任意 `KECCAK-p[b,nr]`、25/50/100 位宽度、完整官方测试集或模块/产品正式验证 |
| `sponge_pad` | — | — | — |
| `sponge_absorb` | FIPS 202 海绵吸收阶段（与 `sponge_squeeze`、`keccak_f` 组合） | `sponge-absorb-contract.test.ts` 通过真实 Blockly 双语言执行吸收阶段；`procedures/ML-KEM-Encaps.json` 在完整 Encaps 链中使用该块 | 只覆盖吸收阶段的接口与列明样例；不单独构成哈希/XOF 端点或 FIPS 202 全量测试 |
| `sponge_squeeze` | FIPS 202 §4 的输出步骤；项目接口限定于 KECCAK-f[1600] 和可选速率，输出长度须为非负安全整数值 | `sponge-squeeze-contract.test.ts` 从真实 Blockly 块生成并执行双语言代码，检查 lane 字节序、整数值浮点长度接受，以及负数/小数长度拒绝 | 所有 rate、跨置换多块输出、完整官方测试集及模块验证 |
| `keccak_state_init` | FIPS 202 §4 海绵构造的初始 `b` 位零状态；项目默认状态为 25 个 64-bit lane | 同一 `keccak-block-contract.test.ts` 通过真实 Blockly 块执行 JavaScript/Python，断言恰好 25 个零 lane | 仅验证初始状态表示，不覆盖完整 Sponge 构造的全部输入长度或正式算法验证 |
| `sha3_hash` | FIPS 202 §6.1 SHA3-224/256/384/512；项目提供四档 SIZE 封装，置换为 KECCAK-f[1600] | `sha3-block-contract.test.ts` 从真实 Blockly 块生成并运行双语言代码，核对 `abc` 和各自 `rate−1` 字节输入的四档固定结果，并与 Node 原生 SHA-3 交叉核验 | 空消息、一般多块消息、更多边界、完整 NIST 官方测试集或算法/模块正式验证 |
| `pq_xof`(SHAKE-128/256) | FIPS 202 §6.2 SHAKE128/256；项目输出长度单位为字节，JS 使用项目 Keccak-f[1600]，Python 使用 `hashlib` | `shake-block-contract.test.ts` 从真实 Blockly 块生成并运行双语言代码；固定 `rate−1` 输出，并于 2026-10-03 增补空输入、3-byte 输入、整 rate 与 `rate+1` 输入，以及输出 17/32/`rate+1`/`2·rate+5` bytes 的边界回归；与 Node 原生 SHAKE 和 Python `hashlib` 对照 | 完整 NIST 官方测试集、其它运行环境或算法/模块正式验证 |

示例工作区：`demos/procedures/SHA3-Hash.json`；Procedure 模板：`proc_sponge_duplex（仅 squeeze 起始骨架；输出长度留空，不是 duplex）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
