# GM/T 0005 — 游程与关系检测条目

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 检测函数族 / 游程、推导、自相关 |
| 标准定位 | GM/T 0005-2021 §5.5–§5.9、附录 B.5–B.9 |
| 原文证据 | [随机性标准原文提取](./00-Standard-Source.md) · [PDF](./0005-2021随机性检测规范DI.pdf) |
| 原文位置 | PDF 物理第 8–11 页（标准页 5–7）；[提取稿 §5.5](./00-Standard-Source.md#L308) |
| 项目状态 | 由 `metacrypt_server` 后端执行；不属于 Blockly 块 |

## 原文定位与引用

> “游程是指序列中由连续的‘0’或者‘1’组成的子序列。”
>
> — GM/T 0005-2021 §5.5.1；[提取稿第 308 行](./00-Standard-Source.md#L308)

## 原文摘录

> 本页正文是按 source 的“GM/T 0005-2021 §5.5–§5.9、附录 B.5–B.9”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

## 标准定义

游程总数、游程分布和块内最大游程检查连续相同比特的长度结构；二元推导和自相关检查不同
位置/阶次之间的关系。块内最大游程有“最大 1 游程”和“最大 0 游程”两个独立模式。

## 公式或伪代码

### 5.5 游程总数

```text
r(i) = 0 if epsilon_i = epsilon_(i+1), else 1
V_obs = 1 + sum(r(i), i=1..n-1)
pi = sum(epsilon_i, i=1..n) / n
V = (V_obs - 2*n*pi*(1-pi)) / (2*sqrt(2*n)*pi*(1-pi))
P = erfc(abs(V) / sqrt(2))
Q = 0.5 * erfc(abs(V) / sqrt(2))
```

### 5.6 游程分布

```text
e_i = n / 2^(i+2) + 3
k   = largest i with e_i >= 5
T   = sum(b_i + g_i, i=1..k)
e'_i = T / 2^i                  (1 <= i < k)
e'_k = T / 2^(k-1)              (overflow bin)
V = sum((b_i-e'_i)^2/e'_i + (g_i-e'_i)^2/e'_i, i=1..k)
P = igamc((k-1)/2, V/2)
Q = P
```

`b_i`/`g_i` 分别是长度为 `i` 的 1/0 游程数，超过 `k` 的游程进入末箱。

### 5.7 块内最大游程

```text
split epsilon into N=floor(n/m) blocks
for each block:
    v_i = maximum run length of the selected bit (1 or 0)
    add v_i to its standard-defined bin
V = sum((v_bin_i - N*pi_i)^2 / (N*pi_i), i=0..K)
P = igamc(K/2, V/2)
Q = P
```

`pi_i` 和分箱边界必须读取附录 B.7 表 B.2–B.4；不能用自选分布替代。

### 5.8 二元推导

```text
epsilon^(0) = epsilon
epsilon^(j+1)_i = epsilon^(j)_i xor epsilon^(j)_(i+1)
repeat j = 0..k-1
X_i = 2*epsilon^(k)_i - 1
V = sum(X_i) / sqrt(n-k)
P = erfc(abs(V) / sqrt(2))
Q = 0.5 * erfc(abs(V) / sqrt(2))
```

### 5.9 自相关

```text
A(d) = sum(epsilon_i xor epsilon_(i+d), i=0..n-d-1)
V = 2*(A(d) - (n-d)/2) / sqrt(n-d)
P = erfc(abs(V) / sqrt(2))
Q = 0.5 * erfc(abs(V) / sqrt(2))
```

每个 `k` 或 `d` 配置分别形成测评项目。

## 输入与输出

| 检测 | 输入参数 | 输出 |
|---|---|---|
| 游程总数 | `epsilon` | `P/Q`、统计量 |
| 游程分布 | `epsilon`、标准分箱 | `P/Q`、分布统计 |
| 块内最大游程 | `epsilon`、`m`、bit 模式 | `P/Q`、两个模式分别报告 |
| 二元推导 | `epsilon`、阶次 `k` | `P/Q` |
| 自相关 | `epsilon`、移位 `d` | `P/Q` |

## 项目映射

以上检测由 `metacrypt_server` Go 后端执行；前端仅展示项目名、参数和后端结果。不要在前端
另实现一份“近似算法”再与平台后端测评结果混用。

## 核验与缺项

需要用附录 A 的所有 `m/k/d` 组合验证，并覆盖全相同比特、交替比特、单点翻转、非 32 倍长度
和样本长度不足。游程分布分箱概率必须与标准附录 B 表格逐项比对。
