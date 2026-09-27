# GM/T 0005 — 矩阵、复杂度、通用统计与频谱检测

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 检测函数族 / 线性代数、复杂度和频谱 |
| 标准定位 | GM/T 0005-2021 §5.10–§5.15、附录 B.10–B.15 |
| 原文证据 | [随机性标准原文提取](./00-Standard-Source.md) · [PDF](./0005-2021随机性检测规范DI.pdf) |
| 原文位置 | PDF 物理第 11–15 页（标准页 8–12）；[提取稿 §5.10](./00-Standard-Source.md#L435)、[§5.13](./00-Standard-Source.md#L524)、[§5.15](./00-Standard-Source.md#L586) |
| 项目状态 | 由 `metacrypt_server` 后端执行；不属于 Blockly 块 |

## 原文定位与引用

> “矩阵秩检测用来检测待检序列中给定长度的子序列之间的线性独立性。”
>
> — GM/T 0005-2021 §5.10.1；[提取稿第 435 行](./00-Standard-Source.md#L435)

## 原文摘录

> 本页正文是按 source 的“GM/T 0005-2021 §5.10–§5.15、附录 B.10–B.15”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

## 标准定义

这六项检测分别评估 32×32 二元矩阵秩、前/后向累加和、近似熵、线性复杂度、不可压缩性和
离散傅立叶频谱。它们的统计量、参数和特殊函数自由度均与前面的检测不同，必须按独立条目记录。

## 公式或伪代码

### 5.10 矩阵秩

```text
split epsilon into N=floor(n/(32*32)) matrices A_i of 32x32 bits
R_i = rank_GF(2)(A_i)
FM   = count(R_i = 32)
FM1  = count(R_i = 31)
V = (FM-0.2888*N)^2/(0.2888*N)
  + (FM1-0.5776*N)^2/(0.5776*N)
  + (N-FM-FM1-0.1336*N)^2/(0.1336*N)
P = igamc(1, V/2)
Q = P
```

### 5.11 累加和

```text
X_i = 2*epsilon_i - 1
S_i = sum(X_j, j=1..i)
z   = max(abs(S_i))
P   = standard_forward_or_backward_cusum_pvalue(S_1..S_n, z)
Q   = P
```

前向模式从第 1 bit 开始，后向模式从最后 1 bit 开始；`P` 的分段求和表达式和 `z` 的定义以
标准 §5.11/附录 B.11 为准，两个模式分别作为项目。此处不把 PDF 文本层损坏的排版猜成另一套公式。

### 5.12 近似熵

```text
epsilon' = epsilon || first_(m-1)(epsilon)
C_i^m = count of m-bit pattern i / n
phi(m) = sum(C_i^m * ln(C_i^m)); 0*ln(0) = 0
ApEn(m) = phi(m) - phi(m+1)
V = 2*n*(ln(2) - ApEn(m))
P = igamc(2^(m-1), V/2)
Q = P
```

### 5.13 线性复杂度

```text
split epsilon into N=floor(n/m) blocks
L_i = Berlekamp-Massey(block_i)
mu  = m/2 + 9/36 + (3-(-1)^(m+1))/36
      - (m/3 + 2/9) / 2^m
T_i = (-1)^m * (L_i - mu) + 2/9
place T_i into the seven standard bins
V = sum((v_i - N*pi_i)^2/(N*pi_i), i=0..6)
P = igamc(3, V/2)
Q = P
```

七个分箱概率必须使用标准给定的 `pi_i`，不能改用通用 NIST 表。

### 5.14 Maurer 通用统计

```text
split epsilon into Q initialization blocks and K test blocks of L bits
remember the last position of every L-bit value in the initialization table
sum = Σ log2(i - T[value_i]) over test blocks, updating T[value_i]=i
V = (sum/K - E(L)) / sigma(L)
P = erfc(abs(V) / sqrt(2))
Q = 0.5 * erfc(abs(V) / sqrt(2))
```

`E(L)`、`sigma(L)` 和 `Q/K` 取标准附录 B.14/附录 A 参数。

### 5.15 离散傅立叶

```text
X_i = 2*epsilon_i - 1
f_j = DFT(X)_j
M_j = abs(f_j), j=0..floor(n/2)-1
T = 2.995732274 * sqrt(n)
N0 = 0.95 * n / 2
N1 = count(M_j < T)
V = (N1 - N0) / sqrt(n * 0.95 * 0.05 / 2)
P = erfc(abs(V) / sqrt(2))
Q = 0.5 * erfc(abs(V) / sqrt(2))
```

## 输入与输出

| 检测 | 关键输入 | 输出 |
|---|---|---|
| 矩阵秩 | bit 序列、32×32 分块 | 秩分布、`P/Q` |
| 累加和 | bit 序列、前/后向模式 | `P/Q` |
| 近似熵 | bit 序列、`m` | `ApEn`、`P/Q` |
| 线性复杂度 | bit 序列、`m` | `L_i` 分布、`P/Q` |
| Maurer | bit 序列、`L/Q` | `V`、`P/Q` |
| DFT | bit 序列 | 频谱统计、`P/Q` |

## 项目映射

所有条目由 `metacrypt_server` Go 后端执行；浏览器端不展示自己的近似分数来替代后端结果。前端
可以展示每项统计量和公式出处，但最终“通过/未通过”来自带版本号的后端报告。

## 核验与缺项

矩阵秩必须在 `GF(2)` 上消元；线性复杂度必须是 Berlekamp–Massey；Maurer 的表更新和 DFT 的
频率范围必须独立测试。累加和的完整分段公式、所有附录参数、样本不足错误和跨实现结果仍需纳入
后端验收矩阵。
