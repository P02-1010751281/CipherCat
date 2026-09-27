## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 译码原语 / 教学分解 |
| 标准定位 | Patterson 代数译码、错误定位多项式与 Chien 搜索 |
| 原文证据 | [来源索引](./00-Research-Source.md#L17)（Patterson 1975、ISO Clause 13） |
| 原文位置 | Patterson 1975 pp. 203–207；ISO/IEC 18033-2:2006/Amd 2:2026 Clause 13；完整 ISO 文本未本地保存 |
| 项目状态 | 已实现教学译码原语；未实现 ISO Classic McEliece KEM 参数集或符合性 |

## 原文定位与引用

> 本页是 Patterson 译码的教学推导和实现说明，不是标准全文转录。原始来源与访问限制见[来源索引](./00-Research-Source.md#L17)。

## 来源要点（转述，非逐字引用）

> 参考原文入口：Patterson 1975《The algebraic decoding of Goppa codes》；书目信息和可访问来源见 [00-Research-Source.md](./00-Research-Source.md#L17)。

Patterson 算法对二元 Goppa 码做**代数译码**：由 syndrome 直接解出错误定位
多项式 σ(z)，无需查表——这是 McEliece 码基密码能实际纠错的核心。

## 公式或伪代码

> 本页没有可直接核对的单一标准原件；下面内容是项目教学推导和实现笔记，不是完整标准原文，不能把它当作标准公式或伪代码摘录。
> 完整书目信息与待核对原始文献见 [README.md](./README.md)。

### 算法

输入：支持集 L、生成多项式 G(z)（次数 t）、接收字 y 的 syndrome S(z)（deg < t）。

1. **syndrome 多项式**：S(z) = Σᵢ yᵢ/(z−αᵢ) mod G(z)（由 H·y 得到）
2. **关键方程**：错误定位子 σ(z) 满足
   ```
   S(z) · σ(z) ≡ σ′(z)  mod G(z)      （特征 2：σ′ 是形式导数，σ′² 即平方）
   ```
   （σ′/σ = S——**不是** σ ≡ S·σ′。）
3. **Patterson 分解**：σ = r² + z·B²（r, B ∈ GF(2^m)[z]）。代入关键方程：
   σ′ = B²（特征 2 下 z·B² 的导数为 B²）⟹ B² = S·(r² + z·B²)
   ⟹ **r² = B²·(S⁻¹ + z) mod G** ⟹ **r ≡ B·T mod G**，其中
   **T = √(S⁻¹ + z) mod G**（模 G 开方，见下）。
4. **解 (r, B)**：对 **(G, T)** 做扩展欧几里得，迭代到余数次数 ≤ ⌊t/2⌋，
   停点 (r, B) = (余数, T 系数)（Bezout：r ≡ B·T mod G，**非** r ≡ B·S）。
5. **错误定位子**：`σ(z) = r(z)² + z·B(z)²`
6. **求根（Chien 搜索）**：对 αᵢ ∈ L 求 σ(αᵢ)，σ(αᵢ) = 0 ⟺ 位置 i 出错
7. **纠错**：翻转 y 中出错位

> 教学实例 t=2 特例：deg T = 1 = ⌊t/2⌋，Euclid 循环不迭代——r = T、B = 1、σ = T² + z。

### 关键推导（σ′ = B²，特征 2）

Patterson 恒等式 σ = r² + z·B²（特征 2 下形式导数 σ′ = B²）代入关键方程
S·σ ≡ σ′ ⟹ B² = S·(r²+zB²) ⟹ r² = B²(S⁻¹+z)，开方得 r ≡ B·T。
**实现坑**：σ 取 (r, B) 而非 (g 系数, T 系数)——A_B 变体全部译错，R_B 变体全对
（CipherCat 实测 50/50）；Bezout 关系是 r ≡ B·T 而非 r ≡ B·S（数值验证：
r≡B·T 成立、r≡B·S 不成立）。

### 模多项式开方（特征 2）

T = √(S⁻¹ + z) 需要模 G 的平方根：Frobenius 自同态 x ↦ x² 是 GF(2)-线性，
GF(2^m)[z]/(G) 上的平方根用 **m·t × m·t GF(2) Frobenius 矩阵**（基 {z^i·2^j}，
系数按比特展开），矩阵求逆后乘目标——比逐项试探快且确定。矩阵方向易反
（行/列坐标需转置），先随机往返验证再集成。

## CipherCat 块实现

- `goppa_decode(y, g, l)` → 纠正后的接收字（0/1 位向量）：完整 Patterson 闭包
  （扩展欧几里得 → Frobenius 开方 → Chien 搜索），教学实例 t=2/n=14/GF(16) 子域。
- **可拼装原子链**（syndrome 侧）：`arr_slice(xgcd(a,g), 1, 2)` 解析 Bezout 输出
  取逆元系数 + `syndrome_calc` 链——`Goppa-Decode.json` demo 中 syndrome 计算
  用原子块拼装，译码求解侧（数据依赖迭代）由黑盒承担（用户偏好：原子块优先，
  黑盒转 demo）。
- `gf2m_poly_xgcd(a, b)` → [len_u, u…, len_v, v…, g…]：扩展欧几里得，
  u·a ⊕ v·b = g（g 首一）——Patterson 提取错误定位子的核心原语。

## 验证（性质向量）

`demos/procedures/Goppa-Decode.json`：已知值/根判定 13,81、逆元
u₃=[188,225]·(z−177)≡1、原子链 syndrome==[236,12]（预计算）、
往返（无错/单错/双错）、篡改 g' 不可纠。
