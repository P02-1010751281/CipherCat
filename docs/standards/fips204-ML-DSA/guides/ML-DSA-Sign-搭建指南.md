# ML-DSA-44 Sign — 原子原语链搭建指南

> FIPS 204 算法 7（ML-DSA.Sign_internal）+ 算法 8（ML-DSA.Verify_internal），ML-DSA-44 参数：
> q=8380417，n=256，k=ℓ=4，d=13，γ₁=2¹⁷，γ₂=95232，τ=39，ω=80，β=τ·η=78
> **5 个签名原语块 + 2 个黑盒对照块 + 2 个格基环辅助块。** 工作区可见 ~33 块，约 15 分钟搭建。
> 输入：`sk`（2560 字节）、`msg`（任意长度字节串）。输出：`sig`（2420 字节）/ 布尔。

---

## 算法调用链

### 签名：FIPS 204 算法 7（ML-DSA.Sign_internal）

```
ML-DSA.Sign_internal(sk, M′, rnd)            // 确定性签名 rnd = 0³²
  └─ (ρ, K, tr, s1, s2, t0) ← skDecode(sk)   // 私钥解析
  └─ μ ← H(BytesToBits(tr) ‖ M′, 64)         // 消息代表元（SHAKE256，64B）
  └─ ρ″ ← H(K ‖ rnd ‖ μ, 64)                 // 私有随机种子（SHAKE256，64B）
  └─ 拒绝采样循环（κ = 0, ℓ, 2ℓ, …）：
  └─   y ← ExpandMask(ρ″, κ)                 // 掩码向量，系数 ∈ (−γ₁, γ₁)
  └─   w ← NTT⁻¹(Â ∘ NTT(y))                 // 承诺 w = Ay
  └─   w1 ← HighBits(w)                       // Decompose 高位（r1）
  └─   c̃ ← H(μ ‖ w1Encode(w1), λ/4=32)       // 承诺哈希（SHAKE256，32B）
  └─   c ← SampleInBall(c̃)                   // 挑战多项式，恰 τ=39 个 ±1
  └─   z ← y + c·s1                           // 响应 z
  └─   r0 ← LowBits(w − c·s2)                 // Decompose 低位（r0）
  └─   if ‖z‖∞ ≥ γ₁−β 或 ‖r0‖∞ ≥ γ₂−β → 重试
  └─   h ← MakeHint(−c·t0, w − c·s2 + c·t0)   // hint 位数组
  └─   if ‖c·t0‖∞ ≥ γ₂ 或 wt(h) > ω → 重试
  └─ σ ← sigEncode(c̃, z, h)                  // c̃(32B) ‖ z(2304B) ‖ h(84B) = 2420B
```

### 验签：FIPS 204 算法 8（ML-DSA.Verify_internal）

```
ML-DSA.Verify_internal(pk, M′, σ)
  └─ (ρ, t1) ← pkDecode(pk)                   // 公钥解析
  └─ (c̃, z, h) ← sigDecode(σ)                 // 签名解析；h = ⊥ → false
  └─ Â ← ExpandA(ρ)
  └─ tr ← H(pk, 64)                           // 公钥哈希（SHAKE256，64B）
  └─ μ ← H(BytesToBits(tr) ‖ M′, 64)          // 消息代表元
  └─ c ← SampleInBall(c̃)                      // 验证端重建挑战
  └─ w′ ← UseHint(h, NTT⁻¹(Â ∘ NTT(z) − NTT(c) ∘ NTT(t1·2^d)))
  └─ c̃′ ← H(μ ‖ w1Encode(w1′), 32)           // 重建承诺哈希
  └─ return ‖z‖∞ < γ₁−β 且 c̃ == c̃′
```

**核心思想**：签名端把「承诺 w1」压进挑战 c̃，验证端从公钥（t1 ≈ t/2^d）和签名（z, h）重建近似承诺 w1′，再比对 c̃。hint 修正的是舍入误差：`w − c·s2 + c·t0` 与 `w′` 之间的差来自 t 与 t1·2^d 的舍入（t0 部分），MakeHint/UseHint 负责在验证端恢复。

---

## 原语块角色表

| 块 | Blockly ID | 输入 → 输出 | 下拉 / 固定参数 | FIPS 204 | 签名流程中的角色 |
|----|-----------|------------|-----------------|----------|------------------|
| Power2Round_d | `pq_power2round` | IntList → IntList | `PART`: r1/r0；**d=13 固定** | 算法 35 | KeyGen 生成 t=(t1,t0) 分解；本指南用于 P2R 可逆性演示 |
| Decompose | `pq_decompose` | IntList → IntList | `PART`: r1/r0；**γ₂=95232 固定** | 算法 36 | 签名端 w1=HighBits(w)；验证端恢复 w1′（HighBits/LowBits 即算法 37/38，基于 Decompose） |
| MakeHint | `pq_make_hint` | Z, R（IntList）→ IntList(0/1) | 无下拉；γ₂=95232 固定 | 算法 39 | 签名端 h ← MakeHint(−c·t0, …) |
| UseHint | `pq_use_hint` | H, R（IntList）→ IntList | 无下拉；γ₂=95232 固定 | 算法 40 | 验证端 w1′ ← UseHint(h, w′Approx) |
| SampleInBall | `pq_sample_in_ball` | SEED（Bytes）→ IntList | 无下拉；**τ=39 固定** | 算法 29 | 挑战多项式 c ← SampleInBall(c̃)（两端一致） |
| ML-DSA-44 Sign（黑盒） | `mldsa_sign` | sk, msg（Bytes）→ Bytes | ML-DSA-44 固定 | 算法 2+7 | 完整签名对照（ACVP 30/30） |
| ML-DSA-44 Verify（黑盒） | `mldsa_verify` | pk, msg, sig（Bytes）→ Boolean | ML-DSA-44 固定 | 算法 3+8 | 完整验签对照 |
| ModPow | `nt_mod_pow` | A, B（Number）→ Number | `MODULUS`: 3329 / **8380417** / 12289 / 65537 / 1000000007 | —（§2.5） | 模幂：验证 q 素数（费马小定理）、z 系数约减 |
| PolyMul | `pq_poly_mul` | A, B（IntList）→ IntList | `MODULUS`: none / 3329 / **8380417** / 12289 | —（§2.4） | R_q 环乘法教学（普通卷积 mod q） |
| XOF | `pq_xof` | SEED, OUTLEN → Bytes | `ALGO`: SHAKE128 / **SHAKE256** | 算法 29/34 的 H | μ、ρ″、c̃ 的哈希（SHAKE256） |
| PRF | `pq_prf` | SEED, NONCE, OUTLEN → Bytes | `ALGO`: SHAKE256 / SHAKE128 | 算法 34 | ExpandMask(y) 的伪随机源（seed ‖ nonce） |
| NTT / INTT | `pq_ntt` / `pq_intt` | IntList → IntList | `MODULUS`: 3329 / **8380417** / 12289；`DEGREE`: 256/128 | 算法 41/42 | 环运算 w ← NTT⁻¹(Â∘NTT(y))（q=8380417 分支：ζ=1753, BitRev8, 8 层） |
| NTT Mul | `pq_ntt_mul` | A, B → IntList | `MODULUS`: 3329 / **8380417** | 算法 45 | NTT 域点乘（q=8380417 为逐点乘；q=3329 为 half-NTT 基乘） |
| PolyAdd | `pq_poly_add` | A, B → IntList | `MODULUS`: 3329 / **8380417** | 算法 44 | 向量/多项式加法 |
| SampleNTT | `pq_sample_ntt` | SEED → IntList | `MODULUS`: 3329 / **8380417** | 算法 30 | 矩阵 A 的 NTT 域采样（q=8380417：SHAKE128 3 字节 → 23-bit < q） |

> ⚠ **块事实**：签名原语（前 5 块）内部固定 ML-DSA-44 参数（d=13、γ₂=95232、τ=39），
> q=8380417 已内嵌。NTT 域环运算块（`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_poly_add`/`pq_sample_ntt`）
> 均已支持 **q=8380417（ML-DSA）**——NTT 分支按 FIPS 204 Alg 41/42（ζ=1753、BitRev8、INTT 乘 256⁻¹），
> 见步骤 8c 的完整拼装与 `demos/procedures/ML-DSA-NTT.json` 性质向量。

---

## 前置：理解两个 demo

本指南的两条搭建线对应两个已入库 demo（`demos/procedures/`）：

| demo | 内容 | 验证 |
|------|------|------|
| `ML-DSA-Primitives.json` | 7 个签名原语 procedure（P2R_High / P2R_Low / Dec_High / Dec_Low / Make_Hint / Use_Hint / In_Ball） | 性质向量（P2R 可逆、UseHint(MakeHint) 定理、InBall 恰 39 个 ±1） |
| `ML-DSA-Sign.json` | 黑盒 MLDSA_Sign / MLDSA_Verify（内嵌 sk 2560B / pk 1312B / msg 2934B） | FIPS 204 ACVP 官方向量（sig 2420B，首字节 `dd36ebcc…`） |

原语 procedure 使用**带类型参数的 `procedures_defreturn`**（函数类目，支持 int_list / bytes 参数），
driver 侧注入 r、z、seed 等实参做性质断言——这是「场景 9 完整原子链 + 官方向量」的既有惯例。

## 如何阅读每个步骤

| 符号 | 含义 |
|------|------|
| `──next──` | 将上一块的底部凹槽卡入本块顶部凸起（顺序执行） |
| `RETURN ←` | 将块拖入 procedure 的 RETURN 插座（函数返回值） |
| `INPUT ←` | 将块拖入 VALUE 输入插座 |
| `PARAM ←` | 将参数变量引用块拖入输入插座 |

**从外向内搭建。** 先拖最外层块（procedure），再往内层插座填原语块。

---

## 步骤 1：P2R_High — Power2Round 高位

FIPS 204 算法 35。`r = r1·2¹³ + r0 mod q`，r0 ∈ (−2¹², 2¹²]。r1 用于公钥 t1，r0 用于签名提示。

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn` 到工作区。 |
| 2 | 双击 NAME 字段，改为 `P2R_High`。 |
| 3 | 点击块首齿轮/设置按钮，添加参数 `r`，类型选 `int_list`。 |
| 4 | **后量子高级** → 拖 `Power2Round_d` 插入 RETURN 插座。 |
| 5 | PART 下拉：`r1 (高位)`。 |
| 6 | INPUT ← **变量** → `r`（参数引用）。 |

```
procedures_defreturn P2R_High(r: int_list)
  RETURN = Power2Round_d(part=r1, INPUT = r)
```

**块数**：1× `procedures_defreturn`、1× `pq_power2round`、1× 参数引用

---

## 步骤 2：P2R_Low — Power2Round 低位

与步骤 1 完全相同，仅 PART 下拉改为 `r0 (低位)`。

```
procedures_defreturn P2R_Low(r: int_list)
  RETURN = Power2Round_d(part=r0, INPUT = r)
```

**块数**：1× `procedures_defreturn`、1× `pq_power2round`、1× 参数引用

> **性质 1（P2R 可逆）**：对任意 r ∈ Z_q，`(P2R_High(r)[i]·8192 + P2R_Low(r)[i]) mod q == r[i]`（256 系数全过）。
> 8192 = 2¹³ 即 d=13 的缩放因子。

---

## 步骤 3：Dec_High — Decompose 高位

FIPS 204 算法 36。`r = r1·2γ₂ + r0`，r0 ∈ (−γ₂, γ₂]，γ₂=95232。签名端 w1 = HighBits(w) 即 Decompose(w).r1。

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn`，NAME 改为 `Dec_High`。 |
| 2 | 添加参数 `r`，类型 `int_list`。 |
| 3 | RETURN ← **后量子高级** → `Decompose`。 |
| 4 | PART 下拉：`r1 (高位)`。INPUT ← 参数 `r`。 |

**块数**：1× `procedures_defreturn`、1× `pq_decompose`、1× 参数引用

---

## 步骤 4：Dec_Low — Decompose 低位

与步骤 3 相同，PART 下拉改为 `r0 (低位)`。

```
procedures_defreturn Dec_Low(r: int_list)
  RETURN = Decompose(part=r0, INPUT = r)
```

**块数**：1× `procedures_defreturn`、1× `pq_decompose`、1× 参数引用

---

## 步骤 5：Make_Hint — hint 生成

FIPS 204 算法 39。`MakeHint(z, r)`：逐系数比较 HighBits(r) 与 HighBits(r+z)，不同 → 1。
签名端调用 `h ← MakeHint(−c·t0, w − c·s2 + c·t0)`，把 t0 舍入差异记录为 0/1 位。

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn`，NAME 改为 `Make_Hint`。 |
| 2 | 添加参数 `z`、`r`，类型均为 `int_list`。 |
| 3 | RETURN ← **后量子高级** → `MakeHint`。 |
| 4 | Z 插座 ← 参数 `z`。R 插座 ← 参数 `r`。 |

```
procedures_defreturn Make_Hint(z: int_list, r: int_list)
  RETURN = MakeHint(z, r)
```

**块数**：1× `procedures_defreturn`、1× `pq_make_hint`、2× 参数引用

---

## 步骤 6：Use_Hint — hint 使用

FIPS 204 算法 40。`UseHint(h, r)`：逐系数用 hint 位修正 r1（h=1 且 r0>0 → +1，r0≤0 → −1，模 m=44）。
验证端从 `w′Approx` 重建承诺 w1′。

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn`，NAME 改为 `Use_Hint`。 |
| 2 | 添加参数 `h`、`r`，类型均为 `int_list`。 |
| 3 | RETURN ← **后量子高级** → `UseHint`。 |
| 4 | H 插座 ← 参数 `h`。R 插座 ← 参数 `r`。 |

**块数**：1× `procedures_defreturn`、1× `pq_use_hint`、2× 参数引用

> **性质 2（UseHint(MakeHint) 定理）**：`h = MakeHint(z, r)` 且 `rsum = (r+z) mod q` 时，
> `Use_Hint(h, rsum) == Dec_High(rsum)`——hint 精确补偿了「先加 z 再取高位」与「先取高位再加」的舍入差。
> 这是验签能重建 w1′ 的数学基础。

---

## 步骤 7：In_Ball — 挑战多项式采样

FIPS 204 算法 29。`SampleInBall(c̃)`：SHAKE256(c̃) 采样，恰 τ=39 个非零系数（±1，符号由输出字节决定），
其余为 0。签名与验签两端必须得到同一个 c——这是承诺绑定的关键。

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn`，NAME 改为 `In_Ball`。 |
| 2 | 添加参数 `seed`，类型 `bytes`。 |
| 3 | RETURN ← **后量子高级** → `SampleInBall`。 |
| 4 | SEED 插座 ← 参数 `seed`。 |

```
procedures_defreturn In_Ball(seed: bytes)
  RETURN = SampleInBall(SEED = seed)
```

**块数**：1× `procedures_defreturn`、1× `pq_sample_in_ball`、1× 参数引用

> **性质 3（稀疏性）**：对 seed = [1,2,3,4,5,6,7,8]，输出长度 256、恰 39 个非零、
> 非零系数 ∈ {−1, +1}（τ=39 与 ML-DSA-44 一致；65/87 为 49/60）。

---

## 步骤 8：格基环辅助 — q=8380417 的模运算

FIPS 204 §2.4–2.5：环 R_q = Z_q[X]/(X²⁵⁶+1)，q = 2²³−2¹³+1 = 8380417。
原语链的完整拼装需要 NTT 域环运算（见附录缺口），本节先用两个「支持 8380417」的块验证 q 的代数性质。

### 8a — 费马小定理：q 是素数

| # | 操作 |
|---|------|
| 1 | **demo 工作区 JSON** → `ModPow`（`nt_mod_pow`）。 | 
| 2 | A ← 数字 `2`。B ← 数字 `8380416`（q−1）。 |
| 3 | `MODULUS` 下拉：`8380417 (ML-DSA)`。 |
| 4 | 执行（driver 断言）：结果为 `1`。 |

> `2^(q−1) ≡ 1 mod 8380417`（费马小定理）验证 q 为素数——NTT 存在的代数前提。
> `nt_mod_pow` 收录于通用块（`remaining.ts`），工具箱主类目未挂载，程序化 demo 工作区 JSON 可直接引用。

### 8b — R_q 环乘法：pq_poly_mul

| # | 操作 |
|---|------|
| 1 | **数论** → `PolyMul`。A ← `[1, 2, 3]`（或 IntList 变量）。B ← `[4, 5]`。 |
| 2 | `MODULUS` 下拉：`8380417 (ML-DSA)`。 |
| 3 | driver 断言：`PolyMul(a,b) == [4, 13, 22, 15]`（普通卷积 [1·4, 1·5+2·4, 2·5+3·4, 3·5] 逐系数 mod q）。 |

> 与 `pq_ntt_mul`（NTT 域点乘）对比教学：普通卷积 vs 逐点乘。结合律/交换律/分配律可作性质向量
> （见 `demos/procedures/PQC-Gaps.json` 的卷积性质组）。

**块数**：1× `nt_mod_pow`、2× `pq_poly_mul`、~4× 数字块

### 8c — NTT 域环运算：w ← NTT⁻¹(Â∘NTT(y)) 的原子拼装

FIPS 204 签名主链（Alg 7 step 7-8）的核心环运算，现在可全部用原子块拼装（q=8380417）：

| # | 操作 | 块 | 下拉 |
|---|------|-----|------|
| 1 | 采样矩阵 A 的 NTT 域表示 | **数论/后量子** → `SampleNTT`（SEED ← seed‖s‖r 字节） | `MODULUS`: **8380417** |
| 2 | y 正向变换 | `NTT(y)` | `MODULUS`: **8380417**, `DEGREE`: 256 |
| 3 | NTT 域点乘 | `NTT Mul(Â, NTT(y))` | `MODULUS`: **8380417** |
| 4 | 逆变换回系数域 | `INTT(·)` | `MODULUS`: **8380417**, `DEGREE`: 256 |
| 5 | （对照）逐点乘 vs 普通卷积 | `NTT Mul` vs `PolyMul` | 均可选 8380417 |

**算法约定（FIPS 204 §6.3.2-6.3.4）**：NTT 为 Cooley-Tukey 8 层（len 128→1），
旋转因子 `zetas[m] = 1753^BitRev8(m) mod q`（ζ=1753 = 2³² mod q，512 次本原根）；
INTT 为 Gentleman-Sande 8 层（-zetas[m]），末乘 256⁻¹ = 8347681；NTT 域乘法为逐点乘 mod q。
与 Kyber（q=3329，ζ=17，half-NTT 7 层 + 基乘）**不是同一约定**——下拉按 q 自动分发。

**性质向量**（`demos/procedures/ML-DSA-NTT.json`，双语言 PASS）：

| 性质 | 断言 |
|------|------|
| NTT 往返 | `INTT(NTT(p)) == p`（256 系数） |
| NTT 同态 | `NTT(a·b mod (X²⁵⁶+1)) == NTT(a) ∘ NTT(b)`（负缠绕卷积 vs NTT 域点乘） |

**块数**：5× NTT 域块 + 数字块，demo 工作区 3 个 def 函数（`NTT1`/`INTT1`/`MUL1`）。

---

## 步骤 9：黑盒对照 — MLDSA_Sign / MLDSA_Verify

用黑盒块跑通完整签名/验签，作为原语链的**正确性基准**（ACVP 官方向量）。

### 9a — MLDSA_Sign

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn`，NAME 改为 `MLDSA_Sign`（无参数）。 |
| 2 | RETURN ← **后量子高级** → `ML-DSA-44 Sign`。 |
| 3 | SECRET_KEY ← **数据** → `data_value`，粘贴 sk 2560 字节字面量（`0x9c,0xe7,0xae,…`）。 |
| 4 | MESSAGE ← **数据** → `data_value`，粘贴 msg 2934 字节字面量。 |

### 9b — MLDSA_Verify

| # | 操作 |
|---|------|
| 1 | **函数** → 拖 `procedures_defreturn`，NAME 改为 `MLDSA_Verify`（无参数）。 |
| 2 | RETURN ← **后量子高级** → `ML-DSA-44 Verify`。 |
| 3 | PUBLIC_KEY ← `data_value`（pk 1312 字节）。MESSAGE ← `data_value`（同 msg）。 |
| 4 | SIGNATURE ← `data_value`（sig 2420 字节，首字节 `0xdd,0x36,0xeb,0xcc,…`）。 |

```
procedures_defreturn MLDSA_Sign()
  RETURN = ML-DSA-44 Sign(SECRET_KEY = sk, MESSAGE = msg)

procedures_defreturn MLDSA_Verify()
  RETURN = ML-DSA-44 Verify(PUBLIC_KEY = pk, MESSAGE = msg, SIGNATURE = sig)
```

**块数**：2× `procedures_defreturn`、1× `mldsa_sign`、1× `mldsa_verify`、5× `data_value`

---

## 完整块清单

| 分类 | 块 | 数量 | Blockly ID |
|------|-----|:---:|------------|
| 函数 | `procedures_defreturn`（P2R_High / P2R_Low / Dec_High / Dec_Low / Make_Hint / Use_Hint / In_Ball / MLDSA_Sign / MLDSA_Verify） | 9 | `procedures_defreturn` |
| 后量子高级 | `Power2Round_d`（PART=r1 / r0） | 2 | `pq_power2round` |
| 后量子高级 | `Decompose`（PART=r1 / r0） | 2 | `pq_decompose` |
| 后量子高级 | `MakeHint` | 1 | `pq_make_hint` |
| 后量子高级 | `UseHint` | 1 | `pq_use_hint` |
| 后量子高级 | `SampleInBall` | 1 | `pq_sample_in_ball` |
| 后量子高级 | `ML-DSA-44 Sign` | 1 | `mldsa_sign` |
| 后量子高级 | `ML-DSA-44 Verify` | 1 | `mldsa_verify` |
| 数论 | `ModPow`（MODULUS=8380417） | 1 | `nt_mod_pow` |
| 数论 | `PolyMul`（MODULUS=8380417） | 2 | `pq_poly_mul` |
| 哈希 | `XOF`（SHAKE256）/ `PRF`（SHAKE256） | 0–2（可选） | `pq_xof` / `pq_prf` |
| 变量 | 参数引用 | 9 | `variables_get` |
| 数据 | `data_value`（sk/msg/pk/sig 字面量） | 5 | `data_value` |
| 数学 | 数字块 | ~6 | `math_number` |
| | **总计** | **~33** | |

---

## 验证清单

| # | 检查项 |
|:--:|-------|
| 1 | 7 个原语 procedure 命名与参数类型正确（r/z/seed 为 int_list 或 bytes） |
| 2 | `pq_power2round` / `pq_decompose` 的 PART 下拉：步骤 1/3 选 r1，步骤 2/4 选 r0 |
| 3 | `Make_Hint`/`Use_Hint` 的插座接线：Z/H 与 R 各就各位 |
| 4 | `In_Ball` 的 seed 参数类型为 bytes |
| 5 | `nt_mod_pow` 的 MODULUS 下拉 = `8380417 (ML-DSA)` |
| 6 | 黑盒对照：sk 2560B / pk 1312B / msg 2934B / sig 2420B 长度正确 |
| 7 | 生成代码 执行 验证：性质向量 3 组 + ACVP sig 首字节 dd36ebcc |

### 验证命令

先构建验证 harness，再逐 demo 执行（构建只需一次）：

```bash
npx vite build --config vite.verify.config.ts
node dist-verify/verify-demo.js demos/procedures/ML-DSA-Primitives.json --exec
node dist-verify/verify-demo.js demos/procedures/ML-DSA-Sign.json --exec
```

### 预期输出

```
# ML-DSA-Primitives.json（性质向量，driver 断言，失败即抛异常）
MLDSA_PRIMS_OK
#  断言内容：
#  ① P2R 可逆：P2R_High(r)·8192 + P2R_Low(r) ≡ r (mod 8380417)，256 系数全过
#  ② UseHint(MakeHint)：Use_Hint(Make_Hint(z,r), (r+z) mod q) == Dec_High((r+z) mod q)
#  ③ InBall：长度 256、恰 39 个非零、系数 ∈ {−1, 0, 1}

# ML-DSA-Sign.json（ACVP 官方向量）
dd36ebcc94cd8834e17132b10458e43557357c09a5b855592ecb412bc27480f21…（2420 字节 = 4840 hex）
True
```

`mldsa_sign` / `mldsa_verify` 块实现本身已通过 **NIST ACVP sigGen ML-DSA-44 deterministic 30/30**
（external + internal 接口，双语言 PASS）；本 demo 内嵌其中一组向量做端到端回归。

---

## FIPS 204 条款对照

| 步骤 | FIPS 204 | 操作 |
|------|----------|------|
| 1–2 | 算法 35（§3.4） | Power2Round_d(r) → (r1, r0)，d=13 |
| 3–4 | 算法 36（§3.4）；HighBits/LowBits = 算法 37/38 | Decompose(r, 2γ₂) → (r1, r0)，γ₂=95232 |
| 5 | 算法 39（§3.4） | MakeHint(z, r)：HighBits(r) ≠ HighBits(r+z) → 1 |
| 6 | 算法 40（§3.4） | UseHint(h, r)：按 hint 位 ±1 修正 r1（模 m=44） |
| 7 | 算法 29（§3.3） | SampleInBall(ρ)：SHAKE256 采样 τ=39 个 ±1 |
| 8a | §2.5 | q = 2²³−2¹³+1 素数性（费马小定理） |
| 8b | §2.4 | R_q = Z_q[X]/(X²⁵⁶+1) 环乘法（普通卷积 mod q） |
| 9a | 算法 7 + 算法 2 | ML-DSA.Sign_internal（黑盒对照） |
| 9b | 算法 8 + 算法 3 | ML-DSA.Verify_internal（黑盒对照） |

---

## 对比：原语链 vs 黑盒

| | 原语链（步骤 1–8） | 黑盒（步骤 9） |
|---|:---:|:---:|
| 可见块数 | ~33 | 9 |
| 搭建时间 | ~15 分钟 | ~3 分钟 |
| 教学价值 | 逐原语理解舍入/采样/提示机制 | 端到端正确性基准 |
| 数学细节 | 每个原语可独立验证性质向量 | 封装在闭包内 |
| NTT 环运算 | 缺 8380417 原子块（见附录） | 内部完整实现 |
| 适用 | 教学、调试、性质验证 | 快速原型、对照 |

---

## 附录：参数快速参考（FIPS 204 Table 1/2）

| 参数 | ML-DSA-44 | ML-DSA-65 | ML-DSA-87 |
|------|:---------:|:---------:|:---------:|
| k = ℓ | 4 | 5 | 7 |
| η | 2 | 4 | 2 |
| τ | 39 | 49 | 60 |
| β = τ·η | 78 | 196 | 120 |
| λ | 128 | 192 | 256 |
| q | 8380417 | 8380417 | 8380417 |
| d | 13 | 13 | 13 |
| γ₁ | 2¹⁷ | 2¹⁹ | 2¹⁹ |
| γ₂ | (q−1)/88 = 95232 | (q−1)/32 = 261888 | (q−1)/32 |
| ω | 80 | 55 | 75 |
| \|pk\| | 1312 | 1952 | 2592 |
| \|sk\| | 2560 | 4032 | 4896 |
| \|σ\| | 2420 | 3309 | 4627 |

签名布局（44）：`σ = c̃(32B) ‖ z(4×576B=2304B) ‖ h(ω+k=84B)`。
z 每系数 18 位（bitlen(2γ₁)=18，BitPack(z, γ₁−1, γ₁)）；h 为 HintBitPack（ω+k 字节，存非零位置 + 累计 Index）。

---

## 附录：格基环运算 q 支持现状

| 块 | 下拉选项 | ML-DSA (q=8380417) |
|----|----------|:---:|
| `pq_ntt` / `pq_intt` | 3329, **8380417**, 12289 | ✅（ζ=1753, BitRev8, 8 层 CT/GS, INTT 乘 256⁻¹） |
| `pq_ntt_mul` | 3329, **8380417** | ✅（逐点乘；q=3329 为 half-NTT 基乘） |
| `pq_poly_add` | 3329, **8380417** | ✅（逐系数 mod q） |
| `pq_sample_ntt` | 3329, **8380417** | ✅（SHAKE128 3 字节 → 23-bit < q） |
| `nt_mod_pow` | 3329, **8380417**, 12289, 65537, 1000000007 | ✅ |
| `pq_poly_mul` | none, 3329, **8380417**, 12289 | ✅ |

**2026-08-05 补齐**：NTT 域四块（`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_poly_add`/`pq_sample_ntt`）新增
q=8380417 下拉，生成器按 `MODULUS` 字段分发到 FIPS 204 约定（与 Kyber half-NTT 不同分支）。
「w ← NTT⁻¹(Â∘NTT(y))」完整原子链拼装见**步骤 8c**，性质向量见 `demos/procedures/ML-DSA-NTT.json`
（往返 + 负缠绕同态，Python/JS 双语言 PASS）。

---

## 附录：参考文件

- 标准章节：`docs/standards/fips204-ML-DSA/`（README 参数表 + 算法 2/3/7/8/20/26/29/35/36/39/40 章节目录）
- demo：`demos/procedures/ML-DSA-Primitives.json`、`demos/procedures/ML-DSA-Sign.json`
- 官方向量：NIST ACVP sigGen ML-DSA-44 deterministic（30/30）
- 块实现：`src/blocks/mldsa/`（primitives.ts + blocks.ts）、`src/generators/{javascript,python}/mldsa/`
