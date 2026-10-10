# SHA-3 XOFs (§6.2–6.3)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # SHA-3 XOFs (§6.2–6.3) |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1167)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现：SHAKE128/256 的 XOF 入口；置换限定为 KECCAK-f[1600]，尚无完整官方测试集证据 |

## 原文定位与引用

> 本页按 source 中的“# SHA-3 XOFs (§6.2–6.3)”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1167) 与同目录 PDF。


## 标准定义

SHAKE128、SHAKE256 以及 RawSHAKE128、RawSHAKE256 是基于 `KECCAK[c]` 的可扩展输出函数；输出长度 `d` 由调用方提供，域分离后缀不能与 SHA-3 哈希后缀混用。

## 公式或伪代码

```text
SHAKE128(M, d) = KECCAK[256] (M || 1111, d)
SHAKE256(M, d) = KECCAK[512] (M || 1111, d)

RawSHAKE128(J, d) = KECCAK[256] (J || 11, d)
RawSHAKE256(J, d) = KECCAK[512] (J || 11, d)
SHAKE128(M, d) = RawSHAKE128(M || 11, d)
SHAKE256(M, d) = RawSHAKE256(M || 11, d)
N = J || 11 = M || 11 || 11
```

上面的公式完整覆盖 §6.2–§6.3 的函数定义；额外的 `pad10*1` 比特由 `KECCAK[c]` 执行。

## 输入与输出

标准输入是任意位长消息 `M`（以及 RawSHAKE 的 `J`）和输出长度 `d`；输出是恰好 `d` bit 的字符串。SHAKE128 使用容量 256 bit，SHAKE256 使用容量 512 bit。标准允许实现限定消息长度支持范围。

项目 `pq_xof` 与 `pq_prf` 使用字节表示输入，只覆盖字节对齐的消息，不支持任意位长 bit string；两块的 `outLen` 参数按**字节数**解释，不是标准记号 `d` 的 bit 数，并要求非负安全整数值。为方便 Blockly 输入，字符串按 UTF-8 编码；数组元素必须是数值上为整数的 `0..255` 字节（因此 `1.0` 可接受，布尔值、稀疏槽位及其他值拒绝），JavaScript/Python 行为一致。

## SHAKE128 / SHAKE256

给定消息 M 和输出长度 d, 两个 SHA-3 可扩展输出函数通过追加 4-bit 后缀定义:

```
SHAKE128(M, d) = KECCAK[256](M ‖ 1111, d)
SHAKE256(M, d) = KECCAK[512](M ‖ 1111, d)
```

### 参数

| Function  | r (bits) | c (bits) | Rate Bytes |
|-----------|:--------:|:--------:|:----------:|
| SHAKE128  | 1344     | 256      | 168        |
| SHAKE256  | 1088     | 512      | 136        |

### 域分离

后缀 `1111` (bits) 区别于 SHA-3 的 `01`。在 pad10*1 编码中表现为 suffix `0x1F`。

### 在 ML-KEM (FIPS 203) 中的用途

| 用途 | XOF/PRF | 说明 |
|------|---------|------|
| SampleNTT (`pq_sample_ntt`) | SHAKE128 | 拒绝采样生成 NTT 域多项式 (rate=168) |
| SamplePolyCBD (`pq_sample_poly_cbd`) | SHAKE256 (PRF) | CBD 噪声采样, 读 64·η 字节 (rate=136) |

### RawSHAKE (备选定义, §6.3)

```
RawSHAKE128(J, d) = KECCAK[256](J ‖ 11, d)
RawSHAKE256(J, d) = KECCAK[512](J ‖ 11, d)
SHAKE128(M, d) = RawSHAKE128(M ‖ 11, d)
SHAKE256(M, d) = RawSHAKE256(M ‖ 11, d)
```

即 `SHAKE(M) = RawSHAKE(M ‖ 11)`，追加了额外的域分离后缀扩展。

### 块实现

- `pq_xof` — SHAKE128/256 XOF；输入为字节对齐消息，项目以字节数作为 `outLen`。
- `pq_prf` — 项目接口计算 `SHAKE(seed || nonce-byte, outLen-bytes)`，seed 按 UTF-8 字符串或严格 byte 数组解释，nonce 限定为 `0..255`。只有 seed 恰为 32 byte、输出长度为 `64·η` byte 且算法选择 SHAKE256 时，调用才匹配 ML-KEM 的 `PRFη`：FIPS 203 §4.1 式 (4.3) 定义为 `SHAKE256(s ‖ b, 8·64·η)`；其他 seed/output 参数及 SHAKE128 选项均是项目扩展，不是标准 `PRFη`。见 [FIPS 203 原文 §4.1](../fips203-ML-KEM/00-Standard-Source.md#L1159)。

## 项目映射

`pq_xof` 映射到本页 SHAKE 定义；`pq_prf` 的 SHAKE 基元映射到本页，ML-KEM `PRFη` 的拼接和 nonce 语义另见 FIPS 203 §4.1 式 (4.3)。项目测试 [shake-block-contract.test.ts](../../../tests/unit/shake-block-contract.test.ts) 通过真实 Blockly 块生成并运行 JavaScript/Python 代码，固定 SHAKE128/256 在 `rate−1` 输入边界的 XOF/PRF 输出，并检查输出长度、nonce 边界、整数值字节数组及非法/稀疏数组拒绝。固定输出是独立 Python `hashlib` 参考回归值，不是 NIST 官方向量或 ACVP 全量测试。

## 核验与缺项

尚缺完整 NIST 官方向量/ACVP 测试集、任意 bit-length 输入支持、空消息与常规/跨 rate 多块消息的系统覆盖，以及所有目标环境验证；该块级测试不证明 FIPS 202 算法验证或产品认证。完整标准上下文见下方 source 摘录。
## 原文摘录

> 以下为 00-Standard-Source.md 的说明性定位引文；仅规范化了空白和分页换行，完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L1167)。

```text
6.2 SHA-3 Extendable-Output Functions
Given a message M, the two SHA-3 XOFs, SHAKE128 and SHAKE256, are defined from the
KECCAK[c] function specified in Sec. 5.2 by appending a four-bit suffix to M, for any output
length d:

SHAKE128(M, d) = KECCAK[256] (M || 1111, d);
SHAKE256(M, d) = KECCAK[512] (M || 1111, d).

6.3 Alternate Definitions of SHA-3 Extendable-Output Functions
RawSHAKE128(J, d) = KECCAK[256] (J || 11, d);
RawSHAKE256(J, d) = KECCAK[512] (J || 11, d).
SHAKE128(M, d) = RawSHAKE128 (M || 11, d);
SHAKE256(M, d) = RawSHAKE256 (M || 11, d).
```
