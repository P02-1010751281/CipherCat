# ML-DSA-44 Sign — Atomic Primitive Chain Build Guide

> FIPS 204 Algorithm 7 (ML-DSA.Sign_internal) + Algorithm 8 (ML-DSA.Verify_internal), ML-DSA-44 parameters:
> q=8380417, n=256, k=ℓ=4, d=13, γ₁=2¹⁷, γ₂=95232, τ=39, ω=80, β=τ·η=78
> **5 signature primitive blocks + 2 black-box reference blocks + 2 lattice-ring helper blocks.** ~33 visible blocks, ~15 minute build.
> Input: `sk` (2560 bytes), `msg` (arbitrary-length byte string). Output: `sig` (2420 bytes) / boolean.

---

## Algorithm Chain

### Signing: FIPS 204 Algorithm 7 (ML-DSA.Sign_internal)

```
ML-DSA.Sign_internal(sk, M′, rnd)            // deterministic signing rnd = 0³²
  └─ (ρ, K, tr, s1, s2, t0) ← skDecode(sk)   // parse private key
  └─ μ ← H(BytesToBits(tr) ‖ M′, 64)         // message representative (SHAKE256, 64B)
  └─ ρ″ ← H(K ‖ rnd ‖ μ, 64)                 // private random seed (SHAKE256, 64B)
  └─ rejection-sampling loop (κ = 0, ℓ, 2ℓ, …):
  └─   y ← ExpandMask(ρ″, κ)                 // masking vector, coefficients ∈ (−γ₁, γ₁)
  └─   w ← NTT⁻¹(Â ∘ NTT(y))                 // commitment w = Ay
  └─   w1 ← HighBits(w)                       // Decompose high part (r1)
  └─   c̃ ← H(μ ‖ w1Encode(w1), λ/4=32)       // commitment hash (SHAKE256, 32B)
  └─   c ← SampleInBall(c̃)                   // challenge polynomial, exactly τ=39 ±1
  └─   z ← y + c·s1                           // response z
  └─   r0 ← LowBits(w − c·s2)                 // Decompose low part (r0)
  └─   if ‖z‖∞ ≥ γ₁−β or ‖r0‖∞ ≥ γ₂−β → retry
  └─   h ← MakeHint(−c·t0, w − c·s2 + c·t0)   // hint bit array
  └─   if ‖c·t0‖∞ ≥ γ₂ or wt(h) > ω → retry
  └─ σ ← sigEncode(c̃, z, h)                  // c̃(32B) ‖ z(2304B) ‖ h(84B) = 2420B
```

### Verifying: FIPS 204 Algorithm 8 (ML-DSA.Verify_internal)

```
ML-DSA.Verify_internal(pk, M′, σ)
  └─ (ρ, t1) ← pkDecode(pk)                   // parse public key
  └─ (c̃, z, h) ← sigDecode(σ)                 // parse signature; h = ⊥ → false
  └─ Â ← ExpandA(ρ)
  └─ tr ← H(pk, 64)                           // public key hash (SHAKE256, 64B)
  └─ μ ← H(BytesToBits(tr) ‖ M′, 64)          // message representative
  └─ c ← SampleInBall(c̃)                      // verifier rebuilds challenge
  └─ w′ ← UseHint(h, NTT⁻¹(Â ∘ NTT(z) − NTT(c) ∘ NTT(t1·2^d)))
  └─ c̃′ ← H(μ ‖ w1Encode(w1′), 32)           // rebuilt commitment hash
  └─ return ‖z‖∞ < γ₁−β and c̃ == c̃′
```

**Core idea**: the signer folds the commitment w1 into the challenge c̃; the verifier rebuilds an
approximate commitment w1′ from the public key (t1 ≈ t/2^d) and the signature (z, h), then compares c̃.
The hint compensates the rounding gap between `w − c·s2 + c·t0` and w′ (the t0 part of t vs t1·2^d):
MakeHint/UseHint let the verifier recover w1′.

---

## Primitive Block Role Table

| Block | Blockly ID | Input → Output | Dropdown / fixed params | FIPS 204 | Role in signing flow |
|----|-----------|------------|-----------------|----------|------------------|
| Power2Round_d | `pq_power2round` | IntList → IntList | `PART`: r1/r0; **d=13 fixed** | Alg 35 | KeyGen t=(t1,t0) split; P2R reversibility demo here |
| Decompose | `pq_decompose` | IntList → IntList | `PART`: r1/r0; **γ₂=95232 fixed** | Alg 36 | signer w1=HighBits(w); verifier recovers w1′ (HighBits/LowBits = Alg 37/38, built on Decompose) |
| MakeHint | `pq_make_hint` | Z, R (IntList) → IntList(0/1) | no dropdown; γ₂=95232 fixed | Alg 39 | signer h ← MakeHint(−c·t0, …) |
| UseHint | `pq_use_hint` | H, R (IntList) → IntList | no dropdown; γ₂=95232 fixed | Alg 40 | verifier w1′ ← UseHint(h, w′Approx) |
| SampleInBall | `pq_sample_in_ball` | SEED (Bytes) → IntList | no dropdown; **τ=39 fixed** | Alg 29 | challenge c ← SampleInBall(c̃) (both sides) |
| ML-DSA-44 Sign (black box) | `mldsa_sign` | sk, msg (Bytes) → Bytes | ML-DSA-44 fixed | Alg 2+7 | full signing reference (ACVP 30/30) |
| ML-DSA-44 Verify (black box) | `mldsa_verify` | pk, msg, sig (Bytes) → Boolean | ML-DSA-44 fixed | Alg 3+8 | full verification reference |
| ModPow | `nt_mod_pow` | A, B (Number) → Number | `MODULUS`: 3329 / **8380417** / 12289 / 65537 / 1000000007 | — (§2.5) | modular exponent: q primality (Fermat), z coefficient reduction |
| PolyMul | `pq_poly_mul` | A, B (IntList) → IntList | `MODULUS`: none / 3329 / **8380417** / 12289 | — (§2.4) | R_q ring multiplication teaching (plain convolution mod q) |
| XOF | `pq_xof` | SEED, OUTLEN → Bytes | `ALGO`: SHAKE128 / **SHAKE256** | H of Alg 29/34 | hashing for μ, ρ″, c̃ (SHAKE256) |
| PRF | `pq_prf` | SEED, NONCE, OUTLEN → Bytes | `ALGO`: SHAKE256 / SHAKE128 | Alg 34 | pseudorandom source for ExpandMask(y) (seed ‖ nonce) |
| NTT / INTT | `pq_ntt` / `pq_intt` | IntList → IntList | `MODULUS`: 3329 / **8380417** / 12289; `DEGREE`: 256/128 | Alg 41/42 | ring op w ← NTT⁻¹(Â∘NTT(y)) (q=8380417 branch: ζ=1753, BitRev8, 8 layers) |
| NTT Mul | `pq_ntt_mul` | A, B → IntList | `MODULUS`: 3329 / **8380417** | Alg 45 | NTT-domain pointwise multiply (q=8380417 pointwise; q=3329 half-NTT base mul) |
| PolyAdd | `pq_poly_add` | A, B → IntList | `MODULUS`: 3329 / **8380417** | Alg 44 | vector/poly addition |
| SampleNTT | `pq_sample_ntt` | SEED → IntList | `MODULUS`: 3329 / **8380417** | Alg 30 | NTT-domain sampling of matrix A (q=8380417: SHAKE128 3 bytes → 23-bit < q) |

> ⚠ **Block facts**: the signature primitives (first 5) hard-code ML-DSA-44 parameters
> (d=13, γ₂=95232, τ=39) with q=8380417 embedded; `nt_mod_pow` / `pq_poly_mul` include 8380417 in their dropdowns.
> The NTT-domain ring-op blocks (`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_poly_add`/`pq_sample_ntt`)
> all support **q=8380417 (ML-DSA)** — the NTT branch follows FIPS 204 Alg 41/42 (ζ=1753, BitRev8, INTT × 256⁻¹),
> see Step 8c for the full assembly and `demos/procedures/ML-DSA-NTT.json` for property vectors.

---

## Prerequisites: Understand the Two Demos

The two build lines of this guide map to two committed demos (`demos/procedures/`):

| demo | content | verification |
|------|------|------|
| `ML-DSA-Primitives.json` | 7 signature primitive procedures (P2R_High / P2R_Low / Dec_High / Dec_Low / Make_Hint / Use_Hint / In_Ball) | property vectors (P2R reversible, UseHint(MakeHint) theorem, InBall exactly 39 ±1) |
| `ML-DSA-Sign.json` | black-box MLDSA_Sign / MLDSA_Verify (embedded sk 2560B / pk 1312B / msg 2934B) | FIPS 204 ACVP official vector (sig 2420B, first byte `dd36ebcc…`) |

The primitive procedures use **typed-parameter `procedures_defreturn`** (Functions category, supports
int_list / bytes params); the driver injects r, z, seed arguments and asserts properties — the established
"scenario 9 full atomic chain + official vector" convention.

## How to Read Each Step

| Symbol | Meaning |
|------|------|
| `──next──` | snap the previous block's bottom notch into this block's top bump (sequential execution) |
| `RETURN ←` | drag a block into the procedure's RETURN socket (function return value) |
| `INPUT ←` | drag a block into the VALUE input socket |
| `PARAM ←` | drag a parameter variable reference into the input socket |

**Build outside-in.** Drag the outermost block (procedure) first, then fill the inner sockets.

---

## Step 1: P2R_High — Power2Round high part

FIPS 204 Algorithm 35. `r = r1·2¹³ + r0 mod q`, r0 ∈ (−2¹², 2¹²]. r1 feeds the public key t1, r0 feeds the signing hint.

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn` onto the workspace. |
| 2 | Double-click the NAME field, rename to `P2R_High`. |
| 3 | Click the gear/settings button on the block, add parameter `r`, type `int_list`. |
| 4 | **Post-Quantum Advanced** → drag `Power2Round_d` into the RETURN socket. |
| 5 | PART dropdown: `r1 (high)`. |
| 6 | INPUT ← **Variables** → `r` (parameter reference). |

```
procedures_defreturn P2R_High(r: int_list)
  RETURN = Power2Round_d(part=r1, INPUT = r)
```

**Blocks**: 1× `procedures_defreturn`, 1× `pq_power2round`, 1× parameter reference

---

## Step 2: P2R_Low — Power2Round low part

Identical to Step 1, except the PART dropdown is `r0 (low)`.

```
procedures_defreturn P2R_Low(r: int_list)
  RETURN = Power2Round_d(part=r0, INPUT = r)
```

**Blocks**: 1× `procedures_defreturn`, 1× `pq_power2round`, 1× parameter reference

> **Property 1 (P2R reversible)**: for any r ∈ Z_q, `(P2R_High(r)[i]·8192 + P2R_Low(r)[i]) mod q == r[i]` (all 256 coefficients).
> 8192 = 2¹³ is the d=13 scaling factor.

---

## Step 3: Dec_High — Decompose high part

FIPS 204 Algorithm 36. `r = r1·2γ₂ + r0`, r0 ∈ (−γ₂, γ₂], γ₂=95232. The signer's w1 = HighBits(w) is Decompose(w).r1.

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn`, NAME → `Dec_High`. |
| 2 | Add parameter `r`, type `int_list`. |
| 3 | RETURN ← **Post-Quantum Advanced** → `Decompose`. |
| 4 | PART dropdown: `r1 (high)`. INPUT ← parameter `r`. |

**Blocks**: 1× `procedures_defreturn`, 1× `pq_decompose`, 1× parameter reference

---

## Step 4: Dec_Low — Decompose low part

Same as Step 3, PART dropdown `r0 (low)`.

```
procedures_defreturn Dec_Low(r: int_list)
  RETURN = Decompose(part=r0, INPUT = r)
```

**Blocks**: 1× `procedures_defreturn`, 1× `pq_decompose`, 1× parameter reference

---

## Step 5: Make_Hint — hint generation

FIPS 204 Algorithm 39. `MakeHint(z, r)`: coefficient-wise compare HighBits(r) vs HighBits(r+z), differing → 1.
The signer calls `h ← MakeHint(−c·t0, w − c·s2 + c·t0)` to record the t0 rounding differences as 0/1 bits.

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn`, NAME → `Make_Hint`. |
| 2 | Add parameters `z`, `r`, both `int_list`. |
| 3 | RETURN ← **Post-Quantum Advanced** → `MakeHint`. |
| 4 | Z socket ← parameter `z`. R socket ← parameter `r`. |

```
procedures_defreturn Make_Hint(z: int_list, r: int_list)
  RETURN = MakeHint(z, r)
```

**Blocks**: 1× `procedures_defreturn`, 1× `pq_make_hint`, 2× parameter references

---

## Step 6: Use_Hint — hint application

FIPS 204 Algorithm 40. `UseHint(h, r)`: coefficient-wise fix r1 using hint bits (h=1 and r0>0 → +1, r0≤0 → −1, mod m=44).
The verifier rebuilds w1′ from `w′Approx`.

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn`, NAME → `Use_Hint`. |
| 2 | Add parameters `h`, `r`, both `int_list`. |
| 3 | RETURN ← **Post-Quantum Advanced** → `UseHint`. |
| 4 | H socket ← parameter `h`. R socket ← parameter `r`. |

**Blocks**: 1× `procedures_defreturn`, 1× `pq_use_hint`, 2× parameter references

> **Property 2 (UseHint(MakeHint) theorem)**: with `h = MakeHint(z, r)` and `rsum = (r+z) mod q`,
> `Use_Hint(h, rsum) == Dec_High(rsum)` — the hint exactly compensates the rounding difference between
> "take high bits after adding z" and "take high bits, then add". This is the math behind the verifier's w1′ rebuild.

---

## Step 7: In_Ball — challenge polynomial sampling

FIPS 204 Algorithm 29. `SampleInBall(c̃)`: SHAKE256(c̃) sampling, exactly τ=39 nonzero coefficients (±1,
sign from output bytes), the rest zero. Both signer and verifier must derive the same c — the commitment binding.

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn`, NAME → `In_Ball`. |
| 2 | Add parameter `seed`, type `bytes`. |
| 3 | RETURN ← **Post-Quantum Advanced** → `SampleInBall`. |
| 4 | SEED socket ← parameter `seed`. |

```
procedures_defreturn In_Ball(seed: bytes)
  RETURN = SampleInBall(SEED = seed)
```

**Blocks**: 1× `procedures_defreturn`, 1× `pq_sample_in_ball`, 1× parameter reference

> **Property 3 (sparsity)**: for seed = [1,2,3,4,5,6,7,8], output length 256, exactly 39 nonzero,
> nonzero coefficients ∈ {−1, +1} (τ=39 matches ML-DSA-44; 65/87 use 49/60).

---

## Step 8: Lattice-Ring Helpers — modular arithmetic at q=8380417

FIPS 204 §2.4–2.5: ring R_q = Z_q[X]/(X²⁵⁶+1), q = 2²³−2¹³+1 = 8380417.
Full primitive-chain assembly uses the NTT-domain ring ops (see Step 8c); this step first uses the two blocks
that support 8380417 to verify q's algebraic properties.

### 8a — Fermat's little theorem: q is prime

| # | Operation |
|---|------|
| 1 | **demo workspace JSON** → `ModPow` (`nt_mod_pow`). |
| 2 | A ← number `2`. B ← number `8380416` (q−1). |
| 3 | `MODULUS` dropdown: `8380417 (ML-DSA)`. |
| 4 | Execute (driver assert): result is `1`. |

> `2^(q−1) ≡ 1 mod 8380417` (Fermat) verifies q is prime — the algebraic prerequisite for the NTT.
> `nt_mod_pow` lives in the generic block set (`remaining.ts`); it is not mounted in a main toolbox
> category but is directly referenceable in programmatic demo workspace JSON.

### 8b — R_q ring multiplication: pq_poly_mul

| # | Operation |
|---|------|
| 1 | **Number Theory** → `PolyMul`. A ← `[1, 2, 3]` (or IntList variable). B ← `[4, 5]`. |
| 2 | `MODULUS` dropdown: `8380417 (ML-DSA)`. |
| 3 | Driver assert: `PolyMul(a,b) == [4, 13, 22, 15]` (plain convolution [1·4, 1·5+2·4, 2·5+3·4, 3·5], coefficient-wise mod q). |

> Teaching contrast with `pq_ntt_mul` (NTT-domain pointwise multiply): plain convolution vs pointwise.
> Associativity/commutativity/distributivity can be asserted as property vectors
> (see the convolution property group in `demos/procedures/PQC-Gaps.json`).

**Blocks**: 1× `nt_mod_pow`, 2× `pq_poly_mul`, ~4× number blocks

### 8c — NTT-domain ring ops: assembling w ← NTT⁻¹(Â∘NTT(y))

The core ring op of the FIPS 204 signing chain (Alg 7 step 7-8) is now fully assembleable from atomic blocks (q=8380417):

| # | Operation | Block | Dropdown |
|---|-----------|-------|----------|
| 1 | Sample matrix A in NTT domain | **Number Theory / PQ** → `SampleNTT` (SEED ← seed‖s‖r bytes) | `MODULUS`: **8380417** |
| 2 | Forward transform of y | `NTT(y)` | `MODULUS`: **8380417**, `DEGREE`: 256 |
| 3 | NTT-domain pointwise multiply | `NTT Mul(Â, NTT(y))` | `MODULUS`: **8380417** |
| 4 | Inverse transform | `INTT(·)` | `MODULUS`: **8380417**, `DEGREE`: 256 |
| 5 | (contrast) pointwise vs plain convolution | `NTT Mul` vs `PolyMul` | both accept 8380417 |

**Algorithm convention (FIPS 204 §6.3.2-6.3.4)**: NTT = Cooley-Tukey 8 layers (len 128→1),
twiddle `zetas[m] = 1753^BitRev8(m) mod q` (ζ=1753 = 2³² mod q, a 512th primitive root);
INTT = Gentleman-Sande 8 layers (−zetas[m]) then × 256⁻¹ = 8347681; NTT-domain multiply is pointwise mod q.
This differs from Kyber (q=3329, ζ=17, half-NTT 7 layers + base multiply) — the dropdown dispatches per q.

**Property vectors** (`demos/procedures/ML-DSA-NTT.json`, both languages PASS):

| Property | Assertion |
|----------|-----------|
| NTT roundtrip | `INTT(NTT(p)) == p` (256 coefficients) |
| NTT homomorphism | `NTT(a·b mod (X²⁵⁶+1)) == NTT(a) ∘ NTT(b)` (negacyclic convolution vs NTT-domain pointwise) |

**Blocks**: 5× NTT-domain blocks + number blocks; demo workspace holds 3 def functions (`NTT1`/`INTT1`/`MUL1`).

---

## Step 9: Black-Box Reference — MLDSA_Sign / MLDSA_Verify

Run the complete sign/verify through the black-box blocks as the **correctness baseline** (ACVP official vector).

### 9a — MLDSA_Sign

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn`, NAME → `MLDSA_Sign` (no params). |
| 2 | RETURN ← **Post-Quantum Advanced** → `ML-DSA-44 Sign`. |
| 3 | SECRET_KEY ← **Data** → `data_value`, paste the 2560-byte sk literal (`0x9c,0xe7,0xae,…`). |
| 4 | MESSAGE ← **Data** → `data_value`, paste the 2934-byte msg literal. |

### 9b — MLDSA_Verify

| # | Operation |
|---|------|
| 1 | **Functions** → drag `procedures_defreturn`, NAME → `MLDSA_Verify` (no params). |
| 2 | RETURN ← **Post-Quantum Advanced** → `ML-DSA-44 Verify`. |
| 3 | PUBLIC_KEY ← `data_value` (1312-byte pk). MESSAGE ← `data_value` (same msg). |
| 4 | SIGNATURE ← `data_value` (2420-byte sig, first byte `0xdd,0x36,0xeb,0xcc,…`). |

```
procedures_defreturn MLDSA_Sign()
  RETURN = ML-DSA-44 Sign(SECRET_KEY = sk, MESSAGE = msg)

procedures_defreturn MLDSA_Verify()
  RETURN = ML-DSA-44 Verify(PUBLIC_KEY = pk, MESSAGE = msg, SIGNATURE = sig)
```

**Blocks**: 2× `procedures_defreturn`, 1× `mldsa_sign`, 1× `mldsa_verify`, 5× `data_value`

---

## Complete Block Inventory

| Category | Block | Count | Blockly ID |
|------|-----|:---:|------------|
| Functions | `procedures_defreturn` (P2R_High / P2R_Low / Dec_High / Dec_Low / Make_Hint / Use_Hint / In_Ball / MLDSA_Sign / MLDSA_Verify) | 9 | `procedures_defreturn` |
| Post-Quantum Advanced | `Power2Round_d` (PART=r1 / r0) | 2 | `pq_power2round` |
| Post-Quantum Advanced | `Decompose` (PART=r1 / r0) | 2 | `pq_decompose` |
| Post-Quantum Advanced | `MakeHint` | 1 | `pq_make_hint` |
| Post-Quantum Advanced | `UseHint` | 1 | `pq_use_hint` |
| Post-Quantum Advanced | `SampleInBall` | 1 | `pq_sample_in_ball` |
| Post-Quantum Advanced | `ML-DSA-44 Sign` | 1 | `mldsa_sign` |
| Post-Quantum Advanced | `ML-DSA-44 Verify` | 1 | `mldsa_verify` |
| Number Theory | `ModPow` (MODULUS=8380417) | 1 | `nt_mod_pow` |
| Number Theory | `PolyMul` (MODULUS=8380417) | 2 | `pq_poly_mul` |
| Hash | `XOF` (SHAKE256) / `PRF` (SHAKE256) | 0–2 (optional) | `pq_xof` / `pq_prf` |
| Variables | parameter references | 9 | `variables_get` |
| Data | `data_value` (sk/msg/pk/sig literals) | 5 | `data_value` |
| Math | number blocks | ~6 | `math_number` |
| | **Total** | **~33** | |

---

## Verification Checklist

| # | Check |
|:--:|-------|
| 1 | 7 primitive procedures named correctly with typed params (r/z/seed as int_list or bytes) |
| 2 | `pq_power2round` / `pq_decompose` PART dropdowns: r1 in Steps 1/3, r0 in Steps 2/4 |
| 3 | `Make_Hint`/`Use_Hint` sockets wired: Z/H and R each in place |
| 4 | `In_Ball` seed parameter type is bytes |
| 5 | `nt_mod_pow` MODULUS dropdown = `8380417 (ML-DSA)` |
| 6 | black-box reference lengths: sk 2560B / pk 1312B / msg 2934B / sig 2420B |
| 7 | generated code executes: 3 property-vector groups + ACVP sig first byte dd36ebcc |

### Verification Commands

Build the verification harness first, then run each demo (build once):

```bash
npx vite build --config vite.verify.config.ts
node dist-verify/verify-demo.js demos/procedures/ML-DSA-Primitives.json --exec
node dist-verify/verify-demo.js demos/procedures/ML-DSA-Sign.json --exec
```

### Expected Output

```
# ML-DSA-Primitives.json (property vectors, driver asserts, throws on failure)
MLDSA_PRIMS_OK
#  assertions:
#  ① P2R reversible: P2R_High(r)·8192 + P2R_Low(r) ≡ r (mod 8380417), all 256 coefficients
#  ② UseHint(MakeHint): Use_Hint(Make_Hint(z,r), (r+z) mod q) == Dec_High((r+z) mod q)
#  ③ InBall: length 256, exactly 39 nonzero, coefficients ∈ {−1, 0, 1}

# ML-DSA-Sign.json (ACVP official vector)
dd36ebcc94cd8834e17132b10458e43557357c09a5b855592ecb412bc27480f21…（2420 bytes = 4840 hex）
True
```

The `mldsa_sign` / `mldsa_verify` block implementations themselves pass **NIST ACVP sigGen
ML-DSA-44 deterministic 30/30** (external + internal interfaces, dual-language PASS); this demo embeds
one of those vectors for end-to-end regression.

---

## FIPS 204 Clause Mapping

| Step | FIPS 204 | Operation |
|------|----------|------|
| 1–2 | Algorithm 35 (§3.4) | Power2Round_d(r) → (r1, r0), d=13 |
| 3–4 | Algorithm 36 (§3.4); HighBits/LowBits = Algorithms 37/38 | Decompose(r, 2γ₂) → (r1, r0), γ₂=95232 |
| 5 | Algorithm 39 (§3.4) | MakeHint(z, r): HighBits(r) ≠ HighBits(r+z) → 1 |
| 6 | Algorithm 40 (§3.4) | UseHint(h, r): ±1 fix of r1 via hint bits (mod m=44) |
| 7 | Algorithm 29 (§3.3) | SampleInBall(ρ): SHAKE256 sampling, τ=39 ±1 |
| 8a | §2.5 | q = 2²³−2¹³+1 primality (Fermat) |
| 8b | §2.4 | R_q = Z_q[X]/(X²⁵⁶+1) ring multiplication (plain convolution mod q) |
| 9a | Algorithm 7 + Algorithm 2 | ML-DSA.Sign_internal (black-box reference) |
| 9b | Algorithm 8 + Algorithm 3 | ML-DSA.Verify_internal (black-box reference) |

---

## Comparison: Primitive Chain vs Black Box

| | Primitive chain (Steps 1–8) | Black box (Step 9) |
|---|:---:|:---:|
| Visible blocks | ~33 | 9 |
| Build time | ~15 minutes | ~3 minutes |
| Teaching value | per-primitive rounding/sampling/hint mechanics | end-to-end correctness baseline |
| Math details | each primitive independently verifiable via property vectors | encapsulated in closure |
| NTT ring ops | missing 8380417 atomic blocks (see appendix) | fully implemented internally |
| Use case | teaching, debugging, property verification | quick prototyping, reference |

---

## Appendix: Parameter Quick Reference (FIPS 204 Tables 1/2)

| Parameter | ML-DSA-44 | ML-DSA-65 | ML-DSA-87 |
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

Signature layout (44): `σ = c̃(32B) ‖ z(4×576B=2304B) ‖ h(ω+k=84B)`.
Each z coefficient uses 18 bits (bitlen(2γ₁)=18, BitPack(z, γ₁−1, γ₁)); h is HintBitPack (ω+k bytes,
stores nonzero positions + running Index).

---

## Appendix: Lattice-Ring Op q Support Status

| Block | Dropdown options | ML-DSA (q=8380417) |
|----|----------|:---:|
| `pq_ntt` / `pq_intt` | 3329, **8380417**, 12289 | ✅ (ζ=1753, BitRev8, 8-layer CT/GS, INTT × 256⁻¹) |
| `pq_ntt_mul` | 3329, **8380417** | ✅ (pointwise; q=3329 half-NTT base mul) |
| `pq_poly_add` | 3329, **8380417** | ✅ (coefficient-wise mod q) |
| `pq_sample_ntt` | 3329, **8380417** | ✅ (SHAKE128 3 bytes → 23-bit < q) |
| `nt_mod_pow` | 3329, **8380417**, 12289, 65537, 1000000007 | ✅ |
| `pq_poly_mul` | none, 3329, **8380417**, 12289 | ✅ |

**Closed 2026-08-05**: the four NTT-domain blocks (`pq_ntt`/`pq_intt`/`pq_ntt_mul`/`pq_poly_add`/`pq_sample_ntt`)
now offer q=8380417, with the generators dispatching on the `MODULUS` field to the FIPS 204 convention
(distinct from the Kyber half-NTT branch). The full atomic chain for "w ← NTT⁻¹(Â∘NTT(y))" is in **Step 8c**;
property vectors live in `demos/procedures/ML-DSA-NTT.json` (roundtrip + negacyclic homomorphism, Python/JS PASS).

---

## Appendix: Reference Files

- Standard chapters: `docs/standards/fips204-ML-DSA/` (README parameter tables + algorithm 2/3/7/8/20/26/29/35/36/39/40 chapter files)
- Demos: `demos/procedures/ML-DSA-Primitives.json`, `demos/procedures/ML-DSA-Sign.json`
- Official vectors: NIST ACVP sigGen ML-DSA-44 deterministic (30/30)
- Block implementation: `src/blocks/mldsa/` (primitives.ts + blocks.ts), `src/generators/{javascript,python}/mldsa/`
