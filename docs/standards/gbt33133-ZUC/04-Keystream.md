# ZUC — 比特重组与密钥流生成

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 密钥流生成 |
| 标准定位 | GB/T 33133.1-2016 §5.3、§5.4、§6 |
| 原文证据 | [ZUC 原文提取](./00-Standard-Source.md) · [第 1 部分 PDF](./GBT-33133.1-2016.pdf) |
| 原文位置 | [PDF 物理第 8–9 页](./GBT-33133.1-2016.pdf#page=8)（标准印刷第 4–5 页）；[提取稿 L1107–L1185](./00-Standard-Source.md#L1107-L1185)、[L1232–L1288](./00-Standard-Source.md#L1232-L1288) |
| 项目状态 | `zuc_keystream` 与 `proc_zuc_keystream` 已覆盖 |

## 原文摘录

本页完整列出 BR、F、初始化和工作步骤。公式按 PDF 视觉页规范化。

## 原文定位与引用

完整算法来自 GB/T 33133.1-2016 §5.3、§5.4、§6；对应原文行号见上方“原文证据”和“原文位置”。

## 公式或伪代码

### 比特重组 BR

输入为 LFSR 单元 `s0, s2, s5, s7, s9, s11, s14, s15`，输出四个 32-bit 字 `X0, X1, X2, X3`：

```text
BitReconstruction():
    X0 = s15_H || s14_L
    X1 = s11_L || s9_H
    X2 = s7_L  || s5_H
    X3 = s2_L  || s0_H
```

其中 `_H` 和 `_L` 分别表示寄存器字的高 16 bit 和低 16 bit。

## F 函数

```text
F(X0, X1, X2):
    W  = ((X0 xor R1) + R2) mod 2^32
    W1 = (R1 + X1) mod 2^32
    W2 = R2 xor X2
    R1 = S(L1(W1_L || W2_H))
    R2 = S(L2(W2_L || W1_H))
    return W

L1(X) = X xor rotl32(X, 2) xor rotl32(X, 10)
          xor rotl32(X, 18) xor rotl32(X, 24)
L2(X) = X xor rotl32(X, 8) xor rotl32(X, 14)
          xor rotl32(X, 22) xor rotl32(X, 30)
```

`S` 的完整 S0/S1 表见 [02-SBox-Linear.md](./02-SBox-Linear.md)，LFSR 更新见 [03-F-and-LFSR.md](./03-F-and-LFSR.md)。

## ZUC-128 密钥流算法

输入为 128-bit 密钥 `k`、128-bit 初始向量 `iv` 和正整数 `L`；输出 `L` 个 32-bit 密钥流字 `Z`。

```text
ZUC(k, iv, L):
    load s0..s15 using s_i = k_i || d_i || iv_i
    R1 = 0
    R2 = 0

    repeat 32 times:
        (X0, X1, X2, X3) = BitReconstruction()
        W = F(X0, X1, X2)
        LFSRWithInitializationMode(W >> 1)

    BitReconstruction()
    F(X0, X1, X2)
    LFSRWithWorkMode()

    repeat L times:
        (X0, X1, X2, X3) = BitReconstruction()
        Z = F(X0, X1, X2) xor X3
        output Z
        LFSRWithWorkMode()
```

初始化阶段的 `W` 不输出；工作阶段每轮先取 BR、调用 `F`，计算 `Z = W xor X3`，再执行一次 LFSR 工作模式更新。

## 项目映射

`zuc_keystream` 负责完整密钥流过程；`proc_zuc_keystream` 将同一过程拆为可视化步骤。验证应覆盖初始化轮数、丢弃工作轮、`Z = W xor X3` 和多字输出顺序。
