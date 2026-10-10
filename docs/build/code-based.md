# 纠错码、多变量与共享数学构件：分步拼装

GF(2)、GF(2^m)、Goppa 码、多变量与通用数学构件：为多种算法提供可组合的原语。

## 本页覆盖的工作区

| | |
|---|---|
| `Code-Based-Math` | `demos/procedures/Code-Based-Math.json` |
| `GF2m-Poly` | `demos/procedures/GF2m-Poly.json` |
| `Goppa-Decode` | `demos/procedures/Goppa-Decode.json` |
| `Multivariate-Math` | `demos/procedures/Multivariate-Math.json` |
| `PQC-Gaps` | `demos/procedures/PQC-Gaps.json` |
| `Research-Math` | `demos/procedures/Research-Math.json` |
| `Wrap-Up-Math` | `demos/procedures/Wrap-Up-Math.json` |

### `Code-Based-Math`

- 证据类别：代数或结构性质
- 依据：GF(2) 多项式结合/除余重建/欧几里得、A·A⁻¹=I、d=wt(x⊕y)
- 核对入口：`a = [1, 0, 1, 0, 0, 1] # 1 + x^2 + x^5`
- 期望结果：`CODE_BASED_OK`

#### 拼装步骤

**函数 `PMul(a: int_list, b: int_list)` 的返回值**

- `gf2_poly_mul`（GF(2) 多项式乘法（XOR 卷积，低位在前）；任一输入为空时返回 `[]`，以空系数表表示零多项式；非空算例 `(1+x)(1+x+x²)…）
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2_poly_mul`

**函数 `PDiv(a: int_list, b: int_list)` 的返回值**

- `gf2_poly_div`
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2_poly_div`

**函数 `PMod(a: int_list, b: int_list)` 的返回值**

- `gf2_poly_mod`
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2_poly_mod`

**函数 `PGcd(a: int_list, b: int_list)` 的返回值**

- `gf2_poly_gcd`（欧几里得 GCD）
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2_poly_gcd`

**函数 `MMul(a: int_list, b: int_list, n: int)` 的返回值**

- `bin_mat_mul`（GF(2) 矩阵乘（展平 n×n，n 为阶数））
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`
  - `N` ←
    - 变量 `n`

**该函数用到的算法块**：`bin_mat_mul`

**函数 `MInv(a: int_list, n: int)` 的返回值**

- `bin_mat_inv`（GF(2) 矩阵求逆（增广高斯消元））
  - `A` ←
    - 变量 `a`
  - `N` ←
    - 变量 `n`

**该函数用到的算法块**：`bin_mat_inv`

**函数 `HW(x: int_list)` 的返回值**

- `ham_weight`（汉明重量）
  - `X` ←
    - 变量 `x`

**该函数用到的算法块**：`ham_weight`

**函数 `HD(x: int_list, y: int_list)` 的返回值**

- `ham_dist`（汉明距离）
  - `X` ←
    - 变量 `x`
  - `Y` ←
    - 变量 `y`

**该函数用到的算法块**：`ham_dist`

### `GF2m-Poly`

- 证据类别：代数或结构性质
- 依据：GF(2^m) 多项式零元/交换/结合、Bezout 恒等式、Goppa 根判定
- 核对入口：`a = [1, 2, 3]; b = [4, 5]; c = [6, 7]`
- 期望结果：`GF2M_POLY_OK`

#### 拼装步骤

**函数 `GA(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_add`（逐系数 XOR（特征 2））
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_add`

**函数 `GM(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_mul`（卷积（GF(2⁸) 域乘，AES 多项式表示）；任一输入为空时返回 `[]`；双语言算例 `[1,2]×[3,4]=[3,2,8]`，标量域乘…）
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_mul`

**函数 `GMod(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_mod`（长除取余（模 Goppa 多项式））
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_mod`

**函数 `GXGcd(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_xgcd`
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_xgcd`

**函数 `GEval(p: int_list, x: int)` 的返回值**

- `gf2m_poly_eval`（Horner 求值（Chien 搜索））
  - `P` ←
    - 变量 `p`
  - `X` ←
    - 变量 `x`

**该函数用到的算法块**：`gf2m_poly_eval`

**函数 `GP(alphas: int_list)` 的返回值**

- `goppa_gen_poly`（G(z)=∏(z−αᵢ)，αᵢ ∈ GF(2⁸)（AES 域）——McEliece 码核心构造）
  - `ALPHA` ←
    - 变量 `alphas`

**该函数用到的算法块**：`goppa_gen_poly`

### `Goppa-Decode`

- 证据类别：代数或结构性质
- 依据：根判定与逆元、syndrome 原子链已知值、无错/单错/双错往返、篡改不可纠
- 核对入口：`g = GOPPA_G([13, 81])`
- 期望结果：`GOPPA_OK`

#### 拼装步骤

**函数 `GOPPA_G(alphas: int_list)` 的返回值**

- `goppa_gen_poly`（G(z)=∏(z−αᵢ)，αᵢ ∈ GF(2⁸)（AES 域）——McEliece 码核心构造）
  - `ALPHA` ←
    - 变量 `alphas`

**该函数用到的算法块**：`goppa_gen_poly`

**函数 `GOPPA_EVAL(p: int_list, x: int)` 的返回值**

- `gf2m_poly_eval`（Horner 求值（Chien 搜索））
  - `P` ←
    - 变量 `p`
  - `X` ←
    - 变量 `x`

**该函数用到的算法块**：`gf2m_poly_eval`

**函数 `GA(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_add`（逐系数 XOR（特征 2））
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_add`

**函数 `GM(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_mul`（卷积（GF(2⁸) 域乘，AES 多项式表示）；任一输入为空时返回 `[]`；双语言算例 `[1,2]×[3,4]=[3,2,8]`，标量域乘…）
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_mul`

**函数 `GMod(a: int_list, b: int_list)` 的返回值**

- `gf2m_poly_mod`（长除取余（模 Goppa 多项式））
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_poly_mod`

**函数 `GOPPA_INV(a: int_list, g: int_list)` 的返回值**

- `arr_slice`
  - `LIST` ←
    - `gf2m_poly_xgcd`
      - `A` ←
        - 变量 `a`
      - `B` ←
        - 变量 `g`
  - `START` ←
    - 数字 `1`
  - `LENGTH` ←
    - 数字 `2`

**该函数用到的算法块**：`arr_slice` · `gf2m_poly_xgcd`

**函数 `GOPPA_SYN(a: int_list, b: int_list, g: int_list)` 的返回值**

- `gf2m_poly_mod`（长除取余（模 Goppa 多项式））
  - `A` ←
    - `gf2m_poly_add`（逐系数 XOR（特征 2））
      - `A` ←
        - `arr_slice`
          - …（更深层的输入见工作区）
      - `B` ←
        - `arr_slice`
          - …（更深层的输入见工作区）
  - `B` ←
    - 变量 `g`

**该函数用到的算法块**：`arr_slice` · `gf2m_poly_add` · `gf2m_poly_mod` · `gf2m_poly_xgcd`

**函数 `GOPPA_DEC(y: int_list, g: int_list, L: int_list)` 的返回值**

- `goppa_decode`（项目教学实现中的 Patterson 风格译码块；当前性质回归使用 GF(16) 子域 `[14,6,5]` 小型示例，不是 Classic …）
  - `Y` ←
    - 变量 `y`
  - `G` ←
    - 变量 `g`
  - `L` ←
    - 变量 `L`

**该函数用到的算法块**：`goppa_decode`

### `Multivariate-Math`

- 证据类别：项目固定回归（非官方向量）
- 依据：线性方程组、二次式、组合数与 GF(2⁸) 算例的项目固定输入回归；非标准 KAT
- 核对入口：`aug = [1,1,1,6, 1,2,-1,2, 2,1,1,7]`
- 期望结果：`MULTIVAR_OK`

#### 拼装步骤

**函数 `GE(aug: int_list, n: int)` 的返回值**

- `gauss_elim`（b]`（`n×(n+1)`），以浮点高斯消元求唯一解；秩不足时返回空列表。调用方须提供匹配的维度；这是通用数值线性代数，不是密码算法验证器。）
  - `AUG` ←
    - 变量 `aug`
  - `N` ←
    - 变量 `n`

**该函数用到的算法块**：`gauss_elim`

**函数 `Quad(c: int_list, x: int_list)` 的返回值**

- `mv_quad_eval`（求值 `Q(x)=Σ(i≤j)aᵢⱼxᵢxⱼ+Σbᵢxᵢ+c`；系数依次为上三角二次项（行优先）、`n` 个一次项、常数，输入长度须为 `n(…）
  - `COEFFS` ←
    - 变量 `c`
  - `X` ←
    - 变量 `x`

**该函数用到的算法块**：`mv_quad_eval`

**函数 `Comb(n: int, k: int)` 的返回值**

- `comb`（`n`、`k` 必须是安全整数；结果精确计算，超过 JavaScript 安全整数范围时两种生成语言均报错）
  - `N` ←
    - 变量 `n`
  - `K` ←
    - 变量 `k`

**该函数用到的算法块**：`comb`

**函数 `GAdd(a: int_list, b: int_list)` 的返回值**

- `gf2m_add`（域加法 = 按位 XOR（AES/GCM 双域））：FIELD=aes
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_add`

**函数 `GInv(a: int_list)` 的返回值**

- `gf2m_inv`（乘法逆元（多项式扩展欧几里得）；AES S-box 约定将 0 映射为 0，GCM 的 0 无逆元并报错）：FIELD=aes
  - `A` ←
    - 变量 `a`

**该函数用到的算法块**：`gf2m_inv`

**函数 `GMul(a: int_list, b: int_list)` 的返回值**

- `gf2m_mul`：FIELD=aes
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`gf2m_mul`

### `PQC-Gaps`

- 证据类别：代数或结构性质
- 依据：Rej 边界排他、卷积代数律、mod 8380417 范围、ADRS 域分隔、WOTS csum 单调、费马同余
- 核对入口：`assert REJ(5, 10) == 5, 'REJ_ACCEPT'`
- 期望结果：`GAPS_OK`

#### 拼装步骤

**函数 `REJ(x: int, b: int)` 的返回值**

- `pq_rej_sample`（若调用者提供的 `X < BOUND` 则返回 X，否则返回 -1；只做阈值判断，不生成样本或重试，不是 FIPS 204 `RejBound…）
  - `X` ←
    - 变量 `x`
  - `BOUND` ←
    - 变量 `b`

**该函数用到的算法块**：`pq_rej_sample`

**函数 `PM(a: int_list, b: int_list)` 的返回值**

- `pq_poly_mul`（普通系数卷积（MODULUS: none/3329/8380417/12289；安全整数系数；不按 `X^256+1` 约简，不是 FIPS …）：MODULUS=none
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`pq_poly_mul`

**函数 `PMQ(a: int_list, b: int_list)` 的返回值**

- `pq_poly_mul`（普通系数卷积（MODULUS: none/3329/8380417/12289；安全整数系数；不按 `X^256+1` 约简，不是 FIPS …）：MODULUS=8380417
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`pq_poly_mul`

**函数 `ADRS_TREE(layer: int, tree: int, kp: int, h: int, idx: int)` 的返回值**

- `slh_adrs_full`（覆盖部分 type 字段布局；限安全整数，不能表示完整 96-bit tree address，不是完整 FIPS 205 编码）：TYPE=3
  - `LAYER` ←
    - 变量 `layer`
  - `TREE` ←
    - 变量 `tree`
  - `KEYPAIR` ←
    - 变量 `kp`
  - `HEIGHT` ←
    - 变量 `h`
  - `INDEX` ←
    - 变量 `idx`

**该函数用到的算法块**：`slh_adrs_full`

**函数 `ADRS_ROOTS(layer: int, tree: int, kp: int)` 的返回值**

- `slh_adrs_full`（覆盖部分 type 字段布局；限安全整数，不能表示完整 96-bit tree address，不是完整 FIPS 205 编码）：TYPE=4
  - `LAYER` ←
    - 变量 `layer`
  - `TREE` ←
    - 变量 `tree`
  - `KEYPAIR` ←
    - 变量 `kp`
  - `HEIGHT` ←
    - 数字 `0`
  - `INDEX` ←
    - 数字 `0`

**该函数用到的算法块**：`slh_adrs_full`

**函数 `WC(m: bytes)` 的返回值**

- `wots_checksum`
  - `M` ←
    - 变量 `m`

**该函数用到的算法块**：`wots_checksum`

**函数 `MP(a: int, b: int)` 的返回值**

- `nt_mod_pow`：MODULUS=8380417
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`nt_mod_pow`

### `Research-Math`

- 证据类别：代数或结构性质
- 依据：LLL 行列式保持、离散高斯 PMF 对称归一、Berlekamp–Massey 重放性质
- 核对入口：`B = [1,1, 1,2]`
- 期望结果：`RESEARCH_OK`

#### 拼装步骤

**函数 `LLL(basis: int_list, r: int, c: int)` 的返回值**

- `lll_reduce`（扁平 `rows×cols` 格基矩阵的浮点 Gram–Schmidt 教学实现，固定 `δ=0.75`；不提供精确整数运算、完备输入校验或可…）
  - `BASIS` ←
    - 变量 `basis`
  - `ROWS` ←
    - 变量 `r`
  - `COLS` ←
    - 变量 `c`

**该函数用到的算法块**：`lll_reduce`

**函数 `GPMF(x: int, sg: int)` 的返回值**

- `gauss_pmf`（中心为 0 的离散高斯概率质量函数近似，在有限区间截断并归一化；`sigma` 应为正数。它只计算概率，不抽样，也不是 Falcon/FN-D…）
  - `X` ←
    - 变量 `x`
  - `SIGMA` ←
    - 变量 `sg`

**该函数用到的算法块**：`gauss_pmf`

**函数 `BM(seq: int_list)` 的返回值**

- `berlekamp_massey`（GF(2) 最短 LFSR 综合（BCH/RS 译码））
  - `SEQ` ←
    - 变量 `seq`

**该函数用到的算法块**：`berlekamp_massey`

### `Wrap-Up-Math`

- 证据类别：代数或结构性质
- 依据：点积/多项式缩放、FORS 确定性、Goppa 多项式与 syndrome 算例（性质/固定回归）
- 核对入口：`assert VDot([1,2,3], [4,5,6]) == 32, 'DOT'`
- 期望结果：`WRAPUP_OK`

#### 拼装步骤

**函数 `VDot(a: int_list, b: int_list)` 的返回值**

- `vec_dot`（两个向量长度必须相同；维度不匹配时两种生成语言均报错）
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`vec_dot`

**函数 `PScale(p: int_list, k: int)` 的返回值**

- `poly_scale`（每个多项式系数乘以标量 `k`，不取模；数值精度遵循运行语言的数值语义。）
  - `P` ←
    - 变量 `p`
  - `K` ←
    - 变量 `k`

**该函数用到的算法块**：`poly_scale`

**函数 `FRoot(r: bytes, adrs: bytes)` 的返回值**

- `fors_root`（项目 SHAKE 拼接树根，不是 FIPS 205 `T_k(PK.seed, ADRS, roots)`）
  - `ROOTS` ←
    - 变量 `r`
  - `ADRS` ←
    - 变量 `adrs`

**该函数用到的算法块**：`fors_root`

**函数 `Goppa(al: int_list)` 的返回值**

- `goppa_gen_poly`（G(z)=∏(z−αᵢ)，αᵢ ∈ GF(2⁸)（AES 域）——McEliece 码核心构造）
  - `ALPHA` ←
    - 变量 `al`

**该函数用到的算法块**：`goppa_gen_poly`

**函数 `Syn(h: int_list, y: int_list, m: int, n: int)` 的返回值**

- `syndrome_calc`（线性码 syndrome s = H·y mod 2；s=0 ⟺ 合法码字）
  - `H` ←
    - 变量 `h`
  - `Y` ←
    - 变量 `y`
  - `ROWS` ←
    - 变量 `m`
  - `COLS` ←
    - 变量 `n`

**该函数用到的算法块**：`syndrome_calc`

