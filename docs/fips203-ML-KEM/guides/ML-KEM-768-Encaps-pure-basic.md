# ML-KEM-768 Encaps — Pure Basic Blocks Build Guide

> FIPS 203 Algorithm 10 + 13, k=3, η₁=2, η₂=2, d_u=10, d_v=4, q=3329
> **Zero composite blocks.** Every XOF/PRF/NTT/PolyAdd/Compress wired manually.
> Input: `ek` (1184 bytes), `m` (32 bytes). Output: `c` (1088 bytes), `K_hat` (32 bytes).

---

## Why This Guide Exists

The advanced build guide uses 5 composite blocks that internally expand to ~10–30 basic blocks each at codegen time — ~45 visible blocks, ~10 minute build.

This guide wires every primitive explicitly — ~120 visible blocks, ~45–60 minute build. Every XOF absorption, NTT butterfly, NTT-domain multiply, and coefficient addition is a separate block.

| Use this guide to |
|-------------------|
| Understand ML-KEM's internal structure block by block |
| Teach or present the algorithm step by step |
| Debug codegen output by comparing composite vs. expanded form |
| Verify that composite blocks produce correct expansions |

---

## Using math_arithmetic for Nonce Offsets

Blockly's **Math** category includes `math_arithmetic` — a standard block supporting `+`, `-`, `×`, `÷`, `^`. Use it to compute nonce offsets like `3 + i` inside loops.

| Category | Block | Settings |
|----------|-------|----------|
| **Math** | `math_arithmetic` | Dropdown: `+`. A = number `3`. B = variable `i`. |

**Loop-based approach (recommended)**: With `math_arithmetic`, Step 8 can be a single `ctrl_iterate` loop instead of three manual unrolls. This saves ~60 blocks.

This guide still shows the manual unroll approach for reference — it works without `math_arithmetic` and is useful for verifying loop-based codegen output.

---

## Prerequisites: Create All Variables

Before dragging any logic, create every variable. This prevents Blockly from auto-creating variables with wrong types.

**「Variables」→「Create variable」** — create in order:

| # | Variable | Type | Purpose |
|---|----------|------|---------|
| 1 | `ek` | bytes | Encapsulation key, 1184 bytes |
| 2 | `m` | bytes | Message, 32 bytes |
| 3 | `h` | bytes | SHA3-256(ek), 32 bytes |
| 4 | `g_out` | bytes | SHA3-512(m‖h), 64 bytes — intermediate to avoid double computation |
| 5 | `K_hat` | bytes | Shared secret = G output bytes 0..32 |
| 6 | `r_seed` | bytes | Randomness seed = G output bytes 32..64 |
| 7 | `t_bytes` | bytes | ek[0:1152] — encoded t̂ (3 × 384 bytes at d=12) |
| 8 | `rho` | bytes | ek[1152:1184] — 32-byte matrix seed |
| 9 | `t_hat` | array[3] | Loop writes directly; manual needs t0_ntt/t1_ntt/t2_ntt (optional) |
| 10 | `A` | array[3] | Loop writes directly; `row` auto-created inside loop |
| 11 | `r_hat` | array[3] | Loop writes directly |
| 12 | `acc` | poly[256] | Accumulator for PolyAdd summations (reused) |
| 13 | `e1_0` | poly[256] | e₁[0] = CBD₂(r_seed‖3) |
| 14 | `e1_1` | poly[256] | e₁[1] = CBD₂(r_seed‖4) |
| 15 | `e1_2` | poly[256] | e₁[2] = CBD₂(r_seed‖5) |
| 16 | `u` | array[3] | Encryption output u (3 polynomials) |
| 17 | `mu` | poly[256] | μ = Decompress₁(m) |
| 18 | `e2` | poly[256] | e₂ = CBD₂(r_seed‖6) |
| 19 | `v` | poly[256] | Encryption output v (1 polynomial) |
| 20 | `c1_0` | bytes | Compressed-encoded u[0], 320 bytes |
| 21 | `c1_1` | bytes | Compressed-encoded u[1], 320 bytes |
| 22 | `c1_2` | bytes | Compressed-encoded u[2], 320 bytes |
| 23 | `c1` | bytes | c₁ = c1_0 ‖ c1_1 ‖ c1_2, 960 bytes |
| 24 | `c2` | bytes | Compressed-encoded v, 128 bytes |
| 25 | `c` | bytes | c = c₁ ‖ c₂, 1088 bytes |

> Do NOT pre-create `i` and `j`. They are auto-created when you drag `ctrl_iterate` blocks.

---

## How to Read Each Step

| Symbol | Meaning |
|--------|---------|
| `──next──` | Snap previous block's bottom notch into this block's top bump |
| `VALUE ←` | Drag block into VALUE input socket of parent |
| `STATE ←` | Drag block into STATE input socket |
| `BLOCK ←` | Drag block into BLOCK input socket |
| `INPUT ←` | Drag block into INPUT socket |

Build from outside in. Drag the outermost block (usually `set VAR to`) first, then fill its inner sockets.

---

## Step 1: Initialize ek and m

FIPS 203 Algorithm 10 line 1. Empty text placeholders — real byte values injected at runtime.

### 1a — set ek to

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set ek to` to top-left of workspace. |
| 2 | Click the VALUE socket (puzzle-piece on right). |
| 3 | **Text** → drag `""` into VALUE socket. Leave text field empty. |

### 1b — set m to

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set m to` to workspace. |
| 2 | Snap 1b's top notch into 1a's bottom bump (`──next──`). |
| 3 | **Text** → drag `""` into VALUE socket. Leave empty. |

```
[set ek → ""]──next──[set m → ""]
```

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 2 |
| Text | `""` | 2 |

---

## Step 2: h = SHA3-256(ek)

FIPS 203 Algorithm 10 line 1. H = SHA3-256. rate=1088, c=512, suffix=0x06, output=32 bytes.

### 2.1 — Outer shell

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set h to`. Snap to 1b's bottom bump. |

### 2.2 — Squeeze (layer 1)

| # | Action |
|---|--------|
| 1 | **Hash** → drag `Squeeze` into VALUE socket of `set h to`. |
| 2 | Rate dropdown: `1088 (SHA3-256)`. |

### 2.3 — Absorb (layer 2)

| # | Action |
|---|--------|
| 1 | **Hash** → drag `Absorb` into STATE socket of `Squeeze`. |
| 2 | Rate dropdown: `1088`. |

### 2.4 — Keccak Init (layer 3, left)

| # | Action |
|---|--------|
| 1 | **Hash** → drag `Keccak Init` into STATE socket of `Absorb`. |

### 2.5 — SHA-3 Pad (layer 3, right)

| # | Action |
|---|--------|
| 1 | **Hash** → drag `SHA-3 Pad` into BLOCK socket of `Absorb`. |
| 2 | Rate: `1088 (SHA3-256)`. Suffix: `0x06 (SHA-3)`. |

### 2.6 — ek variable (layer 4)

| # | Action |
|---|--------|
| 1 | **Variables** → drag `ek` into INPUT socket of `SHA-3 Pad`. |

### 2.7 — OUTLEN

| # | Action |
|---|--------|
| 1 | **Math** → drag number block into OUTLEN socket of `Squeeze`. |
| 2 | Change from `0` to `32`, press Enter. |

```
set h = Squeeze(rate=1088, outLen=32,
          state = Absorb(rate=1088,
            state = Keccak Init,
            block = SHA-3 Pad(rate=1088, suffix=0x06, input=ek)))
```

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 1 |
| Hash | `Squeeze` | 1 |
| Hash | `Absorb` | 1 |
| Hash | `Keccak Init` | 1 |
| Hash | `SHA-3 Pad` | 1 |
| Variables | `ek` get | 1 |
| Math | number `32` | 1 |

---

## Step 3: G(m ‖ h) = SHA3-512 → g_out, then split into K̂, r

FIPS 203 Algorithm 10 line 1. G = SHA3-512. rate=576, c=1024, suffix=0x06, output=64 bytes.

Compute SHA3-512 once into `g_out`, then slice twice. This avoids building the sponge chain twice.

### 3a — g_out = SHA3-512(m‖h)

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set g_out to`. Snap to step 2's bottom. |
| 2 | VALUE ← **Hash** → `Squeeze`. Rate: `576 (SHA3-512)`. |
| 3 | OUTLEN ← **Math** → `64`. |
| 4 | Into Squeeze STATE: **Hash** → `Absorb`. Rate: `576`. |
| 5 | Into Absorb STATE: **Hash** → `Keccak Init`. |
| 6 | Into Absorb BLOCK: **Hash** → `SHA-3 Pad`. Rate: `576 (SHA3-512)`. Suffix: `0x06 (SHA-3)`. |
| 7 | Into SHA-3 Pad INPUT: **PQ Basic** → `BytesConcat`. |
| 8 | A socket ← **Variables** → `m`. B socket ← **Variables** → `h`. |

```
set g_out = Squeeze(rate=576, outLen=64,
              Absorb(rate=576,
                Keccak Init,
                SHA-3 Pad(rate=576, suffix=0x06,
                  BytesConcat(m, h))))
```

### 3b — K_hat = BytesSlice(g_out, 0, 32)

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set K_hat to`. Snap to 3a. |
| 2 | VALUE ← **PQ Basic** → `BytesSlice`. |
| 3 | INPUT ← **Variables** → `g_out`. |
| 4 | START ← **Math** → `0`. END ← **Math** → `32`. |

### 3c — r_seed = BytesSlice(g_out, 32, 64)

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set r_seed to`. Snap to 3b. |
| 2 | VALUE ← **PQ Basic** → `BytesSlice`. |
| 3 | INPUT ← **Variables** → `g_out`. |
| 4 | START ← **Math** → `32`. END ← **Math** → `64`. |

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 3 |
| Hash | `Squeeze` | 1 |
| Hash | `Absorb` | 1 |
| Hash | `Keccak Init` | 1 |
| Hash | `SHA-3 Pad` | 1 |
| PQ Basic | `BytesConcat` | 1 |
| PQ Basic | `BytesSlice` | 2 |
| Variables | get (m, h, g_out) | 4 |
| Math | number | 3 |

---

## Step 4: Parse ek

FIPS 203 Algorithm 13 line 2–3. ek = ByteEncode₁₂(t̂) ‖ ρ. For k=3, d=12: |t̂| = 384×3 = 1152 bytes, |ρ| = 32 bytes, |ek| = 1184 bytes.

### 4a — t_bytes

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set t_bytes to`. Snap to 3b. |
| 2 | VALUE ← **PQ Basic** → `BytesSlice`. |
| 3 | INPUT ← **Variables** → `ek`. |
| 4 | START ← **Math** → `0`. END ← **Math** → `1152`. |

### 4b — rho

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set rho to`. Snap to 4a. |
| 2 | VALUE ← **PQ Basic** → `BytesSlice`. |
| 3 | INPUT ← **Variables** → `ek`. |
| 4 | START ← **Math** → `1152`. END ← **Math** → `1184`. |

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 2 |
| PQ Basic | `BytesSlice` | 2 |
| Variables | `ek` get | 2 |
| Math | number | 4 |

---

## Step 5: Decode t̂ → Write to t_hat Array (Loop Approach)

FIPS 203 Algorithm 13 line 2. ByteDecode₁₂ each `32·d = 384` byte slice. `t_bytes` encodes `t̂` (already in NTT domain), so no NTT after decoding.

Uses `ctrl_iterate` + `math_arithmetic` to compute offsets, avoiding three manual repetitions. Loop variable `i` auto-created.

### 5a — Initialize t_hat placeholder

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set t_hat to`. Snap to 4b. |
| 2 | VALUE ← **Arrays** → `create list with item repeated`. ITEM=`0`, TIMES=`3`. |

### 5b — Loop i=0..2: decode and write to t_hat[i]

| # | Action |
|---|--------|
| 1 | **Control** → drag `ctrl_iterate`. Snap to 5a. VAR=`i` (auto). TIMES=`3`. |
| 2 | Inside DO: **Arrays** → drag `in list ... set # ... as`. |
| 3 | LIST=**Variables** → `t_hat`. INDEX=**Variables** → `i`. |
| 4 | VALUE ← **PQ Basic** → `ByteDecode`. d=`12`. |
| 5 | ByteDecode INPUT: **PQ Basic** → `BytesSlice`. |
| 6 | BytesSlice INPUT ← **Variables** → `t_bytes`. |
| 7 | START ← **Math** → `×`. A=**Variables** → `i`. B=**Math** → `384`. |
| 8 | END ← **Math** → `×`. A=**Math** → `+` (A=`i`, B=`1`). B=**Math** → `384`. |

**START** = `i × 384` (i=0→0, i=1→384, i=2→768)
**END** = `(i + 1) × 384` (i=0→384, i=1→768, i=2→1152)

```
ctrl_iterate i=0..2:
  lists_setIndex(t_hat, i,
    ByteDecode(d=12,
      BytesSlice(t_bytes, i*384, (i+1)*384)))
```

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 1 |
| Control | `ctrl_iterate` | 1 |
| Arrays | `lists_repeat` | 1 |
| Arrays | `lists_setIndex` | 1 |
| PQ Basic | `ByteDecode` | 1 |
| PQ Basic | `BytesSlice` | 1 |
| Math | `math_arithmetic` | 3 |
| Variables | `t_bytes`/`t_hat`/`i` get | 4 |
| Math | number | 3 |

> **vs manual approach**: Manual takes 3× `set` + 3× ByteDecode + 3× BytesSlice + 1× `lists_create_with` ≈ 10 blocks. Loop takes ~9 blocks.

---

## Step 6: Generate Matrix Â (Nested Loop)

FIPS 203 Algorithm 13 line 4–8. Â[i][j] = SampleNTT(ρ ‖ j ‖ i) = SeedWithNonce(SeedWithNonce(rho, j), i).

Nested `ctrl_iterate` loops write directly to `A` array. No A00–A22 variables, no row0/row1/row2.

### 6a — Initialize A placeholder

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set A to`. Snap to 5b. |
| 2 | VALUE ← **Arrays** → `create list with item repeated`. ITEM=`0`, TIMES=`3`. |

### 6b — Outer loop i=0..2

| # | Action |
|---|--------|
| 1 | **Control** → drag `ctrl_iterate`. Snap to 6a. VAR=`i` (auto). TIMES=`3`. |
| 2 | Inside DO: **Variables** → drag `set row to`. |
| 3 | VALUE ← **Arrays** → `create list with item repeated`. ITEM=`0`, TIMES=`3`. |

### 6c — Inner loop j=0..2 (inside 6b's DO)

| # | Action |
|---|--------|
| 1 | **Control** → drag `ctrl_iterate`. Snap after 6b's `set row`. VAR=`j` (auto). TIMES=`3`. |
| 2 | Inside DO: **Arrays** → drag `in list ... set # ... as`. |
| 3 | LIST=**Variables** → `row`. INDEX=**Variables** → `j`. |
| 4 | VALUE ← **PQ Advanced** → `SampleNTT`. q=`3329 (Kyber)`. |
| 5 | Into SampleNTT SEED: **PQ Basic** → `SeedWithNonce`. |
| 6 | Into inner SeedWithNonce SEED: **PQ Basic** → `SeedWithNonce` (SEED=`rho`, NONCE=`i`). |
| 7 | Outer SeedWithNonce NONCE ← **Variables** → `j`. |

### 6d — After inner loop: write row to A[i]

| # | Action |
|---|--------|
| 1 | After 6c loop, inside outer DO: **Arrays** → drag `in list ... set # ... as`. |
| 2 | LIST=**Variables** → `A`. INDEX=**Variables** → `i`. VALUE=**Variables** → `row`. |

```
set A = [0, 0, 0]
ctrl_iterate i=0..2:
  set row = [0, 0, 0]
  ctrl_iterate j=0..2:
    row[j] = SampleNTT(q=3329,
               SeedWithNonce(
                 SeedWithNonce(rho, j),
                 j))
  A[i] = row
```

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 2 |
| Control | `ctrl_iterate` | 2 |
| Arrays | `lists_repeat` | 2 |
| Arrays | `lists_setIndex` | 2 |
| PQ Advanced | `SampleNTT` | 1 |
| PQ Basic | `SeedWithNonce` | 2 |
| Variables | `rho`/`A`/`row`/`i`/`j` get | 5 |
| Math | number | 2 |

> **vs manual approach**: Manual takes 13 `set` + 9 SampleNTT + 18 SeedWithNonce + 4 `lists_create_with` ≈ 65 blocks. Loop takes ~12, saves ~53, scales to any k.
>
> Manual reference: create A00..A22 (9 vars), each = `SampleNTT(SeedWithNonce(SeedWithNonce(rho, j), i))`, then row0/row1/row2 to assemble.

---

## Step 7: Generate r̂ Vector (Loop)

FIPS 203 Algorithm 13 line 9–12. r̂[i] = NTT(SamplePolyCBD₂(r_seed ‖ i)). Nonce = i — no arithmetic needed, simplest loop.

### 7a — Initialize r_hat placeholder

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set r_hat to`. Snap to 6d. |
| 2 | VALUE ← **Arrays** → `create list with item repeated`. ITEM=`0`, TIMES=`3`. |

### 7b — Loop i=0..2: generate and write to r_hat[i]

| # | Action |
|---|--------|
| 1 | **Control** → drag `ctrl_iterate`. Snap to 7a. VAR=`i` (auto). TIMES=`3`. |
| 2 | Inside DO: **Arrays** → drag `in list ... set # ... as`. |
| 3 | LIST=**Variables** → `r_hat`. INDEX=**Variables** → `i`. |
| 4 | VALUE ← **Number Theory** → `NTT`. q=`3329`, n=`256`. |
| 5 | Into NTT INPUT: **PQ Advanced** → `SamplePolyCBD`. η=`2 (ML-KEM-768/1024)`, q=`3329`. |
| 6 | Into SamplePolyCBD SEED: **PQ Basic** → `SeedWithNonce` (SEED=`r_seed`, NONCE=`i`). |

```
set r_hat = [0, 0, 0]
ctrl_iterate i=0..2:
  r_hat[i] = NTT(q=3329, n=256,
               SamplePolyCBD(η=2, q=3329,
                 SeedWithNonce(r_seed, i)))
```

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 1 |
| Control | `ctrl_iterate` | 1 |
| Arrays | `lists_repeat` | 1 |
| Arrays | `lists_setIndex` | 1 |
| Number Theory | `NTT` | 1 |
| PQ Advanced | `SamplePolyCBD` | 1 |
| PQ Basic | `SeedWithNonce` | 1 |
| Variables | `r_seed`/`r_hat`/`i` get | 3 |
| Math | number | 1 |

> **vs manual approach**: Manual takes 3× `set` (r0/r1/r2) + 1× `set` (r_hat) + 3× NTT + 3× SamplePolyCBD + 3× SeedWithNonce + 1× `lists_create_with` ≈ 18 blocks. Loop takes ~8, saves ~10.

---

## Step 8: u = INTT(Âᵀ·r̂) + e₁ — Manual Unroll ×3

FIPS 203 Algorithm 13 line 13–19. u[i] = INTT(∑ⱼ A[j][i] ∘ r̂[j]) + SamplePolyCBD₂(r_seed ‖ (k+i)). The e₁ nonce k+i requires addition → manual unroll.

### 8-init — Initialize u placeholder

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set u to`. Snap to 7d. |
| 2 | VALUE ← `create list with` 3 items: number `0`, `0`, `0`. |

### 8a — u[0] (nonce 3)

#### 8a.1 — Init accumulator

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set acc to`. Snap after u init. |
| 2 | VALUE ← **Arrays** → `create list with item repeated`. ITEM=`0`, TIMES=`256`. |

#### 8a.2 — Loop j=0..2: acc += A[j][0] ∘ r̂[j]

| # | Action |
|---|--------|
| 1 | **Control** → drag `ctrl_iterate` (count with). Snap to 8a.1. VAR: `j` (auto). TIMES: `3`. |
| 2 | Inside DO: **Variables** → drag `set acc to`. |
| 3 | VALUE ← **Number Theory** → `PolyAdd`. q=`3329`. |
| 4 | PolyAdd A ← **Variables** → `acc`. |
| 5 | PolyAdd B ← **Number Theory** → `NTT Mul`. q=`3329 (Kyber)`. |
| 6 | NTTMul A ← **Arrays** → `in list ... get #`. LIST ← **Arrays** → `in list ... get #` (LIST=`A`, INDEX=`j`). Inner INDEX ← **Math** → `0`. |
| 7 | NTTMul B ← **Arrays** → `in list ... get #`. LIST=`r_hat`, INDEX=`j`. |

```
set acc = PolyAdd(acc, NTTMul(lists_getIndex(lists_getIndex(A, j), 0), lists_getIndex(r_hat, j), q=3329), q=3329)
```

#### 8a.3 — After loop: INTT + e₁[0]

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set e1_0 to`. Snap after loop. |
| 2 | VALUE ← `SamplePolyCBD(η=2, q=3329, SEED=SeedWithNonce(r_seed, 3))`. |
| 3 | **Arrays** → drag `in list ... set # ... as`. Snap to e1_0. |
| 4 | LIST=`u`, INDEX=`0`. |
| 5 | VALUE ← **Number Theory** → `PolyAdd`. q=`3329`. |
| 6 | A ← **Number Theory** → `INTT`. q=`3329`, n=`256`. INPUT=`acc`. |
| 7 | B ← **Variables** → `e1_0`. |

### 8b — u[1] (nonce 4)

Same structure as 8a, with these changes:

| # | Change |
|---|--------|
| 1 | Snap all blocks after 8a.3. |
| 2 | Loop body: inner INDEX `0` becomes `1`. |
| 3 | e1 variable: `e1_1`, NONCE=`4`. |
| 4 | `lists_setIndex` INDEX=`1`. |

### 8c — u[2] (nonce 5)

Same structure as 8a, with these changes:

| # | Change |
|---|--------|
| 1 | Snap all blocks after 8b. |
| 2 | Loop body: inner INDEX `0` becomes `2`. |
| 3 | e1 variable: `e1_2`, NONCE=`5`. |
| 4 | `lists_setIndex` INDEX=`2`. |

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 8 |
| Control | `ctrl_iterate` | 3 |
| Arrays | `lists_repeat` | 3 |
| Arrays | `lists_create_with` | 1 |
| Arrays | `lists_getIndex` | 24 |
| Arrays | `lists_setIndex` | 3 |
| Number Theory | `PolyAdd` | 12 |
| Number Theory | `NTTMul` | 9 |
| Number Theory | `INTT` | 3 |
| PQ Advanced | `SamplePolyCBD` | 3 |
| PQ Basic | `SeedWithNonce` | 3 |
| Variables | `acc`/`e1_*` get | 6 |
| Math | number | ~20 |

---

## Step 9: μ = Decompress₁(m)

FIPS 203 §4.2.1, Algorithm 13 line 20.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set mu to`. Snap to 8c. |
| 2 | VALUE ← **PQ Basic** → `Decompress`. d=`1`, q=`3329`. |
| 3 | INPUT ← **Variables** → `m`. |

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 1 |
| PQ Basic | `Decompress` | 1 |
| Variables | `m` get | 1 |

---

## Step 10: v = INTT(t̂ᵀ·r̂) + e₂ + μ

FIPS 203 Algorithm 13 line 21. e₂ nonce = 2k = 6 (constant, no addition → loop OK).

### 10a — Accumulate t̂ᵀ·r̂

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set acc to`. Snap to step 9. |
| 2 | VALUE ← `create list with item repeated` (ITEM=`0`, TIMES=`256`). |
| 3 | **Control** → `ctrl_iterate`. Snap to 10a.1. VAR: `j`, TIMES: `3`. |
| 4 | DO body: `set acc to` = `PolyAdd(acc, NTTMul(lists_getIndex(t_hat, j), lists_getIndex(r_hat, j), q=3329), q=3329)`. |

### 10b — e₂ + INTT + μ

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set e2 to`. Snap after loop. |
| 2 | VALUE ← `SamplePolyCBD(η=2, q=3329, SEED=SeedWithNonce(r_seed, 6))`. |
| 3 | **Variables** → drag `set v to`. Snap to e2. |
| 4 | VALUE ← `PolyAdd(PolyAdd(INTT(acc, q=3329, n=256), e2, q=3329), mu, q=3329)`. |

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 3 |
| Control | `ctrl_iterate` | 1 |
| Arrays | `lists_repeat` | 1 |
| Arrays | `lists_getIndex` | 6 |
| Number Theory | `PolyAdd` | 3 |
| Number Theory | `NTTMul` | 3 |
| Number Theory | `INTT` | 1 |
| PQ Advanced | `SamplePolyCBD` | 1 |
| PQ Basic | `SeedWithNonce` | 1 |
| Variables | `acc`/`e2`/`mu` get | 3 |
| Math | number | ~8 |

---

## Step 11–13: Compress-Encode & Concat

FIPS 203 Algorithm 13 line 22–24. No `VecCompressEncode` → individual Compress + ByteEncode per polynomial.

### 11a — Compress-encode u[0], u[1], u[2] → c1

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set c1_0 to`. Snap after step 10. VALUE = `ByteEncode(Compress(lists_getIndex(u, 0), d=10, q=3329), d=10)`. |
| 2 | **Variables** → drag `set c1_1 to`. Snap to 11a.1. VALUE = same, index=1. |
| 3 | **Variables** → drag `set c1_2 to`. Snap to 11a.2. VALUE = same, index=2. |
| 4 | **Variables** → drag `set c1 to`. Snap to 11a.3. VALUE = `BytesConcat(BytesConcat(c1_0, c1_1), c1_2)`. |

### 11b — Compress-encode v → c2

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set c2 to`. Snap to 11a.4. VALUE = `ByteEncode(Compress(v, d=4, q=3329), d=4)`. |

### 11c — Final concat → c

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set c to`. Snap to 11b. VALUE = `BytesConcat(c1, c2)`. |

| Category | Block | Qty |
|----------|-------|:---:|
| Variables | `set` | 6 |
| PQ Basic | `ByteEncode` | 4 |
| PQ Basic | `Compress` | 4 |
| PQ Basic | `BytesConcat` | 2 |
| Arrays | `lists_getIndex` | 3 |
| Variables | `u`/`v`/`c1`/`c2` get | 5 |
| Math | number | ~5 |

---

## Complete Block Inventory

| Category | Block | Visible | Nested | Blockly ID |
|----------|-------|:---:|:---:|------------|
| Variables | `set VAR to` | 22 | — | `variables_set` |
| Variables | `VAR` get | — | ~70 | `variables_get` |
| Text | `""` | 2 | — | `text` |
| Hash | `Keccak Init` | — | 4 | `hash_sha3_state_init` |
| Hash | `SHA-3 Pad` | — | 4 | `hash_sha3_pad` |
| Hash | `Absorb` | — | 4 | `hash_sha3_absorb` |
| Hash | `Squeeze` | — | 4 | `hash_sha3_squeeze` |
| PQ Basic | `BytesConcat` | 2 | 2 | `pq_byte_concat` |
| PQ Basic | `BytesSlice` | 5 | 3 | `pq_bytes_slice` |
| PQ Basic | `SeedWithNonce` | 3 | 23 | `pq_seed_with_nonce` |
| PQ Basic | `ByteDecode` (d=12) | — | 3 | `pq_byte_decode` |
| PQ Basic | `Decompress` (d=1) | 1 | — | `pq_decompress` |
| PQ Basic | `Compress` (d=10,4) | 4 | — | `pq_compress` |
| PQ Basic | `ByteEncode` (d=10,4) | 4 | — | `pq_byte_encode` |
| PQ Advanced | `SampleNTT` (q=3329) | 9 | — | `pq_sample_ntt` |
| PQ Advanced | `SamplePolyCBD` (η=2) | 4 | 3 | `pq_sample_poly_cbd` |
| Number Theory | `NTT` (q=3329) | 6 | — | `pq_ntt` |
| Number Theory | `INTT` (q=3329) | 1 | 3 | `pq_intt` |
| Number Theory | `NTT Mul` (q=3329) | — | 12 | `pq_ntt_mul` |
| Number Theory | `PolyAdd` (q=3329) | 3 | 15 | `pq_poly_add` |
| Control | `ctrl_iterate` | 4 | — | `controls_repeat_ext` |
| Arrays | `create list with` | 6 | — | `lists_create_with` |
| Arrays | `in list ... get #` | — | 36 | `lists_getIndex` |
| Arrays | `in list ... set # as` | 3 | — | `lists_setIndex` |
| Arrays | `create list with item repeated` | 4 | — | `lists_repeat` |
| Math | number blocks | ~40 | ~60 | `math_number` |
| | **Total visible** | **~120** | | |
| | **Total incl. nested** | | **~250** | |

---

## Verification Checklist

| # | Check |
|:--:|-------|
| 1 | 25 variables created |
| 2 | SampleNTT uses correct double SeedWithNonce: inner SEED=SeedWithNonce(rho, j), outer NONCE=i |
| 3 | A matrix constructed as 3 rows × 3 columns array-of-arrays |
| 4 | r_hat constructed as 3-element array |
| 5 | u initialized as `[0, 0, 0]` before step 8 |
| 6 | u[0] uses column index 0 + nonce 3 |
| 7 | u[1] uses column index 1 + nonce 4 |
| 8 | u[2] uses column index 2 + nonce 5 |
| 9 | e₂ uses nonce 6 (2k) |
| 10 | c₁ concatenates c1_0, c1_1, c1_2 via nested BytesConcat |
| 11 | SHA3-256 chain: 4 levels deep |
| 12 | SHA3-512 chains (×2): 5 levels deep each |
| 13 | t_bytes = ek[0:1152], each t_i slice = 384 bytes (FIPS 203 Alg 6: 32·d) |
| 14 | rho = ek[1152:1184] |
| 15 | Generate code → execute → verify: |c₁|=960, |c₂|=128, |c|=1088, |K̂|=32 |

### Expected Output Sizes (ML-KEM-768)

| Field | Size (bytes) | Formula |
|-------|:-----------:|--------|
| c₁ | 960 | 32 × d_u × k = 32 × 10 × 3 |
| c₂ | 128 | 32 × d_v = 32 × 4 |
| c | 1088 | c₁ + c₂ |
| K_hat | 32 | SHA3-512 output bytes 0..32 |

---

## FIPS 203 Cross-Reference

| Step | FIPS 203 | Primitive(s) |
|------|----------|-------------|
| 2 | Alg 17 ln 1 | SHA3-256 (FIPS 202 §6) |
| 3 | Alg 17 ln 1 | SHA3-512 (FIPS 202 §6) |
| 4 | Alg 14 ln 2–3 | BytesSlice |
| 5 | Alg 14 ln 2, Alg 6, Alg 9 | ByteDecode₁₂ + NTT |
| 6 | Alg 14 ln 4–8, Alg 7 | SampleNTT via SeedWithNonce |
| 7 | Alg 14 ln 9–12, Alg 8 | SamplePolyCBD via SeedWithNonce + NTT |
| 8 | Alg 14 ln 13–19, Alg 10, Alg 11 | NTTMul + PolyAdd + INTT + SamplePolyCBD |
| 9 | §4.2.1, Alg 14 ln 20 | Decompress₁ |
| 10 | Alg 14 ln 21 | NTTMul + PolyAdd + INTT + SamplePolyCBD |
| 11–13 | Alg 14 ln 22–24 | Compress + ByteEncode + BytesConcat |

---

## Comparison: Advanced vs. Pure Basic

| | Advanced | Pure Basic |
|---|:---:|:---:|
| Visible blocks | ~45 | ~120 |
| Build time | ~10 min | ~45–60 min |
| Matrix A | 1× `SampleNTTMat` | 9× `SampleNTT` + 18× `SeedWithNonce` + 4× `lists_create_with` |
| Vector r̂ | 1× `CBDNTTVec` | 3× `SamplePolyCBD` + 3× `NTT` + 1× `lists_create_with` |
| u computation | 1× `ML-KEM-EncapsU` | 4 loops + 9 NTTMul + 9 PolyAdd + 3 INTT + 3 CBD |
| v computation | 1× `ML-KEM-EncapsV` | 1 loop + 3 NTTMul + 3 PolyAdd + 1 INTT + 1 CBD |
| Compress-encode | 2× `VecCompressEncode` | 4× Compress + 4× ByteEncode + 2× BytesConcat |
| Best for | Rapid prototyping | Teaching, debugging, verification |

---

## Appendix: Parameter Quick Reference

| Parameter | ML-KEM-512 | ML-KEM-768 | ML-KEM-1024 |
|-----------|:----------:|:----------:|:-----------:|
| k | 2 | 3 | 4 |
| η₁ | 3 | 2 | 2 |
| η₂ | 2 | 2 | 2 |
| d_u | 10 | 10 | 11 |
| d_v | 4 | 4 | 5 |
| \|ek\| | 800 | 1184 | 1568 |
| \|c\| | 768 | 1088 | 1568 |
| \|K\| | 32 | 32 | 32 |

---

## Appendix: Byte Offset Correction

Earlier versions used `BytesSlice(ek, 0, 384)` and `BytesSlice(t_bytes, 0, 128)`. These are incorrect per FIPS 203 Algorithm 6: `ByteDecode_d` input = `32·d` bytes. d=12 → 384 bytes per polynomial. k=3 → 1152 bytes total.

This guide uses: t_bytes = ek[0:1152], t_i slices at 384-byte boundaries (0:384, 384:768, 768:1152), rho = ek[1152:1184].
