# 标准覆盖矩阵（标准 ↔ 块 ↔ demo ↔ 模板 ↔ 指南）

> 本文档是 `docs/standards/` 的索引：以每个标准目录为行，列出其在 CipherCat 积木体系中的覆盖情况——
> **原子块**（`src/blocks/` 注册的块）、**demo**（`demos/` 预构建工作区）、**模板**（`src/blocks/procedure/blocks.ts` 的 `proc_*` 预填模板）、**搭建指南**（`standards/*/guides/`）。
>
> 块事实以代码为准（2026-08-05 核对）；demo 文件清单见 [demos/README.md](../../demos/README.md)；搭建步骤教程见 [docs/demos/](../demos/) 与 [docs/guides/DEMO.md](../guides/DEMO.md)。

---

## 覆盖矩阵

| 标准 | standards 目录 | 原子块覆盖 | demo | 模板 | 指南 |
|------|----------------|------------|------|------|------|
| AES | `fips197-AES/` | `aes_sub_bytes` · `aes_shift_rows` · `aes_mix_columns` · `aes_add_round_key` · `sbox`(PRESET=AES) · `pad_pkcs7` | `demos/AES-Atomic-Round.json` · `Procedure-AES-Round.json` · `procedures/AES-Round.json` · `procedures/AES-LastRound.json` | `proc_aes_round` · `proc_aes_last_round` · `proc_aes_key_schedule` | — |
| SHA-2 | `fips180-4-SHA2/` | `hash_sha256_pad` · `hash_sha256_compress` · `hash_sha512_pad` · `hash_sha512_compress` · `hash_sha512_hash`(SHA-384/512 下拉) | `demos/SHA256-Atomic-Hash.json` · `procedures/SHA224-Hash.json` · `procedures/SHA256-Hash.json` · `procedures/SHA384-Hash.json` · `procedures/SHA512-Hash.json` | `proc_sha256_hash` · `proc_md_iterate` | — |
| SHA-3 / SHAKE | `fips202-SHA3/` | `keccak_f` · `sponge_pad` · `sponge_absorb` · `sponge_squeeze` · `keccak_state_init` · `sha3_hash` · `pq_xof`(SHAKE-128/256) · `pq_prf` | `demos/procedures/SHA3-Hash.json` | `proc_sponge_duplex` | — |
| HMAC | `fips198-1-hmac/` | `hash_hmac`(HASH 下拉：SHA-256 / SM3) | `demos/procedures/HMAC-SHA256.json` | `proc_hmac_sha256` · `proc_sm3_hmac` | — |
| ML-KEM | `fips203-ML-KEM/` | `pq_sample_poly_cbd` · `pq_sample_ntt` · `pq_ntt` · `pq_intt` · `pq_ntt_mul` · `pq_ntt_butterfly` · `pq_poly_add/sub/mul` · `pq_mat_vec_mul` · `pq_compress/decompress` · `pq_byte_encode/decode` · `pq_bytes_to_bits` · `pq_bits_to_bytes` · `pq_byte_concat` · `pq_bytes_slice` · `pq_seed_with_nonce` · `nt_mod_pow`(q=3329) | `demos/ML-KEM-Atomic.json` · `procedures/ML-KEM-Encaps.json` | `proc_mlkem_keygen` · `proc_ntt_vec` · `proc_pq_cbd` · `proc_pq_sample` · `proc_pq_vec_add` · `proc_pq_vec_sub` · `proc_pq_mat_mul` | ✅ [ML-KEM-768-Encaps-搭建指南](fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md)（+ [en](fips203-ML-KEM/guides/ML-KEM-768-Encaps-build-guide.md)） |
| ML-DSA | `fips204-ML-DSA/` | `mldsa_sign` · `mldsa_verify` · `pq_power2round` · `pq_decompose` · `pq_make_hint` · `pq_use_hint` · `pq_sample_in_ball` · `pq_rej_sample`（+ ML-KEM 共享 `pq_*` / `nt_mod_pow`(q=8380417) 原语） | `demos/procedures/ML-DSA-Sign.json` · `procedures/ML-DSA-Primitives.json` · `procedures/ML-DSA-NTT.json` | —（复用 `proc_ntt_vec` 等 pq 模板） | ✅ [ML-DSA-Sign-搭建指南](fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md)（+ [en](fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.en.md)） |
| SLH-DSA | `fips205-SLH-DSA/` | `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `merkle_auth_path` · `slh_addr` · `slh_adrs_full` · `wots_checksum` · `fors_sign` · `fors_verify` · `fors_pk_from_sk` · `fors_root` · `fors_leaf_index` | `demos/procedures/Hash-Based-Structures.json` · `FORS-Sign.json` · `Tree-Index.json` | — | — |
| McEliece（Goppa 码） | `mceliece-goppa/` | `gf2_poly_mul/div/mod/gcd` · `bin_mat_mul/inv` · `ham_weight` · `ham_dist` · `goppa_gen_poly` · `syndrome_calc` · `gf2m_mul/add/inv` · `gf2m_poly_add/mul/mod/xgcd/eval` · `goppa_decode` · `berlekamp_massey` · `arr_slice` | `demos/procedures/Code-Based-Math.json` · `GF2m-Poly.json` · `Goppa-Decode.json` · `PQC-Gaps.json` | — | — |
| ECDSA | `fips186-5-ecdsa/` | `ecdsa_sign` · `ecdsa_verify` · `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` | `demos/procedures/ECDSA.json` | — | — |
| SP 800-38A 分组模式 | `sp800-38a-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt` · `pad_pkcs7` · `pad_zero` | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` · `proc_mode_cbc` · `proc_mode_ctr` | — |
| CMAC | `sp800-38b-cmac/` | `cmac_mac`(CIPHER 下拉：AES-128 / SM4) | — | — | — |
| CCM | `sp800-38c-ccm/` | `ccm_encrypt` | `demos/procedures/CCM-Encrypt.json` | — | — |
| GCM | `sp800-38d-gcm/` | `gcm_encrypt`（+ `mode_ctr_encrypt` 基础） | `demos/procedures/GCM-Encrypt.json` | `proc_mode_gcm` | — |
| XTS | `sp800-38e-xts/` | `xts_encrypt` | `demos/procedures/XTS-Encrypt.json` | — | — |
| DRBG | `sp800-90a-drbg/` | `drbg_generate` | `demos/procedures/DRBG.json` | — | — |
| PBKDF2 | `sp800-132-pbkdf2/` | `pbkdf2` | `demos/procedures/PBKDF2-SHA256.json` · `procedures/PBKDF2.json` | `proc_pbkdf2` | — |
| ASCON | `sp800-232-ascon/` | `ascon_encrypt` | `demos/procedures/ASCON.json` | — | — |
| HKDF | `rfc5869-hkdf/` | `hkdf` | `demos/procedures/HKDF-SHA256.json` · `procedures/HKDF.json` | `proc_hkdf` | — |
| X25519 | `rfc7748-x25519/` | `x25519` | `demos/procedures/X25519.json` | — | — |
| EdDSA | `rfc8032-eddsa/` | `eddsa_sign` · `eddsa_verify` | `demos/procedures/EDDSA.json` | — | — |
| ECDH | `rfc5903-ecdh/` | `ecdh_shared_secret`（+ `ecc_*` 曲线原语） | `demos/procedures/ECDH.json` | — | — |
| RSA | `rfc8017-pkcs1/` | `rsa_keygen` · `rsa_encrypt` · `rsa_decrypt` · `rsa_sign` · `rsa_verify` | `demos/procedures/RSA-Encrypt.json` · `RSA-Sign.json` | — | — |
| Argon2 | `rfc9106-argon2/` | `argon2_hash` | `demos/procedures/ARGON2.json` | — | — |
| Base64 | `rfc4648-base64/` | `base64_encode` · `base64_decode` | — | — | — |
| PKCS#7 | `rfc2315-pkcs7/` | `pad_pkcs7`（填充语义） | — | — | — |
| SM3 | `gbt32905-SM3/` | `hash_sm3_pad` · `hash_sm3_compress` · `hash_hmac`(SM3) | `demos/procedures/SM3-Hash.json` · `procedures/PBKDF2-SM3.json` | `proc_sm3_hash` · `proc_sm3_hmac` | — |
| SM4 | `gbt32907-SM4/` | `sm4_sbox` · `sm4_round_func` · `sm4_linear_transform` · `sbox`(PRESET=SM4) | `demos/SM4-Atomic-Round.json` · `Procedure-SM4-Round.json` · `procedures/SM4-Sbox.json` · `procedures/SM4-Round.json` | `proc_sm4_round` · `proc_sm4_key_schedule` | — |
| SM2 | `gbt32918-SM2/` | `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` · `sm2_sign` · `sm2_verify` · `sm2_encrypt` · `sm2_decrypt` | `demos/procedures/SM2-PointMul.json` · `SM2-Sign.json` · `SM2-Encrypt.json` | — | — |
| ZUC | `gbt33133-ZUC/` | `zuc_s0` · `zuc_s1` · `zuc_l1` · `zuc_l2` · `zuc_f` · `zuc_keystream` · `sbox`(PRESET=ZUC S0/S1) | `demos/procedures/EEA3.json` | `proc_zuc_keystream` | ✅ [ZUC-KeyStream-搭建指南](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md)（+ [en](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md)） |
| SM9 | `gbt38635-SM9/` | `sm9_master_key` · `sm9_user_key` · `sm9_sign` · `sm9_verify` | `demos/procedures/SM9-Sign.json` | — | — |
| GM/T 0103 随机数发生器 | `gmt0103-rng/` | `gm_rng`（SM3-HMAC-DRBG） | `demos/procedures/GM-RNG.json` | — | — |
| GM/T 0091 密钥派生 | `gmt0091-kdf/` | `hash_hmac`(SM3) · `pbkdf2`（SM3 同构） | `demos/procedures/PBKDF2-SM3.json` | `proc_pbkdf2` | — |
| GB/T 17964 分组模式 | `gbt17964-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt`（SM4 基） | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` · `proc_mode_cbc` · `proc_mode_ctr` | — |
| GB/T 36624 可鉴别加密 | `gbt36624-aead/` | —（无对应块） | — | — | — |
| GB/T 15852 MAC | `gbt15852-mac/` | `cmac_mac`(SM4) · `hash_hmac`(SM3/SHA-256) | — | `proc_hmac_sha256` · `proc_sm3_hmac` | — |
| GM/T 0005 随机性检测 | `gmt0005-randomness/` | —（Go 后端 `randomness/` 实现，非 Blockly 块） | — | — | — |
| CNSA PQC 追踪 | `cnsa-pqc-tracking/` | —（路线图追踪文档，非算法） | — | — | — |

---

## 汇总

- 标准目录总数：**37**
- 有原子块覆盖：**34**（无覆盖 3：GB/T 36624 AEAD、GM/T 0005 随机性检测、CNSA PQC 追踪）
- 有 demo：**30**
- 有 `proc_*` 模板：**15**（另有 ML-DSA 复用 pq 模板）
- 有搭建指南：**3**（ML-KEM、ML-DSA、ZUC）
- 无 standards 目录的算法族：**0**（2026-08-05 补齐 SLH-DSA/McEliece/RSA/ECDH 四目录，全部算法族均已拆分）

> 计数口径：原子块覆盖 = 该标准有 ≥1 个直接对应块；demo = `demos/` 下有对应工作区文件；模板 = 有直接对应的 `proc_*`；指南 = `standards/*/guides/` 存在指南文件。
