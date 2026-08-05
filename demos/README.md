# 🧪 Demo Workspaces

预构建的 Blockly 工作区示例，全部使用**原子块**（无便利封装），展示密码学底层原语。

> 搭建步骤教程（按算法）：[docs/demos/](../docs/demos/)，索引 [docs/DEMO.md](../docs/guides/DEMO.md)。本文件为文件清单 + 验证命令。

## 原子块 Demo（顶层，无函数封装）

| Demo | 文件 | 原子块 |
|------|------|--------|
| SM4 轮函数 | `SM4-Atomic-Round.json` | `sm4_round_func` + `sm4_linear_transform` |
| AES 单轮 | `AES-Atomic-Round.json` | `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key` |
| SHA-256 哈希 | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| ML-KEM 底层 | `ML-KEM-Atomic.json` | `pq_sample_poly_cbd` + `pq_ntt` + `pq_sample_ntt` + `pq_mat_vec_mul` |

## Procedure 封装 Demo（官方向量验证通过）

以下 demos 用 `procedures_defreturn`（自定义函数）封装原子块链，**不使用 `proc_*` 模板块**；生成代码（Python + JavaScript）经 `scripts/verify-demo.ts --exec` 实测通过官方测试向量（56 项向量，见 `demos/tests.json`）：

| Demo | 文件 | 官方向量 |
|------|------|----------|
| SM4 S-box | `procedures/SM4-Sbox.json` | GM/T 0002-2012（S(0x01)=0x90） |
| SM3 哈希 | `procedures/SM3-Hash.json` | GB/T 32905-2016 A.1（SM3("abc")） |
| SM2 点乘 | `procedures/SM2-PointMul.json` | GB/T 32918.5-2017（k·G） |
| SM2 签名/验签 | `procedures/SM2-Sign.json` | GB/T 32918.2-2016 附录 A（ZA/e/r/s） |
| SM2 加密/解密 | `procedures/SM2-Encrypt.json` | GB/T 32918.4-2016 附录 A 示例 2 |
| SM9 签名 | `procedures/SM9-Sign.json` | GB/T 38635.2-2020 附录 A + Go 交叉 |
| EdDSA | `procedures/EDDSA.json` | RFC 8032 TEST 1-3 |
| ECDSA | `procedures/ECDSA.json` | RFC 6979 P-256 sample/test |
| ECDH 共享密钥 | `procedures/ECDH.json` | RFC 5903 §8.1（IKE P-256） |
| X25519 | `procedures/X25519.json` | RFC 7748 §5.2 V1/V2 |
| ML-KEM.Encaps | `procedures/ML-KEM-Encaps.json` | FIPS 203（ML-KEM-512，c‖K） |
| ML-DSA 签名 | `procedures/ML-DSA-Sign.json` | FIPS 204 ACVP sigGen 30/30 |
| RSA 加解密 | `procedures/RSA-Encrypt.json` | PKCS#1 v1.5 + cryptography 双向交叉 |
| RSA 签名 | `procedures/RSA-Sign.json` | PKCS#1 v1.5 SHA-256 + cryptography 交叉 |
| DRBG | `procedures/DRBG.json` | SP 800-90A CAVP 480/480 |
| 国密 RNG | `procedures/GM-RNG.json` | GM/T 0103（SM3-HMAC-DRBG） |
| Argon2 | `procedures/ARGON2.json` | RFC 9106 三组向量 |
| HKDF | `procedures/HKDF-SHA256.json` | RFC 5869 |
| PBKDF2 | `procedures/PBKDF2-SHA256.json` `procedures/PBKDF2-SM3.json` | RFC 8018 / GM/T 0091（SM3 同构） |
| ZUC EEA3 流加密 | `procedures/EEA3.json` | GB/T 33133.2 附录 A.1 |
| GCM | `procedures/GCM-Encrypt.json` | SP 800-38D TC2/TC3/TC16 |
| CCM | `procedures/CCM-Encrypt.json` | SP 800-38C 附录 C Example 1-3 |
| XTS | `procedures/XTS-Encrypt.json` | SP 800-38E + IEEE 1619-2007 |
| ASCON | `procedures/ASCON.json` | SP 800-232（ascon-c KAT 1089 例） |

## Procedure 封装 Demo（PQC 数学基础 / 性质向量验证）

以下 demos 为后量子补全批次产物，用性质向量（数学恒等式 / 往返 / 确定性 / 篡改检测）双语言验证——无官方向量或黑盒算法用性质断言：

| Demo | 文件 | 性质向量 |
|------|------|----------|
| ML-DSA 签名原语 | `procedures/ML-DSA-Primitives.json` | P2R 可逆 `r=r1·2¹³+r0`、UseHint(MakeHint) 定理、InBall 恰 39 个 ±1 |
| 编码基数学 | `procedures/Code-Based-Math.json` | GF(2) 多项式结合/除余重建/欧几里得、A·A⁻¹=I、d=wt(x⊕y) |
| 哈希基结构 | `procedures/Hash-Based-Structures.json` | Chain(x,0)=x、半群性、4 叶树根手工组合、ADRS 32B 确定性 |
| FORS 少时签名 | `procedures/FORS-Sign.json` | 往返（Verify(Sign)=True）、确定性、篡改检测、sig 640B/pk 32B |
| GF(2^m) 系数多项式 | `procedures/GF2m-Poly.json` | 加法零元/交换/结合、乘法结合律、(a·b) mod b=0、Bezout 恒等式、Goppa 根判定 |
| Goppa 码 + Patterson | `procedures/Goppa-Decode.json` | G=[176,92,1] 根判定、逆元 u·(z−α)≡1、syndrome 原子链==已知值、无错/单错/双错往返、篡改 G 不可纠 |
| PQC 缺口补全 | `procedures/PQC-Gaps.json` | Rej 边界排他、卷积结合/交换/分配、mod 8380417 范围、ADRS 域分隔、WOTS csum 单调、费马 2^(q-1)≡1 |
| Merkle 树索引 | `procedures/Tree-Index.json` | FORS 选叶分块、leaf+auth 重建根 == 全树根（idx ∈ {0,1,3,5,7}） |

## Procedure 封装 Demo（结构展示 / 加载验证）

| Demo | 文件 | 封装内容 |
|------|------|----------|
| SM4 函数封装 | `Procedure-SM4-Round.json` | `procedures_defreturn` 封装 `sm4_round_func` → `SM4_Round(state_0..3, rk)` |
| AES 函数封装 | `Procedure-AES-Round.json` | `procedures_defreturn` 封装四步 → `AES_Round(state, round_key)` |
| AES 轮链 | `procedures/AES-Round.json` / `procedures/AES-LastRound.json` | 全轮 + 末轮（去 MixColumns） |
| SHA-256 哈希 | `procedures/SHA256-Hash.json` | 垫块 + 压缩函数链 |
| HMAC-SHA256 | `procedures/HMAC-SHA256.json` | HMAC 双哈希链 |
| HKDF / PBKDF2 | `procedures/HKDF.json` / `procedures/PBKDF2.json` | 密钥派生链 |
| ML-KEM KeyGen | `proc_mlkem_keygen` 模板（Crypto Templates） | 密钥生成链（模板注入） |
| 模式加密 | `procedures/Mode-ECB.json` / `Mode-CBC.json` / `Mode-CTR.json` | ECB/CBC/CTR 模式链 |

## 验证方式

`npm run type-check` 后 `node dist-verify/verify-demo.js demos/procedures/<file> --exec`（需先 `npx vite build --config vite.verify.config.ts` 构建 harness）。期望值记录在 `demos/tests.json`。

## 使用方法

1. 打开编辑器 → 菜单「More → Import Workspace」→ 选择 `demos/` 下的 `.json` 文件
2. 观察块连接 → 「▶ Generate」查看 JS/Python 输出
3. Procedure demo → 观察函数封装后如何在其他地方调用
