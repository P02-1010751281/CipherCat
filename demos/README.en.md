# 🧪 Demo Workspaces


Pre-built Blockly workspace examples use **atomic blocks** (no convenience wrappers). Some connect algorithm stages with value sockets; the AES atomic demo uses ordered top-level calls that mutate shared state in place. Procedure Demos show reusable function wrappers.

> Step-by-step tutorials (per algorithm): [docs/demos/](../docs/demos/), index [docs/guides/DEMO.en.md](../docs/guides/DEMO.en.md). This file is the workspace file index.

> Per-demo evidence class and basis are recorded in [`evidence.json`](./evidence.json): `official-vector` (standards appendix or example values), `property` (algebraic or structural properties), `fixed-regression` (project fixed regression, explicitly not an official vector), `cross-implementation` (cross-checked against an independent implementation).

## Atomic Block Demos (top-level, no function wrappers)

| Demo | File | Atomic blocks |
|------|------|--------|
| SM4 round function | `SM4-Atomic-Round.json` | `sm4_round_func` (one round F, including the S-box and L transform) |
| AES single round | `AES-Atomic-Round.json` | Four top-level calls mutate shared state in workspace order; the four primitives are not connected to each other and each reads and writes the shared state through variables |
| SHA-256 hash | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| Post-quantum primitives and scalar math | `ML-KEM-Atomic.json` | Separate examples of `pq_sample_poly_cbd`, `pq_ntt`, and `pq_sample_ntt`; `pq_mat_vec_mul` is a non-standard scalar teaching helper, not an ML-KEM operation |

`SM4-Atomic-Round.json` does not contain a separate `sm4_linear_transform` block. To inspect L by itself, use an independent four-byte input; do not apply it again to the output of the round function, which already includes L.

## Procedure-Wrapped Demos (with sample checks)

The demos below wrap atomic-block chains with `procedures_defreturn` (custom functions), **without using `proc_*` template blocks**. Each entry's evidence class is recorded in [`evidence.json`](./evidence.json): standards appendix or example values, algebraic or structural properties, and project fixed regressions; some algorithms also have independent cross-checks. These checks cover only the listed samples and are not a complete standards test suite or algorithm certification.

| Demo | File | Registered regression basis |
|------|------|----------|
| SM4 S-box | `procedures/SM4-Sbox.json` | GB/T 32907-2016 Appendix A (S(0x01)=0x90) |
| SM4 single round | `procedures/SM4-Round.json` | GB/T 32907-2016 Appendix A (first-round output `27FAD345`; this round only) |
| SM3 hash | `procedures/SM3-Hash.json` | GB/T 32905-2016 A.1 (SM3("abc")) |
| SHA-224 hash | `procedures/SHA224-Hash.json` | FIPS 180-4 Appendix B (`abc` and empty message); Python cross-checks a 256-byte sequence with `hashlib`, while JavaScript checks repeat-run determinism on a 135-byte input |
| SHA-384 hash | `procedures/SHA384-Hash.json` | FIPS 180-4 Appendix B (SHA-384(`abc`)) |
| SHA-512 hash | `procedures/SHA512-Hash.json` | FIPS 180-4 Appendix B (SHA-512(`abc`)) |
| SHA3-256 hash | `procedures/SHA3-Hash.json` | FIPS 202 SHA3-256(`abc`) known answer; 135-byte case is a project regression, not a complete KAT set |
| SM2 point mult | `procedures/SM2-PointMul.json` | GB/T 32918.5-2017 (k·G) |
| SM2 sign/verify | `procedures/SM2-Sign.json` | GB/T 32918.2-2016 Annex A (ZA/e/r/s) |
| SM2 encrypt/decrypt | `procedures/SM2-Encrypt.json` | GB/T 32918.4-2016 Annex A example 2 |
| SM2 key exchange | `procedures/SM2-KeyExchange.json` | GB/T 32918.3-2016 Annex A.2 Example 1 (B-side shared key; not both protocol roles or confirmation flow) |
| SM9 sign | `procedures/SM9-Sign.json` | GB/T 38635.2-2020 Annex A vector (Python/JavaScript generated-code regression) |
| EdDSA | `procedures/EDDSA.json` | RFC 8032 TEST 1-3 |
| ECDSA | `procedures/ECDSA.json` | RFC 6979 P-256 sample/test |
| ECDH shared secret | `procedures/ECDH.json` | RFC 5903 §8.1 (IKE P-256) |
| X25519 | `procedures/X25519.json` | RFC 7748 §5.2 V1/V2 |
| ML-KEM.Encaps | `procedures/ML-KEM-Encaps.json` | Project fixed-input/output regression (ML-KEM-512, output layout `c‖K`); the same implementation is separately checked against the official ACVP cases (ML-KEM-encapDecap-FIPS203 internalProjection tgId=1, tcId 1–3) in a unit test, not a complete ACVP session or certification |
| ML-DSA sign | `procedures/ML-DSA-Sign.json` | Official ACVP cases: ML-DSA-sigGen-FIPS204 internalProjection, ML-DSA-44 deterministic (hashAlg=none, empty context), tgId=1 tcId 5 and 8 (2 cases); not a complete ACVP session or certification |
| RSA encrypt/decrypt | `procedures/RSA-Encrypt.json` | PKCS#1 v1.5 teaching implementation (512-bit modulus); the demo checks the round trip and output container, with no third-party cross-computation in-repo |
| RSA sign | `procedures/RSA-Sign.json` | PKCS#1 v1.5 SHA-256 teaching implementation (512-bit modulus); the demo checks verification results, with no third-party cross-computation in-repo |
| DRBG | `procedures/DRBG.json` | Three fixed outputs covering direct generation, instantiate/generate, and reseed/generate; not the full CAVP suite |
| GM RNG teaching path | `procedures/GM-RNG.json` | Project fixed-input/output regression; not an official vector. Cross-language agreement checks this case only, not independent algorithm correctness; not full RNG/entropy-source validation |
| Argon2 | `procedures/ARGON2.json` | RFC 9106 three vectors |
| HKDF | `procedures/HKDF-SHA256.json` | RFC 5869 |
| PBKDF2 baseline example | `procedures/PBKDF2.json` | Fixed-input/output regression; not claimed as a complete standards test vector |
| PBKDF2-SHA256 | `procedures/PBKDF2-SHA256.json` | RFC 8018 |
| PBKDF2-SM3 | `procedures/PBKDF2-SM3.json` | GM/T 0091 (SM3 variant) |
| ZUC EEA3 stream | `procedures/EEA3.json` | GB/T 33133.2 Annex A.1 |
| ZUC EIA3 message integrity | `procedures/EIA3.json` | GB/T 33133.3-2021 Appendix B Examples 1 and 2 (1/577 bits) |
| GCM | `procedures/GCM-Encrypt.json` | SP 800-38D Test Case 2 and Test Case 13; plus a project-chosen zero key/IV + 16-byte AAD variant (not a standard TC). **TC3 is not covered** |
| CCM | `procedures/CCM-Encrypt.json` | SP 800-38C Annex C Example 1-3 |
| XTS | `procedures/XTS-Encrypt.json` | SP 800-38E + IEEE 1619-2007 |
| ASCON | `procedures/ASCON.json` · `procedures/ASCON-Extended.json` | Fixed AEAD / Hash / XOF cases, empty-message decryption, and bad-tag/parameter rejection; not the full 1,089-case AEAD KAT or complete Hash/XOF suites |

## Procedure-Wrapped Demos (PQC math foundations / property-vector verification)

The demos below are the PQC gap-fill batch outputs, verified dual-language with property vectors (mathematical identities / round-trips / determinism / tamper detection) — algorithms without official vectors or black-box algorithms use property assertions:

| Demo | File | Property vectors |
|------|------|----------|
| ML-DSA signature primitives | `procedures/ML-DSA-Primitives.json` | P2R reversible `r=r1·2¹³+r0`, UseHint(MakeHint) theorem, InBall exactly 39 ±1 |
| ML-DSA NTT | `procedures/ML-DSA-NTT.json` | Round-trip and ring-multiplication homomorphism under FIPS 204 Algorithms 41/42/45; not an official NTT KAT set |
| Coding-basis math | `procedures/Code-Based-Math.json` | GF(2) polynomial associativity / division-remainder rebuild / Euclid, A·A⁻¹=I, d=wt(x⊕y) |
| Hash-based structures | `procedures/Hash-Based-Structures.json` | Chain(x,0)=x, semigroup property, 4-leaf tree root manual composition, ADRS 32B determinism |
| FORS teaching variant (not standard-compatible) | `procedures/FORS-Sign.json` | Project-internal round-trip, determinism, and tamper detection; not FIPS 205 KAT/conformance evidence; sig 640B / pk 32B |
| GF(2^m) coefficient polynomials | `procedures/GF2m-Poly.json` | add zero element / commutativity / associativity, mul associativity, (a·b) mod b=0, Bezout identity, Goppa root check |
| Goppa codes + Patterson | `procedures/Goppa-Decode.json` | G=[176,92,1] root check, inverse u·(z−α)≡1, syndrome atomic chain == known value, no-error / single-error / double-error round-trips, tampered G undecodable |
| PQC gap fill | `procedures/PQC-Gaps.json` | Rej exclusive bound, convolution associative / commutative / distributive, mod 8380417 range, ADRS domain separation, WOTS csum monotonic, Fermat 2^(q-1)≡1 |
| Merkle tree indexing | `procedures/Tree-Index.json` | FORS leaf-selection nibbles, leaf+auth rebuild root == whole-tree root (idx ∈ {0,1,3,5,7}) |
| Multivariate math components | `procedures/Multivariate-Math.json` | Linear systems, quadratic forms, binomial coefficients, and GF(2^8) examples; fixed project regression, not standard KATs |
| Supporting math components | `procedures/Wrap-Up-Math.json` | Dot product/polynomial scaling, FORS determinism, Goppa polynomial and syndrome examples; properties/fixed regressions |
| Research math components | `procedures/Research-Math.json` | LLL determinant preservation, symmetric/normalized discrete-Gaussian PMF, and Berlekamp–Massey replay property |

## Procedure-Wrapped Demos (structural / load-verified)

| Demo | File | Wrapped content |
|------|------|----------|
| SM4 function wrap | `Procedure-SM4-Round.json` | `procedures_defreturn` wrapping `sm4_round_func` → `SM4_Round(state_0..3, rk)` |
| AES function wrap | `Procedure-AES-Round.json` | Explicit `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)` connections; fixed-input regression `4807…c59f`, not an official appendix vector |
| AES round chain | `procedures/AES-Round.json` / `procedures/AES-LastRound.json` | Normal round + final round (without MixColumns); fixed-input regression, not a full official encryption vector |
| SHA-256 hash | `procedures/SHA256-Hash.json` | pad + compress chain |
| HMAC-SHA256 | `procedures/HMAC-SHA256.json` | double-hash HMAC chain |
| HKDF / PBKDF2 | `procedures/HKDF-SHA256.json` / `procedures/PBKDF2.json` / `procedures/PBKDF2-SHA256.json` / `procedures/PBKDF2-SM3.json` | KDF chains |
| Mode encryption | `procedures/Mode-ECB.json` / `procedures/Mode-CBC.json` / `procedures/Mode-CTR.json` | ECB/CBC/CTR mode chains |

The `proc_mlkem_keygen` visual template (Crypto Templates) is not a workspace file in this directory.

## Verification

Import a workspace into the editor, generate Python/JavaScript code, run it locally, and compare the result with the source named in the "evidence" column. A fixed regression value is not an official vector, and a passing demo covers only its registered inputs — it is not a complete standards test or algorithm certification.

## Usage

1. Open the editor → menu "More → Import Workspace" → pick a `.json` under `demos/`
2. Inspect the block connections → "Generate" to see JS/Python output
3. Procedure Demos → see how the wrapped function is called elsewhere
