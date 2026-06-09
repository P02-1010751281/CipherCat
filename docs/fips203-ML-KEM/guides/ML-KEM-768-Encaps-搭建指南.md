# ML-KEM-768 Encaps — 高级复合块搭建指南

> FIPS 203 算法 10 + 13 + 20，k=3，η₁=2，η₂=2，d_u=10，d_v=4，q=3329
> **5 个复合块。** 工作区可见 ~45 块，约 10 分钟搭建。
> 输入：`ek`（1184 字节），`m`（32 字节）。输出：`c`（1088 字节），`K_hat`（32 字节）。

---

## 算法调用链

```
（ML-KEM.Encaps）
  └─ m ←$ {0,1}³²           // 生成 32 随机字节
  └─ ek 长度检查             // 必须 1184 字节（384×3+32）
  └─ 调用

（ML-KEM.Encaps_internal）
  └─ (K̂, r) ← G(m ‖ H(ek))   // G=SHA3-512，H=SHA3-256
  └─ c ← 算法 13(ek, m, r)

算法 13（K-PKE.Encrypt）
  └─ t̂ ← ByteDecode₁₂(ek[0:1152])
  └─ ρ ← ek[1152:1184]
  └─ Â ← SampleNTTMat(ρ)     // k×k 矩阵
  └─ ŷ ← CBDNTTVec(r, η₁)    // k 个向量
  └─ e₁ ← CBDNTTVec(r, η₂)   // k 个向量（偏移 nonce）
  └─ u ← INTT(Âᵀ ∘ ŷ) + e₁
  └─ μ ← Decompress₁(ByteDecode₁(m))
  └─ v ← INTT(t̂ᵀ ∘ ŷ) + e₂ + μ
  └─ c₁ ← CompressEncode₁₀(u)
  └─ c₂ ← CompressEncode₄(v)
  └─ c ← c₁ ‖ c₂
```

---

## 前置：创建所有变量

拖任何逻辑块之前，先创建所有变量。避免 Blockly 后续自动创建类型错误的变量。

**「变量」→「创建变量」** — 按顺序逐一创建：

| # | 变量名 | 类型 | 用途 |
|---|--------|------|------|
| 1 | `ek` | bytes | 封装公钥，1184 字节 |
| 2 | `m` | bytes | 消息，32 字节 |
| 3 | `h` | bytes | SHA3-256(ek)，32 字节 |
| 4 | `g_out` | bytes | SHA3-512(m‖h)，64 字节——中间变量，避免重复计算 |
| 5 | `K_hat` | bytes | 共享密钥 = G 输出字节 0..32 |
| 6 | `r_seed` | bytes | 随机种子 = G 输出字节 32..64 |
| 7 | `t_bytes` | bytes | ek[0:1152] — 编码的 t̂（3 × 384 字节，d=12） |
| 8 | `rho` | bytes | ek[1152:1184] — 32 字节矩阵种子 |
| 9 | `t0_ntt` | poly[256] | NTT(ByteDecode₁₂(ek[0:384])) |
| 10 | `t1_ntt` | poly[256] | NTT(ByteDecode₁₂(ek[384:768])) |
| 11 | `t2_ntt` | poly[256] | NTT(ByteDecode₁₂(ek[768:1152])) |
| 12 | `t_hat` | vec3 | BuildVec₃(t0_ntt, t1_ntt, t2_ntt) |
| 13 | `A` | mat3×3 | SampleNTTMat(ρ, k=3) |
| 14 | `r_hat` | vec3 | CBDNTTVec(r_seed, k=3, η=2) |
| 15 | `u` | vec3 | u = INTT(Âᵀ∘r̂) + e₁ |
| 16 | `mu` | poly[256] | μ = Decompress₁(m) |
| 17 | `v` | poly[256] | v = INTT(t̂ᵀ∘r̂) + e₂ + μ |
| 18 | `c1` | bytes | 压缩编码后的 u，960 字节 |
| 19 | `c2` | bytes | 压缩编码后的 v，128 字节 |
| 20 | `c` | bytes | c = c₁ ‖ c₂，1088 字节 |

---

## 如何阅读每个步骤

| 符号 | 含义 |
|------|------|
| `──next──` | 将上一块的底部凹槽卡入本块顶部凸起（顺序执行） |
| `VALUE ←` | 将块拖入父块的 VALUE 输入插座 |
| `STATE ←` | 将块拖入 STATE 输入插座 |
| `BLOCK ←` | 将块拖入 BLOCK 输入插座 |
| `INPUT ←` | 将块拖入 INPUT 插座 |

**从外向内搭建。** 先拖最外层块，再往内层插座填块。

---

## 步骤 1：初始化 ek 和 m

FIPS 203 算法 10 第 1 行。空文本占位符——运行时注入真实字节值。

### 1a — set ek to

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set ek to` 到工作区左上角。 |
| 2 | 点击 VALUE 插座（右侧拼图缺口）。 |
| 3 | **文本** → 拖 `""` 插入 VALUE 插座。文本字段留空。 |

### 1b — set m to

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set m to` 到工作区。 |
| 2 | 将 1b 顶部凹槽卡入 1a 底部凸起（`──next──`）。 |
| 3 | **文本** → 拖 `""` 插入 VALUE 插座。留空。 |

```
[set ek → ""]──next──[set m → ""]
```

**块数**：2× `variables_set`、2× `text`

---

## 步骤 2：h = SHA3-256(ek)

FIPS 203 算法 10 第 1 行。H = SHA3-256。rate=1088，c=512，suffix=0x06，输出=32 字节。

### 2.1 — 外层

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set h to`。卡入 1b 底部凸起。 |

### 2.2 — Squeeze（第 1 层）

| # | 操作 |
|---|------|
| 1 | **哈希** → 拖 `Squeeze` 插入 `set h to` 的 VALUE 插座。 |
| 2 | rate 下拉选 `1088 (SHA3-256)`。 |

### 2.3 — Absorb（第 2 层）

| # | 操作 |
|---|------|
| 1 | **哈希** → 拖 `Absorb` 插入 `Squeeze` 的 STATE 插座。 |
| 2 | rate 下拉选 `1088`。 |

### 2.4 — Keccak Init（第 3 层，左分支）

| # | 操作 |
|---|------|
| 1 | **哈希** → 拖 `Keccak Init` 插入 `Absorb` 的 STATE 插座。 |

### 2.5 — SHA-3 Pad（第 3 层，右分支）

| # | 操作 |
|---|------|
| 1 | **哈希** → 拖 `SHA-3 Pad` 插入 `Absorb` 的 BLOCK 插座。 |
| 2 | rate：`1088 (SHA3-256)`。suffix：`0x06 (SHA-3)`。 |

### 2.6 — ek 变量（第 4 层）

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `ek` 插入 `SHA-3 Pad` 的 INPUT 插座。 |

### 2.7 — OUTLEN

| # | 操作 |
|---|------|
| 1 | **数学** → 拖数字块插入 `Squeeze` 的 OUTLEN 插座。 |
| 2 | 将默认值 `0` 改为 `32`，回车。 |

**块嵌套结构**：
```
set h = Squeeze(rate=1088, outLen=32,
          state = Absorb(rate=1088,
            state = Keccak Init,
            block = SHA-3 Pad(rate=1088, suffix=0x06, input=ek)))
```

**块数**：1× `set`、1× `Squeeze`、1× `Absorb`、1× `Keccak Init`、1× `SHA-3 Pad`、1× `ek` 引用、1× 数字 `32`

---

## 步骤 3：G(m ‖ h) = SHA3-512 → g_out，再拆分为 K̂、r

FIPS 203 算法 10 第 1 行。G = SHA3-512。rate=576，c=1024，suffix=0x06，输出=64 字节。

先算 SHA3-512 存入 `g_out`，再切两次。避免重复构建海绵链。

### 3a — g_out = SHA3-512(m‖h)

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set g_out to`。卡入步骤 2 底部。 |
| 2 | VALUE ← **哈希** → `Squeeze`。rate：`576 (SHA3-512)`。 |
| 3 | OUTLEN ← **数学** → `64`。 |
| 4 | Squeeze 的 STATE：**哈希** → `Absorb`。rate：`576`。 |
| 5 | Absorb 的 STATE：**哈希** → `Keccak Init`。 |
| 6 | Absorb 的 BLOCK：**哈希** → `SHA-3 Pad`。rate：`576 (SHA3-512)`。suffix：`0x06 (SHA-3)`。 |
| 7 | SHA-3 Pad 的 INPUT：**后量子基础** → `BytesConcat`。 |
| 8 | A 插座 ← `m`。B 插座 ← `h`。 |

```
set g_out = Squeeze(rate=576, outLen=64,
              Absorb(rate=576,
                Keccak Init,
                SHA-3 Pad(rate=576, suffix=0x06,
                  BytesConcat(m, h))))
```

### 3b — K_hat = BytesSlice(g_out, 0, 32)

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set K_hat to`。卡入 3a 底部。 |
| 2 | VALUE ← **后量子基础** → `BytesSlice`。 |
| 3 | INPUT ← `g_out`。 |
| 4 | START ← **数学** → `0`。END ← **数学** → `32`。 |

### 3c — r_seed = BytesSlice(g_out, 32, 64)

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set r_seed to`。卡入 3b 底部。 |
| 2 | VALUE ← **后量子基础** → `BytesSlice`。 |
| 3 | INPUT ← `g_out`。 |
| 4 | START ← **数学** → `32`。END ← **数学** → `64`。 |

**块数**：3× `set`、1× `Squeeze`、1× `Absorb`、1× `Keccak Init`、1× `SHA-3 Pad`、1× `BytesConcat`、2× `BytesSlice`、4× 变量引用、3× 数字块

---

## 步骤 4：解析 ek

FIPS 203 算法 13 第 2–3 行。FIPS 203 算法 10：`ByteDecode_d` 输入 = `32·d` 字节。d=12 → 每多项式 384 字节。k=3 → |t̂| = 1152 字节，|ρ| = 32 字节，|ek| = 1184 字节。

|ek| = |ByteEncode₁₂(t̂)| + |ρ| = 384×3 + 32 = 1184。

### 4a — t_bytes

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t_bytes to`。卡入 3b 底部。 |
| 2 | VALUE ← **后量子基础** → `BytesSlice`。 |
| 3 | INPUT ← **变量** → `ek`。 |
| 4 | START ← **数学** → `0`。END ← **数学** → `1152`。 |

### 4b — rho

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set rho to`。卡入 4a 底部。 |
| 2 | VALUE ← **后量子基础** → `BytesSlice`。 |
| 3 | INPUT ← **变量** → `ek`。 |
| 4 | START ← **数学** → `1152`。END ← **数学** → `1184`。 |

**块数**：2× `set`、2× `BytesSlice`、2× `ek` 引用、4× 数字块

---

## 步骤 5：解码 t̂ → BuildVec₃

FIPS 203 算法 13 第 2 行。ByteDecode₁₂ 每 384 字节切片。`t_bytes` 编码的是 `t̂`（已在 NTT 域），解码后无需 NTT。

### 5a — t0_ntt

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t0_ntt to`。卡入 4b 底部。 |
| 2 | VALUE ← **后量子基础** → `ByteDecode`。d=`12`。 |
| 3 | ByteDecode 的 INPUT：**后量子基础** → `BytesSlice`。 |
| 4 | BytesSlice INPUT ← `t_bytes`。START ← `0`。END ← `384`。 |

```
set t0_ntt = ByteDecode(d=12, BytesSlice(t_bytes, 0, 384))
```

### 5b — t1_ntt

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t1_ntt to`。卡入 5a 底部。 |
| 2–4 | 与 5a 相同。BytesSlice START=`384`，END=`768`。 |

### 5c — t2_ntt

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t2_ntt to`。卡入 5b 底部。 |
| 2–4 | 与 5a 相同。BytesSlice START=`768`，END=`1152`。 |

### 5d — BuildVec₃

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t_hat to`。卡入 5c 底部。 |
| 2 | VALUE ← **后量子高级** → `BuildVec₃`。 |
| 3 | A 插座 ← `t0_ntt`。B 插座 ← `t1_ntt`。C 插座 ← `t2_ntt`。 |

**块数**：3× `set`（t0/t1/t2）、1× `set`（t_hat）、3× `ByteDecode`、3× `BytesSlice`、1× `BuildVec₃`、3× `t_bytes` 引用、3× `t*_ntt` 引用、6× 数字块

---

## 步骤 6–10：后量子高级复合块

每个复合块在代码生成时内部展开为 ~10–30 个基础块。工作区上每步只看到一个块。

### 步骤 6 — SampleNTTMat → A

FIPS 203 算法 13 第 4–8 行。从种子 ρ 生成 k×k SampleNTT 矩阵。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set A to`。卡入 5d 底部。 |
| 2 | VALUE ← **后量子高级** → `SampleNTTMat`。 |
| 3 | k 下拉：`3`。q：`3329`。 |
| 4 | SEED 插座 ← `rho`。 |

### 步骤 7 — CBDNTTVec → r_hat

FIPS 203 算法 13 第 9–12 行。生成 k 个 CBD 采样并 NTT 变换的多项式。Nonce 0,1,2。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set r_hat to`。卡入步骤 6 底部。 |
| 2 | VALUE ← **后量子高级** → `CBDNTTVec`。 |
| 3 | k：`3`，η：`2 (ML-KEM-768/1024)`，q：`3329`。 |
| 4 | SEED 插座 ← `r_seed`。 |

### 步骤 8 — ML-KEM-EncapsU → u

FIPS 203 算法 13 第 13–19 行。计算 u = INTT(Âᵀ∘r̂) + e₁。Nonce k..2k-1（3,4,5）。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set u to`。卡入步骤 7 底部。 |
| 2 | VALUE ← **后量子高级** → `ML-KEM-EncapsU`。 |
| 3 | k：`3`，η：`2`，q：`3329`。 |
| 4 | A 插座 ← `A`。r̂ 插座 ← `r_hat`。seed 插座 ← `r_seed`。 |

### 步骤 9 — Decompress → mu

FIPS 203 §4.2.1，算法 13 第 20 行。Decompress₁(m)：每个比特缩放回 Z_q。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set mu to`。卡入步骤 8 底部。 |
| 2 | VALUE ← **后量子基础** → `Decompress`。 |
| 3 | d：`1`，q：`3329`。INPUT ← `m`。 |

### 步骤 10 — ML-KEM-EncapsV → v

FIPS 203 算法 13 第 21 行。计算 v = INTT(t̂ᵀ∘r̂) + e₂ + μ。Nonce 2k（6）。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set v to`。卡入步骤 9 底部。 |
| 2 | VALUE ← **后量子高级** → `ML-KEM-EncapsV`。 |
| 3 | k：`3`，η：`2`，q：`3329`。 |
| 4 | t̂ 插座 ← `t_hat`。r̂ 插座 ← `r_hat`。seed 插座 ← `r_seed`。μ 插座 ← `mu`。 |

**块数**（步骤 6–10）：5× `set`、5× 复合块、5× 变量引用

---

## 步骤 11–13：压缩编码并拼接

FIPS 203 算法 13 第 22–24 行。

### 步骤 11 — VecCompressEncode(d=10) → c1

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set c1 to`。卡入步骤 10 底部。 |
| 2 | VALUE ← **后量子高级** → `VecCompressEncode`。 |
| 3 | d：`10`，q：`3329`。U 插座 ← `u`。 |

### 步骤 12 — VecCompressEncode(d=4) → c2

v 是单个多项式——用单元素列表包装后再喂给 VecCompressEncode。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set c2 to`。卡入步骤 11 底部。 |
| 2 | VALUE ← **后量子高级** → `VecCompressEncode`。 |
| 3 | d：`4`，q：`3329`。 |
| 4 | U 插座 ← **数组** → `create list with`（1 项）。项 ← `v`。 |

### 步骤 13 — BytesConcat → c

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set c to`。卡入步骤 12 底部。 |
| 2 | VALUE ← **后量子基础** → `BytesConcat`。 |
| 3 | A 插座 ← `c1`。B 插座 ← `c2`。 |

**块数**：3× `set`、2× `VecCompressEncode`、1× `BytesConcat`、1× `lists_create_with`、3× 变量引用

> **VecCompressEncode 内部展开**（代码生成时）：对输入向量的每个多项式独立做 Compress(d, q) → ByteEncode(d)，再 BytesConcat 拼接所有编码结果。d=10 时每个多项式输出 320 字节，3 个 → 960 字节 = c₁。d=4 时输出 128 字节 = c₂。

---

## 完整块清单

| 分类 | 块 | 数量 | Blockly ID |
|------|-----|:---:|------------|
| 变量 | `set VAR to` | 19 | `variables_set` |
| 变量 | `VAR`（引用） | ~20 | `variables_get` |
| 文本 | `""` | 2 | `text` |
| 哈希 | `Keccak Init` | 2 | `hash_sha3_state_init` |
| 哈希 | `SHA-3 Pad` | 2 | `hash_sha3_pad` |
| 哈希 | `Absorb` | 2 | `hash_sha3_absorb` |
| 哈希 | `Squeeze` | 2 | `hash_sha3_squeeze` |
| 后量子基础 | `BytesConcat` | 2 | `pq_byte_concat` |
| 后量子基础 | `BytesSlice` | 5 | `pq_bytes_slice` |
| 后量子基础 | `ByteDecode (d=12)` | 3 | `pq_byte_decode` |
| 后量子基础 | `Decompress (d=1)` | 1 | `pq_decompress` |
| 数论 | `NTT (q=3329)` | 3 | `pq_ntt` |
| 后量子高级 | `BuildVec₃` | 1 | `pq_build_vec3` |
| 后量子高级 | `SampleNTTMat` | 1 | `pq_sample_ntt_mat` |
| 后量子高级 | `CBDNTTVec` | 1 | `pq_cbd_ntt_vec` |
| 后量子高级 | `ML-KEM-EncapsU` | 1 | `pq_atr_intt_add_e1` |
| 后量子高级 | `ML-KEM-EncapsV` | 1 | `pq_tr_intt_add_e2_mu` |
| 后量子高级 | `VecCompressEncode` | 2 | `pq_vec_compress_encode` |
| 数组 | `create list with` | 1 | `lists_create_with` |
| 数学 | 数字块 | ~15 | `math_number` |
| | **总计** | **~45** | |

---

## 验证清单

| # | 检查项 |
|:--:|-------|
| 1 | 20 个变量已创建 |
| 2 | SHA3-256 链嵌套 4 层 |
| 3 | SHA3-512 链（x2）各嵌套 5 层，除 BytesSlice 偏移外完全相同 |
| 4 | t_bytes = ek[0:1152]，每个 t_i 切片 384 字节（FIPS 203 算法 10：32d） |
| 5 | rho = ek[1152:1184] |
| 6 | 5 个复合块的下拉设置正确（k=3，eta=2，d=10/4，q=3329） |
| 7 | v 以单元素列表包装后喂给 VecCompressEncode |
| 8 | 生成代码 执行 验证 c1=960 c2=128 c=1088 K_hat=32 |

### 预期输出大小（ML-KEM-768）

| 字段 | 大小（字节） | 公式 |
|------|:----------:|------|
| c₁ | 960 | 32 × d_u × k = 32 × 10 × 3 |
| c₂ | 128 | 32 × d_v = 32 × 4 |
| c | 1088 | c₁ + c₂ |
| K_hat | 32 | SHA3-512 输出字节 0..32 |

---

## FIPS 203 条款对照

| 步骤 | FIPS 203 | 操作 |
|------|----------|------|
| 2 |  第 1 行 | SHA3-256（FIPS 202 §6） |
| 3 |  第 1 行 | SHA3-512（FIPS 202 §6）→ (K̂, r) |
| 4 | 算法 13 第 2–3 行 | 解析 ek → t̂_bytes、ρ |
| 5 | 算法 13 第 2 行、算法 6、算法 9 | ByteDecode₁₂ + NTT t̂ |
| 6 | 算法 13 第 4–8 行、算法 7 | SampleNTTMat → Â |
| 7 | 算法 13 第 9–12 行、算法 8 | CBDNTTVec → r̂（η₁=2，nonce 0,1,2） |
| 8 | 算法 13 第 13–19 行、算法 10、算法 11 | ML-KEM-EncapsU → u（nonce 3,4,5） |
| 9 | §4.2.1、算法 13 第 20 行 | Decompress₁(m) → μ |
| 10 | 算法 13 第 21 行 | ML-KEM-EncapsV → v（nonce 6） |
| 11 | 算法 13 第 22 行 | Compress₁₀ + ByteEncode₁₀ → c₁ |
| 12 | 算法 13 第 23 行 | Compress₄ + ByteEncode₄ → c₂ |
| 13 | 算法 13 第 24 行 | c = c₁ ‖ c₂ |

---

## 对比：高级块 vs 纯基础块

| | 高级块 | 纯基础块 |
|---|:---:|:---:|
| 可见块数 | ~45 | ~120 |
| 搭建时间 | ~10 分钟 | ~45–60 分钟 |
| 矩阵 A | 1× `SampleNTTMat` | 9× `SampleNTT` + 18× `SeedWithNonce` + 4× `lists_create_with` |
| 向量 r̂ | 1× `CBDNTTVec` | 3× `SamplePolyCBD` + 3× `NTT` + 1× `lists_create_with` |
| u 计算 | 1× `ML-KEM-EncapsU` | 4 个循环 + 9 NTTMul + 9 PolyAdd + 3 INTT + 3 CBD |
| v 计算 | 1× `ML-KEM-EncapsV` | 1 个循环 + 3 NTTMul + 3 PolyAdd + 1 INTT + 1 CBD |
| 压缩编码 | 2× `VecCompressEncode` | 3× Compress + 3× ByteEncode (d=10) + 1× Compress + 1× ByteEncode (d=4) + 2× BytesConcat |
| 适用 | 快速原型 | 教学、调试、验证 |

---

## 附录：参数快速参考

| 参数 | ML-KEM-512 | ML-KEM-768 | ML-KEM-1024 |
|------|:----------:|:----------:|:-----------:|
| k | 2 | 3 | 4 |
| η₁ | 3 | 2 | 2 |
| η₂ | 2 | 2 | 2 |
| d_u | 10 | 10 | 11 |
| d_v | 4 | 4 | 5 |
| \|ek\| | 800 | 1184 | 1568 |
| \|c\| | 768 | 1088 | 1568 |
| \|K\| | 32 | 32 | 32 |

切换参数集：修改 k/η₁/d_u/d_v 下拉即可。算法流程完全一致。

---

## 附录：字节偏移修正

更早版本使用 `BytesSlice(ek, 0, 384)` 和 `BytesSlice(t_bytes, 0, 128)`。**这些值与 FIPS 203 算法 10 不符。**

FIPS 203 算法 10：`ByteDecode_d` 输入 = `32·d` 字节。d=12 → 每多项式 384 字节。k=3 → 总计 1152 字节。

**本指南使用**：t_bytes = ek[0:1152]，各项 t_i 切片按 384 字节边界（0:384、384:768、768:1152），rho = ek[1152:1184]。
