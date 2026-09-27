# SHA-3 XOFs (§6.2–6.3)
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | # SHA-3 XOFs (§6.2–6.3) |
| 原文证据 | [source：fips202-SHA3](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿定位](./00-Standard-Source.md#L1167)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

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

输入是消息 `M`（以及 RawSHAKE 的 `J`）和输出长度 `d`；输出是恰好 `d` bit 的字符串。SHAKE128 使用容量 256 bit，SHAKE256 使用容量 512 bit。

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

- `pq_xof` — XOF(seed, outLen) 默认 SHAKE128, 可选 SHAKE256
- `pq_prf` — PRF(seed, nonce, outLen) 默认 SHAKE256, 可选 SHAKE128

## 项目映射

`pq_xof` 和 `pq_prf` 是项目中用于后量子流程的调用入口；本页不把它们等同于 SHAKE 的完整标准认证。

## 核验与缺项

应核对 SHAKE 两个 suffix、RawSHAKE 等价关系、输出长度、空消息和多块消息向量；完整标准上下文见下方 source 摘录。
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
