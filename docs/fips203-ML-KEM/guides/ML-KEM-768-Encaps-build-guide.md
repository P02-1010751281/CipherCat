# ML-KEM-768 Encaps — Advanced Composite Blocks Build Guide

> FIPS 203 Algorithm 10 + 13, k=3, η₁=2, η₂=2, d_u=10, d_v=4, q=3329
> **5 composite blocks.** ~45 visible blocks, ~10 minute build.
> Input: `ek` (1184 bytes), `m` (32 bytes). Output: `c` (1088 bytes), `K_hat` (32 bytes).

---

## Algorithm Chain

```
Algorithm 10 (ML-KEM.Encaps)
  └─ m ←$ {0,1}³²           // 32 random bytes
  └─ ek length check         // must be 1184 bytes (384·3+32)
  └─ call 


  └─ (K̂, r) ← G(m ‖ H(ek))   // G=SHA3-512, H=SHA3-256
  └─ c ← Algorithm 13(ek, m, r)

Algorithm 13 (K-PKE.Encrypt)
  └─ t̂ ← ByteDecode₁₂(ek[0:1152])
  └─ ρ ← ek[1152:1184]
  └─ Â ← SampleNTTMat(ρ)     // k × k matrix
  └─ ŷ ← CBDNTTVec(r, η₁)    // k vectors
  └─ e₁ ← CBDNTTVec(r, η₂)   // k vectors (offset nonce)
  └─ u ← INTT(Âᵀ ∘ ŷ) + e₁
  └─ μ ← Decompress₁(ByteDecode₁(m))
  └─ v ← INTT(t̂ᵀ ∘ ŷ) + e₂ + μ
  └─ c₁ ← CompressEncode₁₀(u)
  └─ c₂ ← CompressEncode₄(v)
  └─ c ← c₁ ‖ c₂
```

---

## Prerequisites: Create All Variables

Before dragging any logic, create every variable. This prevents Blockly from auto-creating variables with wrong types.

**「Variables」→「Create variable」** — create these in order:

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
| 9 | `t0_ntt` | poly[256] | NTT(ByteDecode₁₂(ek[0:384])) |
| 10 | `t1_ntt` | poly[256] | NTT(ByteDecode₁₂(ek[384:768])) |
| 11 | `t2_ntt` | poly[256] | NTT(ByteDecode₁₂(ek[768:1152])) |
| 12 | `t_hat` | vec3 | BuildVec₃(t0_ntt, t1_ntt, t2_ntt) |
| 13 | `A` | mat3×3 | SampleNTTMat(ρ, k=3) |
| 14 | `r_hat` | vec3 | CBDNTTVec(r_seed, k=3, η=2) |
| 15 | `u` | vec3 | u = INTT(Âᵀ∘r̂) + e₁ |
| 16 | `mu` | poly[256] | μ = Decompress₁(m) |
| 17 | `v` | poly[256] | v = INTT(t̂ᵀ∘r̂) + e₂ + μ |
| 18 | `c1` | bytes | Compressed-encoded u, 960 bytes |
| 19 | `c2` | bytes | Compressed-encoded v, 128 bytes |
| 20 | `c` | bytes | c = c₁ ‖ c₂, 1088 bytes |

---

## How to Read Each Step

| Symbol | Meaning |
|--------|---------|
| `──next──` | Snap previous block's bottom notch into this block's top bump |
| `VALUE ←` | Drag block into VALUE input socket of parent |
| `STATE ←` | Drag block into STATE input socket |
| `BLOCK ←` | Drag block into BLOCK input socket |
| `INPUT ←` | Drag block into INPUT socket |

**Build from outside in.** Drag the outermost block first, then fill its inner sockets.

---

## Step 1: Initialize ek and m

FIPS 203 Algorithm 10 line 1. Empty text placeholders — real values injected at runtime.

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

**Blocks used**: 2× `variables_set`, 2× `text`

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

**Block tree**:
```
set h = Squeeze(rate=1088, outLen=32,
          state = Absorb(rate=1088,
            state = Keccak Init,
            block = SHA-3 Pad(rate=1088, suffix=0x06, input=ek)))
```

**Blocks used**: 1× `set`, 1× `Squeeze`, 1× `Absorb`, 1× `Keccak Init`, 1× `SHA-3 Pad`, 1× `ek` get, 1× number `32`

---

## Step 3: G(m ‖ h) = SHA3-512 → g_out, then split into K̂, r

FIPS 203 Algorithm 10 line 1. G = SHA3-512. rate=576, c=1024, suffix=0x06, output=64 bytes.

Compute SHA3-512 once into `g_out`, then slice twice.

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

FIPS 203 Algorithm 13 line 2–3. FIPS 203 Algorithm 6: `ByteDecode_d` input = `32·d` bytes. d=12 → 384 bytes per polynomial. k=3 → |t̂| = 1152 bytes, |ρ| = 32 bytes, |ek| = 1184 bytes.

|ek| = |ByteEncode₁₂(t̂)| + |ρ| = 384×3 + 32 = 1184.

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

**Blocks used**: 2× `set`, 2× `BytesSlice`, 2× `ek` gets, 4× number blocks

---

## Step 5: Decode t̂ → BuildVec₃

FIPS 203 Algorithm 13 line 2. ByteDecode₁₂ each 384-byte slice. `t_bytes` encodes `t̂` (already in NTT domain), so no NTT is needed after decoding.

### 5a — t0_ntt

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set t0_ntt to`. Snap to 4b. |
| 2 | VALUE ← **PQ Basic** → `ByteDecode`. d=`12`. |
| 3 | Into ByteDecode INPUT: **PQ Basic** → `BytesSlice`. |
| 4 | BytesSlice INPUT ← **Variables** → `t_bytes`. START ← `0`. END ← `384`. |

```
set t0_ntt = ByteDecode(d=12, BytesSlice(t_bytes, 0, 384))
```

### 5b — t1_ntt

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set t1_ntt to`. Snap to 5a. |
| 2–4 | Same as 5a. BytesSlice START=`384`, END=`768`. |

### 5c — t2_ntt

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set t2_ntt to`. Snap to 5b. |
| 2–4 | Same as 5a. BytesSlice START=`768`, END=`1152`. |

### 5d — BuildVec₃

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set t_hat to`. Snap to 5c. |
| 2 | VALUE ← **PQ Advanced** → `BuildVec₃`. |
| 3 | A socket ← `t0_ntt`. B socket ← `t1_ntt`. C socket ← `t2_ntt`. |

**Blocks used**: 3× `set` (t0/t1/t2), 1× `set` (t_hat), 3× `ByteDecode`, 3× `BytesSlice`, 1× `BuildVec₃`, 3× `t_bytes` gets, 3× `t*_ntt` gets, 6× number blocks

---

## Steps 6–10: PQC Advanced Composite Blocks

Each composite block internally expands to ~10–30 basic blocks at codegen time. You only see one block per step on the workspace.

### Step 6 — SampleNTTMat → A

FIPS 203 Algorithm 13 line 4–8. Generates k×k SampleNTT matrix from seed ρ.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set A to`. Snap to 5d. |
| 2 | VALUE ← **PQ Advanced** → `SampleNTTMat`. |
| 3 | k dropdown: `3`. q: `3329`. |
| 4 | SEED socket ← **Variables** → `rho`. |

### Step 7 — CBDNTTVec → r_hat

FIPS 203 Algorithm 13 line 9–12. Generates k CBD-sampled, NTT-transformed polynomials. Nonces 0,1,2.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set r_hat to`. Snap to step 6. |
| 2 | VALUE ← **PQ Advanced** → `CBDNTTVec`. |
| 3 | k: `3`, η: `2 (ML-KEM-768/1024)`, q: `3329`. |
| 4 | SEED socket ← **Variables** → `r_seed`. |

### Step 8 — ML-KEM-EncapsU → u

FIPS 203 Algorithm 13 line 13–19. Computes u = INTT(Âᵀ∘r̂) + e₁. Nonces k..2k-1 (3,4,5).

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set u to`. Snap to step 7. |
| 2 | VALUE ← **PQ Advanced** → `ML-KEM-EncapsU`. |
| 3 | k: `3`, η: `2`, q: `3329`. |
| 4 | A socket ← `A`. r̂ socket ← `r_hat`. seed socket ← `r_seed`. |

### Step 9 — Decompress → mu

FIPS 203 §4.2.1, Algorithm 13 line 20. Decompress₁(m): each bit scaled back to Z_q.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set mu to`. Snap to step 8. |
| 2 | VALUE ← **PQ Basic** → `Decompress`. |
| 3 | d: `1`, q: `3329`. INPUT ← **Variables** → `m`. |

### Step 10 — ML-KEM-EncapsV → v

FIPS 203 Algorithm 13 line 21. Computes v = INTT(t̂ᵀ∘r̂) + e₂ + μ. Nonce 2k (6).

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set v to`. Snap to step 9. |
| 2 | VALUE ← **PQ Advanced** → `ML-KEM-EncapsV`. |
| 3 | k: `3`, η: `2`, q: `3329`. |
| 4 | t̂ socket ← `t_hat`. r̂ socket ← `r_hat`. seed socket ← `r_seed`. μ socket ← `mu`. |

**Blocks used** (steps 6–10): 5× `set`, 5× composite blocks, 5× variable gets

---

## Steps 11–13: Compress-Encode & Concat

FIPS 203 Algorithm 13 line 22–24.

### Step 11 — VecCompressEncode(d=10) → c1

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set c1 to`. Snap to step 10. |
| 2 | VALUE ← **PQ Advanced** → `VecCompressEncode`. |
| 3 | d: `10`, q: `3329`. U socket ← **Variables** → `u`. |

### Step 12 — VecCompressEncode(d=4) → c2

v is a single polynomial — wrap in 1-element list before feeding to VecCompressEncode.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set c2 to`. Snap to step 11. |
| 2 | VALUE ← **PQ Advanced** → `VecCompressEncode`. |
| 3 | d: `4`, q: `3329`. |
| 4 | U socket ← **Arrays** → `create list with` (1 item). Item ← **Variables** → `v`. |

### Step 13 — BytesConcat → c

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set c to`. Snap to step 12. |
| 2 | VALUE ← **PQ Basic** → `BytesConcat`. |
| 3 | A socket ← `c1`. B socket ← `c2`. |

**Blocks used**: 3× `set`, 2× `VecCompressEncode`, 1× `BytesConcat`, 1× `lists_create_with`, 3× variable gets

---

## Complete Block Inventory

| Category | Block | Qty | Blockly ID |
|----------|-------|:---:|------------|
| Variables | `set VAR to` | 19 | `variables_set` |
| Variables | `VAR` (get) | ~20 | `variables_get` |
| Text | `""` | 2 | `text` |
| Hash | `Keccak Init` | 2 | `hash_sha3_state_init` |
| Hash | `SHA-3 Pad` | 2 | `hash_sha3_pad` |
| Hash | `Absorb` | 2 | `hash_sha3_absorb` |
| Hash | `Squeeze` | 2 | `hash_sha3_squeeze` |
| PQ Basic | `BytesConcat` | 2 | `pq_byte_concat` |
| PQ Basic | `BytesSlice` | 5 | `pq_bytes_slice` |
| PQ Basic | `ByteDecode (d=12)` | 3 | `pq_byte_decode` |
| PQ Basic | `Decompress (d=1)` | 1 | `pq_decompress` |
| Number Theory | `NTT (q=3329)` | 3 | `pq_ntt` |
| PQ Advanced | `BuildVec₃` | 1 | `pq_build_vec3` |
| PQ Advanced | `SampleNTTMat` | 1 | `pq_sample_ntt_mat` |
| PQ Advanced | `CBDNTTVec` | 1 | `pq_cbd_ntt_vec` |
| PQ Advanced | `ML-KEM-EncapsU` | 1 | `pq_atr_intt_add_e1` |
| PQ Advanced | `ML-KEM-EncapsV` | 1 | `pq_tr_intt_add_e2_mu` |
| PQ Advanced | `VecCompressEncode` | 2 | `pq_vec_compress_encode` |
| Arrays | `create list with` | 1 | `lists_create_with` |
| Math | number blocks | ~15 | `math_number` |
| | **Total** | **~45** | |

---

## Verification Checklist

| # | Check |
|:--:|-------|
| 1 | 20 variables created |
| 2 | SHA3-256 chain nested 4 levels |
| 3 | SHA3-512 chains (x2) nested 5 levels each, identical except BytesSlice offset |
| 4 | t_bytes = ek[0:1152], each t_i slice = 384 bytes (FIPS 203 Alg 6: 32d) |
| 5 | rho = ek[1152:1184] |
| 6 | All 5 composite blocks use correct dropdown settings (k=3, eta=2, d=10/4, q=3329) |
| 7 | v wrapped in 1-element list for VecCompressEncode |
| 8 | Generate code then execute then verify c1=960 c2=128 c=1088 K_hat=32 |

### Expected Output Sizes (ML-KEM-768)

| Field | Size (bytes) | Formula |
|-------|:-----------:|--------|
| c₁ | 960 | 32 × d_u × k = 32 × 10 × 3 |
| c₂ | 128 | 32 × d_v = 32 × 4 |
| c | 1088 | c₁ + c₂ |
| K_hat | 32 | SHA3-512 output bytes 0..32 |

---

## FIPS 203 Cross-Reference

| Step | FIPS 203 | Operation |
|------|----------|-----------|
| 2 | Alg 17 ln 1 | SHA3-256 (FIPS 202 §6) |
| 3 | Alg 17 ln 1 | SHA3-512 (FIPS 202 §6) → (K̂, r) |
| 4 | Alg 14 ln 2–3 | Parse ek → t̂_bytes, ρ |
| 5 | Alg 14 ln 2, Alg 6, Alg 9 | ByteDecode₁₂ + NTT t̂ |
| 6 | Alg 14 ln 4–8, Alg 7 | SampleNTTMat → Â |
| 7 | Alg 14 ln 9–12, Alg 8 | CBDNTTVec → r̂ (η₁=2, nonces 0,1,2) |
| 8 | Alg 14 ln 13–19, Alg 10, Alg 11 | ML-KEM-EncapsU → u (nonces 3,4,5) |
| 9 | §4.2.1, Alg 14 ln 20 | Decompress₁(m) → μ |
| 10 | Alg 14 ln 21 | ML-KEM-EncapsV → v (nonce 6) |
| 11 | Alg 14 ln 22 | Compress₁₀ + ByteEncode₁₀ → c₁ |
| 12 | Alg 14 ln 23 | Compress₄ + ByteEncode₄ → c₂ |
| 13 | Alg 14 ln 24 | c = c₁ ‖ c₂ |

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
| Compress-encode | 2× `VecCompressEncode` | 3× Compress + 3× ByteEncode (d=10) + 1× Compress + 1× ByteEncode (d=4) + 2× BytesConcat |
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

For other parameter sets: change k/η₁/d_u/d_v dropdowns. Algorithm flow is identical.

---

## Appendix: Byte Offset Correction

Earlier versions used `BytesSlice(ek, 0, 384)` and `BytesSlice(t_bytes, 0, 128)`. These are **incorrect per FIPS 203 Algorithm 6**.

FIPS 203 Algorithm 6: `ByteDecode_d` input = `32·d` bytes. d=12 → 384 bytes per polynomial. k=3 → 1152 bytes total.

**This guide uses**: t_bytes = ek[0:1152], each t_i slice spans 384 bytes (0:384, 384:768, 768:1152), rho = ek[1152:1184].
