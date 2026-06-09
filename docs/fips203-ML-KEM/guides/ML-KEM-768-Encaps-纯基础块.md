# ML-KEM-768 Encaps — 纯基础块搭建指南

> FIPS 203 算法 10 + 13 + 20，k=3，η₁=2，η₂=2，d_u=10，d_v=4，q=3329
> **零复合块。** 每个 XOF/PRF/NTT/PolyAdd/Compress 均手动拖块接线。
> 输入：`ek`（1184 字节），`m`（32 字节）。输出：`c`（1088 字节），`K_hat`（32 字节）。

---

## 为什么需要这份指南

高级块搭建指南使用 5 个复合块，每个在代码生成时内部展开为 ~10–30 个基础块——工作区可见 ~45 块，约 10 分钟搭建。

本指南将每一个原语操作显式接线——可见约 120 块，搭建约 45–60 分钟。每个 XOF 吸收、NTT 蝶形运算、NTT 域乘法、系数加法都是独立的块。

| 适用场景 |
|---------|
| 逐块理解 ML-KEM 内部结构 |
| 逐步教学或演示算法 |
| 对比复合块展开结果进行代码生成调试 |
| 验证复合块是否正确展开 |

---

## 用 math_arithmetic 计算 nonce 偏移

Blockly 的 **Math**（数学）分类包含 `math_arithmetic`——一个支持 `+`、`-`、`×`、`÷`、`^` 的标准块。可用于循环内计算 `3 + i` 等 nonce 偏移。

| 分类 | 块 | 设置 |
|------|-----|------|
| **Math** | `math_arithmetic` | 下拉选 `+`。A = 数字 `3`。B = 变量 `i`。 |

**循环方式**：有了 `math_arithmetic`，步骤 8 用双层 `ctrl_iterate`（i 外层，j 内层）循环计算，nonce 偏移用 3 + i。无需三次手动展开。

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
| 9 | `t_hat` | array[3] | 循环直接写入，手动方式需 t0_ntt/t1_ntt/t2_ntt（可选） |
| 10 | `A` | array[3] | 循环直接写入；`row` 为循环内临时变量（自动创建） |
| 11 | `r_hat` | array[3] | 循环直接写入 |
| 12 | `acc` | poly[256] | PolyAdd 累加器（跨步骤复用） |
| 13 | `e1` | poly[256] | e₁ = CBD₂(r_seed‖(k+i))，循环复用 |
| 16 | `u` | array[3] | 加密输出 u（3 个多项式） |
| 17 | `mu` | poly[256] | μ = Decompress₁(ByteDecode₁(m)) |
| 18 | `e2` | poly[256] | e₂ = CBD₂(r_seed‖6) |
| 19 | `v` | poly[256] | 加密输出 v（1 个多项式） |
| 20 | `c1` | bytes | c₁ = ∥ᵢ ByteEncode₁₀(Compress₁₀(u[i]))，960 字节 |
| 21 | `encoded` | bytes | 循环内临时变量，单次编码结果 |
| 22 | `c2` | bytes | 压缩编码后的 v，128 字节 |
| 23 | `c` | bytes | c = c₁‖c₂，1088 字节 |

> 不要预创建 `i` 和 `j`。拖 `ctrl_iterate` 块时会自动创建。

---

## 如何阅读每个步骤

| 符号 | 含义 |
|------|------|
| `──next──` | 将上一块的底部凹槽卡入本块顶部凸起（顺序执行） |
| `VALUE ←` | 将块拖入父块的 VALUE 输入插座 |
| `STATE ←` | 将块拖入 STATE 输入插座 |
| `BLOCK ←` | 将块拖入 BLOCK 输入插座 |
| `INPUT ←` | 将块拖入 INPUT 插座 |

从外向内搭建。先拖最外层块（通常是 `set 变量 to`），再往内层插座填块。

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

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 2 |
| 文本 | `""` | 2 |

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

```
set h = Squeeze(rate=1088, outLen=32,
          state = Absorb(rate=1088,
            state = Keccak Init,
            block = SHA-3 Pad(rate=1088, suffix=0x06, input=ek)))
```

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 1 |
| 哈希 | `Squeeze` | 1 |
| 哈希 | `Absorb` | 1 |
| 哈希 | `Keccak Init` | 1 |
| 哈希 | `SHA-3 Pad` | 1 |
| 变量 | `ek` 引用 | 1 |
| 数学 | 数字 `32` | 1 |

---

## 步骤 3：G(m ‖ h) = SHA3-512 → g_out，再拆分为 K̂、r

FIPS 203 算法 10 第 1 行。G = SHA3-512。rate=576，c=1024，suffix=0x06，输出=64 字节。

先算 SHA3-512 存入 `g_out`，再切两次。避免重复构建海绵链。

### 3a — g_out = SHA3-512(m‖h)

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set g_out to`。卡入 2.7 底部。 |
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

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 3 |
| 哈希 | `Squeeze` | 1 |
| 哈希 | `Absorb` | 1 |
| 哈希 | `Keccak Init` | 1 |
| 哈希 | `SHA-3 Pad` | 1 |
| 后量子基础 | `BytesConcat` | 1 |
| 后量子基础 | `BytesSlice` | 2 |
| 变量 | 引用（m、h、g_out） | 4 |
| 数学 | 数字 | 3 |

---

## 步骤 4：解析 ek

FIPS 203 算法 13 第 2–3 行。ek = ByteEncode₁₂(t̂) ‖ ρ。k=3、d=12 时：|t̂| = 384×3 = 1152 字节，|ρ| = 32 字节，|ek| = 1184 字节。

### 4a — t_bytes

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t_bytes to`。卡入 3c 底部。 |
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

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 2 |
| 后量子基础 | `BytesSlice` | 2 |
| 变量 | `ek` 引用 | 2 |
| 数学 | 数字 | 4 |

---

## 步骤 5：解码 t̂ → 写入 t_hat 数组（循环方式）

FIPS 203 算法 13 第 2 行。ek 中的 t 已经是 NTT 域编码（KeyGen 时已做 `ByteEncode₁₂(NTT(s))`），ByteDecode₁₂ 解码后**直接**就是 t̂，不需要再 NTT。

用 `ctrl_iterate` 循环 + `math_arithmetic` 计算偏移量，避免三次手动重复。循环变量 `i` 自动创建。

### 5a — 初始化 t_hat 占位数组

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set t_hat to`。卡入 4b 底部。 |
| 2 | VALUE ← **数组** → `create list with item repeated`。ITEM=`0`，TIMES=`3`。 |

### 5b — 循环 i=0..2：解码并写入 t_hat[i]

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡入 5a 底部。VAR=`i`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**数组** → 拖 `in list ... set # ... as`。 |
| 3 | LIST=**变量** → `t_hat`。INDEX=**变量** → `i`。 |
| 4 | VALUE ← **后量子基础** → `ByteDecode`。d=`12`。 |
| 5 | ByteDecode 的 INPUT：**后量子基础** → `BytesSlice`。 |
| 6 | BytesSlice INPUT ← `t_bytes`。 |
| 7 | START ← **Math** → `math_arithmetic`。下拉选 `×`。A=**变量** → `i`。B=**Math** → `384`。 |
| 8 | END ← **Math** → `math_arithmetic`。下拉选 `×`。A=**Math** → `math_arithmetic`（下拉 `+`，A=`i`，B=`1`）。B=**Math** → `384`。 |

**START 计算**：`i × 384`（i=0→0, i=1→384, i=2→768）
**END 计算**：`(i + 1) × 384`（i=0→384, i=1→768, i=2→1152）

```
ctrl_iterate i=0..2:
  lists_setIndex(t_hat, i,
    ByteDecode(d=12,
      BytesSlice(t_bytes, i*384, (i+1)*384)))
```

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 1 |
| 控制 | `ctrl_iterate` | 1 |
| 数组 | `lists_repeat` | 1 |
| 数组 | `lists_setIndex` | 1 |
| 后量子基础 | `ByteDecode` | 1 |
| 后量子基础 | `BytesSlice` | 1 |
| Math | `math_arithmetic` | 3 |
| 变量 | `t_bytes`/`t_hat`/`i` 引用 | 4 |
| Math | 数字 | 3 |

> **对比手动方式**：手动方式需 3× `set` + 3× NTT + 3× ByteDecode + 3× BytesSlice + 1× `create list with` ≈ 16 块。循环方式约 9 块，节省 ~7 块，且可扩展到任意 k 值。
>
> 手动方式参考：分别创建 t0_ntt/t1_ntt/t2_ntt 变量，各自计算 `NTT(ByteDecode(BytesSlice(t_bytes, 0, 384)))`、`...384,768)`、`...768,1152)`，再用 `create list with` 组装 t_hat。

---

## 步骤 6：生成矩阵 Â（双层嵌套循环）

FIPS 203 算法 13 第 4–8 行。Â[i][j] = SampleNTT(ρ ‖ j ‖ i)。种子顺序是先 j 后 i，与 FIPS 203 一致。

注：SampleNTT 使用 SHAKE128 流式挤压输出，系数本身就是 NTT 域表示，无需再调用 NTT()。代码生成器已自动处理。

双层 `ctrl_iterate` 循环，直接写入 `A` 数组。

### 6a — 初始化 A 占位数组

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set A to`。卡入 5b 底部。 |
| 2 | VALUE ← **数组** → `create list with item repeated`。ITEM=`0`，TIMES=`3`。 |

### 6b — 外层循环 i=0..2

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡入 6a 底部。VAR=`i`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**变量** → 拖 `set row to`。 |
| 3 | VALUE ← **数组** → `create list with item repeated`。ITEM=`0`，TIMES=`3`。 |

### 6c — 内层循环 j=0..2（在 6b 的 DO 区域内）

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡入 6b 的 `set row` 之后。VAR=`j`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**数组** → 拖 `in list ... set # ... as`。 |
| 3 | LIST=**变量** → `row`。INDEX=**变量** → `j`。 |
| 4 | VALUE ← **后量子高级** → `SampleNTT`。q=`3329 (Kyber)`。 |
| 5 | SampleNTT 的 SEED ← **后量子基础** → `SeedWithNonce`。 |
| 6 | SeedWithNonce 的 SEED ← **后量子基础** → `SeedWithNonce`（SEED=`rho`，NONCE=`j`）。 |
| 7 | SeedWithNonce 的 NONCE ← **变量** → `i`。 |

> 种子构造：`SeedWithNonce(SeedWithNonce(rho, j), i)` = `rho ‖ j ‖ i`，先 j 后 i。

### 6d — 外层循环尾部：将 row 写入 A[i]

| # | 操作 |
|---|------|
| 1 | 在 6c 循环块**之后**、外层 DO 区域内：**数组** → 拖 `in list ... set # ... as`。 |
| 2 | LIST=**变量** → `A`。INDEX=**变量** → `i`。VALUE=**变量** → `row`。 |

```
	set A = [0, 0, 0]
	ctrl_iterate i=0..2:
	  set row = [0, 0, 0]
	  ctrl_iterate j=0..2:
	    row[j] = SampleNTT(q=3329,
	               SeedWithNonce(
	                 SeedWithNonce(rho, j),
	                 i))      # ρ ‖ j ‖ i
	  A[i] = row

> `SampleNTT` 输出即 NTT 域系数，无需额外 `NTT()` 调用。
```

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 2 |
| 控制 | `ctrl_iterate` | 2 |
| 数组 | `lists_repeat` | 2 |
| 数组 | `lists_setIndex` | 2 |
| 后量子高级 | `SampleNTT` | 1 |
| 后量子基础 | `SeedWithNonce` | 2 |
| 变量 | `rho`/`A`/`row`/`i`/`j` 引用 | 5 |
| 数学 | 数字 | 2 |

> **对比手动方式**：手动需 9× `set`（Aij）+ 3× `set`（row）+ 1× `set`（A）+ 9× SampleNTT + 18× SeedWithNonce + 4× `lists_create_with` ≈ 65 块。循环约 12 块，节省 ~53 块，且可扩展到任意 k（改 TIMES 即可）。
>
> 手动方式参考：分别创建 A00..A22 共 9 个变量，每个 = `SampleNTT(SeedWithNonce(SeedWithNonce(rho, j), i))`，再用 row0/row1/row2 组装数组的数组。

---

## 步骤 7：生成 r̂ 向量（循环方式）

FIPS 203 算法 13 第 9–12 行。r̂[i] = NTT(SamplePolyCBD₂(r_seed ‖ i))。nonce = i，无需算术运算，循环最简。

### 7a — 初始化 r_hat 占位数组

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set r_hat to`。卡入 6b 底部（循环外）。 |
| 2 | VALUE ← **数组** → `create list with item repeated`。ITEM=`0`，TIMES=`3`。 |

### 7b — 循环 i=0..2：生成并写入 r_hat[i]

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡入 7a 底部。VAR=`i`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**数组** → 拖 `in list ... set # ... as`。 |
| 3 | LIST=**变量** → `r_hat`。INDEX=**变量** → `i`。 |
| 4 | VALUE ← **数论** → `NTT`。q=`3329`，n=`256`。 |
| 5 | NTT 的 INPUT：**后量子高级** → `SamplePolyCBD`。η=`2 (ML-KEM-768/1024)`，q=`3329`。 |
| 6 | SamplePolyCBD 的 SEED：**后量子基础** → `SeedWithNonce`（SEED=`r_seed`，NONCE=`i`）。 |

```
set r_hat = [0, 0, 0]
ctrl_iterate i=0..2:
  r_hat[i] = NTT(q=3329, n=256,
               SamplePolyCBD(η=2, q=3329,
                 SeedWithNonce(r_seed, i)))
```

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 1 |
| 控制 | `ctrl_iterate` | 1 |
| 数组 | `lists_repeat` | 1 |
| 数组 | `lists_setIndex` | 1 |
| 数论 | `NTT` | 1 |
| 后量子高级 | `SamplePolyCBD` | 1 |
| 后量子基础 | `SeedWithNonce` | 1 |
| 变量 | `r_seed`/`r_hat`/`i` 引用 | 3 |
| 数学 | 数字 | 1 |

> **对比手动方式**：手动需 3× `set`（r0/r1/r2）+ 1× `set`（r_hat）+ 3× NTT + 3× SamplePolyCBD + 3× SeedWithNonce + 1× `lists_create_with` ≈ 18 块。循环约 8 块，节省 ~10 块。

---

## 步骤 8：u = INTT(Âᵀ·r̂) + e₁ — 循环方式

FIPS 203 算法 13 第 13–19 行。k=3，nonce 偏移用 `math_arithmetic` 计算 3 + i。外层 i（u 下标），内层 j（求和下标）。

### 8a — 初始化 u 占位数组

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set u to`。卡入 7b 底部（循环外）。 |
| 2 | VALUE ← **数组** → `create list with item repeated`。ITEM=`0`，TIMES=`3`。 |

### 8b — 外层循环 i=0..2

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡入 8a 底部。VAR=`i`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**变量** → 拖 `set acc to`。 |
| 3 | VALUE ← **数组** → `create list with item repeated`。ITEM=`0`，TIMES=`256`。 |

### 8c — 内层循环 j=0..2：acc += Aⱼᵢ ∘ r̂ⱼ（在 8b 的 DO 区域内）

> **注意**：`lists_getIndex(lists_getIndex(A, j), i)` = `A[j][i]`，即外层 INDEX=`i`、内层 INDEX=`j`。这是 `Aᵀ` 的转置乘法，符合 FIPS 203 算法 10 第 14 行的 `A[j][i]`。

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡在 8b 的 `set acc` 之后。VAR=`j`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**变量** → 拖 `set acc to`。 |
| 3 | VALUE ← **数论** → `PolyAdd`。q=`3329`。 |
| 4 | PolyAdd A ← `acc`。 |
| 5 | PolyAdd B ← **数论** → `NTT Mul`。q=`3329 (Kyber)`。 |
| 6 | NTTMul A ← **数组** → `in list ... get #`。LIST ← **数组** → `in list ... get #`（LIST=`A`，INDEX=`j`）。内层 INDEX ← **变量** → `i`。 |
| 7 | NTTMul B ← **数组** → `in list ... get #`。LIST=`r_hat`，INDEX=`j`。 |

```
set acc = PolyAdd(acc, NTTMul(lists_getIndex(lists_getIndex(A, j), i), lists_getIndex(r_hat, j), q=3329), q=3329)
```

### 8d — e₁ + INTT → u[i]（在 8b 的 DO 区域内，卡在 8c 循环之后）

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set e1 to`。卡在 8c 循环块之后（仍在 8b DO 内）。 |
| 2 | VALUE ← **后量子高级** → `SamplePolyCBD`。η=`2 (ML-KEM-768/1024)`，q=`3329`。 |
| 3 | SamplePolyCBD 的 SEED：**后量子基础** → `SeedWithNonce`。SEED=`r_seed`。 |
| 4 | SeedWithNonce 的 NONCE：**数学** → `math_arithmetic`。OP=`+`。A=`3`。B=**变量** → `i`。 |
| 5 | **数组** → 拖 `in list ... set # ... as`。卡在 e1 之后。 |
| 6 | LIST=`u`，INDEX=`i`。 |
| 7 | VALUE ← **数论** → `PolyAdd`。q=`3329`。 |
| 8 | A ← **数论** → `INTT`。q=`3329`，n=`256`。INPUT=`acc`。 |
| 9 | B ← `e1`。 |

```
set u = [0, 0, 0]
ctrl_iterate i=0..2:
    set acc = [0]*256
    ctrl_iterate j=0..2:
        set acc = PolyAdd(acc, NTTMul(A[j][i], r̂[j]), q=3329)
    set e1 = SamplePolyCBD(η=2, q=3329, SEED=SeedWithNonce(r_seed, 3 + i))
    u[i] = PolyAdd(INTT(acc, q=3329, n=256), e1, q=3329)
```

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 4 |
| 控制 | `ctrl_iterate` | 2 |
| 数组 | `lists_repeat` | 2 |
| 数组 | `lists_getIndex` | 3 |
| 数组 | `lists_setIndex` | 1 |
| 数论 | `PolyAdd` | 2 |
| 数论 | `NTTMul` | 1 |
| 数论 | `INTT` | 1 |
| 后量子高级 | `SamplePolyCBD` | 1 |
| 后量子基础 | `SeedWithNonce` | 1 |
| 数学 | `math_arithmetic` | 1 |
| 变量 | `acc`/`e1`/`i`/`j` 引用 | 7 |
| 数学 | 数字 | ~9 |

> 循环方式 ~25 块，手动展开 ~85 块，节省 ~60 块。

---

## 步骤 9：μ = Decompress₁(ByteDecode₁(m))

FIPS 203 §4.2.1，算法 13 第 20 行。先 ByteDecode₁ 将 32 字节展开为 256 系数，再 Decompress₁ 映射到 {0, 1665}。

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set mu to`。卡入 8b 底部（循环外）。 |
| 2 | VALUE ← **后量子基础** → `Decompress`。d=`1`，q=`3329`。 |
| 3 | Decompress 的 INPUT：**后量子基础** → `ByteDecode`。d=`1`。 |
| 4 | ByteDecode 的 INPUT ← `m`。 |

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 1 |
| 后量子基础 | `Decompress` | 1 |
| 后量子基础 | `ByteDecode` | 1 |
| 变量 | `m` 引用 | 1 |

---

## 步骤 10：v = INTT(t̂ᵀ·r̂) + e₂ + μ

FIPS 203 算法 13 第 21 行。e₂ nonce = 2k = 6（常量，无需加法→循环 OK）。

### 10a — 累加 t̂ᵀ·r̂

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set acc to`。卡入步骤 9 底部。 |
| 2 | VALUE ← `create list with item repeated`（ITEM=`0`，TIMES=`256`）。 |
| 3 | **控制** → `ctrl_iterate`。卡在 10a.1 之后。VAR：`i`，TIMES：`3`。 |
| 4 | DO 区域内：**变量** → 拖 `set acc to`。 |
| 5 | VALUE ← **数论** → `PolyAdd`。q=`3329`。 |
| 6 | PolyAdd A ← `acc`。 |
| 7 | PolyAdd B ← **数论** → `NTT Mul`。q=`3329 (Kyber)`。 |
| 8 | NTTMul A ← **数组** → `in list ... get #`。LIST=`t_hat`，INDEX=`i`。 |
| 9 | NTTMul B ← **数组** → `in list ... get #`。LIST=`r_hat`，INDEX=`i`。 |

### 10b — e₂ + INTT + μ

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set e2 to`。卡在循环块之后。 |
| 2 | VALUE ← **后量子高级** → `SamplePolyCBD`。η=`2 (ML-KEM-768/1024)`，q=`3329`。 |
| 3 | SamplePolyCBD 的 SEED：**后量子基础** → `SeedWithNonce`。SEED=`r_seed`，NONCE=`6`。 |
| 4 | **变量** → 拖 `set v to`。卡在 e2 之后。 |
| 5 | VALUE ← **数论** → `PolyAdd`。q=`3329`。 |
| 6 | PolyAdd A ← **数论** → `PolyAdd`。q=`3329`。 |
| 7 | 内层 PolyAdd A ← **数论** → `INTT`。q=`3329`，n=`256`。INPUT=`acc`。 |
| 8 | 内层 PolyAdd B ← `e2`。 |
| 9 | 外层 PolyAdd 的 B ← `mu`。 |

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 4 |
| 控制 | `ctrl_iterate` | 1 |
| 数组 | `lists_repeat` | 1 |
| 数组 | `lists_getIndex` | 2 |
| 数论 | `PolyAdd` | 3 |
| 数论 | `NTTMul` | 1 |
| 数论 | `INTT` | 1 |
| 后量子高级 | `SamplePolyCBD` | 1 |
| 后量子基础 | `SeedWithNonce` | 1 |
| 变量 | `acc`/`e2`/`mu`/`i` 引用 | 5 |
| 数学 | 数字 | ~10 |

---

## 步骤 11–13：压缩编码并拼接

FIPS 203 算法 13 第 22–24 行。逐个多项式 Compress + ByteEncode，BytesConcat 累加拼接。

### 11a — 初始化 c1 占位

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set c1 to`。卡在 10b 之后。 |
| 2 | VALUE ← **文本** → `""`。留空。 |

### 11b — 循环 i=0..2：编码 u[i] → 拼接到 c1

| # | 操作 |
|---|------|
| 1 | **控制** → 拖 `ctrl_iterate`。卡入 11a 底部。VAR=`i`（自动创建）。TIMES=`3`。 |
| 2 | DO 区域内：**变量** → 拖 `set encoded to`。 |
| 3 | VALUE ← **后量子基础** → `ByteEncode`。d=`10`。 |
| 4 | ByteEncode 的 INPUT：**后量子基础** → `Compress`。d=`10`，q=`3329`。 |
| 5 | Compress 的 INPUT：**数组** → `in list ... get #`。LIST=`u`，INDEX=`i`。 |
| 6 | **变量** → 拖 `set c1 to`。卡在 DO 区域内 `set encoded` 之后。 |
| 7 | VALUE ← **后量子基础** → `BytesConcat`。 |
| 8 | A 插座 ← `c1`。B 插座 ← `encoded`。 |

### 11c — 压缩编码 v → c2

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set c2 to`。卡入 11b 底部（循环外）。 |
| 2 | VALUE ← **后量子基础** → `ByteEncode`。d=`4`。 |
| 3 | ByteEncode 的 INPUT：**后量子基础** → `Compress`。d=`4`，q=`3329`。 |
| 4 | Compress 的 INPUT ← `v`。 |

### 11d — 最终拼接 → c

| # | 操作 |
|---|------|
| 1 | **变量** → 拖 `set c to`。卡入 11c 底部。 |
| 2 | VALUE ← **后量子基础** → `BytesConcat`。 |
| 3 | A 插座 ← `c1`。B 插座 ← `c2`。 |

| 分类 | 块 | 数量 |
|------|-----|:---:|
| 变量 | `set` | 4 |
| 控制 | `ctrl_iterate` | 1 |
| 文本 | `""` | 1 |
| 后量子基础 | `ByteEncode` | 2 |
| 后量子基础 | `Compress` | 2 |
| 后量子基础 | `BytesConcat` | 2 |
| 数组 | `lists_getIndex` | 1 |
| 变量 | `u`/`v`/`c1`/`c2`/`encoded`/`i` 引用 | 6 |
| 数学 | 数字 | ~5 |

---

## 完整块清单

| 分类 | 块 | 可见 | 嵌套 | Blockly ID |
|------|-----|:---:|:---:|------------|
| 变量 | `set VAR to` | 22 | — | `variables_set` |
| 变量 | `VAR` 引用 | — | ~70 | `variables_get` |
| 文本 | `""` | 2 | — | `text` |
| 哈希 | `Keccak Init` | — | 4 | `hash_sha3_state_init` |
| 哈希 | `SHA-3 Pad` | — | 4 | `hash_sha3_pad` |
| 哈希 | `Absorb` | — | 4 | `hash_sha3_absorb` |
| 哈希 | `Squeeze` | — | 4 | `hash_sha3_squeeze` |
| 后量子基础 | `BytesConcat` | 2 | 2 | `pq_byte_concat` |
| 后量子基础 | `BytesSlice` | 5 | 3 | `pq_bytes_slice` |
| 后量子基础 | `SeedWithNonce` | 3 | 23 | `pq_seed_with_nonce` |
| 后量子基础 | `ByteDecode`（d=12） | — | 3 | `pq_byte_decode` |
| 后量子基础 | `Decompress`（d=1） | 1 | — | `pq_decompress` |
| 后量子基础 | `Compress`（d=10,4） | 4 | — | `pq_compress` |
| 后量子基础 | `ByteEncode`（d=10,4） | 4 | — | `pq_byte_encode` |
| 后量子高级 | `SampleNTT`（q=3329） | 9 | — | `pq_sample_ntt` |
| 后量子高级 | `SamplePolyCBD`（η=2） | 4 | 3 | `pq_sample_poly_cbd` |
| 数论 | `NTT`（q=3329） | 6 | — | `pq_ntt` |
| 数论 | `INTT`（q=3329） | 1 | 3 | `pq_intt` |
| 数论 | `NTT Mul`（q=3329） | — | 12 | `pq_ntt_mul` |
| 数论 | `PolyAdd`（q=3329） | 3 | 15 | `pq_poly_add` |
| 控制 | `ctrl_iterate` | 4 | — | `controls_repeat_ext` |
| 数组 | `create list with` | 6 | — | `lists_create_with` |
| 数组 | `in list ... get #` | — | 36 | `lists_getIndex` |
| 数组 | `in list ... set # as` | 3 | — | `lists_setIndex` |
| 数组 | `create list with item repeated` | 4 | — | `lists_repeat` |
| 数学 | 数字块 | ~40 | ~60 | `math_number` |
| | **可见总计** | **~120** | | |
| | **含嵌套总计** | | **~250** | |

---

## 验证清单

| # | 检查项 |
|:--:|-------|
| 1 | 21 个变量已创建 |
| 2 | SampleNTT 使用正确的双层 SeedWithNonce：内层 SEED=SeedWithNonce(rho, j)，外层 NONCE=i |
| 3 | A 矩阵构建为 3 行 ×3 列数组的数组 |
| 4 | r_hat 构建为 3 元素数组 |
| 5 | u 在步骤 8 之前初始化为 `[0, 0, 0]` |
| 6 | 步骤 8 外层循环 i=0..2，内层 j=0..2，A 第二下标取 `i` |
| 7 | e₁ nonce = 3 + i（通过 math_arithmetic 计算） |
| 8 | e₂ 使用 nonce 6（2k） |
| 9 | c₁ 通过循环累加 BytesConcat(c1, ByteEncode(Compress(u[i], d=10), d=10)) |
| 10 | SHA3-256 链：4 层深 |
| 11 | SHA3-512 链（×2）：各 5 层深 |
| 12 | t_bytes = ek[0:1152]，每个 t_i 切片 384 字节（FIPS 203 算法 10：32·d） |
| 13 | rho = ek[1152:1184] |
| 14 | 生成代码 → 执行 → 验证：|c₁|=960，|c₂|=128，|c|=1088，|K̂|=32 |

### 预期输出大小（ML-KEM-768）

| 字段 | 大小（字节） | 公式 |
|------|:----------:|------|
| c₁ | 960 | 32 × d_u × k = 32 × 10 × 3 |
| c₂ | 128 | 32 × d_v = 32 × 4 |
| c | 1088 | c₁ + c₂ |
| K_hat | 32 | SHA3-512 输出字节 0..32 |

---

## FIPS 203 条款对照

| 步骤 | FIPS 203 | 原语 |
|------|----------|------|
| 2 |  第 1 行 | SHA3-256（FIPS 202 §6） |
| 3 |  第 1 行 | SHA3-512（FIPS 202 §6） |
| 4 | 算法 13 第 2–3 行 | BytesSlice |
| 5 | 算法 13 第 2 行、算法 6、算法 9 | ByteDecode₁₂ + NTT |
| 6 | 算法 13 第 4–8 行、算法 7 | SampleNTT 通过 SeedWithNonce |
| 7 | 算法 13 第 9–12 行、算法 8 | SamplePolyCBD 通过 SeedWithNonce + NTT |
| 8 | 算法 13 第 13–19 行、算法 10、算法 11 | NTTMul + PolyAdd + INTT + SamplePolyCBD |
| 9 | §4.2.1、算法 13 第 20 行 | Decompress₁ |
| 10 | 算法 13 第 21 行 | NTTMul + PolyAdd + INTT + SamplePolyCBD |
| 11–13 | 算法 13 第 22–24 行 | Compress + ByteEncode + BytesConcat |

---

## 对比：高级块 vs 纯基础块

| | 高级块 | 纯基础块 |
|---|:---:|:---:|
| 可见块数 | ~45 | ~120 |
| 搭建时间 | ~10 分钟 | ~45–60 分钟 |
| 矩阵 A | 1× `SampleNTTMat` | 9× `SampleNTT` + 18× `SeedWithNonce` + 4× `lists_create_with` |
| 向量 r̂ | 1× `CBDNTTVec` | 3× `SamplePolyCBD` + 3× `NTT` + 1× `lists_create_with` |
| u 计算 | 1× `ML-KEM-EncapsU` | 2 个循环 + 1 NTTMul + 2 PolyAdd + 1 INTT + 1 CBD |
| v 计算 | 1× `ML-KEM-EncapsV` | 1 个循环 + 3 NTTMul + 3 PolyAdd + 1 INTT + 1 CBD |
| 压缩编码 | 2× `VecCompressEncode` | 1 个循环 + 2 Compress + 2 ByteEncode + 2 BytesConcat |
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

---

## 附录：字节偏移修正

更早版本使用 `BytesSlice(ek, 0, 384)` 和 `BytesSlice(t_bytes, 0, 128)`。这些值与 FIPS 203 算法 10 不符：`ByteDecode_d` 输入 = `32·d` 字节。d=12 → 每多项式 384 字节。k=3 → 总计 1152 字节。

本指南使用：t_bytes = ek[0:1152]，各项 t_i 切片按 384 字节边界（0:384、384:768、768:1152），rho = ek[1152:1184]。
