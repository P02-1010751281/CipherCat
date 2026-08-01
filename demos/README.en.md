# 🧪 CipherCat Demo Workspaces

> [中文](./README.md) · [English](./README.en.md)

Pre-built Blockly workspace examples, all using **atomic blocks** (no convenience wrappers), showcasing low-level crypto primitives.

> Step-by-step tutorials (per algorithm): [docs/demos/](../docs/demos/), index [docs/DEMO.md](../docs/DEMO.en.md). This file is the file index + verification commands.

## Atomic Block Demos

| Demo | File | Atomic blocks |
|------|------|--------|
| SM4 round | `SM4-Atomic-Round.json` | `sm4_round_func` + `sm4_linear_transform` |
| AES single round | `AES-Atomic-Round.json` | `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key` |
| SHA-256 hash | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| ML-KEM primitives | `ML-KEM-Atomic.json` | `pq_sample_poly_cbd` + `pq_ntt` + `pq_sample_ntt` + `pq_mat_vec_mul` |

## Procedure-Wrapped Demos (official-vector verified)

The following demos wrap atomic-block chains with `procedures_defreturn` (custom functions), **without using `proc_*` template blocks**; generated code (Python + JavaScript) passes official test vectors via `scripts/verify-demo.ts --exec` (SM4 S-box table / GB/T 32905-2016 SM3 / GB/T 32918.5 SM2 / FIPS 203 ML-KEM-512).

| Demo | File | Wrapped content | Official vector |
|------|------|----------|----------|
| SM4 S-box | `procedures/SM4-Sbox.json` | `sm4_sbox` lookup → `SM4_Sbox(x)` | GM/T 0002-2012 S-box (S(0x01)=0x90) |
| SM3 hash | `procedures/SM3-Hash.json` | `hash_sm3_pad` → `hash_sm3_compress` (IV const) → `SM3_Hash(msg)` | GB/T 32905-2016 A.1 (SM3("abc")) |
| SM2 point mult | `procedures/SM2-PointMul.json` | `ecc_load_curve_params` + `ecc_load_point` + `ecc_multiply` → `SM2_PointMul()` | GB/T 32918.5-2017 (k·G) |
| ML-KEM.Encaps | `procedures/ML-KEM-Encaps.json` | SampleNTT/CBD/NTT/INTT/ntt_mul/compress/encode full chain → `ML_KEM_Encaps(ek, m)` | FIPS 203 (ML-KEM-512 encaps, c‖K) |

> Verify: `npm run type-check`, then `node dist-verify/verify-demo.js demos/procedures/<file> --exec` (build the harness first with `npx vite build --config vite.verify.config.ts`). Expected values are recorded in `demos/tests.json`.

## Procedure-Wrapped Demos (structure showcase)

| Demo | File | Wrapped content |
|------|------|----------|
| SM4 function | `Procedure-SM4-Round.json` | `procedures_defreturn` wraps `sm4_round_func` → `SM4_Round(state_0..3, rk)` |
| AES function | `Procedure-AES-Round.json` | `procedures_defreturn` wraps the four steps → `AES_Round(state, round_key)` |

## How to Use

1. Open CipherCat → Menu "More → Import Workspace" → pick a `.json` file from `demos/`
2. Inspect the block wiring → "▶ Generate" to view JS/Python output
3. Procedure demo → see how the wrapped function is called elsewhere
