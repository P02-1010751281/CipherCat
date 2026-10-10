# 端点级来源与参数范围矩阵（自动生成）

> 本文件由 `npm run endpoint-matrix:write` 从 `docs/standards/CONFORMANCE-INVENTORY.md` 的 Demo↔块映射表与
> `demos/evidence.json` 生成；`npm run verify:all` 会重算并逐字节比对，任一侧变更而未重新生成即失败。
> 它回答 ITEM-2 的“每个标准化端点是否有适用测试来源与参数范围”，但**不代表**任何一项已通过官方验证或认证。

| 端点（登记 Demo） | 覆盖块 | 证据类别 | 参数集/变体 | 依据 | 缺口（本行不能证明什么） |
|---|---|---|---|---|---|
| `procedures/SM4-Sbox.json` | `sm4_sbox` | `official-vector` | SM4-128 字节代换表 | GB/T 32907-2016 附录 A（S(0x01)=0x90） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SM3-Hash.json` | `data_value` · `hash_sm3_compress` · `hash_sm3_pad` | `official-vector` | SM3-256 | GB/T 32905-2016 A.1 SM3("abc") | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SM2-PointMul.json` | `ecc_load_curve_params` · `ecc_load_point` · `ecc_multiply` | `official-vector` | SM2 推荐曲线（256-bit） | GB/T 32918.5-2017（k·G） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SM2-Sign.json` | `data_value` · `sm2_sign` | `official-vector` | SM2 推荐曲线（256-bit）+ SM3 | GB/T 32918.2-2016 附录 A（ZA/e/r/s） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/ML-KEM-Encaps.json` | `data_value` · `keccak_state_init` · `pq_byte_concat` · `pq_byte_decode` · `pq_byte_encode` · `pq_bytes_slice` · `pq_compress` · `pq_decompress` · `pq_intt` · `pq_ntt` · `pq_ntt_mul` · `pq_poly_add` · `pq_prf` · `pq_sample_ntt` · `pq_sample_poly_cbd` · `pq_seed_with_nonce` · `sponge_absorb` · `sponge_pad` · `sponge_squeeze` | `fixed-regression` | ML-KEM-512（encapsulation；输出 c‖K） | 本工作区登记的输入/期望值是项目固定回归，不取自 ACVP；同一实现在 tests/unit/mlkem-acvp-official-vectors.test.ts 中用 NIST ACVP ML-KEM-encapDecap-FIPS203 internalProjection testGroup tgId=1（ML-KEM-512 encapsulation）的 tcId 1–3 单独核对 | 项目固定回归，未登记官方来源 |
| `procedures/CCM-Encrypt.json` | `ccm_encrypt` · `data_value` | `official-vector` | AES-128 CCM：Example 1（N=7B、A=8B、P=4B、Tlen=4）、Example 2（N=8B、A=16B、P=16B、Tlen=6）、Example 3（N=12B、A=20B、P=24B、Tlen=8） | SP 800-38C 附录 C Example 1、Example 2、Example 3 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/XTS-Encrypt.json` | `data_value` · `xts_encrypt` | `fixed-regression` | AES-128 XTS（32B key 拆两半、16B tweak、支持密文窃取） | IEEE 1619-2007 XTS-AES-128 经典向量（key=00..1f、tweak=00000000000000000102030405060708、64 字节数据单元）；该标准为付费文档且未随仓库分发，仓库内无可离线核对的来源，故不登记为官方向量 | 项目固定回归，未登记官方来源 |
| `procedures/X25519.json` | `data_value` · `x25519` | `official-vector` | Curve25519（32B 标量/u 坐标） | RFC 7748 §5.2 V1/V2 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/ASCON.json` | `ascon_encrypt` · `data_value` | `official-vector` | Ascon-AEAD128（固定样例）；Hash256/XOF128/CXOF128（ACVP 字节对齐用例，outLen ≤ 4096 字节子集） | NIST SP 800-232 Ascon AEAD128 文档示例（固定样例）；Hash256/XOF128/CXOF128 另对齐 NIST ACVP 官方用例（ACVP-Ascon-*-SP800-232，字节对齐子集，含 tgId/tcId） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/ASCON-Extended.json` | `ascon_cxof128` · `ascon_decrypt` · `ascon_hash256` · `ascon_xof128` · `data_value` | `fixed-regression` | — | 扩展固定样例与错误标签/参数拒绝；非完整 KAT | 项目固定回归，未登记官方来源 |
| `procedures/HKDF-SHA256.json` | `data_value` · `hkdf` | `official-vector` | HMAC-SHA-256，L=42 bytes | RFC 5869 A.1 Test Case 1 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/PBKDF2-SHA256.json` | `data_value` · `pbkdf2` | `cross-implementation` | PBKDF2-HMAC-SHA-256，dkLen=32 | 期望值取自 RFC 7914 §11 的 PBKDF2-HMAC-SHA-256 向量（含 password/salt/c/dkLen 与 33 字节尾块截断），并由 Python hashlib.pbkdf2_hmac 现场复算一致；RFC 7914 未作为标准目录随仓库跟踪，故按独立复算登记。RFC 6070 只提供 HMAC-SHA1 附录值，与本变体无关 | 独立实现交叉，非官方向量 |
| `procedures/PBKDF2-SM3.json` | `data_value` · `pbkdf2` | `fixed-regression` | — | SM3-HMAC/PBKDF2 组合为项目实现固定回归；未见公开官方向量登记 | 项目固定回归，未登记官方来源 |
| `procedures/GCM-Encrypt.json` | `data_value` · `gcm_encrypt` | `official-vector` | AES-128 GCM；96-bit IV、tagLen=128（ACVP tgId=1 全 15 例）；项目另有 120-bit IV/AAD 变体 | 算法定义见 NIST SP 800-38D；测试来源为 NIST ACVP AES-GCM 官方用例（tgId=1，encrypt、tagLen=128、96-bit IV，15 例，含 tcId；这 15 例均为空明文）。注意：SP 800-38D 正文与附录不含测试用例表，TC 编号属 GCM 规范（McGrew & Viega）体系 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/DRBG.json` | `data_value` · `drbg_generate` | `fixed-regression` | — | 3 个固定输出（直接生成/实例化后连续生成/重播种）；非完整 CAVP 套件 | 项目固定回归，未登记官方来源 |
| `procedures/EDDSA.json` | `data_value` · `eddsa_sign` · `eddsa_verify` | `official-vector` | Ed25519（32B 私钥/公钥、64B 签名） | RFC 8032 TEST 1-3 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/EEA3.json` | `data_value` · `zuc_keystream` | `official-vector` | ZUC-128 密钥流（128-bit key/IV） | GB/T 33133.2 附录 A.1 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/EIA3.json` | `data_value` · `zuc_eia3` | `official-vector` | ZUC-128 EIA3（128-bit key/IV，1 与 577 bit 消息） | GB/T 33133.3-2021 附录 B 示例 1、2（1/577 bit） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/ECDSA.json` | `data_value` · `ecdsa_sign` · `ecdsa_verify` | `official-vector` | NIST P-256 + SHA-256 + RFC 6979 确定性 k | RFC 6979 §A.2.5 P-256/SHA-256（"sample"/"test"） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/ARGON2.json` | `argon2_hash` · `data_value` | `official-vector` | Argon2d / Argon2i / Argon2id v1.3（RFC §5.1–5.3） | RFC 9106 §5.1–5.3 三组向量 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/GM-RNG.json` | `data_value` · `gm_rng` | `fixed-regression` | — | 固定输入/输出项目回归；非官方向量，也不是 RNG/熵源验证 | 项目固定回归，未登记官方来源 |
| `procedures/ML-DSA-Sign.json` | `data_value` · `mldsa_sign` · `mldsa_verify` | `official-vector` | ML-DSA-44（确定性签名，rnd=0，空上下文） | NIST ACVP ML-DSA-sigGen-FIPS204 internalProjection：ML-DSA-44、hashAlg=none 且空 context 的确定性用例，tgId=1 的 tcId 5、8（共 2 例） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SM9-Sign.json` | `data_value` · `sm9_master_key` · `sm9_sign` · `sm9_user_key` | `official-vector` | GB/T 38635.1-2020 系统参数（256-bit） | GB/T 38635.2-2020 附录 A | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/RSA-Encrypt.json` | `data_value` · `rsa_decrypt` · `rsa_encrypt` · `rsa_keygen` | `fixed-regression` | 项目教学参数：512-bit 模数（密文 64B）；`rsa_keygen` 为项目自定义，不满足 FIPS 186-5 密钥生成要求，也不代表可用密钥长度 | PKCS#1 v1.5 教学实现的加解密往返与长度固定回归（明文恢复 'hello RSA'）；仓库内无第三方实现交叉复算 | 项目固定回归，未登记官方来源 |
| `procedures/RSA-Sign.json` | `data_value` · `rsa_sign` · `rsa_verify` | `fixed-regression` | 项目教学参数：512-bit 模数（签名 64B）+ SHA-256 | PKCS#1 v1.5 SHA-256 教学实现的签名固定回归与验签正/负例（True/False）；仓库内无第三方实现交叉复算 | 项目固定回归，未登记官方来源 |
| `procedures/SM2-Encrypt.json` | `data_value` · `sm2_decrypt` · `sm2_encrypt` | `official-vector` | SM2 推荐曲线（256-bit）+ SM3 | GB/T 32918.4-2016 附录 A 示例 2 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/ECDH.json` | `data_value` · `ecdh_shared_secret` | `official-vector` | NIST P-256 ECDH | RFC 5903 §8.1（IKE P-256） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SHA224-Hash.json` | `hash_sha224_hash` | `official-vector` | SHA-224（全部字节导向用例） | FIPS 180-4 定义的 SHA-224；测试来源为 NIST CAVP shabytetestvectors 的 SHA224ShortMsg + SHA224LongMsg 全量字节导向用例（CAVS 11.0） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SHA384-Hash.json` | `hash_sha512_hash` | `official-vector` | SHA-384（全部字节导向用例） | FIPS 180-4 定义的 SHA-384；测试来源为 NIST CAVP shabytetestvectors 的 SHA384ShortMsg 全量字节导向用例（CAVS 11.0） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SHA512-Hash.json` | `hash_sha512_hash` | `official-vector` | SHA-512（全部字节导向用例） | FIPS 180-4 定义的 SHA-512；测试来源为 NIST CAVP shabytetestvectors 的 SHA512ShortMsg + SHA512LongMsg 全量字节导向用例（CAVS 11.0） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SHA3-Hash.json` | `sha3_hash` | `cross-implementation` | SHA3-256（1600-bit 状态、rate 1088） | FIPS 202 定义的 SHA3-256（rate=1088、capacity=512）在 "abc" 上的期望值经 Python hashlib 独立复算一致；135 字节用例是项目固定回归。FIPS 202 正文不含附录向量，官方参数化数据须走 CAVP/ACVTS | 独立实现交叉，非官方向量 |
| `procedures/AES-Round.json` | `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes` | `fixed-regression` | — | 正常轮 + 末轮（去 MixColumns）固定输入回归；不声称为官方完整加密向量 | 项目固定回归，未登记官方来源 |
| `procedures/AES-LastRound.json` | `aes_add_round_key` · `aes_shift_rows` · `aes_sub_bytes` | `fixed-regression` | — | 末轮固定输入回归；不声称为官方完整加密向量 | 项目固定回归，未登记官方来源 |
| `Procedure-AES-Round.json` | `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes` | `fixed-regression` | — | 显式值连接轮函数的固定输入回归 4807…c59f；非官方附录向量 | 项目固定回归，未登记官方来源 |
| `procedures/SM4-Round.json` | `sm4_round_func` | `official-vector` | SM4-128 轮函数（首轮密钥 0xf12186f9） | GB/T 32907-2016 附录 A 首轮输出 27FAD345（仅此轮向量） | 仅覆盖所列参数集/用例，非完整测试集 |
| `Procedure-SM4-Round.json` | `sm4_round_func` | `official-vector` | SM4-128 轮函数 | GB/T 32907-2016 附录 A 首轮输出 27FAD345 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/HMAC-SHA256.json` | `hash_hmac` | `official-vector` | HMAC-SHA-256（CAVP [L=32] 全量；Tlen 覆盖用例给定值） | HMAC 规范见 FIPS 198-1；测试来源为 NIST CAVP hmactestvectors 的 [L=32] 段（HMAC-SHA-256）全部 225 例（CAVS 11.0，按 Tlen 截断比较） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/SHA256-Hash.json` | `data_value` · `hash_sha256_compress` · `hash_sha256_pad` | `official-vector` | SHA-256（单块 pad→compress 路径；Len ≤ 440 bit） | FIPS 180-4 附录 A.2 指向的 NIST SHA-2 示例页（SHA-256(abc)）；另有 NIST CAVP SHA256ShortMsg 中单块（Len ≤ 440 bit）子集 | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/PBKDF2.json` | `data_value` · `pbkdf2` | `cross-implementation` | PBKDF2-HMAC-SHA-256，dkLen=32 | 期望值经 Python hashlib.pbkdf2_hmac 独立复算一致；非标准附录值 | 独立实现交叉，非官方向量 |
| `procedures/Mode-ECB.json` | `data_value` · `mode_ecb_encrypt` | `official-vector` | AES-128 ECB（单块；CAVP KAT 全例） | FIPS 197 附录 C.1（AES-128 ECB）；并逐例核对 NIST CAVP AESVS KAT 的 128-bit ECB 四文件（ECBGFSbox/ECBKeySbox/ECBVarKey/ECBVarTxt） | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/Mode-CBC.json` | `data_value` · `mode_cbc_encrypt` | `official-vector` | AES-128 CBC（16B key/IV） | SP 800-38A F.2.1 CBC-AES128.Encrypt | 仅覆盖所列参数集/用例，非完整测试集 |
| `procedures/Mode-CTR.json` | `data_value` · `mode_ctr_encrypt` | `official-vector` | AES-128 CTR（16B key、16B 初始计数器块） | SP 800-38A F.5.1 CTR-AES128.Encrypt | 仅覆盖所列参数集/用例，非完整测试集 |
| `AES-Atomic-Round.json` | `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes` · `data_value` | `fixed-regression` | — | 四个原子轮原语按工作区顺序原地修改共享状态，固定值 4807…c59f；非官方附录向量 | 项目固定回归，未登记官方来源 |
| `SM4-Atomic-Round.json` | `data_value` · `sm4_round_func` | `official-vector` | SM4-128 单轮 | GB/T 32907-2016 附录 A 首轮输出 27fad345 | 仅覆盖所列参数集/用例，非完整测试集 |
| `SHA256-Atomic-Hash.json` | `data_value` · `hash_sha256_compress` · `hash_sha256_pad` | `official-vector` | SHA-256 单块（<512-bit 消息） | NIST SHA-2 示例页（FIPS 180-4 A.2 引用）（SHA-256(abc)，pad→compress 链） | 仅覆盖所列参数集/用例，非完整测试集 |
| `ML-KEM-Atomic.json` | `data_value` · `pq_mat_vec_mul` · `pq_ntt` · `pq_sample_ntt` · `pq_sample_poly_cbd` | `property` | — | CBD 采样与 NTT 冲激响应性质；pq_mat_vec_mul 为非标准标量教学辅助 | 性质/结构断言，非官方向量 |
| `procedures/ML-DSA-Primitives.json` | `pq_decompose` · `pq_make_hint` · `pq_power2round` · `pq_sample_in_ball` · `pq_use_hint` | `property` | — | P2R 可逆、UseHint(MakeHint) 定理、InBall 计数（FIPS 204 定义） | 性质/结构断言，非官方向量 |
| `procedures/Hash-Based-Structures.json` | `hash_chain` · `merkle_leaf` · `merkle_node` · `merkle_root` · `slh_addr` | `property` | — | hash chain 边界与半群性、4 叶树根手工组合、ADRS 32B 确定性 | 性质/结构断言，非官方向量 |
| `procedures/Code-Based-Math.json` | `bin_mat_inv` · `bin_mat_mul` · `gf2_poly_div` · `gf2_poly_gcd` · `gf2_poly_mod` · `gf2_poly_mul` · `ham_dist` · `ham_weight` | `property` | — | GF(2) 多项式结合/除余重建/欧几里得、A·A⁻¹=I、d=wt(x⊕y) | 性质/结构断言，非官方向量 |
| `procedures/Multivariate-Math.json` | `comb` · `gauss_elim` · `gf2m_add` · `gf2m_inv` · `gf2m_mul` · `mv_quad_eval` | `fixed-regression` | — | 线性方程组、二次式、组合数与 GF(2⁸) 算例的项目固定输入回归；非标准 KAT | 项目固定回归，未登记官方来源 |
| `procedures/Wrap-Up-Math.json` | `fors_root` · `goppa_gen_poly` · `poly_scale` · `syndrome_calc` · `vec_dot` | `property` | — | 点积/多项式缩放、FORS 确定性、Goppa 多项式与 syndrome 算例（性质/固定回归） | 性质/结构断言，非官方向量 |
| `procedures/Research-Math.json` | `berlekamp_massey` · `gauss_pmf` · `lll_reduce` | `property` | — | LLL 行列式保持、离散高斯 PMF 对称归一、Berlekamp–Massey 重放性质 | 性质/结构断言，非官方向量 |
| `procedures/FORS-Sign.json` | `fors_pk_from_sk` · `fors_sign` · `fors_verify` | `property` | — | 项目内部往返、确定性、篡改检测；非 FIPS 205 KAT 或符合性证据 | 性质/结构断言，非官方向量 |
| `procedures/GF2m-Poly.json` | `gf2m_poly_add` · `gf2m_poly_eval` · `gf2m_poly_mod` · `gf2m_poly_mul` · `gf2m_poly_xgcd` · `goppa_gen_poly` | `property` | — | GF(2^m) 多项式零元/交换/结合、Bezout 恒等式、Goppa 根判定 | 性质/结构断言，非官方向量 |
| `procedures/Goppa-Decode.json` | `arr_slice` · `gf2m_poly_add` · `gf2m_poly_eval` · `gf2m_poly_mod` · `gf2m_poly_mul` · `gf2m_poly_xgcd` · `goppa_decode` · `goppa_gen_poly` | `property` | — | 根判定与逆元、syndrome 原子链已知值、无错/单错/双错往返、篡改不可纠 | 性质/结构断言，非官方向量 |
| `procedures/PQC-Gaps.json` | `nt_mod_pow` · `pq_poly_mul` · `pq_rej_sample` · `slh_adrs_full` · `wots_checksum` | `property` | — | Rej 边界排他、卷积代数律、mod 8380417 范围、ADRS 域分隔、WOTS csum 单调、费马同余 | 性质/结构断言，非官方向量 |
| `procedures/Tree-Index.json` | `fors_leaf_index` · `merkle_auth_path` · `merkle_node` · `merkle_root` · `slh_addr` | `property` | — | FORS 选叶分块、leaf+auth 重建根与全树根一致（idx ∈ {0,1,3,5,7}） | 性质/结构断言，非官方向量 |
| `procedures/ML-DSA-NTT.json` | `pq_intt` · `pq_ntt` · `pq_ntt_mul` | `property` | — | FIPS 204 Alg 41/42/45 定义下的往返与环乘同态性质；不是官方 NTT KAT 集 | 性质/结构断言，非官方向量 |
| `procedures/SM2-KeyExchange.json` | `sm2_key_exchange` | `official-vector` | SM2 推荐曲线（256-bit）+ SM3 | GB/T 32918.3-2016 附录 A.2 示例 1（B 侧共享密钥；未覆盖完整协议双方/确认流程） | 仅覆盖所列参数集/用例，非完整测试集 |
