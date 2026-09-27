# SHA-2 — 消息扩展原语
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | FIPS 180-4 §6.2.2、§6.4.2 |
| 原文证据 | [source：fips180-4-SHA2](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | SHA-256：[提取稿第 1052 行](./00-Standard-Source.md#L1052)；SHA-512：[第 1142 行](./00-Standard-Source.md#L1142) |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页拆出 FIPS 180-4 §6.2.2 和 §6.4.2 中的消息调度；说明性定位引文来自 source，完整上下文仍以 PDF 为准。


原件：[FIPS 180-4 PDF](./NIST.FIPS.180-4.pdf)。消息扩展目前由压缩块内部执行，没有独立 Blockly 块，因此单独记录为可核验算法阶段。

## 标准定义

SHA-224/SHA-256 和 SHA-384/SHA-512 分别使用 32-bit 与 64-bit 消息调度；每个分组的消息字先初始化，再按标准递推到完整调度长度。消息调度属于哈希压缩流程的规范组成部分，不能用最终摘要或项目 helper 摘要替代。

## 公式或伪代码

以下保留 SHA-256 与 SHA-512 的完整消息调度规范单元；字宽、轮数和取值范围均按标准保留。

```text
SHA-256 / SHA-224, for each message block M(i):
    W_t = M_t(i)                                             0 ≤ t ≤ 15
    W_t = σ1(256)(W_t−2) + W_t−7 + σ0(256)(W_t−15) + W_t−16  16 ≤ t ≤ 63

SHA-512 / SHA-384, for each message block M(i):
    W_t = M_t(i)                                             0 ≤ t ≤ 15
    W_t = σ1(512)(W_t−2) + W_t−7 + σ0(512)(W_t−15) + W_t−16  16 ≤ t ≤ 79
```

## 输入与输出

输入是按标准填充并解析的 512-bit 或 1024-bit 消息分组；输出是对应的 `W[0..63]` 或 `W[0..79]` 消息调度。加法分别在 `mod 2^32` 或 `mod 2^64` 下进行。

## SHA-224/SHA-256

每个 512-bit 分组先解析为 16 个 32-bit 大端字 `W[0..15]`，再计算：

```text
W[t] = σ1(W[t−2]) + W[t−7] + σ0(W[t−15]) + W[t−16] mod 2^32
σ0(x) = ROTR7(x) xor ROTR18(x) xor SHR3(x)
σ1(x) = ROTR17(x) xor ROTR19(x) xor SHR10(x)
```

得到 `W[0..63]` 后，按轮次与 `K[t]` 送入压缩函数。

## SHA-384/SHA-512

1024-bit 分组解析为 16 个 64-bit 字，扩展至 `W[0..79]`；旋转、移位、加法均在 64-bit 字宽内进行。不能用 32-bit 扩展公式替代。

## 项目映射

`hash_sha256_compress` 和 `hash_sha512_compress` 的输入已经是压缩阶段所需的链状态/消息字；扩展过程封装在生成器中。若需要逐字验证，应使用标准向量或独立实现交叉验证，而不是只检查最终摘要。
## 核验与缺项

应逐字核验 SHA-256/512 的初始化范围、递推范围和字宽；项目当前将扩展封装在压缩路径中，没有独立 Blockly 块。

## 原文摘录

> 以下片段分别对应 SHA-256 和 SHA-512 的标准消息调度定义；仅删除分页控制符，未修正提取稿中的数学字形。

```text
6.2.2 SHA-256 Hash Computation
The SHA-256 hash computation uses functions and constants previously defined in Sec. 4.1.2
and Sec. 4.2.2, respectively. Addition (+) is performed modulo 2^32.
Each message block, M(1), M(2), …, M(N), is processed in order, using the following steps:

For i=1 to N:
{
  1. Prepare the message schedule, {Wt}:
       Wt = Mt(i)                                      0 ≤ t ≤ 15
       Wt = σ1{256}(Wt−2) + Wt−7 + σ0{256}(Wt−15) + Wt−16  16 ≤ t ≤ 63
  2. Initialize a, b, c, d, e, f, g, and h with H0(i−1), …, H7(i−1).
  3. For t=0 to 63:
     {
       T1 = h + Σ1{256}(e) + Ch(e,f,g) + Kt{256} + Wt
       T2 = Σ0{256}(a) + Maj(a,b,c)
       h=g; g=f; f=e; e=d+T1; d=c; c=b; b=a; a=T1+T2
     }
  4. Compute H0(i)=a+H0(i−1), …, H7(i)=h+H7(i−1).
}

6.4.2 SHA-512 Hash Computation
The SHA-512 hash computation uses functions and constants previously defined in Sec. 4.1.3
and Sec. 4.2.3, respectively. Addition (+) is performed modulo 2^64.
Each message block, M(1), M(2), …, M(N), is processed in order, using the following steps:

For i=1 to N:
{
  1. Prepare the message schedule, {Wt}:
       Wt = Mt(i)                                      0 ≤ t ≤ 15
       Wt = σ1{512}(Wt−2) + Wt−7 + σ0{512}(Wt−15) + Wt−16  16 ≤ t ≤ 79
  2. Initialize a, b, c, d, e, f, g, and h with H0(i−1), …, H7(i−1).
  3. For t=0 to 79:
     {
       T1 = h + Σ1{512}(e) + Ch(e,f,g) + Kt{512} + Wt
       T2 = Σ0{512}(a) + Maj(a,b,c)
       h=g; g=f; f=e; e=d+T1; d=c; c=b; b=a; a=T1+T2
     }
  4. Compute H0(i)=a+H0(i−1), …, H7(i)=h+H7(i−1).
}
```
