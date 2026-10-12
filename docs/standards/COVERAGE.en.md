# Standards Coverage Matrix (Standard ↔ Blocks ↔ Demos ↔ Templates ↔ Guides)

> This document is the index of `docs/standards/`: one row per standards directory, showing its coverage in the CipherCat block system —
> **atomic blocks** (registered in `src/blocks/`), **demos** (prebuilt workspaces under `demos/`), **templates** (`proc_*` prefilled templates in `src/blocks/procedure/blocks.ts`), and **build guides** (`standards/*/guides/`).
> Extraction quality, source-artifact availability, and unfinished items are tracked separately in [DOCUMENT-STATUS.en.md](./DOCUMENT-STATUS.en.md); this matrix is not proof of full-text standards coverage.
> Function/primitive page split rules and entry points are listed in [FUNCTION-PRIMITIVE-INDEX.en.md](./FUNCTION-PRIMITIVE-INDEX.en.md); source-layer boundaries are listed in [SOURCE-LAYERS.en.md](./SOURCE-LAYERS.en.md).
>
> Block facts verified against code (2026-09-29); demo file inventory in [demos/README.en.md](../../demos/README.en.md); step-by-step tutorials in [guides/TUTORIALS.en.md](../guides/TUTORIALS.en.md) and [guides/DEMO.en.md](../guides/DEMO.en.md). `standards/papers/` is a research-material index and is not counted among the standard and reference directories reported by `npm run standards:check` (`directories=`, currently 40, including `randomness-certification-sources/` and `rfc6979-ecdsa/`).
>
> The object-level register (211 active blocks plus 1 compat identity, 29 template identities, 59 demos) is [CONFORMANCE-INVENTORY.md](./CONFORMANCE-INVENTORY.md); this matrix is a standards-dimension aggregate mapping and does not replace per-object test evidence.

---

## Coverage Matrix

### Status semantics

- `Atomic blocks/templates/demos/guides` indicate repository assets only; they do not imply certification or production security assurance.
- Each standards directory should record the exact edition/date, official source URL, vector source, known errata, implementation status and security boundary.
- When an NIST page carries an errata or revision notice, retain the coverage row but mark the reference for re-check instead of claiming unconditional conformance to the latest text.
- The Go assessment in `gmt0005-randomness/` and the CipherCat browser trial are separate execution planes; randomness judgments must come from the `metacrypt_server` backend report.

| Standard | Standards dir | Atomic blocks | Demo | Template | Guide |
|----------|---------------|---------------|------|----------|-------|
| AES | `fips197-AES/` | `aes_sub_bytes` · `aes_shift_rows` · `aes_mix_columns` · `aes_add_round_key` · `sbox`(PRESET=AES) · `pad_pkcs7` | `demos/AES-Atomic-Round.json` · `Procedure-AES-Round.json` · `procedures/AES-Round.json` · `procedures/AES-LastRound.json` | `proc_aes_round` · `proc_aes_last_round` · `proc_aes_key_schedule` (10 empty iterations; no round-key calculation) | — |
| SHA-2 | `fips180-4-SHA2/` | `hash_sha224_hash` · `hash_sha256_pad` · `hash_sha256_compress` · `hash_sha512_pad` · `hash_sha512_compress` · `hash_sha512_hash`(SHA-384/512 dropdown) | `demos/SHA256-Atomic-Hash.json` · `procedures/SHA224-Hash.json` · `procedures/SHA256-Hash.json` · `procedures/SHA384-Hash.json` · `procedures/SHA512-Hash.json` | `proc_sha256_hash` (padding fragment only) · `proc_md_iterate` | — |
| SHA-3 / SHAKE | `fips202-SHA3/` | `keccak_f`(200/18, 400/20, 800/22, 1600/24; SHA-3/SHAKE still use only 1600/24) · `sponge_pad` · `sponge_absorb` · `sponge_squeeze` · `keccak_state_init` · `sha3_hash` · `pq_xof`(SHAKE-128/256) | `demos/procedures/SHA3-Hash.json` | `proc_sponge_duplex` (squeeze starter only; output length unset; not duplex) | — |
| HMAC | `fips198-1-hmac/` | `hash_hmac`(HASH dropdown: SHA-256 / SM3) | `demos/procedures/HMAC-SHA256.json` | `proc_hmac_sha256` · `proc_sm3_hmac` (template message input unset) | — |
| ML-KEM | `fips203-ML-KEM/` | `pq_sample_poly_cbd` · `pq_sample_ntt` · `pq_prf`(PRFη: SHAKE256) · `pq_ntt` · `pq_intt` · `pq_ntt_mul` · `pq_ntt_butterfly` · `pq_poly_add/sub` · `pq_compress/decompress` · `pq_byte_encode/decode` · `pq_bytes_to_bits` · `pq_bits_to_bytes` · `pq_byte_concat` · `pq_bytes_slice` · `pq_seed_with_nonce` · `nt_mod_pow`(q=3329) | `demos/ML-KEM-Atomic.json` · `procedures/ML-KEM-Encaps.json` (fixed ML-KEM-512 vector) | `proc_mlkem_keygen` (CBD→NTT fragment) · `proc_mlkem_encaps` (fixed ML-KEM-512; template structure/smoke only) · `proc_ntt_vec` · `proc_pq_cbd` · `proc_pq_sample` · `proc_pq_vec_add` · `proc_pq_vec_sub` | ✅ [ML-KEM-768-Encaps build guide](fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md) (for parameter set 768; + [ZH](fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md)) |
| ML-DSA | `fips204-ML-DSA/` | `mldsa_sign` · `mldsa_verify` · `pq_power2round` · `pq_decompose` · `pq_make_hint` · `pq_use_hint` · `pq_sample_in_ball` · `pq_rej_sample` · shared helpers `pq_xof/prf`, `pq_sample_ntt`, `pq_ntt/intt/ntt_mul`, `pq_poly_add/sub` (see Inventory for per-block scope) | `demos/procedures/ML-DSA-Sign.json` · `procedures/ML-DSA-Primitives.json` · `procedures/ML-DSA-NTT.json` | —（reuses pq templates like `proc_ntt_vec`） | ✅ [ML-DSA-Sign build guide](fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.en.md)（+ [ZH](fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md)） |
| SLH-DSA | `fips205-SLH-DSA/` | `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `merkle_auth_path` · `slh_addr` · `slh_adrs_full` · `wots_checksum` · `fors_sign` · `fors_verify` · `fors_pk_from_sk` · `fors_root` · `fors_leaf_index` | `demos/procedures/Hash-Based-Structures.json` · `FORS-Sign.json` · `Tree-Index.json` | — | — |
| McEliece (Goppa codes) | `mceliece-goppa/` | `gf2_poly_mul/div/mod/gcd` · `bin_mat_mul/inv` · `ham_weight` · `ham_dist` · `goppa_gen_poly` · `syndrome_calc` · `gf2m_mul/add/inv` · `gf2m_poly_add/mul/mod/xgcd/eval` · `goppa_decode` · `berlekamp_massey` · `arr_slice` | `demos/procedures/Code-Based-Math.json` · `GF2m-Poly.json` · `Goppa-Decode.json` · `PQC-Gaps.json` | — | — |
| ECDSA | `fips186-5-ecdsa/` | `ecdsa_sign` · `ecdsa_verify` · `ecdsa_k_rfc6979`(RFC 6979) · `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` | `demos/procedures/ECDSA.json` | — | — |
| SP 800-38A block modes | `sp800-38a-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt` · `pad_pkcs7` · `pad_zero` | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` (AES-128; key unset) · `proc_mode_cbc` (AES-128; key/IV unset) · `proc_mode_ctr` (AES-128; key/nonce unset) | — |
| CMAC | `sp800-38b-cmac/` | `cmac_double` · `cmac_subkeys` · `cmac_mac`(CIPHER dropdown: AES-128 / SM4) | — | — | — |
| CCM | `sp800-38c-ccm/` | `ccm_b0` · `ccm_counter_block` · `ccm_cbc_mac` · `ccm_ctr` · `ccm_encrypt` | `demos/procedures/CCM-Encrypt.json` | — | — |
| GCM | `sp800-38d-gcm/` | `gcm_gf128_mul` · `gcm_ghash` · `gcm_gctr` · `gcm_inc32` · `gcm_j0` · `gcm_encrypt` (+ `mode_ctr_encrypt` basis) | `demos/procedures/GCM-Encrypt.json` (GCM-spec Test Case 2/13 numbering plus 15 NIST ACVP AES-GCM cases with tagLen=128 and 96-bit IV; SP 800-38D itself has no test-vector appendix) | `proc_mode_gcm` (CTR-only scaffold; no GHASH/tag; not GCM evidence) | — |
| XTS | `sp800-38e-xts/` | `xts_tweak_mul` · `xts_encrypt` | `demos/procedures/XTS-Encrypt.json` | — | — |
| DRBG | `sp800-90a-drbg/` | `drbg_generate` | `demos/procedures/DRBG.json` | — | — |
| PBKDF2 | `sp800-132-pbkdf2/` | `pbkdf2_f` · `pbkdf2` | `demos/procedures/PBKDF2-SHA256.json` · `procedures/PBKDF2.json` | `proc_pbkdf2` (empty-loop starter; no derivation) | — |
| ASCON | `sp800-232-ascon/` | `ascon_encrypt` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` · `ascon_cxof128` | `demos/procedures/ASCON.json` · `ASCON-Extended.json` | — | — |
| HKDF | `rfc5869-hkdf/` | `hkdf_extract` · `hkdf_expand` · `hkdf` | `demos/procedures/HKDF-SHA256.json` · `procedures/HKDF.json` | `proc_hkdf` (empty-loop placeholders; no Extract/Expand) | — |
| X25519 | `rfc7748-x25519/` | `x25519` | `demos/procedures/X25519.json` | — | — |
| EdDSA | `rfc8032-eddsa/` | `eddsa_sign` · `eddsa_verify` | `demos/procedures/EDDSA.json` | — | — |
| ECDH | `rfc5903-ecdh/` | `ecdh_shared_secret`（+ `ecc_*` curve primitives） | `demos/procedures/ECDH.json` | — | — |
| ECDSA deterministic k | `rfc6979-ecdsa/` | `ecdsa_k_rfc6979` (RFC 6979 §3.2 deterministic k; `ecdsa_sign`/`ecdsa_verify` are counted under `fips186-5-ecdsa/`) | `demos/procedures/ECDSA.json` | — | — |
| Randomness certification source index | `randomness-certification-sources/` | — (certification sources and rules index; no block mapping) | — | — | — |
| RSA signature-key requirements / primality test | `fips186-5-ecdsa/05-RSA-Key-Generation.en.md` · `06-RSA-Primality-Testing.en.md` | `rsa_keygen` (educational) · `rsa_sign` · `rsa_verify` (scheme mapping only; no conformance claim) | `demos/procedures/RSA-Sign.json` | — | — |
| RSAES/RSASSA PKCS#1 v1.5 | `rfc8017-pkcs1/` | `rsa_encrypt` · `rsa_decrypt` · `rsa_sign` · `rsa_verify` (teaching implementations) | `demos/procedures/RSA-Encrypt.json` · `RSA-Sign.json` | — | — |
| Argon2 | `rfc9106-argon2/` | `argon2_hash` | `demos/procedures/ARGON2.json` | — | — |
| Base64 | `rfc4648-base64/` | `base64_encode` · `base64_decode` | — | — | — |
| PKCS#7 | `rfc2315-pkcs7/` | `pad_pkcs7`（padding semantics） | — | — | — |
| SM3 | `gbt32905-SM3/` | `hash_sm3_pad` · `hash_sm3_compress` · `hash_hmac`(SM3) | `demos/procedures/SM3-Hash.json` · `procedures/PBKDF2-SM3.json` | `proc_sm3_hash` (padding only) · `proc_sm3_hmac` (message input unset) | — |
| SM4 | `gbt32907-SM4/` | `sm4_sbox` · `sm4_round_func` · `sm4_linear_transform` · `sbox`(PRESET=SM4) | `demos/SM4-Atomic-Round.json` · `Procedure-SM4-Round.json` · `procedures/SM4-Sbox.json` · `procedures/SM4-Round.json` | `proc_sm4_round` · `proc_sm4_key_schedule` (32 empty iterations; no round-key calculation) | — |
| SM2 | `gbt32918-SM2/` | `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` · `sm2_sign` · `sm2_verify` · `sm2_encrypt` · `sm2_decrypt` · `sm2_key_exchange` | `demos/procedures/SM2-PointMul.json` · `SM2-Sign.json` · `SM2-Encrypt.json` · `SM2-KeyExchange.json` | — | — |
| ZUC | `gbt33133-ZUC/` | `zuc_s0` · `zuc_s1` · `zuc_l1` · `zuc_l2` · `zuc_f` · `zuc_keystream` · `zuc_eia3` · `sbox`(PRESET=ZUC S0/S1) | `demos/procedures/EEA3.json` · `EIA3.json` | `proc_zuc_keystream` (starter scaffold; IV/length unset) | ✅ [ZUC-KeyStream build guide](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md)（+ [ZH](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md)） |
| SM9 | `gbt38635-SM9/` | `sm9_master_key` · `sm9_user_key` · `sm9_sign` · `sm9_verify` | `demos/procedures/SM9-Sign.json` | — | — |
| GM/T 0103 RNG framework reference (not a conformance claim) | `gmt0103-rng/` | `gm_rng` (deterministic SM3-HMAC teaching example; excludes entropy source/assessment/testing) | `demos/procedures/GM-RNG.json` | — | — |
| GM/T 0091 KDF | `gmt0091-kdf/` | `hash_hmac`(SM3) · `pbkdf2`（SM3 isomorphic） | `demos/procedures/PBKDF2-SM3.json` | `proc_pbkdf2` | — |
| GB/T 17964 block modes | `gbt17964-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt`（current generator uses AES helpers; SM4 mapping pending） | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` · `proc_mode_cbc` · `proc_mode_ctr` | — |
| GB/T 36624 AEAD | `gbt36624-aead/` | —（official record is current; local scan has no reliable clause mapping） | — | — | — |
| GB/T 15852 MAC (.1-2020/.2-2024/.3-2019) | `gbt15852-mac/` | `cmac_mac`(SM4) · `hash_hmac`(SM3/SHA-256) (implementation mapping only) | — | `proc_hmac_sha256` · `proc_sm3_hmac` (template message input unset; not MAC evidence) | — |
| GM/T 0005 randomness testing | `gmt0005-randomness/` | —（implemented in Go backend `randomness/`, not Blockly blocks） | — | — | — |
| GB/T 32915 binary-sequence randomness testing | `gbt32915-randomness/` | — (backend statistical testing standard, not a Blockly block; conformance review pending) | — | — | — |
| China PQC public-information tracking | `china-pqc-tracking/` | — (tracks official research and standardization information; not an algorithm) | — | — | — |

---

`pq_mat_vec_mul` and `proc_pq_mat_mul` remain generic scalar-math teaching constructs. They are not the polynomial-ring matrix-vector operation in ML-KEM/ML-DSA and are excluded from the standards coverage mapping above. In `ML-KEM-Atomic.json`, this block is a standalone scalar example.

## Summary

RSA `rsa_keygen` is project-specific teaching code and is not defined by RFC 8017. The FIPS 186-5 RSA page is a normative reference, not evidence that the current block or demos conform. Matrix mappings indicate scheme/function relationships only.

- Total standards directories: **40**
- Research-material directories: **1** (`standards/papers/`, excluded from the algorithm count)
- With atomic-block coverage: **35** (no coverage 5: GB/T 36624 AEAD, GM/T 0005 randomness testing, GB/T 32915 binary-sequence randomness testing, China PQC public-information tracking, `randomness-certification-sources/`; 35 + 5 = 40, matching the `directories=` scope).
- With demos: **31**
- With `proc_*` templates: **15**（ML-DSA additionally reuses pq templates）
- With build guides: **3**（ML-KEM, ML-DSA, ZUC）
- Structured-split boundary: 25 directories have a local standards source; RFC, scanned, historical, and roadmap directories retain only implementation mappings or evidence boundaries. This does not establish that every function, primitive, formula, and table has been split.

> Counting: block coverage = ≥1 directly matching block; demo = matching workspace file under `demos/`; template = matching `proc_*`; guide = guide file exists under `standards/*/guides/`.

## Randomness, entropy-source, and validation-standard boundaries

The references below explain assessment objects and evidence boundaries. They are not included in the algorithm-directory count above and do not mean that this platform implements the corresponding tests or has passed a validation program.

| Standard/program | Object and purpose | Evidence boundary for this project |
|---|---|---|
| [GB/T 32915-2016 / GB/T 32915-2026](https://std.samr.gov.cn/gb/search/gbDetailed?id=oOfJ0FpRS8Q%3D&mode=p) | Statistical randomness testing for binary sequences; the 2026 edition takes effect on 2026-12-01 and fully replaces the 2016 edition | The backend currently references GM/T 0005 and has not completed clause-by-clause conformance review for GB/T 32915; sequence statistics do not prove entropy-source quality |
| [GM/T 0005-2021 / GM/T 0062-2018](https://www.oscca.gov.cn/sca/xwdt/2025-03/27/content_1061246.shtml) | Cryptographic-industry randomness-test specification and random-number testing requirements for cryptographic products | Record scope, tests, sample requirements, and decisions separately from GB/T 32915; one implementation does not automatically establish conformance to another standard |
| [GM/T 0103-2021, GM/T 0105-2021, GM/T 0078-2020](https://www.oscca.gov.cn/sca/xxgk/2021-10/19/content_1060880.shtml) | RNG framework, software RNG design guide, and cryptographic random-number module design guide | Design and evidence references, not an entropy-source test result or certification; the platform has not completed an entropy-source quality assessment |
| [SP 800-22 Rev. 1a](https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final) | Statistical tests for binary sequences | Use only as a sample-level diagnostic reference. NIST announced a planned revision to clarify that it is not for assessing cryptographic RNGs; statistical pass results are not proof of RNG security or entropy |
| [SP 800-90A Rev. 1](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final) | Deterministic random-bit generators (DRBGs) | Related to the existing `sp800-90a-drbg/` construction reference; a demo or vector test is not entropy-source or module validation |
| [SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final) | Entropy sources, entropy estimation, and health tests | Requires source data, an entropy-source model, and health-test evidence; statistical tests on samples from arbitrary deterministic user code cannot replace this evaluation |
| [SP 800-90C](https://csrc.nist.gov/pubs/sp/800/90/c/final) | Random-bit-generator constructions combining entropy sources and DRBGs | Final publication date: 2025-09-25; applies to the complete construction and component evidence, not a 90A demo or statistical test alone |
| [CAVP / ACVP](https://csrc.nist.gov/Projects/cryptographic-algorithm-validation-program) | Testing and validation of specified cryptographic algorithm implementations | Local vectors, demos, or running ACVP tooling independently are not official algorithm validation |
| [CMVP / FIPS 140-3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/cmvp-fips-140-3-management-manual) | Security requirements and validation of cryptographic modules | Algorithm tests are not module validation; this platform currently has no such module validation certificate |

References checked: 2026-09-24.

Machine-checkable standard metadata, source URLs, snapshot dates, errata status/URLs and local PDF SHA-256 values are recorded in [`standards-manifest.json`](./standards-manifest.json); run `npm run standards:check` to verify them. `errata_status=tracked` means only that a review URL is recorded; it does not claim that the remote page has no errata.
