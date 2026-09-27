# 标准覆盖矩阵（标准 ↔ 块 ↔ Demo ↔ 模板 ↔ 指南）

> 本文档是 `docs/standards/` 的索引：以每个标准目录为行，列出其在 CipherCat 积木体系中的覆盖情况——
> **原子块**（`src/blocks/` 注册的块）、**Demo**（`demos/` 预构建工作区）、**模板**（`src/blocks/procedure/blocks.ts` 的 `proc_*` 预填模板）、**搭建指南**（`standards/*/guides/`）。
> 文档提取质量、原件可检索性和未完成项另见 [DOCUMENT-STATUS.md](./DOCUMENT-STATUS.md)，不要把本矩阵当作标准全文覆盖证明。
> 函数/原语页的拆分规则和入口见 [FUNCTION-PRIMITIVE-INDEX.md](./FUNCTION-PRIMITIVE-INDEX.md)。
>
> 块事实以代码为准（2026-09-12 核对）；Demo 文件清单见 [demos/README.md](../../demos/README.md)；搭建步骤教程见 [docs/demos/](../demos/) 与 [docs/guides/DEMO.md](../guides/DEMO.md)。`standards/papers/` 是研究材料索引，不计入下方 37 个算法标准目录。

---

## 覆盖矩阵

### 状态口径

- `原子块/模板/Demo/指南` 只表示仓库中存在对应资产，不表示认证或生产安全保证。
- 每个标准目录应逐步补齐：精确版本/发布日期、官方来源 URL、向量来源、已知 errata、实现状态和安全边界。
- NIST 页面出现 errata 或修订提示时，覆盖仍可保留，但必须在目录说明中记录“待复核”，不能写成“无条件符合最新版”。
- `gmt0005-randomness/` 的 Go 后端测评与 CipherCat 前端试运行是两个执行面；随机性判定必须以 `metacrypt_server` 的后端报告为准。

| 标准 | standards 目录 | 原子块覆盖 | Demo | 模板 | 指南 |
|------|----------------|------------|------|------|------|
| AES | `fips197-AES/` | `aes_sub_bytes` · `aes_shift_rows` · `aes_mix_columns` · `aes_add_round_key` · `sbox`(PRESET=AES) · `pad_pkcs7` | `demos/AES-Atomic-Round.json` · `Procedure-AES-Round.json` · `procedures/AES-Round.json` · `procedures/AES-LastRound.json` | `proc_aes_round` · `proc_aes_last_round` · `proc_aes_key_schedule` | — |
| SHA-2 | `fips180-4-SHA2/` | `hash_sha224_hash` · `hash_sha256_pad` · `hash_sha256_compress` · `hash_sha512_pad` · `hash_sha512_compress` · `hash_sha512_hash`(SHA-384/512 下拉) | `demos/SHA256-Atomic-Hash.json` · `procedures/SHA224-Hash.json` · `procedures/SHA256-Hash.json` · `procedures/SHA384-Hash.json` · `procedures/SHA512-Hash.json` | `proc_sha256_hash` · `proc_md_iterate` | — |
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
| ASCON | `sp800-232-ascon/` | `ascon_encrypt` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` · `ascon_cxof128` | `demos/procedures/ASCON.json` · `ASCON-Extended.json` | — | 标签错误拒绝已在扩展 Demo 中验证 |
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
| SM2 | `gbt32918-SM2/` | `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` · `sm2_sign` · `sm2_verify` · `sm2_encrypt` · `sm2_decrypt` · `sm2_key_exchange` | `demos/procedures/SM2-PointMul.json` · `SM2-Sign.json` · `SM2-Encrypt.json` · `SM2-KeyExchange.json` | — | — |
| ZUC | `gbt33133-ZUC/` | `zuc_s0` · `zuc_s1` · `zuc_l1` · `zuc_l2` · `zuc_f` · `zuc_keystream` · `zuc_eia3` · `sbox`(PRESET=ZUC S0/S1) | `demos/procedures/EEA3.json` · `EIA3.json` | `proc_zuc_keystream` | ✅ [ZUC-KeyStream-搭建指南](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md)（+ [en](gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.en.md)） |
| SM9 | `gbt38635-SM9/` | `sm9_master_key` · `sm9_user_key` · `sm9_sign` · `sm9_verify` | `demos/procedures/SM9-Sign.json` | — | — |
| GM/T 0103 随机数发生器 | `gmt0103-rng/` | `gm_rng`（SM3-HMAC-DRBG） | `demos/procedures/GM-RNG.json` | — | — |
| GM/T 0091 密钥派生 | `gmt0091-kdf/` | `hash_hmac`(SM3) · `pbkdf2`（SM3 同构） | `demos/procedures/PBKDF2-SM3.json` | `proc_pbkdf2` | — |
| GB/T 17964 分组模式 | `gbt17964-modes/` | `mode_ecb_encrypt/decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt`（当前生成器为 AES helper；SM4 映射待补） | `demos/procedures/Mode-ECB.json` · `Mode-CBC.json` · `Mode-CTR.json` | `proc_mode_ecb` · `proc_mode_cbc` · `proc_mode_ctr` | — |
| GB/T 36624 可鉴别加密 | `gbt36624-aead/` | —（官方记录现行；本地扫描件，尚无条款映射） | — | — | — |
| GB/T 15852 MAC（.1-2020/.2-2024/.3-2019） | `gbt15852-mac/` | `cmac_mac`(SM4) · `hash_hmac`(SM3/SHA-256)（仅实现映射） | — | `proc_hmac_sha256` · `proc_sm3_hmac` | — |
| GM/T 0005 随机性检测 | `gmt0005-randomness/` | —（Go 后端 `randomness/` 实现，非 Blockly 块） | — | — | — |
| GB/T 32915 二元序列随机性检测 | `gbt32915-randomness/` | —（后端统计检测标准，非 Blockly 块；符合性待核查） | — | — | [标准状态与边界](gbt32915-randomness/README.md) |
| 中国抗量子密码进展 | `china-pqc-tracking/` | —（官方研究与标准化信息追踪，非算法） | — | — | — |

---

## 汇总

- 标准目录总数：**38**
- 研究材料目录：**1**（`standards/papers/`，不计入算法目录）
- 有原子块覆盖：**34**（无覆盖 4：GB/T 36624 AEAD、GM/T 0005 随机性检测、GB/T 32915 二元序列随机性检测、中国抗量子密码进展追踪）
- 有 Demo：**30**
- 有 `proc_*` 模板：**15**（另有 ML-DSA 复用 pq 模板）
- 有搭建指南：**3**（ML-KEM、ML-DSA、ZUC）
- 结构化拆分边界：25 个目录已有本地标准 source；其余 RFC、扫描件、历史/路线追踪目录仅保留实现映射或证据边界，不能据此宣称全部函数、原语、公式和表格均已拆分。

> 计数口径：原子块覆盖 = 该标准有 ≥1 个直接对应块；Demo = `demos/` 下有对应工作区文件；模板 = 有直接对应的 `proc_*`；指南 = `standards/*/guides/` 存在指南文件。

## 随机性测评、熵源与验证标准的适用边界

下列内容用于说明评测对象和证据边界，不计入上面的算法目录数量，也不表示本平台已经实现对应测试或通过验证。

| 标准/项目 | 对象与用途 | 本项目结论边界 |
|---|---|---|
| [GB/T 32915-2016 / GB/T 32915-2026](https://std.samr.gov.cn/gb/search/gbDetailed?id=oOfJ0FpRS8Q%3D&mode=p) | 二元序列统计随机性检测；2026 版于 2026-12-01 实施并全部代替 2016 版 | 当前后端流程参考 GM/T 0005，尚未完成对 GB/T 32915 的逐条符合性核查；序列统计结果不证明熵源质量 |
| [GM/T 0005-2021 / GM/T 0062-2018](https://www.oscca.gov.cn/sca/xwdt/2025-03/27/content_1061246.shtml) | 密码行业的随机性检测规范及密码产品随机数检测要求 | 与 GB/T 32915 分别记录适用范围、检测项、样本与判定要求；不以一套实现自动声称符合另一标准 |
| [GM/T 0103-2021、GM/T 0105-2021、GM/T 0078-2020](https://www.oscca.gov.cn/sca/xxgk/2021-10/19/content_1060880.shtml) | 随机数发生器总体框架、软件随机数发生器设计指南、密码随机数生成模块设计指南 | 用于设计与证据审查，不是对平台熵源的检测结果或认证；平台当前未完成熵源质量评估 |
| [SP 800-22 Rev. 1a](https://csrc.nist.gov/pubs/sp/800/22/r1/upd1/final) | 二进制序列统计测试 | 只作为样本统计诊断参考。NIST 已公告计划修订该文件以澄清其不用于评估密码学随机数发生器；不能将统计通过解释为随机数安全或熵证明 |
| [SP 800-90A Rev. 1](https://csrc.nist.gov/pubs/sp/800/90/a/r1/final) | 确定性随机比特发生器（DRBG） | 与当前 `sp800-90a-drbg/` 构造参考对应；演示或向量测试不是熵源/模块验证 |
| [SP 800-90B](https://csrc.nist.gov/pubs/sp/800/90/b/final) | 熵源、熵估计与健康测试 | 需源数据采集、熵源模型及健康测试证据；任意确定性用户代码生成的统计样本不能替代该评估 |
| [SP 800-90C](https://csrc.nist.gov/pubs/sp/800/90/c/final) | 由熵源与 DRBG 组合的随机比特生成器构造 | 最终版于 2025-09-25 发布；要求针对完整构造和组成证据，不能由 90A 示例或统计检测替代 |
| [CAVP / ACVP](https://csrc.nist.gov/Projects/cryptographic-algorithm-validation-program) | 指定密码算法实现的测试与验证 | 本地测试向量、demo 或自行运行 ACVP 工具，不构成官方算法验证 |
| [CMVP / FIPS 140-3](https://csrc.nist.gov/projects/cryptographic-module-validation-program/cmvp-fips-140-3-management-manual) | 密码模块的安全要求与验证 | 算法测试不等于模块验证；本平台当前没有相应模块验证证书 |

依据核对日期：2026-09-24。

机器可校验的标准元数据、来源 URL、核对日期、Errata 状态/URL 和目录内 PDF SHA-256 见 [`standards-manifest.json`](./standards-manifest.json)，使用 `npm run standards:check` 校验。`errata_status=tracked` 只表示清单记录了复核 URL，不表示远程页面声明“无 Errata”。
