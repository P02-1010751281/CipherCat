# 🧪 Demo Workspaces


Pre-built Blockly workspace examples use **atomic blocks** (no convenience wrappers). Some connect algorithm stages with value sockets; the AES atomic demo uses ordered top-level calls that mutate shared state in place. Procedure demos show reusable function wrappers.

> Step-by-step tutorials (per algorithm): [docs/demos/](../docs/demos/), index [docs/DEMO.md](../docs/guides/DEMO.en.md). This file is the file index + verification commands.

## Atomic Block Demos (top-level, no function wrappers)

| Demo | File | Atomic blocks |
|------|------|--------|
| SM4 round | `SM4-Atomic-Round.json` | `sm4_round_func` + `sm4_linear_transform` |
| AES single round | `AES-Atomic-Round.json` | Four top-level calls mutate shared state in workspace order; no value-socket wiring |
| SHA-256 hash | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| ML-KEM primitives | `ML-KEM-Atomic.json` | `pq_sample_poly_cbd` + `pq_ntt` + `pq_sample_ntt` + `pq_mat_vec_mul` |

## Procedure-Wrapped Demos (registered-specification verified)

The demos below wrap atomic-block chains with `procedures_defreturn` (custom functions), **without using `proc_*` template blocks**; generated code (Python + JavaScript) is checked against each registered specification via `scripts/verify-demo.ts --exec` (59 demos; specifications include standard vectors, independent cross-checks, and property assertions; see `demos/tests.json`):

| Demo | File | Official vector |
|------|------|----------|
| SM4 S-box | `procedures/SM4-Sbox.json` | GM/T 0002-2012 (S(0x01)=0x90) |
| SM3 hash | `procedures/SM3-Hash.json` | GB/T 32905-2016 A.1 (SM3("abc")) |
| SM2 point mult | `procedures/SM2-PointMul.json` | GB/T 32918.5-2017 (k·G) |
| SM2 sign/verify | `procedures/SM2-Sign.json` | GB/T 32918.2-2016 Annex A (ZA/e/r/s) |
| SM2 encrypt/decrypt | `procedures/SM2-Encrypt.json` | GB/T 32918.4-2016 Annex A example 2 |
| SM9 sign | `procedures/SM9-Sign.json` | GB/T 38635.2-2020 Annex A + Go cross-check |
| EdDSA | `procedures/EDDSA.json` | RFC 8032 TEST 1-3 |
| ECDSA | `procedures/ECDSA.json` | RFC 6979 P-256 sample/test |
| ECDH shared secret | `procedures/ECDH.json` | RFC 5903 §8.1 (IKE P-256) |
| X25519 | `procedures/X25519.json` | RFC 7748 §5.2 V1/V2 |
| ML-KEM.Encaps | `procedures/ML-KEM-Encaps.json` | FIPS 203 (ML-KEM-512, c‖K) |
| ML-DSA sign | `procedures/ML-DSA-Sign.json` | FIPS 204 ACVP sigGen 30/30 |
| RSA encrypt/decrypt | `procedures/RSA-Encrypt.json` | PKCS#1 v1.5 + cryptography cross-check |
| RSA sign | `procedures/RSA-Sign.json` | PKCS#1 v1.5 SHA-256 + cryptography cross-check |
| DRBG | `procedures/DRBG.json` | SP 800-90A CAVP 480/480 |
| GM RNG | `procedures/GM-RNG.json` | GM/T 0103 (SM3-HMAC-DRBG) |
| Argon2 | `procedures/ARGON2.json` | RFC 9106 three vectors |
| HKDF | `procedures/HKDF-SHA256.json` | RFC 5869 |
| PBKDF2 | `procedures/PBKDF2-SHA256.json` `procedures/PBKDF2-SM3.json` | RFC 8018 / GM/T 0091 (SM3 variant) |
| ZUC EEA3 stream | `procedures/EEA3.json` | GB/T 33133.2 Annex A.1 |
| ZUC EIA3 message integrity | `procedures/EIA3.json` | GB/T 33133.3-2021 Appendix B Examples 1 and 2 (1/577 bits) |
| GCM | `procedures/GCM-Encrypt.json` | SP 800-38D TC2/TC3/TC16 |
| CCM | `procedures/CCM-Encrypt.json` | SP 800-38C Annex C Example 1-3 |
| XTS | `procedures/XTS-Encrypt.json` | SP 800-38E + IEEE 1619-2007 |
| ASCON | `procedures/ASCON.json` · `procedures/ASCON-Extended.json` | SP 800-232 (1089 AEAD cases; Hash/XOF/CXOF, decryption, and bad-tag rejection extension checks) |

## Procedure-Wrapped Demos (PQC math foundations / property-vector verification)

The demos below are the PQC gap-fill batch outputs, verified dual-language with property vectors (mathematical identities / round-trips / determinism / tamper detection) — algorithms without official vectors or black-box algorithms use property assertions:

| Demo | File | Property vectors |
|------|------|----------|
| ML-DSA signature primitives | `procedures/ML-DSA-Primitives.json` | P2R reversible `r=r1·2¹³+r0`, UseHint(MakeHint) theorem, InBall exactly 39 ±1 |
| Coding-basis math | `procedures/Code-Based-Math.json` | GF(2) polynomial associativity / division-remainder rebuild / Euclid, A·A⁻¹=I, d=wt(x⊕y) |
| Hash-based structures | `procedures/Hash-Based-Structures.json` | Chain(x,0)=x, semigroup property, 4-leaf tree root manual composition, ADRS 32B determinism |
| FORS few-time signature | `procedures/FORS-Sign.json` | round-trip (Verify(Sign)=True), determinism, tamper detection, sig 640B / pk 32B |
| GF(2^m) coefficient polynomials | `procedures/GF2m-Poly.json` | add zero element / commutativity / associativity, mul associativity, (a·b) mod b=0, Bezout identity, Goppa root check |
| Goppa codes + Patterson | `procedures/Goppa-Decode.json` | G=[176,92,1] root check, inverse u·(z−α)≡1, syndrome atomic chain == known value, no-error / single-error / double-error round-trips, tampered G undecodable |
| PQC gap fill | `procedures/PQC-Gaps.json` | Rej exclusive bound, convolution associative / commutative / distributive, mod 8380417 range, ADRS domain separation, WOTS csum monotonic, Fermat 2^(q-1)≡1 |
| Merkle tree indexing | `procedures/Tree-Index.json` | FORS leaf-selection nibbles, leaf+auth rebuild root == whole-tree root (idx ∈ {0,1,3,5,7}) |

## Procedure-Wrapped Demos (structural / load-verified)

| Demo | File | Wrapped content |
|------|------|----------|
| SM4 function wrap | `Procedure-SM4-Round.json` | `procedures_defreturn` wrapping `sm4_round_func` → `SM4_Round(state_0..3, rk)` |
| AES function wrap | `Procedure-AES-Round.json` | Explicit `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)` connections; fixed-input regression `4807…c59f`, not an official appendix vector |
| AES round chain | `procedures/AES-Round.json` / `procedures/AES-LastRound.json` | Normal round + final round (without MixColumns); fixed-input regression, not a full official encryption vector |
| SHA-256 hash | `procedures/SHA256-Hash.json` | pad + compress chain |
| HMAC-SHA256 | `procedures/HMAC-SHA256.json` | double-hash HMAC chain |
| HKDF / PBKDF2 | `procedures/HKDF.json` / `procedures/PBKDF2.json` | KDF chains |
| ML-KEM KeyGen | `procedures/ML-KEM-KeyGen.json` | keygen chain |
| Mode encryption | `procedures/Mode-ECB.json` / `Mode-CBC.json` / `Mode-CTR.json` | ECB/CBC/CTR mode chains |

## Verification

`npm run type-check`, then `node dist-verify/verify-demo.js demos/procedures/<file> --exec` (build the harness first with `npx vite build --config vite.verify.config.ts`). Expected values live in `demos/tests.json`.

## Usage

1. Open the editor → menu "More → Import Workspace" → pick a `.json` under `demos/`
2. Inspect the block connections → "Generate" to see JS/Python output
3. Procedure demos → see how the wrapped function is called elsewhere
