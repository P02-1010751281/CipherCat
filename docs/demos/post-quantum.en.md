# Post-Quantum Demos

> [中文](./post-quantum.md)

> [← Back to index](../guides/DEMO.en.md) · [demo file index](../../demos/README.en.md)
>
> Scenario 4 (ML-KEM primitives) + Scenario 9 (ML-KEM.Encaps), per the `docs/DEMO.md` index.

---

## Scenario 4: ML-KEM Primitives (10 min)

### Goal
Understand ML-KEM keygen core steps with atomic blocks: CBD sampling → NTT → matrix generation → matrix×vector.

### Steps

1. **Load demo**: import `demos/ML-KEM-Atomic.json`
2. **Inspect**:
   - 32-byte seed (ρ/σ from SHAKE-256 output)
   - `pq_sample_poly_cbd`: CBD(η₂) sampling → secret vectors ŝ/ê
   - `pq_sample_ntt`: sample NTT matrix A ∈ Z_q^{K×K×256} from seed
   - `pq_ntt`: NTT of a vector
   - `pq_mat_vec_mul`: A × ŝ in the NTT domain
3. **Generate**: click "▶", pick JavaScript

### Atomic blocks
| Block | Function | Standard |
|----|------|------|
| `pq_sample_poly_cbd` | CBD(η₂) sampling | FIPS 203 §4.2.2 |
| `pq_sample_ntt` | pseudorandom NTT matrix A | FIPS 203 §4.2.2 |
| `pq_ntt` | vector NTT transform | FIPS 203 §4.3 |
| `pq_mat_vec_mul` | NTT-domain matrix×vector | FIPS 203 §4.3 |

---

## Scenario 9: ML-KEM.Encaps (advanced, 20 min)

### Goal
Build the full ML-KEM-512 Encaps chain (k=2) with post-quantum atomic blocks; verify the FIPS 203 official vector.

### Steps

1. **Load demo**: import `demos/procedures/ML-KEM-Encaps.json`
2. **Inspect** (`procedures_defreturn` params `ek: bytes` + `m: bytes`; STACK holds intermediates, RETURN = c‖K):
   - **H(ek)**: SHA3-256 (keccak_state_init → sponge_pad(1088, 0x06) → absorb → squeeze 32)
   - **G(m‖H)**: SHA3-512 (rate 576) → first 32B = K, last 32B = r
   - **t̂/rho decode**: `pq_byte_decode`(d=12) splits ek → t0/t1 + rho
   - **A matrix**: 4× `pq_sample_ntt` (rho‖i‖j, chained `pq_seed_with_nonce`)
   - **Noise**: s/e1/e2 = `pq_sample_poly_cbd`(PRF(r, N)); ŝ = `pq_ntt`
   - **u/v**: `pq_ntt_mul` pointwise + `pq_poly_add` accumulate → `pq_intt`; μ = Decompress(ByteDecode1(m))
   - **c1/c2**: `pq_compress`(d=10/4) → `pq_byte_encode` → concat
3. **Generate**: click "▶", pick Python or JavaScript
4. **Verify**: `node dist-verify/verify-demo.js demos/procedures/ML-KEM-Encaps.json --exec` → c (768B)‖K (32B) matches the FIPS 203 reference

### Blocks
| Block | Function |
|----|------|
| `pq_sample_ntt` / `pq_sample_poly_cbd` | SampleNTT / SamplePolyCBD |
| `pq_ntt` / `pq_intt` / `pq_ntt_mul` | NTT / inverse NTT / pointwise mul |
| `pq_poly_add` / `pq_compress` / `pq_byte_encode` | poly add / compress / encode |
| `pq_seed_with_nonce` / `pq_prf` / `pq_xof` | nonce-extended seed / PRF / SHAKE |
| sponge family | SHA3-256/512 hashing |

---

**Related guide**: ML-KEM-768 (k=3) composite/basic-block builds: [fips203-ML-KEM/guides/](../standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md).

---

## Manual Assembly: ML-KEM Polynomial Sampling (from scratch)

1. **Seed**: drag `data_value` with a 32-byte rho (seed)
2. **Nonce extension**: drag `pq_seed_with_nonce`, chain rho + nonce (j‖i) into a 34-byte input
3. **Sample**: drag `pq_sample_ntt` (SampleNTT), set MODULUS dropdown to `3329`
4. **CBD sample** (optional): `pq_sample_poly_cbd` + `pq_prf`, η dropdown 2/3 (FIPS 203 Alg 8 consumes PRF output directly)
5. **NTT**: drag `pq_ntt` (q=3329, n=256) — note t̂ from ek is already in NTT domain, **do NOT NTT again**
6. **Generate**: ▶ Generate
7. **Verify**: coefficients ∈ [0, 3329), matching the FIPS 203 reference implementation

> Full Encaps chain (SampleNTT→CBD→INTT→Compress→ByteEncode): see `demos/procedures/ML-KEM-Encaps.json` and the ML-KEM-768 build guide.

---

**Official-vector verification**: `node dist-verify/verify-demo.js demos/procedures/ML-KEM-Encaps.json --exec` → `=== ALL VECTORS PASS ===`
