## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 编码原语 / 教学分解 |
| 标准定位 | Goppa 码定义、生成多项式与 syndrome |
| 原文证据 | [来源索引](./00-Research-Source.md#L17)（Goppa 1970、Berlekamp 1973、ISO Clause 13） |
| 原文位置 | Goppa 1970 §2–3；ISO/IEC 18033-2:2006/Amd 2:2026 Clause 13；完整 ISO 文本未本地保存 |
| 项目状态 | 已实现教学原语；未实现 ISO Classic McEliece KEM 参数集或符合性 |

## 原文定位与引用

> 本页是论文和 ISO 标准背景的结构化教学说明，不是标准全文转录。原始来源与访问限制见[来源索引](./00-Research-Source.md#L17)。

## 来源要点（转述，非逐字引用）

> 参考原文入口：Goppa 1970、Berlekamp 1973 和 ISO Clause 13；完整书目信息及本地文件状态见 [00-Research-Source.md](./00-Research-Source.md#L17)。

二元 Goppa 码是一类线性纠错码：由有限域上的多项式 G(z) 与支持集 L 定义，
且其译码问题（含隐藏结构）构成 McEliece 密码的安全性基础。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 定义（Goppa 1970 / Berlekamp 1973）

设 GF(2^m) 上的次数 t 多项式 `G(z)`（生成多项式，在支持集上非零），
支持集 `L = {α₀, …, αₙ₋₁} ⊆ GF(2^m)`（G(αᵢ) ≠ 0）。二进制 Goppa 码：

```
Γ(L, G) = { c ∈ GF(2)^n : Σᵢ cᵢ / (z − αᵢ) ≡ 0 mod G(z) }
```

参数：码长 n = |L|，维数 k ≥ n − m·t，纠错能力 t（可纠 t 个错误）。

### 奇偶校验矩阵

令 hᵢ = 1/G(αᵢ)（∈ GF(2^m)），H 为 m·t × n 矩阵（GF(2^m) 展开）：

```
H = ( hᵢ · αᵢʲ ),  行 j = 0..t−1（幂次），列 i = 0..n−1（码位）
```

接收字 y 的 **syndrome**：`s = H·y`（GF(2) 上）。s = 0 ⟺ y 是合法码字。

### 教学实例（CipherCat demo 参数）

- 支持集 L = GF(16) 子域 14 个元素（AES 域 0x11B 中阶 15 元 0x0d 生成；子域
  S = {0} ∪ {13^k} XOR 封闭，排除 G 的根 13/81 后 |L| = 14）
- G = [176, 92, 1]（t=2，根 13 与 81）
- 码参数：n=14, t=2, k=6（n − m′·t = 14 − 4×2，m′ = 子域度数 4）

性质向量（`demos/procedures/GF2m-Poly.json`）：G(z) 在 αᵢ 求值为 0、常数项 =
根的积 24、Bezout 恒等式 u·a⊕v·b=g、monic。

## 生成多项式

```
G(z) = ∏ᵢ (z − αᵢ)，αᵢ 为支持集元素（**G 的根不在支持集**——教学实例中根 13/81
被排除在 L 之外，保证 G(αᵢ) ≠ 0）。
```

特征 2 中减号 = 加号。GF(2^8)（AES 域 0x11B）上逐对乘。

## CipherCat 块实现

- `goppa_gen_poly(alpha)` → G(z) 系数数组（低次到高次，GF(2^8) 元素）：
  G(z) = ∏(z−αᵢ)，αᵢ 为码位对应的域元素字节值。
- `syndrome_calc(h, y, m, n)` → s = H·y (mod 2)：校验矩阵 H（m×n 展平）×
  接收向量 y（n）→ m 维。s=0 ⟺ 合法码字；非零 syndrome 驱动译码。
- `gf2m_poly_add/mul/mod`：GF(2^8) 系数多项式运算（系数数组低位在前），
  `gf2m_poly_mod` 模首一多项式（如 G(z)）。
- `gf2m_poly_eval(poly, alpha)`：Horner 求值 P(α)——Chien 搜索求根的基础。
