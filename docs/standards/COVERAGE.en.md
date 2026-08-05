# Standards Coverage Matrix (Standard ↔ Blocks ↔ Demos ↔ Templates ↔ Guides)

> This document is the index of `docs/standards/`: one row per standards directory, showing its coverage in the CipherCat block system —
> **atomic blocks** (registered in `src/blocks/`), **demos** (prebuilt workspaces under `demos/`), **templates** (`proc_*` prefilled templates in `src/blocks/procedure/blocks.ts`), and **build guides** (`standards/*/guides/`).
>
> Block facts verified against code (2026-08-05); demo file inventory in [demos/README.md](../../demos/README.md); step-by-step tutorials in [docs/demos/](../demos/) and [docs/guides/DEMO.md](../guides/DEMO.md).

---

## Coverage Matrix

| Standard | Standards dir | Atomic blocks | Demo | Template | Guide |
|----------|---------------|---------------|------|----------|-------|
| AES | `fips197-AES/` | `aes_sub_bytes` · `aes_shift_rows` · `aes_mix_columns` · `aes_add_round_key` · `sbox`(PRESET=AES) · `pad_pkcs7` | `demos/AES-Atomic-Round.json` · `Procedure-AES-Round.json` · `procedures/AES-Round.json` · `procedures/AES-LastRound.json` | `proc_aes_round` · `proc_aes_last_round` · `proc_aes_key_schedule` | — |
| SHA-2 | `fips180-4-SHA2/` | `hash_sha256_pad` · `hash_sha256_compress` · `hash_sha512_pad` · `hash_sha512_compress` · `hash_sha512_hash`(SHA-384/512 dropdown) | `demos/SHA256-Atomic-Hash.json` · `procedures/SHA224-Hash.json` · `procedures/SHA256-Hash.json` · `procedures/SHA384-Hash.json` · `procedures/SHA512-Hash.json` | `proc_sha256_hash` · `proc_md_iterate` | — |
| SHA-3 / SHAKE | `fips202-SHA3/` | `keccak_f` · `sponge_pad` · `sponge_absorb` · `sponge_squeeze` · `keccak_state_init` · `sha3_hash` · `pq_xof`(SHAKE-128/256) · `pq_prf` | `demos/procedures/SHA3-Hash.json` | `proc_sponge_duplex` | — |
| HMAC | `fips198-1-hmac/` | `hash_hmac`(HASH dropdown: SHA-256 / SM3) | `demos/procedures/HMAC-SHA256.json` | `proc_hmac_sha256` · `proc_sm3_hmac` | — |
| ML-KEM | `fips203-ML-KEM/` | `pq_sample_poly_cbd` · `pq_sample_ntt` · `pq_ntt` · `pq_intt` · `pq_ntt_mul` · `pq_ntt_butterfly` · `pq_poly_add/sub/mul` · `pq_mat_vec_mul` · `pq_compress/decompress` · `pq_byte_encode/decode` · `pq_bytes_to_bits` · `pq_bits_to_bytes` · `pq_byte_concat` · `pq_bytes_slice` · `pq_seed_with_nonce` · `nt_mod_pow`(q=3329) | `demos/ML-KEM-Atomic.json` · `procedures/ML-KEM-Encaps.json` | `proc_mlkem_keygen` · `proc_ntt_vec` · `proc_pq_cbd` · `proc_pq_sample` · `proc_pq_vec_add` · `proc_pq_vec_sub` · `proc_pq_mat_mul` | ✅ [ML-KEM-768-Encaps build guide](fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md)（+ [ZH](fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md)） |
| ML-DSA | `fips204-ML-DSA/` | `mldsa_sign` · `mldsa_verify` · `pq_power2round` · `pq_decompose` · `pq_make_hint` · `pq_use_hint` · `pq_sample_in_ball` · `pq_rej_sample`（+ shared ML-KEM `pq_*` / `nt_mod_pow`(q=8380417) primitives） | `demos/procedures/ML-DSA-Sign.json` · `procedures/ML-DSA-Primitives.json` · `procedures/ML-DSA-NTT.json` | —（reuses pq templates like `proc_ntt_vec`） | ✅ [ML-DSA-Sign build guide](fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.en.md)（+ [ZH](fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md)） |
| SLH-DSA | `fips205-SLH-DSA/` | `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `merkle_auth_path` · `slh_addr` · `slh_adrs_full` · `wots_checksum` · `fors_sign` · `fors_verify` · `fors_pk_from_sk` · `fors_root` · `fors_leaf_index` | `demos/procedures/Hash-Based-Structures.json` · `FORS-Sign.json` · `Tree-Index.json` | — | — |
| McEliece (Goppa codes) | `mceliece-goppa/` | `gf2_poly_mul/div/mod/gcd` · `bin_mat_mul/inv` · `ham_weight` · `ham_dist` · `goppa_gen_poly` · `syndrome_calc` · `gf2m_mul/add/inv` · `gf2m_poly_add/mul/mod/xgcd/eval` · `goppa_decode` · `berlekamp_massey` · `arr_slice` | `demos/procedures/Code-Based-Math.json` · `GF2m-Poly.json` · `Goppa-Decode.json` · `PQC-Gaps.json` | — | — |
| ECDSA | `fips186-5-ecdsa/` | `ecdsa_sign` · `ecdsa_verify` · `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` | `demos/procedures/ECDSA.json` | — | — |
| SP 800-38A block modes | `sp800-38a-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt` · `pad_pkcs7` · `pad_zero` | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` · `proc_mode_cbc` · `proc_mode_ctr` | — |
| CMAC | `sp800-38b-cmac/` | `cmac_mac`(CIPHER dropdown: AES-128 / SM4) | — | — | — |
| CCM | `sp800-38c-ccm/` | `ccm_encrypt` | `demos/procedures/CCM-Encrypt.json` | — | — |
| GCM | `sp800-38d-gcm/` | `gcm_encrypt`（+ `mode_ctr_encrypt` basis） | `demos/procedures/GCM-Encrypt.json` | `proc_mode_gcm` | — |
| XTS | `sp800-38e-xts/` | `xts_encrypt` | `demos/procedures/XTS-Encrypt.json` | — | — |
| DRBG | `sp800-90a-drbg/` | `drbg_generate` | `demos/procedures/DRBG.json` | — | — |
| PBKDF2 | `sp800-132-pbkdf2/` | `pbkdf2` | `demos/procedures/PBKDF2-SHA256.json` · `procedures/PBKDF2.json` | `proc_pbkdf2` | — |
| ASCON | `sp800-232-ascon/` | `ascon_encrypt` | `demos/procedures/ASCON.json` | — | — |
| HKDF | `rfc5869-hkdf/` | `hkdf` | `demos/procedures/HKDF-SHA256.json` · `procedures/HKDF.json` | `proc_hkdf` | — |
| X25519 | `rfc7748-x25519/` | `x25519` | `demos/procedures/X25519.json` | — | — |
| EdDSA | `rfc8032-eddsa/` | `eddsa_sign` · `eddsa_verify` | `demos/procedures/EDDSA.json` | — | — |
| ECDH | `rfc5903-ecdh/` | `ecdh_shared_secret`（+ `ecc_*` curve primitives） | `demos/procedures/ECDH.json` | — | — |
| RSA | `rfc8017-pkcs1/` | `rsa_keygen` · `rsa_encrypt` · `rsa_decrypt` · `rsa_sign` · `rsa_verify` | `demos/procedures/RSA-Encrypt.json` · `RSA-Sign.json` | — | — |
| Argon2 | `rfc9106-argon2/` | `argon2_hash` | `demos/procedures/ARGON2.json` | — | — |
| Base64 | `rfc4648-base64/` | `base64_encode` · `base64_decode` | — | — | — |
| PKCS#7 | `rfc2315-pkcs7/` | `pad_pkcs7`（padding semantics） | — | — | — |
| SM3 | `gbt32905-SM3/` | `hash_sm3_pad` · `hash_sm3_compress` · `hash_hmac`(SM3) | `demos/procedures/SM3-Hash.json` · `procedures/PBKDF2-SM3.json` | `proc_sm3_hash` · `proc_sm3_hmac` | — |
| SM4 | `gbt32907-SM4/` | `sm4_sbox` · `sm4_round_func` · `sm4_linear_transform` · `sbox`(PRESET=SM4) | `demos/SM4-Atomic-Round.json` · `Procedure-SM4-Round.json` · `procedures/SM4-Sbox.json` · `procedures/SM4-Round.json` | `proc_sm4_round` · `proc_sm4_key_schedule` | — |
| SM2 | `gbt32918-SM2/` | `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` · `sm2_sign` · `sm2_verify` · `sm2_encrypt` · `sm2_decrypt` | `demos/procedures/SM2-PointMul.json` · `SM2-Sign.json` · `SM2-Encrypt.json` | — | — |
| ZUC | `gbt33133-ZUC/` | `zuc_s0` · `zuc_s1` · `zuc_l1` · `zuc_l2` · `zuc_f` · `zuc_keystream` · `sbox`(PRESET=ZUC S0/S1) | `demos/procedures/EEA3.json` | `proc_zuc_keystream` | ✅ [ZUC-KeyStream build guide](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md)（+ [ZH](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md)） |
| SM9 | `gbt38635-SM9/` | `sm9_master_key` · `sm9_user_key` · `sm9_sign` · `sm9_verify` | `demos/procedures/SM9-Sign.json` | — | — |
| GM/T 0103 RNG | `gmt0103-rng/` | `gm_rng`（SM3-HMAC-DRBG） | `demos/procedures/GM-RNG.json` | — | — |
| GM/T 0091 KDF | `gmt0091-kdf/` | `hash_hmac`(SM3) · `pbkdf2`（SM3 isomorphic） | `demos/procedures/PBKDF2-SM3.json` | `proc_pbkdf2` | — |
| GB/T 17964 block modes | `gbt17964-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt`（SM4-based） | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` · `proc_mode_cbc` · `proc_mode_ctr` | — |
| GB/T 36624 AEAD | `gbt36624-aead/` | —（no matching blocks） | — | — | — |
| GB/T 15852 MAC | `gbt15852-mac/` | `cmac_mac`(SM4) · `hash_hmac`(SM3/SHA-256) | — | `proc_hmac_sha256` · `proc_sm3_hmac` | — |
| GM/T 0005 randomness testing | `gmt0005-randomness/` | —（implemented in Go backend `randomness/`, not Blockly blocks） | — | — | — |
| CNSA PQC tracking | `cnsa-pqc-tracking/` | —（roadmap tracking doc, not an algorithm） | — | — | — |

---

## Summary

- Total standards directories: **37**
- With atomic-block coverage: **34**（no coverage 3: GB/T 36624 AEAD, GM/T 0005 randomness testing, CNSA PQC tracking）
- With demos: **30**
- With `proc_*` templates: **15**（ML-DSA additionally reuses pq templates）
- With build guides: **3**（ML-KEM, ML-DSA, ZUC）
- Algorithm families without a standards directory: **0**（2026-08-05: SLH-DSA/McEliece/RSA/ECDH dirs added — all families split out）

> Counting: block coverage = ≥1 directly matching block; demo = matching workspace file under `demos/`; template = matching `proc_*`; guide = guide file exists under `standards/*/guides/`.
