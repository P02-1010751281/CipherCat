# GM/T 0005 — 频数与子序列检测条目

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 检测函数族 / 统计量 |
| 标准定位 | GM/T 0005-2021 §5.1–§5.4、附录 B.1–B.4 |
| 原文证据 | [随机性标准原文提取](./00-Standard-Source.md) · [PDF](./0005-2021随机性检测规范DI.pdf) |
| 原文位置 | PDF 物理第 6–8 页（标准页 3–5）；[提取稿 §5.1](./00-Standard-Source.md#L188)、[§5.2](./00-Standard-Source.md#L210) |
| 项目状态 | 由 `metacrypt_server` 后端执行；不属于 Blockly 块 |

## 原文定位与引用

> “单比特频数检测是最基本的检测，用来检测一个二元序列中 0 和 1 的个数是否相近。”
>
> — GM/T 0005-2021 §5.1.1；[提取稿第 188 行](./00-Standard-Source.md#L188)

## 原文摘录

> 本页正文是按 source 的“GM/T 0005-2021 §5.1–§5.4、附录 B.1–B.4”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

## 标准定义

这四项检测分别检查全局 0/1 平衡、固定块内平衡、非重叠模式分布和重叠模式分布。每一个检测
项目都必须独立记录参数、统计量、`P-value`、`Q-value` 和判定结果；不能把同名检测替换为
NIST SP 800-22 的另一版实现。

## 公式或伪代码

### 5.1 单比特频数

```text
X_i = 2*epsilon_i - 1
S_n = sum(X_i, i=1..n)
V   = S_n / sqrt(n)
P   = erfc(abs(V) / sqrt(2))
Q   = 0.5 * erfc(abs(V) / sqrt(2))
```

### 5.2 块内频数

```text
N = floor(n / m)
pi_i = (number of 1s in block i) / m
V = 4*m * sum((pi_i - 1/2)^2, i=1..N)
P = igamc(N/2, V/2)
Q = P
```

多余 bit 舍弃；`m` 必须来自标准附录 A 的长度配置。

### 5.3 扑克

```text
N = floor(n / m)
ni = count of the i-th m-bit pattern, i=1..2^m
V = (2^m / N) * sum(ni^2, i=1..2^m) - N
P = igamc((2^m - 1)/2, V/2)
Q = P
```

### 5.4 重叠子序列

```text
epsilon' = epsilon || first_(m-1)(epsilon)
Psi_j = (2^j / n) * sum(v_pattern^2 over all j-bit patterns) - n
Psi2_m  = Psi_m - Psi_(m-1)
Psi2_2m = Psi_m - 2*Psi_(m-1) + Psi_(m-2)
P1 = igamc(2^(m-2), Psi2_m/2)
P2 = igamc(2^(m-3), Psi2_2m/2)
Q1 = P1; Q2 = P2
```

`v_pattern` 是环回扩展序列中该模式的重叠出现次数；两个统计值是两个独立测评项目。

## 输入与输出

| 输入 | 输出 |
|---|---|
| 二元序列 `epsilon`、长度 `n`、检测参数 `m`（适用时） | 统计量、`P-value`、`Q-value`、通过/失败 |
| 取值域 | `epsilon_i ∈ {0,1}`；非法 bit、长度不足、参数缺失应拒绝 |

## 项目映射

实现面是 `metacrypt_server` Go 后端随机性检测模块；CipherCat 前端只提交用户测试数据或展示
后端报告。没有对应 Blockly 检测块，也不使用浏览器样本作为最终测评来源。

## 核验与缺项

后端应以标准附录 A 的 `m` 配置逐项运行，并保存两类重叠子序列统计值。需要覆盖全 0、全 1、
交替序列、随机基线、长度不足和非法 `m`；公式中的特殊函数参数必须与标准原文和 Go 实现联测。
