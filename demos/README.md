# 🧪 Demo Workspaces

预构建的 Blockly 工作区示例都以**原子块**为基础：有些 Demo 用值接口连接算法阶段；AES 原子 Demo 则用顶层顺序调用和共享状态原地修改演示单轮。Procedure Demo 展示可复用函数封装；不使用便利封装块。

> 搭建步骤教程（按算法）：[docs/demos/](../docs/demos/)，索引 [docs/guides/DEMO.md](../docs/guides/DEMO.md)。本文件是工作区文件清单。

> 每个 Demo 的证据类别与依据登记在 [`evidence.json`](./evidence.json)：`official-vector`（标准附录或示例值）、`property`（代数或结构性质）、`fixed-regression`（项目固定回归，明确非官方向量）、`cross-implementation`（与独立实现交叉）。

## 原子块 Demo（顶层，无函数封装）

| Demo | 文件 | 原子块 |
|------|------|--------|
| SM4 轮函数 | `SM4-Atomic-Round.json` | `sm4_round_func`（单轮 F，内部含 S-box 和 L） |
| AES 单轮 | `AES-Atomic-Round.json` | 四个顶层原语按工作区顺序原地修改共享状态；四个原语互不相连，各自通过变量读写共享状态 |
| SHA-256 哈希 | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| 后量子原语与标量数学示例 | `ML-KEM-Atomic.json` | 独立展示 `pq_sample_poly_cbd`、`pq_ntt`、`pq_sample_ntt`；`pq_mat_vec_mul` 是非标准标量教学辅助，不属于 ML-KEM 运算 |

`SM4-Atomic-Round.json` 未单独放置 `sm4_linear_transform`；若要观察 L 原语，应使用独立的 4 字节输入，不要把它再接到已包含 L 的轮函数输出。

## Procedure 封装 Demo（含样例核对）

以下 demos 用 `procedures_defreturn`（自定义函数）封装原子块链，**不使用 `proc_*` 模板块**。每项的证据类型见 [`evidence.json`](./evidence.json)：标准附录或示例值、代数或结构性质、项目固定回归，部分算法另有独立实现交叉核对。这些核对只覆盖所列样例，不代表完整标准测试或算法认证。

| Demo | 文件 | 测试依据 |
|------|------|----------|
| SM4 S-box | `procedures/SM4-Sbox.json` | GB/T 32907-2016 附录 A（S(0x01)=0x90） |
| SM4 单轮 | `procedures/SM4-Round.json` | GB/T 32907-2016 附录 A（首轮输出 `27FAD345`；仅此轮向量） |
| SM3 哈希 | `procedures/SM3-Hash.json` | GB/T 32905-2016 A.1（SM3("abc")） |
| SHA-224 哈希 | `procedures/SHA224-Hash.json` | FIPS 180-4 附录 B（`abc`、空消息）；另有 Python 对 256 字节序列与 `hashlib` 对照，JS 对 135 字节输入检查重复运行确定性 |
| SHA-384 哈希 | `procedures/SHA384-Hash.json` | FIPS 180-4 附录 B（SHA-384(`abc`)） |
| SHA-512 哈希 | `procedures/SHA512-Hash.json` | FIPS 180-4 附录 B（SHA-512(`abc`)） |
| SHA3-256 哈希 | `procedures/SHA3-Hash.json` | FIPS 202 SHA3-256(`abc`) 已知答案；135 字节用例是项目固定回归，不是完整 KAT 集 |
| SM2 点乘 | `procedures/SM2-PointMul.json` | GB/T 32918.5-2017（k·G） |
| SM2 签名/验签 | `procedures/SM2-Sign.json` | GB/T 32918.2-2016 附录 A（ZA/e/r/s） |
| SM2 加密/解密 | `procedures/SM2-Encrypt.json` | GB/T 32918.4-2016 附录 A 示例 2 |
| SM2 密钥交换 | `procedures/SM2-KeyExchange.json` | GB/T 32918.3-2016 附录 A.2 示例 1（B 侧共享密钥；未覆盖完整协议双方/确认流程） |
| SM9 签名 | `procedures/SM9-Sign.json` | GB/T 38635.2-2020 附录 A 向量（Python/JavaScript 生成代码回归） |
| EdDSA | `procedures/EDDSA.json` | RFC 8032 TEST 1-3 |
| ECDSA | `procedures/ECDSA.json` | RFC 6979 P-256 sample/test |
| ECDH 共享密钥 | `procedures/ECDH.json` | RFC 5903 §8.1（IKE P-256） |
| X25519 | `procedures/X25519.json` | RFC 7748 §5.2 V1/V2 |
| ML-KEM.Encaps | `procedures/ML-KEM-Encaps.json` | 项目固定输入/输出回归（ML-KEM-512，输出布局 `c‖K`）；同一实现另有官方 ACVP 用例（ML-KEM-encapDecap-FIPS203 internalProjection tgId=1，tcId 1–3）在单测中核对，不是完整 ACVP 会话或认证 |
| ML-DSA 签名 | `procedures/ML-DSA-Sign.json` | 官方 ACVP 用例：ML-DSA-sigGen-FIPS204 internalProjection，ML-DSA-44 确定性（hashAlg=none、空 context）tgId=1 的 tcId 5、8，共 2 例；不是完整 ACVP 会话或认证 |
| RSA 加解密 | `procedures/RSA-Encrypt.json` | PKCS#1 v1.5 教学实现（512-bit 模数）；Demo 校验往返与输出容器，仓库内暂无第三方实现交叉复算 |
| RSA 签名 | `procedures/RSA-Sign.json` | PKCS#1 v1.5 SHA-256 教学实现（512-bit 模数）；Demo 校验验签结果，仓库内暂无第三方实现交叉复算 |
| DRBG | `procedures/DRBG.json` | 3 个固定输出，覆盖直接生成、实例化后连续生成与重播种；非完整 CAVP 套件 |
| 国密 RNG 教学路径 | `procedures/GM-RNG.json` | 固定输入/输出项目回归；非官方向量。双语言一致仅证明该样例的回归一致，不是独立正确性证据；非完整 RNG/熵源验证 |
| Argon2 | `procedures/ARGON2.json` | RFC 9106 三组向量 |
| HKDF | `procedures/HKDF-SHA256.json` | RFC 5869 |
| PBKDF2 基础示例 | `procedures/PBKDF2.json` | 固定输入/输出回归；不宣称完整标准测试向量 |
| PBKDF2-SHA256 | `procedures/PBKDF2-SHA256.json` | RFC 8018 |
| PBKDF2-SM3 | `procedures/PBKDF2-SM3.json` | GM/T 0091（SM3 变体） |
| ZUC EEA3 流加密 | `procedures/EEA3.json` | GB/T 33133.2 附录 A.1 |
| ZUC EIA3 消息完整性 | `procedures/EIA3.json` | GB/T 33133.3-2021 附录 B 示例 1、2（1/577 bit） |
| GCM | `procedures/GCM-Encrypt.json` | SP 800-38D Test Case 2、Test Case 13；另有项目自选的零 key/IV + 16B AAD 变体（非标准 TC）。**不含 TC3** |
| CCM | `procedures/CCM-Encrypt.json` | SP 800-38C 附录 C Example 1-3 |
| XTS | `procedures/XTS-Encrypt.json` | SP 800-38E + IEEE 1619-2007 |
| ASCON | `procedures/ASCON.json` · `procedures/ASCON-Extended.json` | 固定 AEAD / Hash / XOF 样例、空消息解密与错误标签/参数拒绝；非完整 1,089 项 AEAD KAT 或完整 Hash/XOF 套件 |

## Procedure 封装 Demo（PQC 数学基础 / 性质向量验证）

以下 demos 为后量子补全批次产物，用性质向量（数学恒等式 / 往返 / 确定性 / 篡改检测）双语言验证——无官方向量或黑盒算法用性质断言：

| Demo | 文件 | 性质向量 |
|------|------|----------|
| ML-DSA 签名原语 | `procedures/ML-DSA-Primitives.json` | P2R 可逆 `r=r1·2¹³+r0`、UseHint(MakeHint) 定理、InBall 恰 39 个 ±1 |
| ML-DSA NTT | `procedures/ML-DSA-NTT.json` | FIPS 204 Alg 41/42/45 定义下的往返与环乘同态性质；不是官方 NTT KAT 集 |
| 编码基数学 | `procedures/Code-Based-Math.json` | GF(2) 多项式结合/除余重建/欧几里得、A·A⁻¹=I、d=wt(x⊕y) |
| 哈希基结构 | `procedures/Hash-Based-Structures.json` | Chain(x,0)=x、半群性、4 叶树根手工组合、ADRS 32B 确定性 |
| FORS 教学变体（非标准兼容） | `procedures/FORS-Sign.json` | 项目内部往返、确定性、篡改检测；非 FIPS 205 KAT/符合性证据，sig 640B/pk 32B |
| GF(2^m) 系数多项式 | `procedures/GF2m-Poly.json` | 加法零元/交换/结合、乘法结合律、(a·b) mod b=0、Bezout 恒等式、Goppa 根判定 |
| Goppa 码 + Patterson | `procedures/Goppa-Decode.json` | G=[176,92,1] 根判定、逆元 u·(z−α)≡1、syndrome 原子链==已知值、无错/单错/双错往返、篡改 G 不可纠 |
| PQC 缺口补全 | `procedures/PQC-Gaps.json` | Rej 边界排他、卷积结合/交换/分配、mod 8380417 范围、ADRS 域分隔、WOTS csum 单调、费马 2^(q-1)≡1 |
| Merkle 树索引 | `procedures/Tree-Index.json` | FORS 选叶分块、leaf+auth 重建根 == 全树根（idx ∈ {0,1,3,5,7}） |
| 多元数学构件 | `procedures/Multivariate-Math.json` | 线性方程组、二次式、组合数及 GF(2⁸) 算例；项目固定输入回归，不是标准 KAT |
| 收尾数学构件 | `procedures/Wrap-Up-Math.json` | 点积/多项式缩放、FORS 确定性、Goppa 多项式和 syndrome 算例；性质/固定回归 |
| 研究数学构件 | `procedures/Research-Math.json` | LLL 行列式保持、离散高斯 PMF 对称归一、Berlekamp–Massey 重放性质 |

## Procedure 封装 Demo（结构展示 / 加载验证）

| Demo | 文件 | 封装内容 |
|------|------|----------|
| SM4 函数封装 | `Procedure-SM4-Round.json` | `procedures_defreturn` 封装 `sm4_round_func` → `SM4_Round(state_0..3, rk)` |
| AES 函数封装 | `Procedure-AES-Round.json` | 显式值连接 `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)`；固定输入回归值 `4807…c59f`，非官方附录向量 |
| AES 轮链 | `procedures/AES-Round.json` / `procedures/AES-LastRound.json` | 正常轮 + 末轮（去 MixColumns）；固定输入回归，不声称为官方完整加密向量 |
| SHA-256 哈希 | `procedures/SHA256-Hash.json` | 垫块 + 压缩函数链 |
| HMAC-SHA256 | `procedures/HMAC-SHA256.json` | HMAC 双哈希链 |
| HKDF / PBKDF2 | `procedures/HKDF-SHA256.json` / `procedures/PBKDF2.json` / `procedures/PBKDF2-SHA256.json` / `procedures/PBKDF2-SM3.json` | 密钥派生链 |
| 模式加密 | `procedures/Mode-ECB.json` / `procedures/Mode-CBC.json` / `procedures/Mode-CTR.json` | ECB/CBC/CTR 模式链 |

另有 `proc_mlkem_keygen` 可视化模板（Crypto Templates），不属于本目录的工作区文件。

## 验证方式

把工作区导入编辑器，生成 Python/JavaScript 代码，在本机运行后与「测试依据」列给出的来源核对。固定回归值不是官方向量；某个 Demo 通过只覆盖它登记的那组输入，不代表完整标准测试或算法认证。

## 使用方法

1. 打开编辑器 → 菜单「More → Import Workspace」→ 选择 `demos/` 下的 `.json` 文件
2. 观察块连接 → 「▶ Generate」查看 JS/Python 输出
3. Procedure Demo → 观察函数封装后如何在其他地方调用
