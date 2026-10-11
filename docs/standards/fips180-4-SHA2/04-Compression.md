# SHA-2 — 压缩函数原语
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | FIPS 180-4 §6.2.2、§6.4.2 |
| 原文证据 | [source：fips180-4-SHA2](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | SHA-256：[提取稿第 1052 行](./00-Standard-Source.md#L1052)；SHA-512：[第 1142 行](./00-Standard-Source.md#L1142) |
| 项目状态 | 仅参考（未映射为块实现） |

## 原文定位与引用

> 本页拆出 FIPS 180-4 §6.2.2 和 §6.4.2 的工作变量更新与链值加回；说明性定位引文来自 source，完整上下文仍以 PDF 为准。


原件：[FIPS 180-4 PDF](./NIST.FIPS.180-4.pdf)。

## 标准定义

SHA-224/SHA-256 与 SHA-384/SHA-512 对每个消息分组执行完整工作变量更新，并将工作变量按标准加回中间哈希值。两条路径结构相同，但字宽、轮数、常量和函数族不同。

## 公式或伪代码

SHA-224/SHA-256 使用八个工作字 `(a,b,c,d,e,f,g,h)` 运行 64 轮：

```text
For each message block M(i):
    initialize (a,b,c,d,e,f,g,h) = (H0(i−1),H1(i−1),H2(i−1),H3(i−1),
                                     H4(i−1),H5(i−1),H6(i−1),H7(i−1))
    for t = 0..63 (SHA-224/SHA-256) or t = 0..79 (SHA-384/SHA-512):
        T1 = h + Σ1(e) + Ch(e,f,g) + K[t] + W[t]
        T2 = Σ0(a) + Maj(a,b,c)
        h = g; g = f; f = e; e = d + T1
        d = c; c = b; b = a; a = T1 + T2
    H0(i) = a + H0(i−1); H1(i) = b + H1(i−1)
    H2(i) = c + H2(i−1); H3(i) = d + H3(i−1)
    H4(i) = e + H4(i−1); H5(i) = f + H5(i−1)
    H6(i) = g + H6(i−1); H7(i) = h + H7(i−1)
```

`+` is modulo `2^32` for SHA-224/SHA-256 and modulo `2^64` for SHA-384/SHA-512.

## 输入与输出

标准压缩步骤使用中间哈希值、消息调度和对应字宽的常量表，输出加回后的中间哈希值。填充、初始向量选择和变体截断不由压缩原语负责；本项目的 Blockly 块接收原始 64-byte 消息分组，并在块内扩展消息调度。

## 项目映射

每个分组结束后将工作字加回链状态。SHA-224 复用同一压缩函数，但使用不同初始值并输出前 224 bit。

`hash_sha256_compress(V, W)` 的 `V` 必须是 8 个无符号 32-bit 链状态字；`W` 插槽名为兼容旧工作区而保留，实际输入是一个恰好 64-byte 的消息分组，不是已扩展的 64 个调度字。字节范围为 `0..255`，状态字范围为 `0..2^32−1`；整数值浮点数会归一化为整数，布尔值、非整数、越界值、缺失项和错误长度均被拒绝。生成代码在内部由 16 个大端 32-bit 字扩展出 64 个调度字，并返回压缩后的八字状态。返回数组将每个状态字表示为无符号整数，两种语言的可观察结果一致。`hash_sha224_hash` 是带 SHA-224 初始值与截断的高层封装。SHA-512 使用对应的 64-bit 压缩块。

## 核验与缺项

[`sha256-block-contract.test.ts`](../../../tests/unit/sha256-block-contract.test.ts) 通过真实 Blockly 块生成并执行 JS/Python：对 FIPS 180-4 `SHA-256("abc")` 单块结果逐字比对（包括无符号返回值），并核验整数值浮点归一化、非法值、稀疏数组和错误长度。该定向回归不等于完整 NIST 测试集或 CAVP 算法验证。压缩块仍属于可组合教学原语；它不自动完成输入填充、变体 IV 选择、长度限制或产品认证流程。
## 原文摘录

> 以下片段对应 SHA-256 压缩轮；SHA-512 使用同一结构但字宽、轮数、常量和函数族不同。

```text
3. For t=0 to 63 (or t=0 to 79 for SHA-512):
   {
     T1 = h + Σ1(e) + Ch(e, f, g) + Kt + Wt
     T2 = Σ0(a) + Maj(a, b, c)
     h=g; g=f; f=e; e=d+T1; d=c; c=b; b=a; a=T1+T2
   }
4. Compute the ith intermediate hash value H(i) by adding each working variable
   to the corresponding word of the previous hash value modulo 2^32 or 2^64.
```
