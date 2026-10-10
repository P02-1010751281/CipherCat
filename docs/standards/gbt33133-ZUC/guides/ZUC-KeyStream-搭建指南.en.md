# ZUC Keystream Generation — Build Guide

> GB/T 33133.1-2016 algorithm flow (key loading → 32 init rounds → 1 discard round → work mode), ZUC-128
> **5 atomic blocks + 1 full block.** Full-block path: ~7 visible blocks, ~5 minutes to build; atomic teaching path adds ~10 minutes.
> Inputs: `key` (16 bytes), `iv` (16 bytes), `len` (number of output words). Output: keystream word list (32-bit each, `len` words).

---

## Algorithm Flow

```
ZUC keystream generation (GB/T 33133.1-2016 §5)
  └─ Key loading: s_i = k_i ‖ d_i ‖ iv_i (i=0..15)   // 31-bit cells, d_i 8-bit constants
  └─ Initialization mode (repeat 32 ticks):
  │    └─ BitReconstruction()            // X0..X3 = s15H‖s14L, s11L‖s9H, s7L‖s5H, s2L‖s0H
  │    └─ W = F(X0, X1, X2)              // computes W and next R1/R2; the full flow carries state
  │    └─ LFSRWithInitialisationMode(u = W>>>1)   // mod 2³¹-1 feedback + u
  └─ Discard round: BitReconstruction → F → LFSRWithWorkMode()   // output discarded
  └─ Work mode (one 32-bit word z per tick):
       └─ BitReconstruction()
       └─ z = F(X0, X1, X2) ⊕ X3
       └─ LFSRWithWorkMode()
```

The complete flow carries `R1/R2` and LFSR state across ticks. The atomic `zuc_f` block computes and returns `W` but does not store the next `R1/R2`; initialization-mode LFSR updates inject `W>>>1`, while work-mode updates inject nothing.

---

## Parameters

| Component | Parameter | Description |
|-----------|-----------|-------------|
| LFSR | 16 × 31-bit cells s₀..s₁₅ | linear feedback shift register with mod 2³¹−1 addition |
| Constants d_i | 8-bit × 16 | `0x44D7,0x26BC,0x626B,0x135E,0x5789,0x35E2,0x7135,0x09AF,0x4D78,0x2F13,0x6BC4,0x1AF1,0x5E26,0x3C4D,0x789A,0x47AC` |
| BR | BitReconstruction | X₀ = s₁₅H‖s₁₄L, X₁ = s₁₁L‖s₉H, X₂ = s₇L‖s₅H, X₃ = s₂L‖s₀H |
| S0 / S1 | 8×8 S-box | GB/T 33133 annex A.1 / A.2 |
| L1 | 32-bit linear transform | L1(X) = X⊕(X<<<2)⊕(X<<<10)⊕(X<<<18)⊕(X<<<24) |
| L2 | 32-bit linear transform | L2(X) = X⊕(X<<<8)⊕(X<<<14)⊕(X<<<22)⊕(X<<<30) |
| F | non-linear function | W = (X₀⊕R₁)⊞R₂; R₁'=S(L1(W₁_L‖W₂_H)), R₂'=S(L2(W₂_L‖W₁_H)) |
| Keystream word | 32-bit | z = W ⊕ X₃, one word per tick |

`Wᵢ_H` and `Wᵢ_L` denote the high and low 16 bits of the 32-bit word `Wᵢ`, respectively.

---

## Atomic Block Role Table

| Atomic block | Blockly ID | Role | Formula |
|--------------|------------|------|---------|
| `ZUC S0` | `zuc_s0` | 8×8 S0 S-box lookup | S0(x), x ∈ 0..255 |
| `ZUC S1` | `zuc_s1` | 8×8 S1 S-box lookup | S1(x), x ∈ 0..255 |
| `ZUC L1` | `zuc_l1` | linear transform L1 | L1(X), see parameter table |
| `ZUC L2` | `zuc_l2` | linear transform L2 | L2(X), see parameter table |
| `ZUC F` | `zuc_f` | non-linear function F | W=(X₀⊕R₁)⊞R₂; the atomic block returns W only, and the full flow carries the next R₁/R₂ |
| `ZUC Keystream` | `zuc_keystream` | full keystream (incl. LFSR loop) | key loading + 32 init rounds + discard round + work mode |

S-box interleave: S(x) = S0(x>>24) ‖ S1(x>>16) ‖ S0(x>>8) ‖ S1(x) (used inside F).

---

## Prerequisite: Create All Variables

Create all variables before dragging any logic block, so Blockly does not auto-create wrongly-typed variables later.

**Variables → Create variable** — create in order:

| # | Variable | Type | Purpose |
|---|----------|------|---------|
| 1 | `key` | bytes | initial key, 16 bytes (128 bit) |
| 2 | `iv` | bytes | initial vector, 16 bytes (128 bit) |
| 3 | `len` | number | number of output keystream words |
| 4 | `z` | IntList | keystream word list (32-bit each) |
| 5 | `s0_out` | number | teaching variable: S0 lookup output |
| 6 | `l1_out` | number | teaching variable: L1 output |

---

## How to Read Each Step

| Symbol | Meaning |
|--------|---------|
| `──next──` | snap the previous block's bottom notch into this block's top bump (sequential) |
| `VALUE ←` | drag a block into the parent block's VALUE input socket |

**Build outside-in.** Drag the outermost block first, then fill the inner sockets.

---

## Step 1: Initialize key, iv, len

Empty text placeholders — real byte values are injected at runtime (EEA3 test data key/iv in the Verification Commands section).

### 1a — set key to

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set key to` to the top-left of the workspace. |
| 2 | Click the VALUE socket (puzzle gap on the right). |
| 3 | **Data Processing** → drag `""` (text block) into the VALUE socket. Leave the text field empty. |

### 1b — set iv to

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set iv to`. Snap below 1a (`──next──`). |
| 2 | VALUE ← **Data Processing** → `""`. Leave empty. |

### 1c — set len to

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set len to`. Snap below 1b. |
| 2 | VALUE ← **Math** → number block. Change `0` to `2` (or desired word count), Enter. |

Block order: `set key to ""` → `set iv to ""` → `set len to 2`.

**Block count**: 3× `variables_set`, 2× `text`, 1× `math_number`

---

## Step 2: Full Block Path — ZUC Keystream(key, iv, len)

The `zuc_keystream` block expands to the full ZUC flow at code-generation time (LFSR loop + BitReconstruction + F, ~40 lines of generated code). Only one block is visible on the workspace.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set z to`. Snap below step 1. |
| 2 | VALUE ← **ZUC Stream Cipher** → `ZUC Keystream`. |
| 3 | KEY socket ← **Variables** → `key`. |
| 4 | IV socket ← **Variables** → `iv`. |
| 5 | LEN socket ← **Variables** → `len`. |

Call: `set z to ZUC Keystream(key=key, iv=iv, len=len)`.

**Block count**: 1× `set`, 1× `zuc_keystream`, 3× variable references

> **Internal expansion** (at code-generation time): key loading `s_i = (k_i<<23) | (d_i<<8) | iv_i` → 32 init ticks (each BR → F → `lfsr(W>>>1)` with mod 2³¹−1 addition) → one discard round → work mode emitting `z = W ⊕ X₃` per word. Output is an IntList (32-bit words).

---

## Step 3: Template Path — 🔧 ZUC_Keystream

`proc_zuc_keystream` is a procedure template under the **Crypto Templates** category: dragging it out produces a `def ZUC_Keystream(key): return …` function with `key` already wired to the parameter; the `iv`/`len` sockets are left empty.

| # | Action |
|---|--------|
| 1 | **Crypto Templates** → drag `🔧 ZUC_Keystream` onto the workspace. |
| 2 | Expand the function body; `iv` socket ← **Variables** → `iv`; `len` socket ← **Variables** → `len`. |
| 3 | At the call site use the **Functions** → `ZUC_Keystream` reference block, passing `key` as KEY. |

```
def ZUC_Keystream(key):
  return zuc_keystream(key, iv, len)
```

**Block count**: 1× template block (expands to procedures_defreturn + zuc_keystream + variable references)

---

## Step 4: Atomic Teaching Path — S0, L1, and F Checks

Use the known tick-0 values from C1 in standard Annex C to demonstrate the inputs and outputs of the S0 lookup, L1 transform, and F function. This step does not demonstrate S1 or L2 individually.

### 4a — S0 lookup and L1 transform

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set s0_out to`. |
| 2 | VALUE ← **ZUC Stream Cipher** → `ZUC S0`. INPUT ← **Math** → `0`. |
| 3 | **Variables** → drag `set l1_out to`. VALUE ← **ZUC Stream Cipher** → `ZUC L1`. INPUT ← **Math** → `1`. |

```
set s0_out = ZUC S0(0)     // expect 62 (0x3e, annex A.1 table entry 0)
set l1_out = ZUC L1(1)     // expect 16988165 (0x01040405)
```

### 4b — F function single-tick check

With initial R₁=R₂=0 and C1 tick-0 inputs: X₀=0x008f9a00, X₁=0xf100005e, X₂=0xaf00006b.

| # | Action |
|---|--------|
| 1 | **Variables** → drag `set w to`. |
| 2 | VALUE ← **ZUC Stream Cipher** → `ZUC F`. |
| 3 | X0 ← **Data Processing** → `value` block with `0x008f9a00`. |
| 4 | X1 ← `value` block with `0xf100005e`. X2 ← `value` block with `0xaf00006b`. |
| 5 | R1 ← `value` block with `0`. R2 ← `value` block with `0`. |

```
set w = ZUC F(0x008f9a00, 0xf100005e, 0xaf00006b, 0, 0)
        // expect W = 0x008f9a00 (= X₀ since R₁=R₂=0)
```

> **Note**: the `zuc_f` generator computes new state values R₁'/R₂', but the atomic block outputs only W and does not persist those values. Per-tick state management belongs to the full `zuc_keystream` block; the multi-step loop is not decomposed into an atomic workspace chain.

**Block count** (step 4): 3× `variables_set`, 1× `zuc_s0`, 1× `zuc_l1`, 1× `zuc_f`, 5× `data_value`, 2× `math_number`

---

## Block Types Used in This Guide

This table combines the full-block, template, and atomic teaching paths; the number of block instances differs by path. S1 and L2 are listed in the atomic block table but are not demonstrated individually in this guide.

| Category | Block types | Blockly IDs |
|----------|-------------|-------------|
| Variables | `set VAR to`, `VAR` reference | `variables_set`, `variables_get` |
| Text | `""` | `text` |
| Math | number block | `math_number` |
| Data Processing | `value` | `data_value` |
| ZUC Stream Cipher | `ZUC S0`, `ZUC S1`, `ZUC L1`, `ZUC L2`, `ZUC F`, `ZUC Keystream` | `zuc_s0`, `zuc_s1`, `zuc_l1`, `zuc_l2`, `zuc_f`, `zuc_keystream` |
| Procedure template | `ZUC_Keystream` definition and call | `procedures_defreturn`, `procedures_callreturn` |

---

## Verification Checklist

| # | Check |
|:--:|-------|
| 1 | key/iv are 16-byte text placeholders (inject before running) |
| 2 | All three sockets of `ZUC Keystream` wired (KEY/IV/LEN) |
| 3 | Template path: `🔧 ZUC_Keystream` iv/len filled, call site passes key |
| 4 | Teaching path: S0(0)=62, L1(1)=16988165, F(0x008f9a00,…,0,0)=0x008f9a00 |
| 5 | Generated code yields an IntList for z, each element 32-bit hex |

### Expected Output (Official Vectors)

| Vector | key | iv | len | z₁ | z₂ |
|--------|-----|-----|:---:|------|------|
| C1 | all 0 (16 bytes) | all 0 (16 bytes) | 2 | `27bede74` | `018082da` |
| C2 | 16 bytes of `0xFF` | 16 bytes of `0xFF` | 2 | `0657cfa0` | `7096398b` |
| C3 | `3d4c4be96a82fdaeb58f641db17b455b` | `84319aa8de6915ca1f6bda6bfbd8c766` | 2 | `14f1c272` | `3279c419` |

Source locations: C1 input and output are on [GB/T 33133.1-2016 PDF physical page 13 (printed page 9)](../GBT-33133.1-2016.pdf#page=13), with its state tables continuing on [physical page 14 (printed page 10)](../GBT-33133.1-2016.pdf#page=14); C2 is on physical page 14; C3 is on [physical page 15 (printed page 11)](../GBT-33133.1-2016.pdf#page=15).

---

## Verification Commands

1. Build the verification harness (first time, or after block-definition changes):

```bash
npx vite build --config vite.verify.config.ts
```

2. Run the EEA3 demo (EEA3.json is the `ZUC Keystream` atomic chain + official-vector assertions):

```bash
node dist-verify/verify-demo.js demos/procedures/EEA3.json --exec
```

Expected output (EEA3 test data, key=`0x173d14ba 5003731d 7a600494 70f00a29`, iv=`0x66035492 78000000 66035492 78000000`):

```
ca3e0c8619aed798a66b77e2b077a16a05379169307bf97a
a6c85fc66afb8533aafc2518dfe784940ee1e4b030238cc800
```

> First line = first 24 bytes of keystream (z₁..z₆ big-endian); second line = EEA3 ciphertext (plaintext XOR keystream, truncated to 24 bytes with the first bit preserved).

---

## GB/T 33133 Clause Mapping

| Step | GB/T 33133.1-2016 | Operation |
|------|-------------------|-----------|
| 1 | §5.5 | Key loading: s_i = k_i‖d_i‖iv_i |
| 2 | §5.6.2 | Initialization mode, 32 ticks (BR → F → LFSRWithInitialisationMode(W>>>1)) |
| 2 | §5.6.3 | Discard round + work mode (z = W⊕X₃) |
| 4 | §5.4 | Non-linear function F (S0/S1, L1/L2, R1/R2) |
| 4 | Annex A.1/A.2 | S0/S1 S-box tables |
| Vectors | Annex C | Official test vectors C1/C2/C3 |

---

## C1 Official Vector and Intermediate-State Walkthrough

### C1 (key=iv=all 0)

Initialization tick 0 (R₁=R₂=0):

| t | X₀ | X₁ | X₂ | X₃ | W | R₁' | R₂' | S₁₅ |
|:-:|------|------|------|------|------|------|------|------|
| 0 | 008f9a00 | f100005e | af00006b | 6b000089 | 008f9a00 | 67822141 | 62a3a55f | 4563cb1b |

After 32 initialization ticks (finite-state-machine internal state): **R₁ = 14cfd44c, R₂ = 8c6de800**

LFSR state after initialization s₀..s₁₅:

```
7ce15b8b 747ca0c4 6259dd0b 47a94c2b 3a89c82e 32b433fc 231ea13f 31711e42
4ccce955 3fb6071e 161d3512 7114b136 5154d452 78c69a74 4f26ba6b 3e1b8d6a
```

Discard round and keystream (standard Annex C table; t=0 is the discard round whose output is unused; z₁, z₂… start at t=1):

| t | X₀ | X₁ | X₂ | X₃ | R₁ | R₂ | z | S₁₅ |
|:-:|------|------|------|------|------|------|------|------|
| 0* | 7c37ba6b | b1367f6c | 1e426568 | dd0bf9c2 | 3512bf50 | a0920453 | 286dafe5 | 7f08e141 |
| 1 | fe118d6a | d4522c3a | e955463d | 4c2be8f9 | c7ee7f13 | 0c0fa817 | **27bede74** | 3d383d04 |
| 2 | 7a70e141 | 9a74e229 | 071e62e2 | c82ec4b3 | dde63da7 | b9dd6a41 | **018082da** | 13d6d780 |

\* t=0 is the discard round (z output unused); R₁/R₂ columns show post-F-update values.

### C2 (key=iv=16 bytes of `0xFF`)

| Vector | z₁ | z₂ |
|--------|------|------|
| C2 | `0657cfa0` | `7096398b` |

---

## Guide Appendix: ZUC-128 Quick Parameter Reference

| Parameter | ZUC-128 |
|-----------|---------|
| Key length | 128 bit |
| IV length | 128 bit |
| LFSR cells | 16 × 31-bit (mod 2³¹−1) |
| Output word | 32-bit |
| Initialization rounds | 32 (+ 1 discard round) |
| Applications | EEA3 (confidentiality) / EIA3 (integrity), GB/T 33133.2/.3 |

Switching applications: EEA3 XORs z with the plaintext per word (see EEA3.json demo driver); EIA3 uses z to generate the MAC tag (GB/T 33133.3).
