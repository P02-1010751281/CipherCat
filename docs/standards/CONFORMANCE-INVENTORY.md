# 标准符合性对象清单

核对日期：2026-10-05

本清单固定全量符合性准备的对象边界，并记录它们目前能追溯到的实现区域和规范适用类别。它不是测试通过报告，也不表示任何对象已通过标准认证。

正式认证的产品边界和适用路径另见[正式认证可行性与产品边界](./PRODUCT-CERTIFICATION-FEASIBILITY.md)。

## 清点口径

| 对象 | 数量 | 权威身份来源 | 当前测试入口 |
|---|---:|---|---|
| 唯一自定义 Blockly 块（活动清单） | 218 | [`ALL_BLOCK_TYPES`](../../src/blocks/index.ts) 及各块族导出 | `npm run verify:demos`、`npm run verify:templates`、Vitest |
| 已废弃/兼容注册身份 | 1 | [`COMPAT_BLOCK_TYPES`](../../src/blocks/ctrl/index.ts) | `npm run verify:templates`（登记一致性）；详见下方兼容身份章节 |
| Procedure 模板注册身份 | 29 | [`TEMPLATE_REGISTRY`](../../src/blocks/procedure/blocks.ts) | `scripts/verify-templates.ts` |
| 与基础块同名的模板身份 | 3 | `crypto_encrypt_func`、`crypto_decrypt_func`、`crypto_hash_func` | 模板注入与生成测试；计数时不重复加入唯一块数 |
| Demo 工作区 | 59 | [`demos/tests.json`](../../demos/tests.json) 的键与 `demos/**/*.json` 文件 | `scripts/verify-demos.mjs`；每项登记 Python、JavaScript 用例 |

因此当前对象总数为 **218 个活动块 + 1 个已登记的兼容身份 + 29 个模板身份 + 59 个 Demo**。模板身份是单独的产品对象，即使其中 3 项与基础块同名，也要分别核对其模板参数/预填行为。`verify:demos` 检查工作区文件与测试登记一致并执行双语言用例；它本身不判定测试期望值是否来自完整官方测试集。

按身份去重的口径：218 个活动块与 29 个模板身份有 3 项重合（`crypto_encrypt_func`、`crypto_decrypt_func`、`crypto_hash_func`），合并去重后共 **244 个** 类型；`npm run verify:templates` 会重算该数字并核对本行说明。

## 兼容与已废弃注册身份

下表列出**不进入 218 项活动清单**、但代码中仍然注册的 Blockly 身份。它们仅为加载存量工作区而保留，不出现在工具箱，也不作为可认证或可独立测试的算法构件；每项必须同时具备 Blockly 定义与 JS/Python 生成器，否则应从仓库删除。门禁 `npm run verify:templates` 会枚举全部已注册类型：既不在 218 项活动清单、也不在本表的类型将直接导致失败，防止出现未登记的“影子身份”。

| 身份 | 关系/适用范围 |
|---|---|
| `ctrl_assign` | 已废弃赋值块；`src/blocks/ctrl/deprecated.ts` 保留定义，JS/Python 生成器保留以支持 `migration.ts` 对复杂左值的重建（见 `src/utils/migration.ts` 的 `ctrl_assign` 分支）；不进入 `ALL_BLOCK_TYPES`，不在工具箱出现，无独立规范依据 |

`218` 的准确含义是“当前 `ALL_BLOCK_TYPES` 活动身份数”；加上兼容身份后，项目实际注册的自定义 Blockly 类型为 219 个。

## Blockly 块清单与适用类别

下表逐项列出当前 `ALL_BLOCK_TYPES` 中的 218 个唯一块类型。类别表示应采用的验证边界：规范算法端点按算法测试；标准内部原语按其规范语义、接口契约和父算法关系测试；通用构件测试接口与组合语义；研究数学块不冒称为标准化算法。规范目录和当前聚合映射见[标准覆盖矩阵](./COVERAGE.md)。矩阵列出资产不等于对应块已获得逐块测试证据。

每个块的实际端口、字段、连接类型由 `src/blocks/` 中相应类型的 `Blockly.Blocks[type].init` 定义；Python 与 JavaScript 语义分别由 `src/generators/python/`、`src/generators/javascript/` 的同类型生成器定义。为让“输入输出契约”本身可机器复核，仓库从**真实 Blockly 块**生成 [`BLOCK-IO-CONTRACT.json`](./BLOCK-IO-CONTRACT.json)（218 个活动块的端口名/输入类型/连接检查/输出检查/字段签名），`npm run verify:all` 每次重算并与该文件逐字节比对——代码里的签名一改而契约未同步就会直接失败；有意变更后用 `npm run block-io:write` 重新生成并复核差异。下表保留精确类型 ID，不复制一份可能漂移的 I/O 规格。

仍待逐项完成的是**规范语义级**比对：确认每个块的签名与其规范条款要求的接口/参数域一致（例如标准规定某参数为固定长度字节串，块是否以该类型/约束表达），而不仅是“有端口、有双语言生成器”。该工作按「已核对的逐块测试证据」的 109 行逐条推进，当前状态见每行的“未由这些测试证明”列；门禁已强制每行的“规范语义范围”**要么给出标准族依据（FIPS/SP 800/GB\/T/GM\/T/RFC/ISO\/IEC/IEEE），要么明确标注为通用/教学/研究/项目构件（无独立规范依据）**，两者皆无即失败（已用负向测试验证）。

端点级的“测试来源 + 参数范围 + 缺口”汇总见自动生成的 [`ENDPOINT-MATRIX.md`](./ENDPOINT-MATRIX.md)：它由本文件的 Demo↔块映射表与 `demos/evidence.json` 生成，`npm run verify:all` 逐字节比对（`npm run endpoint-matrix:write` 重新生成），因此不存在手写漂移。

| 注册组 | 适用类别及规范边界 | 当前块类型（与代码注册名一致） |
|---|---|---|
| `CTRL_BLOCK_TYPES` | 通用控制流；无独立密码标准算法身份 | `ctrl_iterate` |
| `DATA_BLOCK_TYPES` | 通用数据转换、长度、值与种子材料接口；按父算法测试，不单独认证 | `data_convert_to_int` · `data_convert_bits_to_bytes` · `data_convert_bytes_to_bits` · `data_bit_length` · `data_byte_length` · `cipher_key_from_seed` · `seed_bytes` · `seed_hex` · `data_value` |
| `ARRAY_BLOCK_TYPES` | 通用数组操作；无独立密码标准算法身份 | `arr_partition_to_array` · `arr_slice` |
| `LOGIC_BLOCK_TYPES` | 通用逻辑构件；无独立密码标准算法身份 | `lgc_compound` · `lgc_not` · `lgc_operation` |
| `BIT_BLOCK_TYPES` | 位运算辅助原语；按其用于的父算法条款与双语言契约验证 | `bit_expr_infix` · `bit_operation` · `bit_rotate_left` · `bit_rotate_left_op` · `bit_rotate_right` · `bit_rotate_right_op` · `bit_not32` · `bit_byte_substitute` |
| `ALL_SBOX_BLOCK_TYPES` | 参数化查表构件；AES、SM4、ZUC 预置须分别对准其标准参数，通用自定义表不是独立标准算法 | `sbox` · `sbox_sub` · `sbox_variables_get` · `sbox_variables_set` |
| `HASH_BLOCK_TYPES` — SHA-2 | FIPS 180-4 算法阶段/端点 | `hash_sha256_pad` · `hash_sha256_pad_text` · `hash_sha256_pad_hex` · `hash_sha256_compress` · `hash_sha224_hash` |
| `HASH_BLOCK_TYPES` — SM3 | GB/T 32905 算法阶段；HMAC 另见 HMAC 组 | `hash_sm3_pad` · `hash_sm3_pad_text` · `hash_sm3_pad_hex` · `hash_sm3_compress` |
| `HASH_BLOCK_TYPES` — SHA-3 / SHAKE | FIPS 202 置换、海绵和哈希/XOF 构造；`pq_prf` 的 ML-KEM `PRFη` 归入 FIPS 203 §4.1（式 4.3） | `keccak_state_init` · `keccak_f` · `sponge_pad` · `hash_sha3_pad_text` · `hash_sha3_pad_hex` · `sponge_absorb` · `sponge_squeeze` · `sha3_hash` · `pq_xof` · `pq_prf` |
| `HASH_BLOCK_TYPES` — 哈希树 / SLH-DSA | FIPS 205 内部结构与端点；仅对参数集和接口实际支持范围作声明 | `slh_xmss_root`（§7.2 XMSS 树根，SHAKE 变体，按 ACVP keyGen 向量核对） · `slh_msg_randomness`（§10.1/§11.1 消息随机数 R，按 ACVP sigGen 向量核对） · `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `merkle_auth_path` · `fors_leaf_index` · `slh_addr` · `fors_root` · `fors_sign` · `fors_verify` · `fors_pk_from_sk` · `slh_adrs_full` · `wots_checksum` |
| `SHA512_BLOCK_TYPES` | FIPS 180-4 SHA-384/512 阶段和端点；具体变体由块参数决定 | `hash_sha512_pad` · `hash_sha512_compress` · `hash_sha512_hash` |
| `NT_BLOCK_TYPES` — 格密码原语 | FIPS 203 ML-KEM、FIPS 204 ML-DSA 的标准内部原语；按参数集、模数和调用关系核验 | `pq_ntt` · `pq_intt` · `pq_ntt_mul` · `pq_poly_add` · `pq_poly_sub` |
| `NT_BLOCK_TYPES` — 通用 NTT 蝶形辅助 | 单步 CT/GS 数学辅助操作；模数选项与标准算法相关，但该块不是完整标准变换或认证声明 | `pq_ntt_butterfly` |
| `NT_BLOCK_TYPES` — 二元/有限域与 Goppa 研究原语 | 代数/编码数学构件；当前按研究和性质测试处理，不视作获标准认证的 McEliece 实现 | `gf2m_mul` · `gf2m_add` · `gf2m_inv` · `gf2_poly_mul` · `gf2_poly_div` · `gf2_poly_mod` · `gf2_poly_gcd` · `bin_mat_mul` · `bin_mat_inv` · `ham_weight` · `ham_dist` · `goppa_gen_poly` · `syndrome_calc` · `berlekamp_massey` · `gauss_elim` · `gf2m_poly_add` · `gf2m_poly_mul` · `gf2m_poly_mod` · `gf2m_poly_xgcd` · `gf2m_poly_eval` · `goppa_decode` |
| `NT_BLOCK_TYPES` — 其他研究/通用数学 | 无单独密码标准算法身份；可作父算法数学辅助，但须验证数学定义、输入域、边界和组合性质 | `nt_field_add` · `nt_mod_inverse` · `mv_quad_eval` · `comb` · `vec_dot` · `poly_scale` · `lll_reduce` · `gauss_pmf` · `pq_poly_mul` · `pq_mat_vec_mul` |
| `ECC_BLOCK_TYPES` | 曲线运算是 ECDSA、ECDH、SM2 等端点的前置原语；须按所选曲线及父算法规范验证 | `ecc_load_curve_params` · `ecc_load_point` · `ecc_point_double` · `ecc_add` · `ecc_multiply` |
| `ZUC_BLOCK_TYPES` | GB/T 33133 / 对应 EEA3、EIA3 算法条款；内部步骤与端点分开核验 | `zuc_s0` · `zuc_s1` · `zuc_l1` · `zuc_l2` · `zuc_f` · `zuc_keystream` · `zuc_eia3` |
| `CMAC_BLOCK_TYPES` | SP 800-38B；子密钥与端点分别核验，同时核验实际支持的 AES/SM4 变体，不从一个变体外推另一个 | `cmac_double` · `cmac_subkeys` · `cmac_mac` |
| `CCM_BLOCK_TYPES` | SP 800-38C 参数、编码和 AEAD 行为；B0、计数器块与 CBC-MAC 逐项核验 | `ccm_b0` · `ccm_counter_block` · `ccm_cbc_mac` · `ccm_ctr` · `ccm_aad_len_prefix` · `ccm_encrypt` |
| `XTS_BLOCK_TYPES` | SP 800-38E / IEEE 1619 约定的 XTS 行为及输入限制；tweak 推进与端点分别核验 | `xts_tweak_mul` · `xts_encrypt` |
| `X25519_BLOCK_TYPES` | RFC 7748 X25519 函数 | `x25519` |
| `ASCON_BLOCK_TYPES` | SP 800-232 Ascon-AEAD128、Hash256、XOF128、CXOF128；各端点分别核验 | `ascon_encrypt` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` · `ascon_cxof128` |
| `HKDF_BLOCK_TYPES` | RFC 5869 HKDF；Extract 与 Expand 分别核验，所用 HMAC/hash 是独立前置项 | `hkdf` · `hkdf_extract` · `hkdf_expand` |
| `PBKDF2_BLOCK_TYPES` | RFC 8018 §5.2 单块函数 F 与整条 DK 分别核验；PRF 变体分别核实 | `pbkdf2_f` · `pbkdf2` |
| `GCM_BLOCK_TYPES` | SP 800-38D GCM；Algorithm 1–3 与 inc32、J0 派生逐项核验，端点与底层分组密码及 CTR/GHASH 的关系一并核验 | `gcm_encrypt` · `gcm_gf128_mul` · `gcm_ghash` · `gcm_gctr` · `gcm_inc32` · `gcm_j0` |
| `PQ_BLOCK_TYPES` | FIPS 203/204 编码、压缩、采样与字节操作内部原语；接口契约与父算法向量须可追溯 | `pq_bytes_to_bits` · `pq_bits_to_bytes` · `pq_byte_encode` · `pq_byte_decode` · `pq_compress` · `pq_decompress` · `pq_byte_concat` · `pq_bytes_slice` · `pq_seed_with_nonce` · `pq_rej_sample` · `pq_sample_ntt` · `pq_sample_poly_cbd` |
| `PROCEDURE_BLOCK_TYPES` | `crypto_return` 是通用返回构件；另 3 项是模板注册身份，详见下节 | `crypto_return` · `crypto_encrypt_func` · `crypto_decrypt_func` · `crypto_hash_func` |
| `SYMMETRIC_BLOCK_TYPES` — AES | FIPS 197 轮函数组件；块级测试及 AES 端到端测试不可互相替代 | `aes_sub_bytes` · `aes_shift_rows` · `aes_mix_columns` · `aes_add_round_key` |
| `SYMMETRIC_BLOCK_TYPES` — SM4 | GB/T 32907 轮函数组件；参数与轮序依规范核验 | `sm4_sbox` · `sm4_round_func` · `sm4_linear_transform` |
| `SYMMETRIC_BLOCK_TYPES` — 填充/模式 | RFC 2315、SP 800-38A 与 GB/T 17964 适用范围；当前模式后端算法映射仍需逐项确认 | `pad_pkcs7` · `pad_zero` · `mode_ecb_encrypt` · `mode_ecb_decrypt` · `mode_cbc_encrypt` · `mode_ctr_encrypt` |
| `REMAINING_BLOCK_TYPES` — 数值与编码 | 通用算术/进制/字节编码构件；按接口、边界及父算法使用验证 | `nt_mod` · `nt_mod_pow` · `nt_div_rem` · `bn_add` · `bn_sub` · `bn_mul` · `bn_div` · `base64_encode` · `base64_decode` · `hex_to_bytes` · `bytes_to_hex` · `endian_swap` |
| `REMAINING_BLOCK_TYPES` — HMAC | FIPS 198-1、GB/T 15852 及调用的 SHA-256/SM3 前置算法；散列变体分别核验 | `hash_hmac` |
| `EDDSA_BLOCK_TYPES` | RFC 8032 EdDSA 变体 | `eddsa_sign` · `eddsa_verify` |
| `ECDSA_BLOCK_TYPES` | FIPS 186-5 ECDSA 变体与曲线参数；当前端点固定为 P-256/SHA-256，签名使用 RFC 6979 确定性 `k` | `ecdsa_sign` · `ecdsa_verify` · `ecdsa_k_rfc6979` |
| `SM2SIG_BLOCK_TYPES` | GB/T 32918 签名/验签流程 | `sm2_sign` · `sm2_verify` |
| `SM2ENC_BLOCK_TYPES` | GB/T 32918.4 加密/解密流程与 §5.4.3 SM3-KDF 分别核验 | `sm2_kdf` · `sm2_encrypt` · `sm2_decrypt` · `sm2_key_exchange` |
| `ECDH_BLOCK_TYPES` | RFC 5903 的指定曲线测试不能外推到所有曲线/协议 | `ecdh_shared_secret` |
| `DRBG_BLOCK_TYPES` | SP 800-90A §10.1.2 HMAC-SHA-256 教学子集；更新函数与生成端点分别核验；本仓库没有 SP 800-90B 熵源证据或 SP 800-90C 构造证据 | `drbg_update` · `drbg_generate` |
| `ARGON2_BLOCK_TYPES` | RFC 9106 Argon2 参数集 | `argon2_g` · `argon2_hash` |
| `GMDRBG_BLOCK_TYPES` | 借鉴 HMAC_DRBG 结构的确定性 SM3-HMAC 教学示例；不声明符合 GM/T 0103/0105 或 SP 800-90A，也不代表熵源质量 | `gm_rng` |
| `MLDSA_BLOCK_TYPES` | FIPS 204 ML-DSA 签名/验签端点及参数集 | `mldsa_sign` · `mldsa_verify` |
| `MLDSA_PRIMITIVE_BLOCK_TYPES` | FIPS 204 ML-DSA 内部算法原语；按数学语义及父算法组合验证 | `pq_power2round` · `pq_decompose` · `pq_make_hint` · `pq_use_hint` · `pq_sample_in_ball` |
| `SM9_BLOCK_TYPES` | GB/T 38635 中实际实现的密钥与签名端点；其他功能不得由签名样例外推 | `sm9_master_key` · `sm9_user_key` · `sm9_sign` · `sm9_verify` |
| `RSA_BLOCK_TYPES` | `rsa_encrypt/decrypt/sign/verify` 是 RFC 8017 方案的教学实现；`rsa_sign/verify` 另有 FIPS 186-5 约束。`rsa_keygen` 是项目自定义教学辅助，不属于 RFC 8017，且未实现/验证 FIPS 186-5 附录 A.1/B.3 要求；任何互操作测试都不是认证证据 | `rsa_mgf1` · `rsa_emsa_pkcs1_v15_encode` · `rsa_keygen` · `rsa_encrypt` · `rsa_decrypt` · `rsa_sign` · `rsa_verify` |

### 跨语言 `Bytes` 输出容器

Blockly 输出检查为 `Bytes` 的运行结果约定为 JavaScript `Uint8Array`、Python `bytes`。`verify-demo.ts --exec` 会为 Demo 工作区中声明为 `Bytes` 的块加运行时断言；只有实际执行到的块输出会被检查。单独运行 `npm run verify:demos` 会先构建校验器，避免复用过期的 `dist-verify`。目前 59 个 Demo 均通过该门禁；它验证的是输出容器与登记的回归结果，不是完整官方测试集或认证证据。

本轮修正的公开块出口包括 RSA 密钥生成/加密/解密/签名，ECDSA、EdDSA、SM2 签名与 SM2 解密，SM9 主密钥/用户密钥/签名，X25519、ML-DSA 签名，HMAC-DRBG、GM RNG、HKDF、PBKDF2，Ascon 加密/解密/哈希/XOF/CXOF，Argon2，ECB/CBC/CTR 模式，AES-GCM/CCM/XTS，以及 AES/SM4-CMAC。包装只在公开 Blockly 表达式边界完成；SM9 内部输入校验同时接受其公开块产生的 `Uint8Array`。[`symmetric-bytes-output-contract.test.ts`](../../tests/unit/symmetric-bytes-output-contract.test.ts)、[`pq-bytes-output-contract.test.ts`](../../tests/unit/pq-bytes-output-contract.test.ts)、[`hmac-block-contract.test.ts`](../../tests/unit/hmac-block-contract.test.ts) 与 Demo 门禁分别记录有限实测范围；未被这些测试或 Demo 实际执行覆盖的块不能据此推定容器契约已验证。

2026-10-05 增加哈希族公开输出容器回归：[`hash-bytes-output-contract.test.ts`](../../tests/unit/hash-bytes-output-contract.test.ts) 通过 Blockly 双语言生成并执行 16 个 SHA-224/256、SM3、SHA-3/SHAKE、SHA-512/384 填充、摘要、XOF/PRF 与 squeeze 输出，断言 JavaScript 为 `Uint8Array`、Python 为 `bytes`。该测试固定样例只核对输出容器，不替代各算法的向量与边界测试。

2026-10-06 补齐公钥 Procedure 输出容器断言：[`public-key-bytes-output-contract.test.ts`](../../tests/unit/public-key-bytes-output-contract.test.ts) 使用已登记 Demo 输入，执行实际生成的 JS/Python Procedure，覆盖 ECDSA、EdDSA、SM2 签名/解密、SM9 签名、ML-DSA 签名及 RSA 密钥生成/加密/解密/签名共 10 个端点；[`sm9-keygen-range.test.ts`](../../tests/unit/sm9-keygen-range.test.ts) 同时核对 `sm9_master_key`、`sm9_user_key` 的原生输出容器。加上既有 X25519 容器测试，逐项静态清点按块类型去重共 68 种 `TYPE_BYTES` 块定义：59 种有专门运行时容器断言，另 9 种由已注册 Demo 的 Procedure 执行路径覆盖。逐项映射见下表；未连接或未由 Demo driver 调用的块不计为覆盖。[`verify-demo.ts`](../../scripts/verify-demo.ts) 将断言包装在 Blockly 生成表达式上；[`demos/tests.json`](../../demos/tests.json) 登记的 driver 调用 Procedure 时，实际执行到的 Bytes 输出才触发断言。以上只表示容器类型证据，不等于对应算法正确性或标准符合性。`seed_bytes` 是运行时变量直通，断言使用满足契约的注入 bytes 输入，不宣称该块会把不符合类型的任意输入自动转换。

| Demo | 覆盖的 Bytes 输出块 | driver 调用的 Procedure |
|---|---|---|
| [`ARGON2.json`](../../demos/procedures/ARGON2.json) | `argon2_hash` | `Argon2_Hash` |
| [`ASCON.json`](../../demos/procedures/ASCON.json) | `ascon_encrypt` | `Ascon_Encrypt` |
| [`ASCON-Extended.json`](../../demos/procedures/ASCON-Extended.json) | `ascon_cxof128` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` | `Ascon_CXOF128_ABC` · `Ascon_Decrypt_Empty` · `Ascon_Hash256_Empty` · `Ascon_XOF128_Empty` |
| [`FORS-Sign.json`](../../demos/procedures/FORS-Sign.json) | `fors_pk_from_sk` · `fors_sign` | `FORS_PkFromSk` · `FORS_Sign` |
| [`PQC-Gaps.json`](../../demos/procedures/PQC-Gaps.json) | `slh_adrs_full` | `ADRS_TREE` · `ADRS_ROOTS` |

## Procedure 模板身份

模板注册和 `ALL_BLOCK_TYPES` 是两套身份：模板含函数名、参数类型、分类及拖出预填行为。下表 29 项必须逐项核验。参数/类别的权威值来自 `TEMPLATE_REGISTRY`，预填定义来自同文件的 `TEMPLATE_PREFILL`；验证用例目前另列于 `scripts/verify-templates.ts`。

| 模板身份 | 关系/适用范围 |
|---|---|
| `crypto_encrypt_func` | 与基础块同名；函数模板预填 AES-128-ECB 加密链，key 留空；不是通用加密实现，也无独立算法身份 |
| `crypto_decrypt_func` | 与基础块同名；函数模板预填 AES-128-ECB 解密链，key 留空；不是通用解密实现，也无独立算法身份 |
| `crypto_hash_func` | 与基础块同名；函数模板预填 SHA-256 padding，不含完整压缩/摘要路径；不是完整哈希实现，也无独立算法身份 |
| `proc_aes_round` | FIPS 197 AES 轮函数教学模板 |
| `proc_aes_last_round` | FIPS 197 AES 末轮教学模板 |
| `proc_aes_key_schedule` | 仅 10 次空循环并返回输入 key；不计算 FIPS 197 轮密钥 |
| `proc_sm4_round` | GB/T 32907 SM4 轮函数教学模板 |
| `proc_sm4_key_schedule` | 仅 32 次空循环并返回输入 key；不计算 GB/T 32907 轮密钥 |
| `proc_sha256_hash` | 仅预填 SHA-256 padding；未连接压缩/摘要路径 |
| `proc_sm3_hash` | 仅预填 SM3 padding；未连接压缩/摘要路径 |
| `proc_hmac_sha256` | HMAC-SHA-256 起始链；key 接入、消息输入留空，模板检查不验证 MAC |
| `proc_sm3_hmac` | SM3-HMAC 起始链；key 接入、消息输入留空，模板检查不验证 MAC |
| `proc_pbkdf2` | 仅 1000 次空循环；未实现 RFC 8018 的 PRF/派生计算 |
| `proc_hkdf` | 仅两次空循环占位；未实现 RFC 5869 Extract/Expand 计算 |
| `proc_md_iterate` | 通用教学迭代骨架；无独立算法身份 |
| `proc_sponge_duplex` | 只预填 `sponge_squeeze` 且输出长度留空；不是 duplex 构造或完整哈希端点 |
| `proc_mlkem_keygen` | 仅预填 `NTT(CBD(seed))` 内部步骤片段；不是 FIPS 203 完整 KeyGen，模板检查仅验证结构/可执行性 |
| `proc_mlkem_encaps` | 固定 ML-KEM-512 的 Encaps 结构模板；模板自身仅做结构与零输入冒烟检查，不是已知答案验证；`procedures/ML-KEM-Encaps.json` Demo 使用独立固定向量断言，不等同于模板检查 |
| `proc_zuc_keystream` | 仅 key 接入；IV 和输出长度留空，模板检查不验证 GB/T 33133 密钥流结果 |
| `proc_mode_ecb` | AES-128-ECB 起始模板；key 留空，模板结构/执行检查不证明模式符合性 |
| `proc_mode_cbc` | AES-128-CBC 起始模板；key/IV 留空，模板结构/执行检查不证明模式符合性 |
| `proc_mode_ctr` | AES-128-CTR 起始模板；key/nonce 留空，模板结构/执行检查不证明模式符合性 |
| `proc_mode_gcm` | GCM 起始骨架仅预填 CTR 核心；key/nonce 留空，且没有 GHASH 或认证标签，不是 GCM 实现。`gcm_encrypt` 与 GCM Demo 的加密路径向量及其覆盖边界见下方对应条目 |
| `proc_ntt_vec` | ML-KEM/ML-DSA 数学内部步骤教学模板 |
| `proc_pq_cbd` | 后量子采样教学模板；按父标准参数核验 |
| `proc_pq_sample` | 后量子采样教学模板；按父标准参数核验 |
| `proc_pq_vec_add` | 格密码向量运算教学模板；按父标准参数核验 |
| `proc_pq_vec_sub` | 格密码向量运算教学模板；按父标准参数核验 |
| `proc_pq_mat_mul` | 通用标量矩阵向量教学模板；不是 ML-KEM/ML-DSA 多项式环运算，不映射为标准模板 |
| **模板合计：29** | 其中 3 个与基础块同名，26 个模板专有身份。此清单数目与测试用例身份必须由后续门禁保持一致。 |

## Demo 身份与关系

Demo 身份以 [`demos/tests.json`](../../demos/tests.json) 的 59 个键为准，每个键都对应一个实际 JSON 工作区，并登记 `py`、`js` 两套驱动和期望输出。工作区 JSON 是“Demo 使用了哪些块”的事实来源；[`demos/README.md`](../../demos/README.md) 给出其标准向量、固定输入回归、性质断言或结构展示分组。不得只因某块出现在工作区中，就把 Demo 计作该块的规范语义覆盖。

当前 59 个登记身份（路径相对于 `demos/`）：

```text
procedures/SM4-Sbox.json
procedures/SM3-Hash.json
procedures/SM2-PointMul.json
procedures/SM2-Sign.json
procedures/ML-KEM-Encaps.json
procedures/CCM-Encrypt.json
procedures/XTS-Encrypt.json
procedures/X25519.json
procedures/ASCON.json
procedures/ASCON-Extended.json
procedures/HKDF-SHA256.json
procedures/PBKDF2-SHA256.json
procedures/PBKDF2-SM3.json
procedures/GCM-Encrypt.json
procedures/DRBG.json
procedures/EDDSA.json
procedures/EEA3.json
procedures/EIA3.json
procedures/ECDSA.json
procedures/ARGON2.json
procedures/GM-RNG.json
procedures/ML-DSA-Sign.json
procedures/SM9-Sign.json
procedures/RSA-Encrypt.json
procedures/RSA-Sign.json
procedures/SM2-Encrypt.json
procedures/ECDH.json
procedures/SHA224-Hash.json
procedures/SHA384-Hash.json
procedures/SHA512-Hash.json
procedures/SHA3-Hash.json
procedures/AES-Round.json
procedures/AES-LastRound.json
Procedure-AES-Round.json
procedures/SM4-Round.json
Procedure-SM4-Round.json
procedures/HMAC-SHA256.json
procedures/SHA256-Hash.json
procedures/PBKDF2.json
procedures/Mode-ECB.json
procedures/Mode-CBC.json
procedures/Mode-CTR.json
AES-Atomic-Round.json
SM4-Atomic-Round.json
SHA256-Atomic-Hash.json
ML-KEM-Atomic.json
procedures/ML-DSA-Primitives.json
procedures/Hash-Based-Structures.json
procedures/Code-Based-Math.json
procedures/Multivariate-Math.json
procedures/Wrap-Up-Math.json
procedures/Research-Math.json
procedures/FORS-Sign.json
procedures/GF2m-Poly.json
procedures/Goppa-Decode.json
procedures/PQC-Gaps.json
procedures/Tree-Index.json
procedures/ML-DSA-NTT.json
procedures/SM2-KeyExchange.json
```

以下关系由 2026-09-29 的工作区 JSON 核对得出，只列本项目自定义块，不列 Blockly 原生控制/变量/类型块。它说明 Demo 的静态组成，不代表该用例对列出的每个块都建立独立断言。

| Demo | 工作区中的自定义块 |
|---|---|
| `procedures/SM4-Sbox.json` | `sm4_sbox` |
| `procedures/SM3-Hash.json` | `data_value` · `hash_sm3_compress` · `hash_sm3_pad` |
| `procedures/SM2-PointMul.json` | `ecc_load_curve_params` · `ecc_load_point` · `ecc_multiply` |
| `procedures/SM2-Sign.json` | `data_value` · `sm2_sign` |
| `procedures/ML-KEM-Encaps.json` | `data_value` · `keccak_state_init` · `pq_byte_concat` · `pq_byte_decode` · `pq_byte_encode` · `pq_bytes_slice` · `pq_compress` · `pq_decompress` · `pq_intt` · `pq_ntt` · `pq_ntt_mul` · `pq_poly_add` · `pq_prf` · `pq_sample_ntt` · `pq_sample_poly_cbd` · `pq_seed_with_nonce` · `sponge_absorb` · `sponge_pad` · `sponge_squeeze` |
| `procedures/CCM-Encrypt.json` | `ccm_encrypt` · `data_value` |
| `procedures/XTS-Encrypt.json` | `data_value` · `xts_encrypt` |
| `procedures/X25519.json` | `data_value` · `x25519` |
| `procedures/ASCON.json` | `ascon_encrypt` · `data_value` |
| `procedures/ASCON-Extended.json` | `ascon_cxof128` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` · `data_value` |
| `procedures/HKDF-SHA256.json` | `data_value` · `hkdf` |
| `procedures/PBKDF2-SHA256.json` | `data_value` · `pbkdf2` |
| `procedures/PBKDF2-SM3.json` | `data_value` · `pbkdf2` |
| `procedures/GCM-Encrypt.json` | `data_value` · `gcm_encrypt` |
| `procedures/DRBG.json` | `data_value` · `drbg_generate` |
| `procedures/EDDSA.json` | `data_value` · `eddsa_sign` · `eddsa_verify` |
| `procedures/EEA3.json` | `data_value` · `zuc_keystream` |
| `procedures/EIA3.json` | `data_value` · `zuc_eia3` |
| `procedures/ECDSA.json` | `data_value` · `ecdsa_sign` · `ecdsa_verify` |
| `procedures/ARGON2.json` | `argon2_hash` · `data_value` |
| `procedures/GM-RNG.json` | `data_value` · `gm_rng` |
| `procedures/ML-DSA-Sign.json` | `data_value` · `mldsa_sign` · `mldsa_verify` |
| `procedures/SM9-Sign.json` | `data_value` · `sm9_master_key` · `sm9_sign` · `sm9_user_key` |
| `procedures/RSA-Encrypt.json` | `data_value` · `rsa_decrypt` · `rsa_encrypt` · `rsa_keygen` |
| `procedures/RSA-Sign.json` | `data_value` · `rsa_sign` · `rsa_verify` |
| `procedures/SM2-Encrypt.json` | `data_value` · `sm2_decrypt` · `sm2_encrypt` |
| `procedures/ECDH.json` | `data_value` · `ecdh_shared_secret` |
| `procedures/SHA224-Hash.json` | `hash_sha224_hash` |
| `procedures/SHA384-Hash.json` | `hash_sha512_hash` |
| `procedures/SHA512-Hash.json` | `hash_sha512_hash` |
| `procedures/SHA3-Hash.json` | `sha3_hash` |
| `procedures/AES-Round.json` | `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes` |
| `procedures/AES-LastRound.json` | `aes_add_round_key` · `aes_shift_rows` · `aes_sub_bytes` |
| `Procedure-AES-Round.json` | `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes` |
| `procedures/SM4-Round.json` | `sm4_round_func` |
| `Procedure-SM4-Round.json` | `sm4_round_func` |
| `procedures/HMAC-SHA256.json` | `hash_hmac` |
| `procedures/SHA256-Hash.json` | `data_value` · `hash_sha256_compress` · `hash_sha256_pad` |
| `procedures/PBKDF2.json` | `data_value` · `pbkdf2` |
| `procedures/Mode-ECB.json` | `data_value` · `mode_ecb_encrypt` |
| `procedures/Mode-CBC.json` | `data_value` · `mode_cbc_encrypt` |
| `procedures/Mode-CTR.json` | `data_value` · `mode_ctr_encrypt` |
| `AES-Atomic-Round.json` | `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes` · `data_value` |
| `SM4-Atomic-Round.json` | `data_value` · `sm4_round_func` |
| `SHA256-Atomic-Hash.json` | `data_value` · `hash_sha256_compress` · `hash_sha256_pad` |
| `ML-KEM-Atomic.json` | `data_value` · `pq_mat_vec_mul` · `pq_ntt` · `pq_sample_ntt` · `pq_sample_poly_cbd` |
| `procedures/ML-DSA-Primitives.json` | `pq_decompose` · `pq_make_hint` · `pq_power2round` · `pq_sample_in_ball` · `pq_use_hint` |
| `procedures/Hash-Based-Structures.json` | `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `slh_addr` |
| `procedures/Code-Based-Math.json` | `bin_mat_inv` · `bin_mat_mul` · `gf2_poly_div` · `gf2_poly_gcd` · `gf2_poly_mod` · `gf2_poly_mul` · `ham_dist` · `ham_weight` |
| `procedures/Multivariate-Math.json` | `comb` · `gauss_elim` · `gf2m_add` · `gf2m_inv` · `gf2m_mul` · `mv_quad_eval` |
| `procedures/Wrap-Up-Math.json` | `fors_root` · `goppa_gen_poly` · `poly_scale` · `syndrome_calc` · `vec_dot` |
| `procedures/Research-Math.json` | `berlekamp_massey` · `gauss_pmf` · `lll_reduce` |
| `procedures/FORS-Sign.json` | `fors_pk_from_sk` · `fors_sign` · `fors_verify` |
| `procedures/GF2m-Poly.json` | `gf2m_poly_add` · `gf2m_poly_eval` · `gf2m_poly_mod` · `gf2m_poly_mul` · `gf2m_poly_xgcd` · `goppa_gen_poly` |
| `procedures/Goppa-Decode.json` | `arr_slice` · `gf2m_poly_add` · `gf2m_poly_eval` · `gf2m_poly_mod` · `gf2m_poly_mul` · `gf2m_poly_xgcd` · `goppa_decode` · `goppa_gen_poly` |
| `procedures/PQC-Gaps.json` | `nt_mod_pow` · `pq_poly_mul` · `pq_rej_sample` · `slh_adrs_full` · `wots_checksum` |
| `procedures/Tree-Index.json` | `fors_leaf_index` · `merkle_auth_path` · `merkle_node` · `merkle_root` · `slh_addr` |
| `procedures/ML-DSA-NTT.json` | `pq_intt` · `pq_ntt` · `pq_ntt_mul` |
| `procedures/SM2-KeyExchange.json` | `sm2_key_exchange` |

`RSA-Encrypt.json` 的密钥来自教学用 `rsa_keygen`。该 Demo 验证所选输入下的教学流程/互操作，不构成 FIPS 186-5 密钥生成、密钥管理或算法认证证据。

## 当前映射边界与待补证据

- [标准覆盖矩阵](./COVERAGE.md) 当前是标准目录维度的聚合映射。块名称存在缩写、参数化家族和跨标准复用，矩阵中“列出块/Demo”不能自动解释为完整、逐项且参数集准确的适用性证明。
- 59 个 Demo 的证据类别与依据登记在 [`demos/evidence.json`](../../demos/evidence.json)：`official-vector`（31，期望值来自标准附录/示例/TC/官方 ACVP 用例，且必须给出条款或用例定位）、`property`（12，正文断言代数或结构性质）、`fixed-regression`（13，项目固定输入输出，明确非官方向量；ML-KEM Encaps 的 Demo 属于此类，其官方 ACVP 核对在单测中单独进行）、`cross-implementation`（3，与独立实现交叉：PBKDF2 的 SHA-256 变体与 SHA3-256）。`npm run verify:all` 会核对台账与登记 Demo 完全一致、类别受控、类别计数与本文一致，并要求 `official-vector` 条目同时标注标准来源、条款/示例定位与参数集/变体。台账记录的是“声明的证据基础”：散列族、HMAC、HKDF、PBKDF2、AES 模式与 P-256 ECDH 的期望值已用独立实现复算确认；参数集写明到实际覆盖范围（如 CCM 为 AES-128 的 Example 1-3 参数、GCM 为 96-bit IV 的 TC2/TC13、RSA 为项目教学用的 512-bit 模数而**不是**可用密钥长度）。XTS 因 IEEE 1619-2007 为付费且未随仓库分发、无离线可核来源，已从 `official-vector` 降级为 `fixed-regression`；SHA3-256 的 `abc` 示例值改记为 `cross-implementation`（FIPS 202 正文不含附录向量）。
- **独立复算证据（2026-10-08 新增）**：[`demo-vector-crosscheck.test.ts`](../../tests/unit/demo-vector-crosscheck.test.ts) 用 Python 标准库与 `cryptography` 独立实现重算 14 组**已登记期望值**（含 `official-vector` 与 `cross-implementation` 两类，不等同于“官方向量”）并与 `demos/tests.json` 逐字节比较——SP 800-38C Example 1/2/3、SP 800-38D TC2 与 TC13、SHA-256/384/512、SHA3-256、HMAC-SHA256（RFC 4231 TC1）、HKDF-SHA256（RFC 5869 A.1）、PBKDF2-HMAC-SHA-256、RFC 5903 §8.1 P-256 ECDH 两方向——当前全部一致；环境缺少 `cryptography` 时整组跳过，不记为通过。
- **本轮纠正的过度声称**：GCM 相关文档与**用户可见工具提示**原称“官方向量 SP 800-38D TC2/TC3/TC16 + pycryptodome 交叉验证通过”。逐组复算后确认：Demo 实际覆盖 **TC2 与 TC13**（空 AAD、64 字节明文），**TC3 从未覆盖**，且仓库任何位置都不存在 pycryptodome 依赖或调用。同一轮还清掉了同类残留：CMAC、CCM 的 README 也写了不存在的 pycryptodome 交叉（分别改为 SP 800-38B 向量测试与独立复算）；ECDH 原先无证据的“cryptography 交叉”已由上述独立复算真正兑现；XTS 与 RSA 没有可兑现的证据，分别改为“向量来源 + Demo 回归”和 `fixed-regression`（并写明仓库内无第三方交叉复算）。涉及文件：`demos/README.md`（中英）、`COVERAGE.md`（中英）、`docs/blocks/symmetric.md`、`docs/blocks/ecc-sbox.md`（中英）、`docs/standards/rfc5903-ecdh/*`、`docs/standards/sp800-38b-cmac/README.md`、`docs/standards/sp800-38c-ccm/README.md`、`docs/standards/rfc8017-pkcs1/README.md`，以及 GCM/ECDH 块与生成器注释和两者的工具提示。
- `verify-templates.ts` 将 29 个测试身份与模板注册表作集合核对，并对每个模板调用实际 `onchange` 预填处理器，核对实际 RETURN 表达式链、BODY/RETURN 块集合、循环次数；对同一 handler 二次调用后比较完整 Blockly 序列化状态，确保工作区状态不变。ML-KEM 封装模板另用独立于生产状态配置的期望值，核对 28 条 BODY 赋值的顺序、变量名、每条语句的表达式根块类型及 `return ret`。检查在真实 Blockly 块/连接上运行，仅将 SVG 初始化/绘制方法替换为空操作；它没有逐一断言 ML-KEM 每个表达式内部的所有嵌套连接，也不等于鼠标拖放 UI 验收或完整算法符合性证明。
- **同类问题全仓排查（2026-10-08）**：按“声明了却无仓库证据”的口径，对 `src/`、`docs/`、`demos/` 中所有“官方向量 / 交叉验证 / 全 PASS / 已验证”类表述逐条核对证据。结论：绝大多数声明有对应 Demo 或单测背书（CMAC 的 SP 800-38B 向量、CCM 附录 C、X25519 RFC 7748、HKDF RFC 5869、ECDSA RFC 6979、EdDSA RFC 8032、SM2/SM9 国标附录、ZUC 表 A.1 等）。另修掉四处不一致：`procedure/blocks.ts` 与 `encaps-prefill.ts` 仍把 ML-KEM Encaps 链称为“FIPS 203 官方向量”（该 Demo 实际已登记为项目固定回归、来源 ID 未登记）；`generators/javascript/sm2sig/blocks.ts` 引用了已失效的 `/tmp/vectors/sm2_sig.json`；FIPS 204 双语言搭建指南把 ML-DSA 样例称为“ACVP 官方向量”并声称“OpenSSL 独立验签核对”，而仓库既无向量 ID 也无 OpenSSL 脚本。以上均按实际证据改写。同时把“记录来源”升级为“可重复验证”：PBKDF2-HMAC-SM3 参考值现由 `kdf-parameter-contract.test.ts` 现场用 Python hashlib/OpenSSL SM3 复算；GM-RNG 的 SM3-HMAC 参考值明确标注为开发期由 OpenSSL 派生、仓库内不重新推导（DRBG 多步构造，不能简化为单次 HMAC）。
- `demos/tests.json` 对两种语言登记回归输出，但不是标准来源台账。标准向量必须补标准版本/条款、官方数据来源、测试子集或全集状态；性质/固定输入用例必须按自身类别标记。
- 通用控制、数据、数组、逻辑和研究数学构件不应被强行归入密码算法认证；它们仍需明确 I/O 契约、边界测试及被父算法使用时的语义。
- 当前分组只建立对象和适用性底线。未逐项完成条款、接口和可判定测试的对象仍是缺口；后续 ITEM-2 至 ITEM-7 负责建立来源与测试证据、补齐门禁和修正文档声明。

- **证据台账门禁（2026-10-08 增补）**：除“与登记 Demo 完全一致、类别受控、计数与本文一致、官方向量须有标准来源 + 条款定位 + 参数集”外，`npm run verify:templates` 现还要求每个 `official-vector` 条目的来源能对应到 `standards-manifest.json` 中已跟踪的标准目录（规范化前缀匹配）；未跟踪来源（如不存在的标准编号）会被直接拒绝，负向测试已确认有效。SHA-2 系列的定位同时由错误的“FIPS 180-4 附录 B”（实为参考文献）更正为“NIST SHA-2 示例页（FIPS 180-4 A.2 引用）”。

### 官方数据与正式验证路径

ITEM-2 要求“不能离线分发官方数据时，记录正式验证系统路径”。本节按下表记录各类算法的官方向量获取方式与正式验证入口；**仓库内不代发官方数据**，本表也不表示任何验证已完成。

| 算法族 | 官方向量/数据的来源形式 | 正式验证路径（需另行授权与费用） | 仓库当前状态 |
|---|---|---|---|
| AES、SHA-2/SHA-3/SHAKE、HMAC、DRBG、ECDSA、RSA | NIST CAVP 公开矢量文件（The Secure Hash Algorithm Validation System、AESAVS、HMACVS、DRBGVS、ECDSAVS 等）与 ACVP 测试会议输出 | NIST CAVP/ACVTS：算法实现由授权实验室或自行部署 ACVTS 客户端向 NIST 提交；`COVERAGE.md` 已登记该入口 | 仅使用少量公开示例值/附录值并逐项标注；**未**运行 CAVP/ACVTS 会话 |
| ML-KEM、ML-DSA、SLH-DSA | FIPS 203/204/205 正文与附录；官方参数化测试数据经 NIST ACVP 的 PQC 测试定义分发 | NIST ACVTS（PQC 算法）——注意 FIPS 203/204/205 本身不含附录测试向量，官方测试数据以 ACVP 形式发布 | ML-KEM Encaps 的官方 ACVP 用例（internalProjection tgId=1，tcId 1–3）在单测中驱动同一实现核对，Demo 本身登记为固定回归；ML-DSA-44 签名的 Demo 登记为官方 ACVP 用例（tgId=1 的 tcId 5、8，共 2 例），仅覆盖所列参数与用例；相关内部原语按性质/契约测试，SLH-DSA 无官方向量 |
| Ascon | SP 800-232 正文与 NIST 随后发布的官方测试数据 | NIST CAVP/ACVTS 对应算法页（若已开放） | Demo 为固定样例；明确不是完整 1,089 项 AEAD KAT |
| SM2 / SM3 / SM4 / ZUC / SM9 | GB/T 32918、GB/T 32905、GB/T 32907、GB/T 33133、GB/T 38635 正文附录示例值 | 商用密码检测认证：依《商用密码产品认证目录》与认证规则，由具备资质的检测/认证机构实施（路线见 `PRODUCT-CERTIFICATION-FEASIBILITY.md`） | 已核对的附录值（SM2 附录 A、SM3 A.1、SM4 附录 A、ZUC 表 A.1/B 示例）逐项标注；**未**提交检测 |
| GM/T 0091 KDF、GM/T 0103 RNG | GM/T 标准正文；随机性统计另依 GM/T 0005 | 同上（商用密码检测认证）；随机性结论须来自 `metacrypt_server` 后端测评报告 | 前端只做确定性回归；**不**作熵源质量或随机性判定 |
| Argon2、HKDF、PBKDF2、X25519、EdDSA、ECDH | RFC 9106/5869/8018/7748/8032/5903 附录示例值 | 无独立验证计划；作为产品密码模块的一部分随 FIPS 140-3/CMVP 或商用密码认证评估 | 已用附录值回归，其中 HKDF/ECDH/PBKDF2 另有独立实现复算 |

任何“已通过官方验证/认证”的结论都必须来自上表右侧的正式路径，仓库内测试、Demo、独立复算与门禁均不能替代。

### 尚未出现在 Demo 工作区的块

静态比对 59 个工作区后，有 **94 个**注册块没有出现在任一 Demo 中。该结果只表示“没有 Demo 直接引用”，不能据此断言没有其他测试；后续须逐项查找单元/模板测试，或新增最小接口、边界、性质测试。当前集合如下：

```text
ctrl_iterate
data_convert_to_int
data_convert_bits_to_bytes
data_convert_bytes_to_bits
data_bit_length
data_byte_length
cipher_key_from_seed
seed_bytes
seed_hex
arr_partition_to_array
lgc_compound
lgc_not
lgc_operation
bit_expr_infix
bit_operation
bit_rotate_left
bit_rotate_left_op
bit_rotate_right
bit_rotate_right_op
bit_not32
bit_byte_substitute
sbox
sbox_sub
sbox_variables_get
sbox_variables_set
hash_sha256_pad_text
hash_sha256_pad_hex
hash_sm3_pad_text
hash_sm3_pad_hex
keccak_f
hash_sha3_pad_text
hash_sha3_pad_hex
pq_xof
hash_sha512_pad
hash_sha512_compress
nt_field_add
nt_mod_inverse
pq_ntt_butterfly
pq_poly_sub
ecc_point_double
ecc_add
zuc_s0
zuc_s1
zuc_l1
zuc_l2
zuc_f
cmac_mac
pq_bytes_to_bits
pq_bits_to_bytes
crypto_return
crypto_encrypt_func
crypto_decrypt_func
crypto_hash_func
sm4_linear_transform
pad_pkcs7
pad_zero
mode_ecb_decrypt
nt_mod
nt_div_rem
bn_add
bn_sub
bn_mul
bn_div
base64_encode
base64_decode
hex_to_bytes
bytes_to_hex
endian_swap
sm2_verify
sm9_verify
gcm_gf128_mul
gcm_ghash
gcm_gctr
gcm_inc32
gcm_j0
hkdf_extract
hkdf_expand
ccm_b0
ccm_counter_block
ccm_cbc_mac
ccm_ctr
cmac_double
cmac_subkeys
xts_tweak_mul
pbkdf2_f
drbg_update
ecdsa_k_rfc6979
rsa_mgf1
rsa_emsa_pkcs1_v15_encode
ccm_aad_len_prefix
sm2_kdf
argon2_g
slh_xmss_root
slh_msg_randomness
```

### 既无 Demo 也无单测字面量命中的块

在上述 94 个无 Demo 直接引用的块中，进一步要求 `tests/unit/**/*.ts` 以字符串字面量引用块类型。两者都没有的共 **0 个**：

```text
```

`crypto_encrypt_func`、`crypto_decrypt_func`、`crypto_hash_func` 曾是仅有的三项缺口（只由 `scripts/verify-templates.ts` 做结构/可执行性冒烟，冒烟不调用模板函数体，因此不构成算法级证据）。现由 `tests/unit/crypto-template-defaults.test.ts` 提供块级可判定断言：

- 预填链在缺少 16 字节 key 时，JavaScript 与 Python 生成代码都必须显式失败（`AES-128 key must be 16 bytes`），而不是静默按空密钥运算；
- 补齐 FIPS 197 附录 C.1 的 key 后，`crypto_encrypt_func` / `crypto_decrypt_func` 的结果分别等于该附录的密文与明文已知答案；
- `crypto_hash_func` 对 `"abc"` 的输出满足 FIPS 180-4 §5.1.1 的填充结构：`0x80` 终止符 + 一个 512 位分组的零填充 + 64 位大端比特长度，且两种语言字节一致。

边界：该文件只覆盖上述三条路径，不代表完整 AES 或 SHA-256 实现符合性，也不替代各算法自身的向量测试。`npm run verify:templates` 每次重算“无 Demo 引用”与“既无 Demo 也无单测字面量命中”两个集合并核对本章节的清单与计数；任何新增的无证据块都会直接导致门禁失败，必须补测试或在此登记理由。

控制流/逻辑、S-box、数论与 `crypto_return` 测试均通过真实 Blockly 双语言生成执行；无 Demo 状态单独保留。

`sm2_verify` 和 `sm9_verify` 均未出现在对应的 Demo 工作区中，但这不表示缺少块测试：[`sm2-verification.test.ts`](../../tests/unit/sm2-verification.test.ts) 与 [`sm9-verification.test.ts`](../../tests/unit/sm9-verification.test.ts) 分别从真实 Blockly 工作区生成并执行双语言验签代码。`demos/tests.json` 的驱动直接调用验签函数，与 Demo 工作区包含验签块是两种不同关系，不能混为一谈。

### 已核对的逐块测试证据

下表记录当前已逐项核对的部分标准端点和原语；它只描述仓库内测试证据，不表示已覆盖官方完整测试集或取得正式验证。

| 块类型 | 规范语义范围 | 当前可复核测试证据 | 未由这些测试证明 |
|---|---|---|---|
| `arr_partition_to_array` | 通用等分数组构件；`BYTES` 输出等长非空字节片，`WORDS32` 按大端字节组装无符号 32-bit 字 | [`array-partition.test.ts`](../../tests/unit/array-partition.test.ts) 通过真实 Blockly 块执行双语言代码，覆盖两种模式、迁移保存/加载、字节/字列表与整数编码输入、边界拒绝和单次求值 | 仅证明列明的分割契约，不属于独立密码标准算法，也不证明调用方算法符合性 |
| `arr_slice` | 通用数组切片构件；安全整数起始索引（负值按末尾相对索引处理）；非负安全整数长度表示元素个数，数组边界处截断 | [`array-slice-contract.test.ts`](../../tests/unit/array-slice-contract.test.ts) 通过真实 Blockly 块生成并执行双语言代码，覆盖常规/尾端截断、负索引取足长度、起点越过数组头部、整数值浮点索引、输入只求值一次，并拒绝小数索引、负长度及超范围 start/length | 无独立密码标准算法身份；不证明父算法符合性 |
| `data_value` | 通用原始表达式输入块；不定义密码算法或跨语言语法转换 | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly 块连接到输出语句，执行数字、数组和带引号文本表达式，核对 JS/Python 行为 | 仅核对列出的相同语法输入；不会解析或保证任意语言表达式可移植 |
| `data_convert_to_int` | 通用数据转换；字节序列按无符号大端、十六进制字符串按严格 Hex、数值向零截断；结果限定 JS 安全整数范围 | 同一 [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 由真实 Blockly 生成执行两种语言，核对 Hex/符号/字节/数值输入及非法 Hex、越界值拒绝 | 不是密码标准原语；不替代任意精度整数或特定算法的编码规则 |
| `data_convert_bits_to_bytes` / `data_convert_bytes_to_bits` | 通用位串与字节转换；位串仅含 0/1，末组左侧补零；输出位串每字节固定 8 位，字节值须为 0..255 整数值 | 同一 [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 由真实 Blockly 双语言执行，覆盖前导零、非整字节位串、非法字符/赋值目标、文档列出的有效容器、负数/越界/分数/布尔伪字节及不支持容器的明确拒绝；`bytes → bits` 源表达式只求值一次 | 通用编码构件，不代表任一父算法实现符合标准；转换格式由父算法规范决定 |
| `pq_bytes_to_bits` | FIPS 203 Algorithm 4 [BytesToBits](./fips203-ML-KEM/04-BytesToBits.md)：每个字节按最低有效位优先展开为 8 个 bit | [`pq-bit-encoding.test.ts`](../../tests/unit/pq-bit-encoding.test.ts) 通过真实 Blockly 生成执行 JS/Python，核对 `[1,128,165]` 的位序、空输入及整数值浮点，并拒绝越界/分数/非有限值/布尔和不可迭代输入 | 原语级向量与契约测试；不证明 ML-KEM 完整算法、全部官方测试数据或正式验证 |
| `pq_bits_to_bytes` | FIPS 203 Algorithm 3 [BitsToBytes](./fips203-ML-KEM/03-BitsToBytes.md)：bit 长度须为 8 的倍数且每项属于 `{0,1}`；按每字节最低有效位优先组装 | 同一 [`pq-bit-encoding.test.ts`](../../tests/unit/pq-bit-encoding.test.ts) 通过真实 Blockly 生成执行 JS/Python，核对 `11010001 → 139`、`[1,128,165]` 位串往返、空输入及整数值浮点，并拒绝长度不整字节、非法 bit 值、非有限值/布尔和不可迭代输入；核对 JS `Uint8Array` 与 Python `bytes` 结果 | 原语级向量与契约测试；不证明 ML-KEM 完整算法、全部官方测试数据或正式验证 |
| `data_bit_length` / `data_byte_length` | 项目通用度量：文本按 UTF-8，字节/数组按字节或元素计，数值按固定 32-bit/4-byte 约定，布尔及其他类型为 0 | 同一 [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 由真实 Blockly 双语言执行 UTF-8 文本、字节序列及 32-bit 数值案例 | 项目接口约定，不是密码标准定义；未列出的对象类型返回 0 |
| `rsa_mgf1` | RFC 8017 附录 B.2.1 MGF1（SHA-256） | [`rsa-ccm-encoding-primitives.test.ts`](../../tests/unit/rsa-ccm-encoding-primitives.test.ts) 对 len=0/1/32/33/48/100 与测试内用 Python `hashlib` 独立重写的 MGF1 比对，双语言各执行 | 只覆盖 SHA-256 与这些长度；不覆盖其它 Hash、OAEP/PSS 组合或密钥长度上限 |
| `rsa_emsa_pkcs1_v15_encode` | RFC 8017 §9.2 EMSA-PKCS1-v1_5（SHA-256） | [`rsa-ccm-encoding-primitives.test.ts`](../../tests/unit/rsa-ccm-encoding-primitives.test.ts) 对 emLen=62/128/256 与独立 Python 重写实现比对，并拒绝过小 emLen | 只覆盖 SHA-256 DigestInfo 与三个 emLen；不含模幂、签名或 PSS |
| `ccm_aad_len_prefix` | SP 800-38C §A.2.2 AAD 长度编码 | [`rsa-ccm-encoding-primitives.test.ts`](../../tests/unit/rsa-ccm-encoding-primitives.test.ts) 双语言核对 0/8/0xFEFF/0xFF00/0x01020304 五个边界与超界拒绝 | 只覆盖该编码函数；不覆盖 CCM 全流程或其它 Tlen/Nlen |
| `drbg_update` | SP 800-90A Rev.1 §10.1.2.2 HMAC_DRBG Update（K、V 状态更新） | [`drbg-update-contract.test.ts`](../../tests/unit/drbg-update-contract.test.ts) 双语言执行一次 Update，并与测试内按标准独立重写的 Python 参考实现比对；含空 provided 分支与 64 字节状态校验 | 只覆盖 SHA-256 实例与单次 Update；不覆盖完整 DRBG 生命周期、熵源或 CAVP 向量集 |
| `drbg_generate` | SP 800-90A Rev.1 §10.1.2 HMAC-SHA-256 教学子集；标准规定请求不超过 Table 2 的 `2^19` bit 并按左端请求位返回；项目 API 以 MSB-first 字节数组承载位串，未请求的末字节低位清零 | [`drbg-block-contract.test.ts`](../../tests/unit/drbg-block-contract.test.ts) 通过真实 Blockly 块双语言执行，覆盖 0-bit 空输出、1/8/9/16-bit 左端截取与项目字节编码、负数/小数/超上限拒绝；并核对 NIST CAVS 14.3 HMAC_DRBG SHA-256、无重播种配置下 COUNT=0 的一次选定返回值；上限依据[标准原文表 2](./sp800-90a-drbg/00-Standard-Source.md#L2123) | 该单条 CAVS 向量不代表完整向量集或算法验证；未覆盖实例化熵要求、状态/重播种计数、additional input 生命周期、预测抗性、SP 800-90B 熵源证据及 SP 800-90C 构造证据；不构成模块认证 |
| `gm_rng` | 借鉴 HMAC_DRBG 结构的确定性 SM3-HMAC 教学示例；固定输入可复现，长度范围是项目定义的 `0..65536` 字节；不声明符合 GM/T 0103/0105 或 SP 800-90A | [`gmdrbg-contract.test.ts`](../../tests/unit/gmdrbg-contract.test.ts) 通过真实 Blockly 双语言执行 Demo 样例，对照独立 Node.js/OpenSSL SM3-HMAC 结果，并检查长度边界与 `Uint8Array` / `bytes` 输出 | 固定样例不是 GM/T、GB/T 或 NIST 官方向量；不证明完整 DRBG 符合性、熵源质量、健康检测、故障响应或认证 |
| `hkdf` | RFC 5869 §2；项目实现 HMAC-SHA-256，`L` 为字节数，范围 `0..255×32 = 8160` | [`kdf-parameter-contract.test.ts`](../../tests/unit/kdf-parameter-contract.test.ts) 通过真实 Blockly 双语言执行 RFC 5869 附录 A.1 向量，核对零长度、255 块上限、整数值浮点输入、负/普通分数/布尔/超界长度双语言拒绝及 JS `Uint8Array` / Python `bytes` 类型；另有 Python-only `fractions.Fraction` 长度拒绝测试 | 仅 HMAC-SHA-256 示例与参数边界；不覆盖完整 RFC 向量、其他 Hash 实例或正式算法验证 |
| `pbkdf2` | RFC 8018 §5.2；当前 SHA-256 与 SM3-HMAC 变体的 `hLen` 均为 32 字节；项目将 `c` 限于 JS 安全整数，`dkLen` 为正整数且不超过 `(2^32−1)×hLen` | [`kdf-parameter-contract.test.ts`](../../tests/unit/kdf-parameter-contract.test.ts) 通过真实 Blockly 双语言执行 RFC 7914 §11 SHA-256 向量（含 33 字节尾块截断），双语言核对整数值浮点及 `c`/`dkLen` 的非正、普通分数、布尔和上界拒绝；另有 Python-only `fractions.Fraction` 对迭代数和 `dkLen` 的拒绝测试，并核对 JS `Uint8Array` / Python `bytes`。SM3-HMAC 另以固定输入对照 OpenSSL 3 结果 | OpenSSL 对照值不是 GM/T 官方测试向量；未执行 137 GB 上限输出、完整 ACVP/CAVP 会话或口令存储策略。SP 800-132 建议迭代次数至少 1,000 不应误写为算法输入的规范性最小值 |
| `sm2_kdf` | GB/T 32918.4 §5.4.3 SM3-KDF | [`sm2-kdf-contract.test.ts`](../../tests/unit/sm2-kdf-contract.test.ts) 对 klen=128/256/264/512 与测试内用 Python `hashlib` 的 SM3（OpenSSL 提供）独立重写的 KDF 比对；另核对非整字节截断掩码与 klen 边界拒绝，双语言各执行 | 只覆盖该 KDF 函数与这些 klen；不覆盖 SM2 加解密全流程、共享秘密来源或曲线参数 |
| `ecdsa_k_rfc6979` | RFC 6979 §3.2 确定性 k（P-256 + SHA-256） | [`ecdsa-k-rfc6979-contract.test.ts`](../../tests/unit/ecdsa-k-rfc6979-contract.test.ts) 双语言执行 A.2.5 的 message="sample" 向量（k = `a6e3c57d…`），消息哈希由 Node `crypto` 独立计算；并拒绝非 32 字节哈希 | 只覆盖 P-256/SHA-256 与该向量；不覆盖其它曲线、其它哈希或 r/s 生成与验证 |
| `ecdsa_sign` / `ecdsa_verify` | FIPS 186-5 §6.4；项目固定 P-256/SHA-256，以 RFC 6979 方法确定性派生 `k`；私钥标量限定 `[1,n−1]`；验签对编码长度、`r/s` 范围及公钥曲线点作拒绝检查 | [`ecdsa-input-contract.test.ts`](../../tests/unit/ecdsa-input-contract.test.ts) 通过真实 Blockly 双语言执行非法私钥、签名长度/标量及公钥点负例；[`public-key-bytes-output-contract.test.ts`](../../tests/unit/public-key-bytes-output-contract.test.ts) 执行 Demo Procedure 并核对签名输出容器；`procedures/ECDSA.json` Demo 门禁另核对 RFC 6979 A.2.5 向量 | 确定性签名遇到最终零 `r/s` 时按 FIPS §6.4.1 失败；RFC 6979 候选重试针对无效 `k` 或 `r=0`，不应用来概括 `s=0` 处理。有限向量/边界测试，不是完整 FIPS 186-5/CAVP 验证；不提供常数时间、密钥管理、证书/身份绑定或认证结论 |
| `x25519` | RFC 7748 §5：32 字节标量与 `u` 坐标，按规范 clamp/屏蔽最高位并在素域计算；低阶点结果可为全零 | [`x25519-contract.test.ts`](../../tests/unit/x25519-contract.test.ts) 真实 Blockly 双语言执行 RFC §5.2 V1，核对 `u=0/1` 低阶输入全零、31 字节/非字节值拒绝及 JavaScript `Uint8Array` / Python `bytes` 输出 | 仅覆盖列明向量与边界，不是完整 RFC 测试集或第三方验证；当前实现有依赖私钥位的分支及高层整数运算，不提供常数时间保证；本块不实现协议层全零共享密钥检查或密钥派生 |
| `seed_bytes` / `seed_hex` / `cipher_key_from_seed` | 教学/运行时接口：暴露注入种子及其 Hex；`seed_bytes` 直通运行时 `data`（调用环境须提供对应语言的 bytes 容器）；`cipher_key_from_seed` 取前 16 字节拆成 4 个大端无符号 word，不是 KDF | 同一 [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly 双语言输出并核对 `seed_bytes` 的 JS `Uint8Array` / Python `bytes`、Hex、word 结果和不足 16 字节拒绝 | 不证明熵源质量、种子生命周期或密码学安全密钥派生；不属于独立标准算法 |
| `base64_encode` / `base64_decode` | RFC 4648 §4 Base64；编码器输出标准字母表、必需填充与零 pad bits。解码拒绝非字母表字符/空白及缺失或错误填充；RFC 4648 §3.5 允许解码器选择是否拒绝非零 pad bits，本实现不额外拒绝 | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 以 RFC 4648 §10 七组向量（空串、`f` 到 `foobar`）通过真实 Blockly 生成并执行 JS/Python 编码与解码；另覆盖非法字母、空白及填充拒绝，并锁定 `Zh==` 宽松策略及解码结果为 JS `Uint8Array` / Python `bytes` | 仅覆盖 RFC 示例向量与列明的解析边界；不等于完整互操作测试集或第三方验证 |
| `nt_mod` | 通用正模数取余；两个操作数都是 JS 安全整数，`n > 0`，结果位于 `[0,n)` | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 真实 Blockly 双语言执行，覆盖负被除数、接近安全整数上限的精确结果，并拒绝超安全整数、小数及非正模数 | 不支持任意精度输入；不证明依赖该操作的父算法符合性 |
| `nt_div_rem` | 向下取整的 `divmod(a,d)`，两种生成语言均返回 `[quotient,remainder]` 列表，Blockly 输出类型为 `IntList`；操作数为安全整数且 `d ≠ 0`；通用整数构件，无独立密码标准依据| [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 从真实 Blockly 执行双语言，检查原生返回容器、正/正、负/正、正/负及负/负四种符号组合、接近安全整数边界的商余数，并拒绝越界、小数和除零 | 仅证明该数值契约；不代表密码标准原语 |
| `bn_add` / `bn_sub` / `bn_mul` / `bn_div` | 低位在前的无符号 32-bit limb 列表；每 limb 在 `0..2^32−1`，空列表表示零，结果零规范化为 `[0]`；通用大整数构件，无独立密码标准依据| 同一测试真实 Blockly 双语言执行四种运算，覆盖进位/借位、跨 limb 的多 limb 乘法进位；除法覆盖双 limb 除数、产生非零余数的输入及被除数小于除数的输入，测试核对商、不直接断言余数；另测空列表零、Python tuple/非列表/非法 limb 拒绝、无符号下溢，以及空列表和 `[0]` 除数拒绝 | 非任意精度密码模块接口；不证明 RSA 或其他父算法符合性 |
| `pq_byte_encode` | FIPS 203 Algorithm 5；将 256 个系数按 `d` 位、小端 bit 顺序打包为 `32d` 字节 | [`pq-bit-encoding.test.ts`](../../tests/unit/pq-bit-encoding.test.ts) 以真实 Blockly 执行 JS/Python，对所有开放的 `d` 值与逐位参考结果比较、核对固定前缀及往返；检查最高合法系数、`d=12` 的 `3329` 拒绝、错误长度/容器/系数拒绝，以及整数值浮点的跨语言一致性 | 积木仅开放项目使用的 `d∈{1,4,5,10,11,12}`，未开放抽象算法的全部 `1..12`；不代表完整 ML-KEM 向量或认证 |
| `pq_byte_decode` | FIPS 203 Algorithm 6；按 `d` 位解包 256 个系数，`d=12` 时对 `q=3329` 取模 | 同一测试核对所有开放 `d` 值的双语言结果、原生返回容器、往返、12-bit 全 1 输入归约为 `4095 mod 3329 = 766`，并拒绝错误长度和容器 | 积木仅开放项目使用的 `d∈{1,4,5,10,11,12}`，未开放抽象算法的全部 `1..12`；不代表完整 ML-KEM 向量或认证 |
| `pq_poly_sub` | q=3329/8380417 下两个 256 项安全整数系数列表的逐项模减；先分别约简系数再相减；FIPS 203/204 多项式环运算（逐项模减）| [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly JS/Python 执行，覆盖安全整数上界附近的精确模结果、整数值浮点归一、布尔/分数/超界值拒绝及既有长度/普通输入回归 | 算术契约/性质回归，不是独立官方测试向量；不证明多项式环乘法或父算法完整符合性 |
| `pq_poly_add` | q=3329/8380417 下两个 256 项安全整数系数列表的逐项模加；先分别约简系数再相加；FIPS 203/204 多项式环运算（逐项模加）| [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly JS/Python 执行，覆盖安全整数上界附近的精确模结果、整数值浮点归一、布尔/分数/超界值拒绝及既有负系数/长度回归 | 算术契约/性质回归，不是独立官方测试向量；不证明多项式环乘法或父算法完整符合性 |
| `pq_poly_mul` | 通用安全整数系数卷积；可选逐系数模约简，不对 `X^256+1` 取商；不是 ML-KEM/ML-DSA 的 `R_q = Z_q[X]/(X^256+1)` 乘法 | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 真实 Blockly 双语言执行核对线性卷积、q=3329 负系数归一和大安全整数模乘、无模数输出上界/溢出拒绝、整数值浮点归一、分数/布尔/越界拒绝、空零多项式，以及 `X^255×X` 不作环约简 | 通用 `Z[X]` / `Z_q[X]` 教学算术，不列入 ML-KEM/ML-DSA 覆盖，不作为 FIPS 203/204 符合性证据 |
| `pq_ntt` | q=3329 的 ML-KEM NTT、q=8380417 的 ML-DSA NTT；q=12289 为项目教学分支；输入安全整数系数在入口先归一到 `[0,q)` | 同一测试以真实 Blockly 双语言执行 q=3329 脉冲输入固定输出，覆盖三种 q 的 256 项 NTT/INTT 往返性质；新增 `MAX_SAFE_INTEGER` 输入与其规范剩余代表的等价性，以及布尔、分数、超安全整数拒绝，并拒绝不支持的次数/长度；`ML-DSA-NTT` Procedure Demo 另做往返与乘法性质检查 | 脉冲/往返/Procedure 性质不是官方完整测试向量集；q=12289 非标准算法；不表示 FIPS 203/204 全算法符合或认证 |
| `pq_intt` | q=3329 的 ML-KEM INTT、q=8380417 的 ML-DSA INTT；q=12289 为项目教学分支；输入安全整数系数在入口先归一到 `[0,q)` | 同一测试通过双语言 256 项往返性质，新增 `MAX_SAFE_INTEGER` 输入与其规范剩余代表的等价性，以及布尔、分数、超安全整数拒绝；并拒绝不支持次数/长度；`ML-DSA-NTT` Procedure Demo 检查生成后的往返性质 | 未覆盖完整官方向量集；q=12289 非标准算法；不表示 FIPS 203/204 全算法符合或认证 |
| `pq_ntt_mul` | NTT 域逐项乘法（q=8380417）与 ML-KEM half-NTT 基乘（q=3329）；256 安全整数系数输入，入口按 q 归一；FIPS 203/204 NTT 域逐项乘法| Blockly 双语言测试核对 q=8380417 全 1×全 2 固定结果、q=3329/8380417 安全整数代表与规范剩余类等价、整数值浮点输入、布尔/分数/超安全整数拒绝及两种 q 下长度约束；ML-DSA-NTT/ML-KEM Encaps Demo 另触发对应 Procedure 路径 | 这些固定输入/边界断言与 Demo 结果不是完整官方测试向量集；未据此证明两个父算法完整符合性或认证 |
| `pq_mat_vec_mul` | 标量模矩阵向量教学辅助：扁平行优先 k×k 标量矩阵与 k 维标量向量；不是 FIPS 203/204 在多项式环 R_q 上的矩阵向量原语 | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 真实 Blockly 双语言测试核对 2×2 示例、负数模归一化、整数值浮点数归一、布尔/分数/超安全整数拒绝及错误矩阵尺寸；`ML-KEM-Atomic.json` 的两种生成语言也从工作区变量断言块输出 `[5,11]` | 非标准原语，不纳入 ML-KEM/ML-DSA 符合性证据；仅为通用算术教学构件 |
| `pq_ntt_butterfly` | 通用单步 CT/GS 蝶形，返回 `[out0,out1]`；只接受规范整数剩余，支持 q=3329/8380417/12289 | 同一测试真实 Blockly 双语言执行两种公式及三个 q 的固定结果，并拒绝非规范操作数；q=12289 仅为教学分支 | 不证明完整 NTT/INTT、NTT 域乘法、FIPS 203 Algorithm 9/10、FIPS 204 Algorithm 41/42 或官方完整测试集 |
| `bit_operation` / `bit_expr_infix` | 通用位运算与中缀表达式构件；不具备独立密码算法标准身份 | 同一测试从真实 Blockly 工作区生成并执行 JS/Python；`bit_operation` 覆盖 AND/OR/XOR、左右移位和左右循环移位，以及分数、非有限数、安全整数边界和 32-bit 移位计数；`bit_expr_infix` 覆盖 XOR/AND/OR、相等为真/假、输出类型变化及分数/非有限数输入 | 只证明列明的通用数值契约，不证明算法级使用正确性或密码算法符合性 |
| `bit_not32` | 按 JavaScript 32-bit 规则执行按位取反，并返回无符号 32-bit 数值；通用位运算构件，无独立密码标准依据| 同一测试真实 Blockly 双语言执行，覆盖 `-1 → 0`、`1.5 → 0xFFFFFFFE` 及非有限输入按 0 转换后的结果 | 有限固定输入回归；不证明算法级使用正确性或密码算法符合性 |
| `bit_rotate_left` | 将输入按字段 `bit` 在 0–31 位范围内循环左移并写入输出变量；通用位运算构件，无独立密码标准依据| 同一测试真实 Blockly 双语言执行 `305419896.9` 按 32-bit 规则转换为 `0x12345678` 后左移 8 位的固定结果、0/31 位边界和非有限输入 | 有限固定输入回归；不证明算法级使用正确性或密码算法符合性 |
| `bit_rotate_right` | 将输入按字段 `bit` 在 0–31 位范围内循环右移并写入输出变量；通用位运算构件，无独立密码标准依据| 同一测试真实 Blockly 双语言执行 `305419896.9` 按 32-bit 规则转换为 `0x12345678` 后右移 8 位的固定结果及 0/31 位边界 | 有限固定输入回归；不证明算法级使用正确性或密码算法符合性 |
| `bit_rotate_left_op` / `bit_rotate_right_op` | 32-bit 左/右循环移位后组合 XOR、AND、OR 或 ADD；通用位运算构件，无独立密码标准依据| 同一测试通过真实 Blockly 双语言执行，对两个方向逐一核对四个组合选项，并覆盖 0/31 位移边界 | 仅证明列出的 32-bit 操作契约，不构成完整密码算法向量或认证 |
| `hex_to_bytes` | 严格偶数长度 Hex 字符串转字节；接受大小写十六进制字母；通用编码构件，无独立密码标准依据| [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 真实 Blockly 双语言核对混合大小写、空字符串、JS `Uint8Array` / Python `bytes` 输出，并拒绝奇数长度、前缀、空白和非 Hex 字符 | 通用编码构件；不证明父算法的字节布局、协议编码或标准符合性 |
| `bytes_to_hex` | 字节序列转小写 Hex 字符串；通用编码构件，无独立密码标准依据| 同一测试真实 Blockly 双语言核对空输入 `→ ""` 与 `[00, 0a, ff] → "000aff"` | 固定样例覆盖空值和代表性字节；不声称覆盖所有序列或容器类型 |
| `endian_swap` | 返回输入元素顺序反转的副本；通用编码构件，无独立密码标准依据| 同一测试真实 Blockly 双语言核对 `[1,2,3,4] → [4,3,2,1]`，并检查 JavaScript 输入未被修改 | 单一示例；不证明协议端序或父算法编码正确 |
| `crypto_return` | Procedure 中的通用返回语句，不是密码算法 | [`procedure-generator.test.ts`](../../tests/unit/procedure-generator.test.ts) 将真实 Blockly 返回块接入过程体，执行 JS/Python 并核对返回值 | 不证明其调用的密码算法或模板正确性 |
| `mldsa_sign` / `mldsa_verify` | FIPS 204 ML-DSA-44 高层签名/验签；其余 ML-DSA 参数集未列为项目实现 | `docs/standards/fips204-ML-DSA/vectors/ACVP-ML-DSA-internalProjection.json` 内的 ML-DSA-44 确定性用例（hashAlg=none、空 context）tgId=1 的 tcId 5、8（共 2 例）随仓库登记，`demos/tests.json` 对 JS/Python 执行并逐字节比对官方 signature；仓库内没有 OpenSSL 或第三方交叉验签脚本 | 非 ACVP 完整会话或完整向量覆盖，未覆盖拒绝路径。2026-10-02 NIST ACVP ML-DSA Internet-Draft 指出用例数依注册能力组合变化；sigGen AFT 至少 15 项/组合，内部确定性接口还需拒绝路径及多次拒绝测试。该 Internet-Draft 是工作草案，不是 FIPS 204 正文或认证结果 |
| `ecc_load_curve_params` / `ecc_load_point` / `ecc_add` / `ecc_point_double` / `ecc_multiply` | FIPS 186-5 §6 所用素域短 Weierstrass 点群运算原语；参数块只接收 `a,b,p`；O 编码为 `{infinity:true}`，标量限定为非负整数 | [`ecc-point-operations.test.ts`](../../tests/unit/ecc-point-operations.test.ts) 的 13 项真实 Blockly 双语言执行测试核对曲线非奇异性和点范围/曲线方程检查、异点相加、倍点、O 单位元、逆点、`y=0`、标量 `0/1/2/3/19`、负/分数/布尔标量拒绝、继承无穷远标记和坐标拒绝、Python `dict` 子类拒绝、非布尔标记及不存在的模逆拒绝 | 这些是性质/边界回归而非 FIPS 官方向量；调用方须提供素数 `p`，运行时不测试 `p` 的素数性，也未验证 `G,n`、点阶或子群成员资格、完整官方测试集、常数时间或正式算法/模块验证 |
| `ctrl_iterate` / `lgc_operation` / `lgc_compound` / `lgc_not` | 通用控制流与 32-bit 逻辑构件，不具备独立密码算法标准身份 | [`control-logic-block-contract.test.ts`](../../tests/unit/control-logic-block-contract.test.ts) 通过真实 Blockly 工作区执行双语言代码，核对 1/5 次迭代、XOR/OR/AND、9 种复合运算及 32-bit NOT | 测试证明列出的构件契约，不证明任一完整密码算法或标准认证 |
| `bit_byte_substitute` | 通用单字节查表替换；索引为 `0..255`，选中输出须为整数值字节 | [`sbox-block-contract.test.ts`](../../tests/unit/sbox-block-contract.test.ts) 通过真实 Blockly 双语言执行，覆盖 AES `00→63`、`FF→16`、整数值浮点输入/输出、布尔/分数/越界拒绝、短表和选中非字节输出拒绝 | 仅检查实际选中的输出表项；不是完整父算法测试 |
| `sbox` / `sbox_variables_get` / `sbox_variables_set` | S-box 数据表生成及工作区变量读写；具体算法语义由所用表和父算法决定；参数化查表构件，无独立标准算法身份| [`sbox-block-contract.test.ts`](../../tests/unit/sbox-block-contract.test.ts) 通过真实 Blockly 的 setter/getter/table/substitution 链路逐项核验 AES、SM4 预置表，并保留 AES 一维/二维固定结果 `00112233→638293C3`；另由 `zuc-primitives.test.ts` 核验 ZUC S0/S1 预置表 | 只证明内置表来源及所列块契约；自定义表不因此成为标准参数，且不代表完整父算法符合性 |
| `sbox_sub` | 通用 32-bit 替换；输入为 `0..2^32−1` 整数值，按大端字节顺序处理；展平表至少含 256 项，前 256 项为 `0..255` 整数值 | 同一 [`sbox-block-contract.test.ts`](../../tests/unit/sbox-block-contract.test.ts) 真实 Blockly 双语言对 AES、SM4 表逐项比对标准原文，并对 256 个重复字节输入逐一核对替换输出；另覆盖整数值浮点、非法输入、短表和布尔/分数/越界表项拒绝 | 不证明完整 AES/SM4 父算法符合性或正式算法/模块验证；ZUC 专用块单测不等同于此块调用 ZUC 预置表 |
| `zuc_s0` / `zuc_s1` | GB/T 33133.1-2016 §5.4 与附录 A.1/A.2；分别按 8-bit 输入查完整 S0/S1 表。测试预期读取原文提取层[表 A.1/A.2](./gbt33133-ZUC/00-Standard-Source.md#L1325-L1408)，并已目视核对标准 PDF 物理第 10–11 页（印刷页 6–7） | [`zuc-primitives.test.ts`](../../tests/unit/zuc-primitives.test.ts) 通过真实 Blockly 生成并执行 JS/Python，对 S0、S1 各自 0–255 的全部 256 个输入逐项比对原文，并确认 `SBOX_PRESETS` 对应数组与来源一致；另拒绝负数、256、分数、NaN、Infinity | 逐项测试证明表查找映射，不覆盖完整密钥流/EEA3/EIA3 端点的全部官方测试集、运行环境或正式算法验证 |
| `zuc_l1` / `zuc_l2` | GB/T 33133.1-2016 §5.4 的 32-bit 循环移位 XOR 线性变换 | 同一 [`zuc-primitives.test.ts`](../../tests/unit/zuc-primitives.test.ts) 双语言核验 L1(1)、L1(0x80000001)、L2(1)、L2(0x80000001) 固定结果，拒绝负数、超 32-bit、分数、NaN、Infinity，并检查输入单次求值 | 只覆盖有限固定输入，不是穷举证明、完整 ZUC 算法向量或正式验证 |
| `zuc_f` | GB/T 33133.1-2016 §5.4 非线性函数；本 Blockly 原子块只返回字 `W`，不持久化下一轮 `R1/R2` | 同一 [`zuc-primitives.test.ts`](../../tests/unit/zuc-primitives.test.ts) 双语言核验 `W=(X0⊕R1)+R2 mod 2^32` 的固定算术案例，并拒绝五个输入中的非法字值；ZUC 完整密钥流另以附录 C 的 C1/C2/C3 向量在同文件测试 | 单一 F 用例不覆盖 S/L 组合和状态更新全流程；不替代完整密钥流、EEA3/EIA3 测试或正式验证 |
| `nt_field_add` / `nt_mod_inverse` | 通用模运算构件；输入限安全整数；域的素数条件由调用方保证 | [`number-theory-block-contract.test.ts`](../../tests/unit/number-theory-block-contract.test.ts) 通过真实 Blockly 双语言执行，覆盖负剩余加/减/乘、接近安全整数上限的精确乘法、`±3 mod 11` 模逆及接续普通数值运算、整数值浮点、非互素/非正模数、小数、布尔和超安全整数拒绝 | 不检查模数素性；模逆输入不支持任意精度；不代表完整 RSA、有限域算法或标准符合性 |
| `keccak_f` | FIPS 202 §3.3；项目支持 `KECCAK-f[200/400/800/1600]`（18/20/22/24 轮），状态均为 25 个 `w` 位 lane；SHA-3/SHAKE 构造仍固定使用 `[1600,24]` | [`keccak-block-contract.test.ts`](../../tests/unit/keccak-block-contract.test.ts) 从真实 Blockly 块生成并运行 JavaScript/Python；四种宽度均比对 XKCP 全零状态向量，并拒绝错误 lane 数/越界 lane | 任意 `KECCAK-p[b,nr]`、25/50/100 位宽度、完整官方测试集或模块/产品正式验证 |
| `keccak_state_init` | FIPS 202 §4 海绵构造的初始 `b` 位零状态；项目默认状态为 25 个 64-bit lane | 同一 [`keccak-block-contract.test.ts`](../../tests/unit/keccak-block-contract.test.ts) 通过真实 Blockly 块执行 JavaScript/Python，断言恰好 25 个零 lane | 仅验证初始状态表示，不覆盖完整 Sponge 构造的全部输入长度或正式算法验证 |
| `hash_sha256_pad` / `hash_sha256_pad_text` / `hash_sha256_pad_hex` | FIPS 180-4 §5.1；显式字节、严格 UTF-8 文本和严格 Hex 入口；raw 块兼容接受严格 UTF-8 文本 | [`sha256-padding-contract.test.ts`](../../tests/unit/sha256-padding-contract.test.ts) 从实际 Blockly 块执行双语言代码，覆盖 0/1/55/56/63/64/119/120 字节边界、`abc` 填充块、文本代理项及非文本类型拒绝、非法 Hex 和非法字节拒绝 | 完整 NIST 测试向量集、所有消息长度区间和正式算法验证 |
| `hash_sm3_pad` / `hash_sm3_pad_text` / `hash_sm3_pad_hex` | GB/T 32905-2016 §5.2；显式字节、严格 UTF-8 文本和严格 Hex 入口；raw 块兼容接受严格 UTF-8 文本，长度字段是 64-bit 大端 | [`sha256-padding-contract.test.ts`](../../tests/unit/sha256-padding-contract.test.ts) 从实际 Blockly 块执行 JavaScript/Python，覆盖 `abc` 填充、`2^32` bit 长度字段、跨 workspace helper 注册、孤立代理项拒绝、严格 Hex 和非法字节拒绝 | 完整 SM3 官方测试向量、所有消息长度、流式接口或正式算法验证；UTF-8/Hex 契约不是标准新增要求 |
| `hash_sha3_pad_text` / `hash_sha3_pad_hex` / `sponge_pad` | FIPS 202 §5.1 `pad10*1`；SHA-3/SHAKE suffix 由算法路径决定；项目文本、Hex 与字节输入均有显式契约 | 同一 [`sha256-padding-contract.test.ts`](../../tests/unit/sha256-padding-contract.test.ts) 从真实 Blockly 块执行双语言代码，核对 SHA-3 文本/Hex 输出、严格输入拒绝，以及五种受支持 rate 与两种 suffix 组合在 `rate−1`、`rate`、`rate+1` 字节边界上的通用填充行为；这些组合回归不表示所有组合都是标准 SHA-3/SHAKE 参数集 | FIPS 202 完整官方向量集、任意位长/非字节对齐输入、一般消息长度及正式算法验证；项目输入校验不是新增标准要求 |
| `hash_sha256_compress` | FIPS 180-4 §6.2.2；Blockly 插槽 `W` 为兼容旧工作区保留，实际接收一个原始 64-byte 消息分组并在内部扩展调度 | [`sha256-block-contract.test.ts`](../../tests/unit/sha256-block-contract.test.ts) 通过真实 Blockly 块执行 JS/Python，核对 SHA-256("abc") 单块结果、状态/字节范围、非法值、稀疏数组、整数值浮点输入与无符号输出 | 完整官方测试向量集、长消息端点、其它实现/运行环境及 CAVP/产品认证 |
| `hash_sha224_hash` | FIPS 180-4 §5.3.2、§6.3；RFC 3874 §3.1 Test Vector #1 | [`sha256-block-contract.test.ts`](../../tests/unit/sha256-block-contract.test.ts) 通过真实 Blockly 高层块生成并运行 JS/Python，核对 `abc` → `23097d223405d8228642a477bda255b32aadbce4bda0b3f7e36c9da7` | 只覆盖一个 24-bit 消息已知答案；不替代 SHAVS 全量测试、其它长度/运行环境或 CAVP/产品验证 |
| `hash_sha512_pad` | FIPS 180-4 §5.1；1024-bit 分组、128-bit 大端消息长度字段 | [`sha512-block-contract.test.ts`](../../tests/unit/sha512-block-contract.test.ts) 从真实 Blockly 块执行双语言代码，核对 `abc` 固定填充块、0/111/112/127/128/239/240-byte 长度边界、`0x80` 标记和 128-bit 长度字段 | 完整 SHAVS 测试向量集、位级消息、超出当前可驻留内存范围的长度及正式算法验证 |
| `hash_sha512_compress` | FIPS 180-4 §6.4；8 个 64-bit 初始状态字、单个 1024-bit 分组、内部扩展 80-word 消息调度并执行压缩 | 同一 [`sha512-block-contract.test.ts`](../../tests/unit/sha512-block-contract.test.ts) 以实际 Pad→Compress Blockly 连接，从 SHA-512 IV 得到固定 `abc` 摘要状态，JS/Python 均比对 | 完整 SHAVS 测试向量集、任意中间状态/多分组流程、其它运行环境及正式算法验证 |
| `hash_sha512_hash` | FIPS 180-4 §6.4/§6.5 SHA-512 与 SHA-384；共用 64-bit 核但使用各自 IV，SHA-384 截断到 384 bit | 同一测试通过实际 Blockly 哈希块核对 SHA-512/384 的 `abc` 固定结果；`procedures/SHA512-Hash.json`、`SHA384-Hash.json` 另由 Demo 双语言驱动执行 | 完整官方向量集、空/多分组消息矩阵、其它运行环境及 CAVP/产品认证 |
| `hash_hmac` | FIPS 198-1 HMAC；SHA-256 使用批准底层哈希，SM3-HMAC 标为项目扩展，不冒称 NIST 批准选项 | [`hmac-block-contract.test.ts`](../../tests/unit/hmac-block-contract.test.ts) 通过真实 Blockly 块双语执行：RFC 4231 SHA-256 case 1/6、Node/OpenSSL SM3 交叉结果、非法字节与孤立代理项拒绝、合法 Unicode 一致性、公开输出为 JS `Uint8Array` / Python `bytes` 及同步组合；HMAC Demo 59 项回归中的对应工作区也通过 | 完整官方 HMAC 测试集、完整 GB/T/GM/T 符合性、密钥擦除/常量时间、CAVP 或产品认证 |
| `sha3_hash` | FIPS 202 §6.1 SHA3-224/256/384/512；项目提供四档 SIZE 封装，置换为 KECCAK-f[1600] | [`sha3-block-contract.test.ts`](../../tests/unit/sha3-block-contract.test.ts) 从真实 Blockly 块生成并运行双语言代码，核对 `abc` 和各自 `rate−1` 字节输入的四档固定结果，并与 Node 原生 SHA-3 交叉核验 | 空消息、一般多块消息、更多边界、完整 NIST 官方测试集或算法/模块正式验证 |
| `sponge_squeeze` | FIPS 202 §4 的输出步骤；项目接口限定于 KECCAK-f[1600] 和可选速率，输出长度须为非负安全整数值 | [`sponge-squeeze-contract.test.ts`](../../tests/unit/sponge-squeeze-contract.test.ts) 从真实 Blockly 块生成并执行双语言代码，检查 lane 字节序、整数值浮点长度接受，以及负数/小数长度拒绝 | 所有 rate、跨置换多块输出、完整官方测试集及模块验证 |
| `pq_xof` | FIPS 202 §6.2 SHAKE128/256；项目输出长度单位为字节，JS 使用项目 Keccak-f[1600]，Python 使用 `hashlib` | [`shake-block-contract.test.ts`](../../tests/unit/shake-block-contract.test.ts) 从真实 Blockly 块生成并运行双语言代码；固定 `rate−1` 输出，并于 2026-10-03 增补空输入、3-byte 输入、整 rate 与 `rate+1` 输入，以及输出 17/32/`rate+1`/`2·rate+5` bytes 的边界回归；与 Node 原生 SHAKE 和 Python `hashlib` 对照 | 完整 NIST 官方测试集、其它运行环境或算法/模块正式验证 |
| `pq_prf` | FIPS 203 §4.1 式 (4.3) `PRFη(s,b)=SHAKE256(s‖b,8·64·η)`；项目 nonce 为单字节，长度字段按字节计；SHAKE128 选项是非标准扩展 | 同一 [`shake-block-contract.test.ts`](../../tests/unit/shake-block-contract.test.ts) 执行生成块，核验两种 SHAKE 模式下 `rate−1` 拼接、nonce `0..255` 边界和输出长度契约；参考输出由 Python `hashlib` 固定，不是官方向量 | FIPS 203 全算法测试、全部 η 参数集及官方 ACVP/CAVP 测试数据或算法验证 |
| `cmac_mac`（AES-128） | [RFC 4493 §4](https://datatracker.ietf.org/doc/html/rfc4493#section-4) AES-CMAC；也与 NIST SP 800-38B 的 CMAC 语义对应 | [`cmac-block-contract.test.ts`](../../tests/unit/cmac-block-contract.test.ts) 通过真实 Blockly 块在 JS/Python 执行 RFC 4493 空消息、16/40/64-byte 消息四个向量，并拒绝 15/17-byte 密钥；[`symmetric-bytes-output-contract.test.ts`](../../tests/unit/symmetric-bytes-output-contract.test.ts) 另核验 AES/SM4 选项的 JS `Uint8Array` / Python `bytes` 输出容器 | 仅验证 AES-128 这些向量和密钥长度及两种选项的容器类型；未覆盖完整 SP 800-38B 向量集、截断标签接口、SM4-CMAC 的 GB/T 专用向量、其它运行环境或正式算法/模块验证 |
| `sm4_linear_transform` | GB/T 32907-2016 轮函数式（3）的线性变换 `L`；详见[标准拆分页](./gbt32907-SM4/02-RoundFunction.md) | [`sm4-linear-transform.test.ts`](../../tests/unit/sm4-linear-transform.test.ts) 通过真实 Blockly 块执行 JS/Python，核验 `L(0x00000001)=0x01040405` | 仅一个固定输入，不覆盖全部输入域、完整 SM4 轮函数/密钥扩展向量或正式验证 |
| `pad_pkcs7` | RFC 2315 §10.3：填充块长须为 1–255 bytes，填充值编码长度；整块输入仍追加完整填充块 | [`symmetric-padding-mode-contract.test.ts`](../../tests/unit/symmetric-padding-mode-contract.test.ts) 真实 Blockly 双语测试覆盖 0/1/15/16/17-byte 输入、JS `Uint8Array` / Python `bytes` 输出及 0、负数、非整数、256 的拒绝 | 完整 RFC/实现测试集、对所有块长及超大输入的资源行为 |
| `pad_zero` | 项目定义的零填充扩展，不声称由 PKCS#7 或单一通用标准规定；整块输入按当前接口追加一个完整块，必须由调用方保留原始长度 | 同一测试通过真实 Blockly 双语核验非整块和整块输入、JS `Uint8Array` / Python `bytes` 输出，并拒绝非正/非整数块长 | 零填充不可从结果唯一恢复原文长度；未定义通用反填充算法，也不应将其当作标准认证证据 |
| `mode_ecb_decrypt` | SP 800-38A §6.1 AES-ECB 解密；输入必须为完整 16-byte 密文块，输出保留块内字节，不移除填充 | 同一测试用 FIPS 197 Appendix C.1 AES-128 逆变换向量在 JS/Python 核验明文，并拒绝 1/15/17-byte 非整块密文；同时修复 JS typed-array `concat` 未扁平化导致的错误输出。另见下方跨切面的公开输出容器断言 | 未覆盖完整 CAVP/ECB 向量集、其它 AES key 长度、填充移除/认证解密（ECB 本身不提供认证） |
| `sm2_verify` | GB/T 32918.2-2016 §7.1；公钥检查依 GB/T 32918.1-2016 §6.2.1，详见[SM2 签名条目](./gbt32918-SM2/03-Signature.md) | [`sm2-verification.test.ts`](../../tests/unit/sm2-verification.test.ts) 中的验签块双语端到端用例覆盖附录 A 向量、`r/s` 边界、`r+s=n`、身份/消息篡改及非规范公钥坐标；同文件的 helper 级测试检查公钥域外/离曲线输入和子群拒绝分支。子群分支通过替换阶参数触发，未构造真实非平凡余因子点 | 完整官方测试集、额外曲线/运行环境、密钥生命周期及正式算法验证 |
| `sm9_master_key` | GB/T 38635.2-2020 §6.1：计算签名主公钥 `Ppub=[ks]P2`；见[原文定位](./gbt38635-SM9/00-Standard-Source.md#L2032)及[参数条目](./gbt38635-SM9/02-H1-H2-and-Parameters.md) | [`sm9-keygen-range.test.ts`](../../tests/unit/sm9-keygen-range.test.ts) 双语言检查输出长度、`ks` 边界和精确 `Uint8Array` / `bytes` 容器；[`demos/tests.json`](../../demos/tests.json) 的 SM9 附录 A 驱动还覆盖其在签名流程中的组合使用 | 独立主公钥已知答案集、完整系统参数生成/发布流程 |
| `sm9_user_key` | GB/T 38635.2-2020 §6.1：按签名用途 HID `0x01` 和身份提取关系生成 `deA`；见[原文定位](./gbt38635-SM9/00-Standard-Source.md#L2032)及[参数条目](./gbt38635-SM9/02-H1-H2-and-Parameters.md) | [`sm9-keygen-range.test.ts`](../../tests/unit/sm9-keygen-range.test.ts) 检查密钥标量、身份字节、边界及精确 `Uint8Array` / `bytes` 容器；[`sm9-block-contract.test.ts`](../../tests/unit/sm9-block-contract.test.ts) 检查块与双语言 HID 契约；[`demos/tests.json`](../../demos/tests.json) 的附录 A 驱动覆盖签名流程中的组合使用 | 完整 KGC 密钥管理、密钥发放与撤销流程 |
| `sm9_sign` | GB/T 38635.2-2020 §6.2，并按 GB/T 38635.1-2020 检查曲线点及域元素 | [`sm9-randomness.test.ts`](../../tests/unit/sm9-randomness.test.ts) 双语言执行生成块，覆盖附录 A 向量、随机/指定标量、非规范/离曲线 `DS` 与 `Ppub`，以及 `Ppub` 非子群点和 `l=0` 故障注入分支；[`public-key-bytes-output-contract.test.ts`](../../tests/unit/public-key-bytes-output-contract.test.ts) 核对 Demo Procedure 签名输出容器 | 完整官方负例集合、独立熵源质量及正式算法验证 |
| `sm9_verify` | GB/T 38635.2-2020 §6.4，并按 GB/T 38635.1-2020 检查点编码、曲线与子群 | [`sm9-verification.test.ts`](../../tests/unit/sm9-verification.test.ts) 双语言执行生成块，覆盖附录 A 向量、篡改消息/身份/散列、非法长度与字节、非规范/离曲线输入及 `Ppub` 非子群点；`sm9-block-contract.test.ts` 核对 HID 契约；[`sm9-randomness.test.ts`](../../tests/unit/sm9-randomness.test.ts) 通过实际生成的 SM9-Sign Blockly Procedure，核对附录 A 签名、`Ppub` 和 `ds` 已登记期望值，再将公开 `Bytes` 输出传入 Python 验签；另确认 `bytes`/`bytearray`/`tuple`/`list` 可用，非法容器/字节返回 `False` | 完整官方测试集、所有系统参数/密钥不一致情形及正式算法验证 |
| `argon2_g` | RFC 9106 §3.5 压缩函数 G | [`argon2-g-contract.test.ts`](../../tests/unit/argon2-g-contract.test.ts) 双语言对 1024 字节确定样本与测试内按 §3.5–§3.6 独立重写的 G 比对（含 X/Y 交换对称性与非 1024 字节拒绝） | 只覆盖单次压缩；不含内存填充、索引函数或 Tag 计算，且无官方 G 向量可比 |
| `argon2_hash` | RFC 9106 §3.1 Argon2 v1.3；RFC 9106 是 IRTF Informational RFC。`P/S/K/X≤2^32−1` bytes、`m≥8p`、Tag 至少 4 bytes；盐无 RFC 最小长度，推荐 16 bytes。项目只接受字节序列/UTF-8 文本，每项输入限 1 MiB，执行参数另限 `m≤65,536 KiB`、`t≤10`、`p≤16`、Tag `≤1,024 bytes`、`m×t≤65,536 KiB-pass` | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly JS/Python 生成代码，拒绝 4 类超 1 MiB 输入、任意迭代器和非法字节值，核对 UTF-8 文本与空盐的双语一致，并覆盖参数边界；[`ARGON2.json`](../../demos/procedures/ARGON2.json) 回归执行 RFC 9106 §5.1–5.3 三种变体的最终 Tag 样例 | 项目输入/执行上限不是 RFC 限值，且不支持 RFC 推荐的 2 GiB/1-pass、64 MiB/3-pass 配置；Demo 只核对最终 Tag，不核对 pre-hash/中间块，不是完整测试集或生产口令哈希实现 |
| `gf2_poly_mul` | 通用 GF(2) 系数卷积，低位在前；无独立密码标准依据；空输入相乘返回 `[]` 表示零多项式 | [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly 生成并执行 JS/Python，覆盖左右空输入及非空已知结果 `[1,1]×[1,1,1]=[1,0,0,1]` | 只验证空输入约定和该卷积算例，不等同任何编码密码算法符合性 |
| `gf2m_poly_mul` | GF(2^8) 系数多项式卷积，底层域为项目选定的 AES 多项式表示；该 Goppa 教学构件无独立密码标准条款 | 同一 [`generator-contracts.test.ts`](../../tests/unit/generator-contracts.test.ts) 通过真实 Blockly 生成并执行 JS/Python，覆盖三种空输入、非空多项式卷积 `[1,2]×[3,4]=[3,2,8]` 及域乘 `0x57×0x83=0xC1` | 仅为基础代数算例；不构成 Classic McEliece 或其他代码密码符合性证据 |
| `sm4_sbox` | GB/T 32907 SM4 字节代换表查询；此表项本身不等于完整 SM4 轮函数或算法端点 | [`sbox-block-contract.test.ts`](../../tests/unit/sbox-block-contract.test.ts) 经真实 Blockly 块执行 JS/Python，逐项核对 0–255 全部 256 个 S-box 输出，并拒绝负数、256、分数和布尔输入 | 只验证表查询及输入域，不证明 `sm4_round_func`、密钥扩展、完整 SM4 标准向量或正式验证 |
| `aes_sub_bytes` · `aes_shift_rows` · `aes_mix_columns` · `aes_add_round_key` | FIPS 197 §5.1 的四个轮变换组件（SubBytes / ShiftRows / MixColumns / AddRoundKey）；按 16 字节状态原地修改 | `AES-Atomic-Round.json`（顺序调用四个原语）、`procedures/AES-Round.json`、`AES-LastRound.json`、`Procedure-AES-Round.json`；这些 Demo 在 [evidence.json](../../demos/evidence.json) 登记为 `fixed-regression`（固定值 `4807…c59f`，明确非官方附录向量） | 未逐组件对照 FIPS 197 附录 B/C 的中间状态；不证明完整 AES 加密、密钥扩展、分组模式或侧信道 |
| `sm4_round_func` | GB/T 32907-2016 轮函数 F（含 S 盒与线性变换 L） | `SM4-Atomic-Round.json`、`procedures/SM4-Round.json` 与 `Procedure-SM4-Round.json` 回归该标准附录 A 首轮输出 `27fad345`（`official-vector`）；`sm4-linear-transform.test.ts` 单独覆盖其中的线性变换 | 只覆盖首轮向量与线性变换；不证明密钥扩展、完整 SM4 或轮数之外的行为 |
| `mode_ecb_encrypt` / `mode_cbc_encrypt` / `mode_ctr_encrypt` | AES-128 的 ECB / CBC / CTR 模式路径，分别对应 FIPS 197 附录 C.1、SP 800-38A F.2.1、SP 800-38A F.5.1 | `procedures/Mode-ECB.json`、`Mode-CBC.json`、`Mode-CTR.json` 回归上述向量（`official-vector`，参数集 AES-128）；`crypto-template-defaults.test.ts` 在模板链上核对 ECB 缺 key 时显式失败与 C.1 加解密；`symmetric-bytes-output-contract.test.ts` 核对 `Uint8Array`/`bytes` 输出容器 | 只覆盖所列单块向量；不覆盖多块填充策略、其它 IV/nonce 长度、padding 标准或侧信道；CTR 未覆盖计数器溢出 |
| `gcm_encrypt` | SP 800-38D GCM（GHASH + GCTR），AES-128、96-bit IV | `procedures/GCM-Encrypt.json` 回归 TC2 与 TC13，并由 `demo-vector-crosscheck.test.ts` 用 `cryptography` 独立复算一致；`symmetric-bytes-output-contract.test.ts` 核对输出容器 | **TC3 未覆盖**；不覆盖其它 IV 长度、tag 长度族与 AD 处理全谱；Demo 第三条是项目自选变体而非标准 TC |
| `ccm_encrypt` | SP 800-38C CCM（CBC-MAC + CTR），AES-128 | `procedures/CCM-Encrypt.json` 回归附录 C Example 1/2/3（tagLen 4/6/8），并由 `demo-vector-crosscheck.test.ts` 独立复算一致；输出容器由 `symmetric-bytes-output-contract.test.ts` 核对 | 只覆盖 Example 1-3 的参数组合；不覆盖全部 nonce/tag 长度组合 |
| `xts_encrypt` | IEEE 1619-2007 / SP 800-38E XTS（AES-128，32 字节 key 拆成两个半钥、16 字节 tweak） | `procedures/XTS-Encrypt.json` 为 `fixed-regression`：使用 IEEE 1619-2007 的经典向量（来源文档付费且未随仓库分发，不可离线核对），并覆盖 17/31/47 字节消息的密文窃取路径、拒绝两半相同的 key 与短于一个分组的消息；输出容器由 `symmetric-bytes-output-contract.test.ts` 核对 | 不登记为官方向量；仓库内亦无第三方独立复算；不覆盖其它数据单元长度与侧信道 |
| `zuc_keystream` / `zuc_eia3` | GB/T 33133 ZUC 密钥流与 EIA3 MAC（EEA3 / EIA3 的构造基础） | `procedures/EEA3.json`（GB/T 33133.2 附录 A.1）与 `procedures/EIA3.json`（GB/T 33133.3-2021 附录 B 示例 1/2）登记为 `official-vector`；`zuc-primitives.test.ts` 另覆盖 S0/S1 全表与长度上限 | 不覆盖密钥流全长度范围、EIA3 全消息长度或 3GPP 完整测试集 |
| `ascon_encrypt` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` · `ascon_cxof128` | SP 800-232 Ascon-AEAD128 / Hash256 / XOF128 / CXOF128 端点 | `procedures/ASCON.json` 与 `ASCON-Extended.json` 覆盖固定样例、空消息与错误标签/参数拒绝；`generator-resource-limits.test.ts` 覆盖 `ascon_xof128` 的资源边界 | 登记为 `fixed-regression`：不是完整 1,089 项 AEAD KAT，也不覆盖完整 Hash/XOF 套件与流式 API |
| `sponge_absorb` | FIPS 202 海绵吸收阶段（与 `sponge_squeeze`、`keccak_f` 组合） | `sponge-absorb-contract.test.ts` 通过真实 Blockly 双语言执行吸收阶段；`procedures/ML-KEM-Encaps.json` 在完整 Encaps 链中使用该块 | 只覆盖吸收阶段的接口与列明样例；不单独构成哈希/XOF 端点或 FIPS 202 全量测试 |
| `hash_sm3_compress` | GB/T 32905 SM3 压缩函数（与填充块组合成 `SM3_Hash`） | `procedures/SM3-Hash.json` 回归 SM3("abc") = `66c7f0f4…`（GB/T 32905-2016 A.1 官方值，另经独立实现复算）；`procedures/PBKDF2-SM3.json` 复用该压缩路径 | 只覆盖 512-bit 单块压缩与所列向量；不覆盖多块消息与长度编码全谱 |
| `slh_msg_randomness` | FIPS 205 §10.1 + §11.1（pure SLH-DSA 的消息随机数 R，SHAKE 变体） | [`slh-msg-randomness-acvp.test.ts`](../../tests/unit/slh-msg-randomness-acvp.test.ts) 用 ACVP SLH-DSA-sigGen 子集核对 SHAKE-128f/192f/256f 的 R（签名前 n 字节），双语言各 2 例；含 context 长度与 opt_rand 长度拒绝 | 只覆盖签名第一步与 M′ 上下文编码；不含 FORS、HT、完整签名或验证 |
| `slh_xmss_root` | FIPS 205 §7.2 Algorithm 9/10（XMSS 树根，SHAKE 变体） | [`slh-xmss-root-acvp.test.ts`](../../tests/unit/slh-xmss-root-acvp.test.ts) 用 NIST ACVP SLH-DSA-keyGen 官方向量（`docs/standards/fips205-SLH-DSA/vectors/`）核对 SHAKE-128f/192f/256f 的 PK.root，双语言各 2 例；含种子长度与树高越界拒绝 | 只覆盖顶层树根与 SHAKE 的 f 参数集；不含 FORS、签名/验签、SHA2 参数集或完整 ACVP 会话 |
| `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `merkle_auth_path` · `fors_leaf_index` · `slh_addr` | FIPS 205 的哈希链与 Merkle 树内部结构（`Chain`、叶/节点/根、认证路径、FORS 选叶、ADRS） | `procedures/Hash-Based-Structures.json` 断言 `Chain(x,0)=x`、链的半群性、4 叶树根手工组合与 ADRS 32 字节确定性；`Tree-Index.json` 断言 FORS 选叶分块与 leaf+auth 重建根等于全树根；`pq-bytes-output-contract.test.ts` 核对这些块的 `Uint8Array`/`bytes` 输出容器 | 结构性质与容器断言；**不是** FIPS 205 KAT，参数集与是否贴合标准分层仍待逐项核对 |
| `fors_sign` · `fors_verify` · `fors_pk_from_sk` · `fors_root` · `wots_checksum` · `slh_adrs_full` | FIPS 205 的 FORS 签名/验签/公钥派生、根计算，WOTS 校验和与完整 ADRS 域分隔 | `procedures/FORS-Sign.json`、`Wrap-Up-Math.json`、`PQC-Gaps.json` 断言项目内部往返、确定性、篡改检测、FORS 确定性与 `wots_checksum` 单调性；`generator-contracts.test.ts` 覆盖部分块的接口契约 | 明确为非标准兼容教学变体（`sig 640B / pk 32B`）：不是 FIPS 205 的 SLH-DSA 参数集，也不是 KAT 或符合性证据 |
| `pq_power2round` · `pq_decompose` · `pq_make_hint` · `pq_use_hint` · `pq_sample_in_ball` | FIPS 204 的 Power2Round / Decompose / MakeHint / UseHint / SampleInBall（ML-DSA-44：q=8380417、n=256、β=78、ω=80、τ=39） | `generator-contracts.test.ts` 用真实 Blockly 块核对每块的 tooltip 引用的 FIPS 204 算法编号（Alg 35/36/39/40/29）、拒绝非法输入域并断言合法种子输出 256 项；`procedures/ML-DSA-Primitives.json` 断言 `r1·2¹³+r0≡r`、`Use_Hint(Make_Hint)` 定理、`\|Dec_Low(r+z)\|<γ2−β` 与 InBall 恰 39 个 ±1 | 工具提示引用编号与输入域检查不是算法向量；Demo 只用一组项目选定系数，不覆盖其它参数集，也不构成 FIPS 204 KAT |
| `pq_sample_poly_cbd` · `pq_sample_ntt` | FIPS 203 采样原语（`SamplePolyCBD` 见 `fips203-ML-KEM/08-SamplePolyCBD.md`，`SampleNTT` 见同目录采样页） | `ML-KEM-Atomic.json` 断言 CBD 采样前四项与 NTT 冲激响应；`procedures/ML-KEM-Encaps.json` 在完整 Encaps 链中调用二者 | 登记为 `property`/固定回归：不覆盖采样分布统计、各 ML-KEM 参数集或官方 KAT |
| `pq_rej_sample` | FIPS 204 拒绝采样（Rej 边界） | `procedures/PQC-Gaps.json` 断言 Rej 边界排他性质 | 性质断言；不覆盖完整拒绝采样分布或 ML-DSA 端点 |
| `pq_byte_concat` · `pq_bytes_slice` · `pq_seed_with_nonce` | FIPS 203 字节拼接/切片与 `ρ‖nonce` 派生辅助 | `pq-bytes-output-contract.test.ts` 对三块核对 `Uint8Array`/`bytes` 输出容器；`procedures/ML-KEM-Encaps.json` 在完整链中使用 | 通用字节操作与派生辅助；不单独构成标准端点，也不证明 ML-KEM 算法符合性 |
| `pq_compress` · `pq_decompress` | FIPS 203 `Compress` / `Decompress`（d 位压缩） | `procedures/ML-KEM-Encaps.json` 在完整 Encaps 链中调用（`mu` 的解压路径） | 未单列向量断言；不覆盖各 d 值及与 ByteEncode/ByteDecode 的组合边界 |
| `gf2m_mul` · `gf2m_add` · `gf2m_inv` | GF(2^8) 域运算（项目选定的 AES 多项式表示）；Goppa/编码教学构件，无独立密码标准条款 | `generator-contracts.test.ts` 通过真实 Blockly 双语言执行，覆盖域乘 `0x57×0x83=0xC1`、零元/单位元与零逆拒绝 | 基础代数契约；不构成 Classic McEliece 或任何编码密码算法的符合性证据 |
| `gf2_poly_mul` · `gf2_poly_div` · `gf2_poly_mod` · `gf2_poly_gcd` | GF(2) 多项式卷积、除余与欧几里得（低位在前）；无独立密码标准条款 | 同一测试覆盖空输入约定、`[1,1]×[1,1,1]=[1,0,0,1]`、除余重建与 GCD 性质；`procedures/Code-Based-Math.json` 断言结合律、除余重建与欧几里得 | 只覆盖列明代数性质；不代表任何编码密码算法符合性 |
| `gf2m_poly_add` · `gf2m_poly_mul` · `gf2m_poly_mod` · `gf2m_poly_xgcd` · `gf2m_poly_eval` | GF(2^m) 多项式运算（项目选定 AES 多项式域） | 同一测试覆盖 GF(2^8) 卷积与域乘；`procedures/GF2m-Poly.json` 断言零元/交换/结合、`(a·b) mod b = 0`、Bezout 恒等式与根判定；`Goppa-Decode.json` 复用这些原语 | 教学代数构件；不构成 Goppa / McEliece 标准实现证据 |
| `bin_mat_mul` · `bin_mat_inv` | GF(2) 矩阵乘法与求逆；GF(2) 线性代数构件，无独立密码标准依据 | `procedures/Code-Based-Math.json` 断言 `A·A⁻¹=I` | 单一性质；不覆盖维度与奇异矩阵全谱，也不构成编码密码端点 |
| `ham_weight` · `ham_dist` | 汉明重量与汉明距离；通用度量构件，无独立密码标准依据 | `procedures/Code-Based-Math.json` 断言 `d = wt(x⊕y)` | 通用度量构件；不构成译码算法证据 |
| `goppa_gen_poly` · `syndrome_calc` · `goppa_decode` · `berlekamp_massey` | Goppa 码生成多项式、伴随式计算与译码相关教学构件 | `procedures/Goppa-Decode.json` 断言 `G=[176,92,1]`、根判定、逆元 `u·(z−α)≡1`、syndrome 已知值、无错/单错/双错往返与篡改不可纠；`Research-Math.json` 覆盖 Berlekamp–Massey 重放性质 | 明确为非标准兼容教学变体（见 [evidence.json](../../demos/evidence.json) 的 `property`/`fixed-regression`）；不是 McEliece 标准实现或认证证据 |
| `comb` · `gauss_elim` · `gauss_pmf` · `lll_reduce` · `mv_quad_eval` · `poly_scale` · `vec_dot` · `nt_mod_pow` | 通用/研究数学构件：组合数、高斯消元、离散高斯 PMF、LLL、二次型求值、多项式缩放、点积、模幂 | `Multivariate-Math.json`、`Research-Math.json`、`Wrap-Up-Math.json`、`PQC-Gaps.json` 分别断言线性方程组、二次式、组合数、GF(2⁸) 算例、LLL 行列式保持、PMF 对称归一、FORS 确定性与 `2^(q−1)≡1 (mod q)`；`nt_mod_pow` 另有 `generator-contracts.test.ts` 覆盖 | 项目固定回归与性质断言；无独立密码标准条款，`q=12289` 等为教学分支 |
| `ecdh_shared_secret` | RFC 5903 §8.1 P-256 ECDH（i→r 与 r→i 两方向） | `procedures/ECDH.json` 双语言回归两个方向；`demo-vector-crosscheck.test.ts` 用 `cryptography` 的 P-256 ECDH 独立复算一致 | 只覆盖该附录向量；不覆盖其它曲线、协议层全零共享密钥检查或侧信道 |
| `eddsa_sign` · `eddsa_verify` | RFC 8032 §7.1 Ed25519 签名与验签 | `procedures/EDDSA.json` 回归 TEST 1-3；`public-key-bytes-output-contract.test.ts` 核对签名输出的 `Bytes` 容器 | 只覆盖 Ed25519 的三组样例；不覆盖 Ed448、上下文相关变体或侧信道 |
| `sm2_sign` | GB/T 32918.2-2016 附录 A 示例 1（ZA/e/r/s） | `procedures/SM2-Sign.json` 回归该示例；`sm2-verification.test.ts` 与 `sm2-nonce.test.ts` 覆盖验签与随机数路径；`public-key-bytes-output-contract.test.ts` 核对签名容器 | 不覆盖其它 ID、曲线参数或完整标准测试集 |
| `sm2_encrypt` · `sm2_decrypt` | GB/T 32918.4-2016 附录 A 示例 2（输出 C1‖C3‖C2） | `procedures/SM2-Encrypt.json` 回归该示例；`public-key-bytes-output-contract.test.ts` 核对解密输出的 `Bytes` 容器 | 不覆盖其它参数集、密钥管理或侧信道 |
| `sm2_key_exchange` | GB/T 32918.3-2016 附录 A.2 示例 1（B 侧共享密钥） | `SM2-KeyExchange.json` 与 `sm2-key-exchange.test.ts` 覆盖该示例的单方向计算 | 未覆盖完整协议双方与密钥确认流程 |
| `rsa_keygen` · `rsa_encrypt` · `rsa_decrypt` · `rsa_sign` · `rsa_verify` | RFC 8017 PKCS#1 v1.5 加解密与 SHA-256 签名，外加项目自定义 `rsa_keygen`；教学参数为 512-bit 模数 | `procedures/RSA-Encrypt.json` 断言加解密往返（明文 `hello RSA`）、`RSA-Sign.json` 断言验签正/负例；`public-key-bytes-output-contract.test.ts` 与 `rsa-randomness.test.ts` 覆盖输出容器与随机性路径 | `rsa_keygen` 为项目自定义，不满足 FIPS 186-5 密钥生成要求；512-bit 模数不代表可用密钥长度；仓库内无第三方实现的交叉复算 |
| `crypto_encrypt_func` / `crypto_decrypt_func` | 函数模板预填 AES-128-ECB 加解密链，key 输入留空；链本身对应 FIPS 197 的 ECB 用法，但该块不是通用加密实现 | [`crypto-template-defaults.test.ts`](../../tests/unit/crypto-template-defaults.test.ts) 在 headless Blockly 中触发真实 `onchange` 预填、生成并执行 JS/Python：缺 16 字节 key 时两种语言都必须抛 `AES-128 key must be 16 bytes`；补入 FIPS 197 附录 C.1 的 key 后分别得到该附录密文与明文 | 只覆盖预填链与 C.1 单组向量；不证明任意密钥/长度、分组模式组合、侧信道或完整 AES 符合性，也不代表通用封装语义 |
| `crypto_hash_func` | 函数模板预填 `hash_sha256_pad(message)`；只输出填充结果，不含压缩与摘要路径；函数模板身份，无独立算法身份| 同一 [`crypto-template-defaults.test.ts`](../../tests/unit/crypto-template-defaults.test.ts) 双语言执行 `"abc"`，核对输出为 64 字节且满足 FIPS 180-4 §5.1.1 结构（`0x80` 终止符 + 512 位分组零填充 + 64 位大端比特长度），JS 与 Python 字节一致 | 只验证填充片段；不证明 SHA-256 摘要、多块填充或多长度输入，也不构成完整哈希实现证据 |

SM2 验签定向回归最近一次为 1 个文件、13 项通过；SM9 四块定向回归最近一次为 4 个文件、61 项通过。逐块条款到测试来源的全量台账、标准版本/勘误盘点及其它对象仍在 ITEM-1/ITEM-2 中继续核对。

**证据入口覆盖盘点（自动核对）**：218 个活动块**全部**在本表有逐块证据行（本轮补齐后为 **218 个**），其中相当一部分块的直接证据来自其登记的 Demo 而非独立单测；既无逐块证据行、也不被任何登记 Demo 执行的块为 **0 个**。`npm run verify:all` 会用同一口径重算并拒绝出现“零证据块”；该口径只证明“存在可追溯的证据入口”，不证明该证据已达到完整标准测试集，也不改变各行的“未由这些测试证明”边界。
| `gcm_gf128_mul` | SP 800-38D Algorithm 1（GF(2¹²⁸) 块乘法） | [`gcm-primitives-contract.test.ts`](../../tests/unit/gcm-primitives-contract.test.ts) 通过真实 Blockly 块在 JS/Python 执行 Test Case 3 派生乘法值 `5e2ec746…`，并核对两语言一致 | 只覆盖单块乘法与该派生向量；不覆盖多块 GHASH 全谱或其他域约定 |
| `gcm_ghash` | SP 800-38D Algorithm 2（GHASH_H(A, C)） | [`gcm-primitives-contract.test.ts`](../../tests/unit/gcm-primitives-contract.test.ts) 双语言执行单块 GHASH，并与 Test Case 3 标签推导值 `f38cbb1a…` 比对 | 单块输入；不覆盖 AAD/密文长度组合全谱、标签截断或认证流程 |
| `gcm_gctr` | SP 800-38D Algorithm 3（GCTR_K(ICB, X)） | [`gcm-primitives-contract.test.ts`](../../tests/unit/gcm-primitives-contract.test.ts) 双语言以 ICB = J0+1 复现 Test Case 3 密文块 `0388dace…`，且拒绝非 16 字节密钥 | 一个分组的 AES-128 路径；不覆盖其它密钥长度、调用上限或完整数据集 |
| `gcm_inc32` | SP 800-38D §6.2（inc32） | [`gcm-primitives-contract.test.ts`](../../tests/unit/gcm-primitives-contract.test.ts) 双语言核对低位回绕 `ffffffff→00000000` 与高位 96 位不变 | 仅两个输入的契约检查，不是标准向量集 |
| `gcm_j0` | SP 800-38D §7.1 Step 1（J0 派生） | [`gcm-primitives-contract.test.ts`](../../tests/unit/gcm-primitives-contract.test.ts) 双语言核对 96 位 IV → `iv‖0³¹‖1`；非 96 位分支与同工作区 GHASH 结果比对一致 | 非 96 位分支是一致性检查而非官方向量；不覆盖超长 IV 资源边界 |
| `hkdf_extract` | RFC 5869 §2.2（HKDF-Extract） | [`hkdf-primitives-contract.test.ts`](../../tests/unit/hkdf-primitives-contract.test.ts) 双语言执行附录 A.1 的 PRK `07770936…` | 只覆盖 HMAC-SHA-256 实例与空 salt 零兜底分支；不覆盖其他 Hash 或空 IKM 全谱 |
| `ccm_b0` | SP 800-38C §A.2 首块 B0 | [`ccm-primitives-contract.test.ts`](../../tests/unit/ccm-primitives-contract.test.ts) 双语言核对附录 C.1 公布的 B 首块 `4f101112 13141516 00000000 00000004` | 一个参数组合；不覆盖 AAD 长度编码分支（≥0xFF00）或其它 Tlen/Nlen |
| `ccm_counter_block` | SP 800-38C §A.3 计数器块 A_i | [`ccm-primitives-contract.test.ts`](../../tests/unit/ccm-primitives-contract.test.ts) 双语言核对 C.1 公布的 Ctr0 `07101112 13141516 00000000 00000000` 与 Ctr1 末位加一 | 两个计数器值；不覆盖计数器回绕或超长数据单元 |
| `ccm_cbc_mac` | SP 800-38C §A.2 CBC-MAC | [`ccm-primitives-contract.test.ts`](../../tests/unit/ccm-primitives-contract.test.ts) 双语言一致性与 16 字节输出；该 helper 是附录 C.1–C.3 官方向量所走的同一条路径（由 ccm_encrypt 用例覆盖） | 标准未公布 CBC-MAC 中间值，本行不能替代 CCM 端点官方向量或完整符合性 |
| `ccm_ctr` | SP 800-38C §A.3 计数器模式 | [`ccm-primitives-contract.test.ts`](../../tests/unit/ccm-primitives-contract.test.ts) 双语言复现 C.1 公布密文段 `7162015b` | 单块明文、单一 Tlen/Nlen；不覆盖多块或部分块 |
| `cmac_double` | SP 800-38B §6.1 子密钥加倍 | [`cmac-xts-primitives-contract.test.ts`](../../tests/unit/cmac-xts-primitives-contract.test.ts) 双语言执行 RFC 4493 §4 的 L→K1→K2 | 单次加倍链；不覆盖其它密钥或 SM4 分支 |
| `cmac_subkeys` | SP 800-38B §6.1 子密钥生成（AES-128） | [`cmac-xts-primitives-contract.test.ts`](../../tests/unit/cmac-xts-primitives-contract.test.ts) 双语言复现 RFC 4493 §4 的 K1‖K2 | 仅 AES-128；SM4-CMAC 子密钥不在本块范围 |
| `xts_tweak_mul` | SP 800-38E / IEEE 1619 tweak ×α | [`cmac-xts-primitives-contract.test.ts`](../../tests/unit/cmac-xts-primitives-contract.test.ts) 双语言核对 0、低位 1 与最高位进位（0x87 约化）三个手算样例 | 三个样例的接口契约；不覆盖多块 tweak 序列或 XTS 端点到其它向量 |
| `pbkdf2_f` | RFC 8018 §5.2 单块函数 F | [`pbkdf2-f-contract.test.ts`](../../tests/unit/pbkdf2-f-contract.test.ts) 双语言执行 RFC 7914 §11 向量的首块（c=1），并以 Python `hashlib.pbkdf2_hmac` 独立复算 c=4096、i=1 的结果 | 仅 HMAC-SHA256 与两档迭代数；不覆盖 SM3 变体、其它 i 或整条 DK 组合 |
| `hkdf_expand` | RFC 5869 §2.3（HKDF-Expand） | [`hkdf-primitives-contract.test.ts`](../../tests/unit/hkdf-primitives-contract.test.ts) 双语言执行附录 A.1 的 OKM（L=42），并核对与 Extract 组合后的完整 HKDF 值、拒绝 L>8160 | 单实例、单 info 长度；不覆盖其它 Hash、任意 info 长度或正式算法验证 |

### 跨切面的运行时输出类型检查

[`symmetric-bytes-output-contract.test.ts`](../../tests/unit/symmetric-bytes-output-contract.test.ts) 通过 Blockly 生成并执行双语言代码，检查 `mode_ecb_encrypt`、`mode_ecb_decrypt`、`mode_cbc_encrypt`、`mode_ctr_encrypt`、`gcm_encrypt`、`ccm_encrypt`、`xts_encrypt` 和 AES/SM4 `cmac_mac` 的公开结果分别为 JavaScript `Uint8Array`、Python `bytes`。[`pq-bytes-output-contract.test.ts`](../../tests/unit/pq-bytes-output-contract.test.ts) 对 `pq_byte_concat`、`pq_bytes_slice`、`pq_seed_with_nonce`、`hash_chain`、`merkle_leaf`、`merkle_node`、`merkle_root`、`merkle_auth_path`、`slh_addr`、`fors_root` 做相同的容器类型核验。[`hash-bytes-output-contract.test.ts`](../../tests/unit/hash-bytes-output-contract.test.ts) 对 16 个哈希族公开输出块作相同的容器类型核验；[`kdf-parameter-contract.test.ts`](../../tests/unit/kdf-parameter-contract.test.ts) 另核验 HKDF/PBKDF2 输出容器及列明的向量、参数边界。[`public-key-bytes-output-contract.test.ts`](../../tests/unit/public-key-bytes-output-contract.test.ts) 执行 ECDSA、EdDSA、SM2 签名/解密、SM9 签名、ML-DSA 签名及 RSA 密钥生成/加密/解密/签名的 Demo Procedure，并核对 SM9 主密钥/用户密钥由 [`sm9-keygen-range.test.ts`](../../tests/unit/sm9-keygen-range.test.ts) 直接检查。以上交叉检查只证明所列 `TYPE_BYTES` 出口的运行时容器映射，不增加密码算法向量或标准符合性证据；当前余下 9 个仅 Demo 路径覆盖的 Bytes 块见上表。

## 维护规则

新增/删除块、模板或 Demo 时，同步检查：注册身份、生成语言、适用类别、规范/无直接规范依据的说明、输入输出契约、测试依据和结果。注册总数改变不是单独的覆盖证明；门禁需在 ITEM-7 中将实际注册集合与本清单进行机器校验。
