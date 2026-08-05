# Patterson 代数译码（1975）

Patterson 算法对二元 Goppa 码做**代数译码**：由 syndrome 直接解出错误定位
多项式 σ(z)，无需查表——这是 McEliece 码基密码能实际纠错的核心。

## 算法

输入：支持集 L、生成多项式 G(z)（次数 t）、接收字 y 的 syndrome S(z)（deg < t）。

1. **syndrome 多项式**：S(z) = Σᵢ yᵢ/(z−αᵢ) mod G(z)（由 H·y 得到）
2. **关键方程**：错误定位子 σ(z) 满足
   ```
   σ(z) ≡ S(z) · σ'(z)  mod G(z)      （特征 2：σ' 是形式导数，σ'² 即平方）
   ```
   令 σ = r² + z·B²（Patterson 分解，r, B ∈ GF(2^m)[z]），代入展开得
   **Bezout 型方程**：`r ≡ B · S mod G`。解 (r, B) 用扩展欧几里得求
   `gcd(G, S)` 的 Bezout 恒等式（S 可逆时恰为逆元）。
3. **错误定位子**：`σ(z) = r(z)² + z·B(z)²`
4. **求根（Chien 搜索）**：对 αᵢ ∈ L 求 σ(αᵢ)，σ(αᵢ) = 0 ⟺ 位置 i 出错
5. **纠错**：翻转 y 中出错位

### 关键推导（σ' = B²，特征 2）

Patterson 恒等式 σ = r² + z·B²（特征 2 下形式导数 σ' = B²），代入关键方程：
σ'/σ = S ⟺ r·B ≡ B²·S ⟺ r ≡ B·S mod G——恰为 (r, B) 的 Bezout 恒等式
（扩展欧几里得迭代的停点余数 r 与 T 系数 B）。**实现坑**：σ 取 (r, B) 而非
(g 系数, T 系数)——A_B 变体全部译错，R_B 变体全对（CipherCat 实测 50/50）。

### 模多项式开方（特征 2）

σ = r² + z·B² 需要 r²、B²：平方 = Frobenius 自同态。GF(2^m)[z]/(G) 上的平方根
用 **m·t × m·t GF(2) Frobenius 矩阵**（基 {z^i·2^j}，系数按比特展开），
矩阵求逆后乘目标——比逐项试探快且确定。矩阵方向易反（行/列坐标需转置），
先随机往返验证再集成。

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
