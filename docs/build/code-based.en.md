# Code-based, multivariate, and shared math components: step-by-step assembly

GF(2), GF(2^m), Goppa codes, multivariate, and general math components that other algorithms compose.

## Workspaces on this page

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

- Evidence class: algebraic or structural properties
- Basis: GF(2) 多项式结合/除余重建/欧几里得、A·A⁻¹=I、d=wt(x⊕y)（source text in Chinese）
- Check: `a = [1, 0, 1, 0, 0, 1] # 1 + x^2 + x^5`
- Expected result: `CODE_BASED_OK`

#### Assembly steps

**Return value of `PMul(a: int_list, b: int_list)`**

- `gf2_poly_mul` (GF(2) polynomial multiplication (XOR convolution, little-endian); an em…)
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2_poly_mul`

**Return value of `PDiv(a: int_list, b: int_list)`**

- `gf2_poly_div`
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2_poly_div`

**Return value of `PMod(a: int_list, b: int_list)`**

- `gf2_poly_mod`
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2_poly_mod`

**Return value of `PGcd(a: int_list, b: int_list)`**

- `gf2_poly_gcd` (Euclidean GCD)
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2_poly_gcd`

**Return value of `MMul(a: int_list, b: int_list, n: int)`**

- `bin_mat_mul` (GF(2) matrix multiply (flattened n×n, n = order))
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`
  - `N` ←
    - variable `n`

**Algorithm blocks used by this function**: `bin_mat_mul`

**Return value of `MInv(a: int_list, n: int)`**

- `bin_mat_inv` (GF(2) matrix inverse (augmented Gaussian elimination))
  - `A` ←
    - variable `a`
  - `N` ←
    - variable `n`

**Algorithm blocks used by this function**: `bin_mat_inv`

**Return value of `HW(x: int_list)`**

- `ham_weight` (Hamming weight)
  - `X` ←
    - variable `x`

**Algorithm blocks used by this function**: `ham_weight`

**Return value of `HD(x: int_list, y: int_list)`**

- `ham_dist` (Hamming distance)
  - `X` ←
    - variable `x`
  - `Y` ←
    - variable `y`

**Algorithm blocks used by this function**: `ham_dist`

### `GF2m-Poly`

- Evidence class: algebraic or structural properties
- Basis: GF(2^m) 多项式零元/交换/结合、Bezout 恒等式、Goppa 根判定（source text in Chinese）
- Check: `a = [1, 2, 3]; b = [4, 5]; c = [6, 7]`
- Expected result: `GF2M_POLY_OK`

#### Assembly steps

**Return value of `GA(a: int_list, b: int_list)`**

- `gf2m_poly_add` (coefficient-wise XOR (characteristic 2))
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_add`

**Return value of `GM(a: int_list, b: int_list)`**

- `gf2m_poly_mul` (convolution (GF(2⁸) field multiplication, AES polynomial representation…)
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_mul`

**Return value of `GMod(a: int_list, b: int_list)`**

- `gf2m_poly_mod` (long-division remainder (mod Goppa polynomial))
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_mod`

**Return value of `GXGcd(a: int_list, b: int_list)`**

- `gf2m_poly_xgcd`
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_xgcd`

**Return value of `GEval(p: int_list, x: int)`**

- `gf2m_poly_eval` (Horner evaluation (Chien search))
  - `P` ←
    - variable `p`
  - `X` ←
    - variable `x`

**Algorithm blocks used by this function**: `gf2m_poly_eval`

**Return value of `GP(alphas: int_list)`**

- `goppa_gen_poly` (G(z)=∏(z−αᵢ), αᵢ ∈ GF(2⁸) (AES field) — core McEliece code construction)
  - `ALPHA` ←
    - variable `alphas`

**Algorithm blocks used by this function**: `goppa_gen_poly`

### `Goppa-Decode`

- Evidence class: algebraic or structural properties
- Basis: 根判定与逆元、syndrome 原子链已知值、无错/单错/双错往返、篡改不可纠（source text in Chinese）
- Check: `g = GOPPA_G([13, 81])`
- Expected result: `GOPPA_OK`

#### Assembly steps

**Return value of `GOPPA_G(alphas: int_list)`**

- `goppa_gen_poly` (G(z)=∏(z−αᵢ), αᵢ ∈ GF(2⁸) (AES field) — core McEliece code construction)
  - `ALPHA` ←
    - variable `alphas`

**Algorithm blocks used by this function**: `goppa_gen_poly`

**Return value of `GOPPA_EVAL(p: int_list, x: int)`**

- `gf2m_poly_eval` (Horner evaluation (Chien search))
  - `P` ←
    - variable `p`
  - `X` ←
    - variable `x`

**Algorithm blocks used by this function**: `gf2m_poly_eval`

**Return value of `GA(a: int_list, b: int_list)`**

- `gf2m_poly_add` (coefficient-wise XOR (characteristic 2))
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_add`

**Return value of `GM(a: int_list, b: int_list)`**

- `gf2m_poly_mul` (convolution (GF(2⁸) field multiplication, AES polynomial representation…)
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_mul`

**Return value of `GMod(a: int_list, b: int_list)`**

- `gf2m_poly_mod` (long-division remainder (mod Goppa polynomial))
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_poly_mod`

**Return value of `GOPPA_INV(a: int_list, g: int_list)`**

- `arr_slice`
  - `LIST` ←
    - `gf2m_poly_xgcd`
      - `A` ←
        - variable `a`
      - `B` ←
        - variable `g`
  - `START` ←
    - number `1`
  - `LENGTH` ←
    - number `2`

**Algorithm blocks used by this function**: `arr_slice` · `gf2m_poly_xgcd`

**Return value of `GOPPA_SYN(a: int_list, b: int_list, g: int_list)`**

- `gf2m_poly_mod` (long-division remainder (mod Goppa polynomial))
  - `A` ←
    - `gf2m_poly_add` (coefficient-wise XOR (characteristic 2))
      - `A` ←
        - `arr_slice`
          - … (deeper inputs live in the workspace)
      - `B` ←
        - `arr_slice`
          - … (deeper inputs live in the workspace)
  - `B` ←
    - variable `g`

**Algorithm blocks used by this function**: `arr_slice` · `gf2m_poly_add` · `gf2m_poly_mod` · `gf2m_poly_xgcd`

**Return value of `GOPPA_DEC(y: int_list, g: int_list, L: int_list)`**

- `goppa_decode` (Patterson-style decoder in this project's teaching implementation; curr…)
  - `Y` ←
    - variable `y`
  - `G` ←
    - variable `g`
  - `L` ←
    - variable `L`

**Algorithm blocks used by this function**: `goppa_decode`

### `Multivariate-Math`

- Evidence class: project fixed regression (not an official vector)
- Basis: 线性方程组、二次式、组合数与 GF(2⁸) 算例的项目固定输入回归；非标准 KAT（source text in Chinese）
- Check: `aug = [1,1,1,6, 1,2,-1,2, 2,1,1,7]`
- Expected result: `MULTIVAR_OK`

#### Assembly steps

**Return value of `GE(aug: int_list, n: int)`**

- `gauss_elim` (b]` (`n×(n+1)`) and uses floating-point elimination to solve a uniquely…)
  - `AUG` ←
    - variable `aug`
  - `N` ←
    - variable `n`

**Algorithm blocks used by this function**: `gauss_elim`

**Return value of `Quad(c: int_list, x: int_list)`**

- `mv_quad_eval` (Evaluates `Q(x)=Σ(i≤j)aᵢⱼxᵢxⱼ+Σbᵢxᵢ+c`; coefficients are upper-triangul…)
  - `COEFFS` ←
    - variable `c`
  - `X` ←
    - variable `x`

**Algorithm blocks used by this function**: `mv_quad_eval`

**Return value of `Comb(n: int, k: int)`**

- `comb` (`n` and `k` must be safe integers; results are exact and values beyond …)
  - `N` ←
    - variable `n`
  - `K` ←
    - variable `k`

**Algorithm blocks used by this function**: `comb`

**Return value of `GAdd(a: int_list, b: int_list)`**

- `gf2m_add` (field addition = bitwise XOR (AES/GCM dual field)): FIELD=aes
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_add`

**Return value of `GInv(a: int_list)`**

- `gf2m_inv` (multiplicative inverse (polynomial extended Euclid); AES S-box conventi…): FIELD=aes
  - `A` ←
    - variable `a`

**Algorithm blocks used by this function**: `gf2m_inv`

**Return value of `GMul(a: int_list, b: int_list)`**

- `gf2m_mul`: FIELD=aes
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `gf2m_mul`

### `PQC-Gaps`

- Evidence class: algebraic or structural properties
- Basis: Rej 边界排他、卷积代数律、mod 8380417 范围、ADRS 域分隔、WOTS csum 单调、费马同余（source text in Chinese）
- Check: `assert REJ(5, 10) == 5, 'REJ_ACCEPT'`
- Expected result: `GAPS_OK`

#### Assembly steps

**Return value of `REJ(x: int, b: int)`**

- `pq_rej_sample` (Returns caller-supplied X if `X < BOUND`, else -1. It only checks a thr…)
  - `X` ←
    - variable `x`
  - `BOUND` ←
    - variable `b`

**Algorithm blocks used by this function**: `pq_rej_sample`

**Return value of `PM(a: int_list, b: int_list)`**

- `pq_poly_mul` (ordinary coefficient convolution (MODULUS: none/3329/8380417/12289; saf…): MODULUS=none
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `pq_poly_mul`

**Return value of `PMQ(a: int_list, b: int_list)`**

- `pq_poly_mul` (ordinary coefficient convolution (MODULUS: none/3329/8380417/12289; saf…): MODULUS=8380417
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `pq_poly_mul`

**Return value of `ADRS_TREE(layer: int, tree: int, kp: int, h: int, idx: int)`**

- `slh_adrs_full` (Partial type-field layout; safe-integer input only, cannot represent th…): TYPE=3
  - `LAYER` ←
    - variable `layer`
  - `TREE` ←
    - variable `tree`
  - `KEYPAIR` ←
    - variable `kp`
  - `HEIGHT` ←
    - variable `h`
  - `INDEX` ←
    - variable `idx`

**Algorithm blocks used by this function**: `slh_adrs_full`

**Return value of `ADRS_ROOTS(layer: int, tree: int, kp: int)`**

- `slh_adrs_full` (Partial type-field layout; safe-integer input only, cannot represent th…): TYPE=4
  - `LAYER` ←
    - variable `layer`
  - `TREE` ←
    - variable `tree`
  - `KEYPAIR` ←
    - variable `kp`
  - `HEIGHT` ←
    - number `0`
  - `INDEX` ←
    - number `0`

**Algorithm blocks used by this function**: `slh_adrs_full`

**Return value of `WC(m: bytes)`**

- `wots_checksum`
  - `M` ←
    - variable `m`

**Algorithm blocks used by this function**: `wots_checksum`

**Return value of `MP(a: int, b: int)`**

- `nt_mod_pow`: MODULUS=8380417
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `nt_mod_pow`

### `Research-Math`

- Evidence class: algebraic or structural properties
- Basis: LLL 行列式保持、离散高斯 PMF 对称归一、Berlekamp–Massey 重放性质（source text in Chinese）
- Check: `B = [1,1, 1,2]`
- Expected result: `RESEARCH_OK`

#### Assembly steps

**Return value of `LLL(basis: int_list, r: int, c: int)`**

- `lll_reduce` (Floating-point Gram–Schmidt teaching implementation over a flattened `r…)
  - `BASIS` ←
    - variable `basis`
  - `ROWS` ←
    - variable `r`
  - `COLS` ←
    - variable `c`

**Algorithm blocks used by this function**: `lll_reduce`

**Return value of `GPMF(x: int, sg: int)`**

- `gauss_pmf` (Finite-range, normalized approximation of the centered discrete Gaussia…)
  - `X` ←
    - variable `x`
  - `SIGMA` ←
    - variable `sg`

**Algorithm blocks used by this function**: `gauss_pmf`

**Return value of `BM(seq: int_list)`**

- `berlekamp_massey` (GF(2) shortest LFSR synthesis (BCH/RS decoding))
  - `SEQ` ←
    - variable `seq`

**Algorithm blocks used by this function**: `berlekamp_massey`

### `Wrap-Up-Math`

- Evidence class: algebraic or structural properties
- Basis: 点积/多项式缩放、FORS 确定性、Goppa 多项式与 syndrome 算例（性质/固定回归）（source text in Chinese）
- Check: `assert VDot([1,2,3], [4,5,6]) == 32, 'DOT'`
- Expected result: `WRAPUP_OK`

#### Assembly steps

**Return value of `VDot(a: int_list, b: int_list)`**

- `vec_dot` (Input vectors must have equal lengths; dimension mismatches are rejecte…)
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `vec_dot`

**Return value of `PScale(p: int_list, k: int)`**

- `poly_scale` (Multiplies each polynomial coefficient by scalar `k`; no modular reduct…)
  - `P` ←
    - variable `p`
  - `K` ←
    - variable `k`

**Algorithm blocks used by this function**: `poly_scale`

**Return value of `FRoot(r: bytes, adrs: bytes)`**

- `fors_root` (Project SHAKE concatenation root, not FIPS 205 `T_k(PK.seed, ADRS, root…)
  - `ROOTS` ←
    - variable `r`
  - `ADRS` ←
    - variable `adrs`

**Algorithm blocks used by this function**: `fors_root`

**Return value of `Goppa(al: int_list)`**

- `goppa_gen_poly` (G(z)=∏(z−αᵢ), αᵢ ∈ GF(2⁸) (AES field) — core McEliece code construction)
  - `ALPHA` ←
    - variable `al`

**Algorithm blocks used by this function**: `goppa_gen_poly`

**Return value of `Syn(h: int_list, y: int_list, m: int, n: int)`**

- `syndrome_calc` (linear-code syndrome s = H·y mod 2; s=0 ⟺ valid codeword)
  - `H` ←
    - variable `h`
  - `Y` ←
    - variable `y`
  - `ROWS` ←
    - variable `m`
  - `COLS` ←
    - variable `n`

**Algorithm blocks used by this function**: `syndrome_calc`

