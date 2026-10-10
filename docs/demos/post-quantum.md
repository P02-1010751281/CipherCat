# 后量子演示


> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 后量子原语、标量数学示例与 ML-KEM Encaps，对应 [Demo 指南](../guides/DEMO.md)。

---

> 逐步块链以[分步拼装指南](../build/INDEX.md)为准；本页讲场景、输入输出与边界。

## 场景 4：后量子原语与标量数学示例（10 分钟）

### 目标
分别观察几个 ML-KEM 相关原语，以及一个通用标量矩阵向量教学块。该工作区是独立示例集合，不构成 ML-KEM 密钥生成流程；标量矩阵向量块也不是 ML-KEM 的多项式环运算。

### 步骤

1. **加载 Demo**：导入 `demos/ML-KEM-Atomic.json`
2. **观察结构**：
   - `pq_sample_poly_cbd`：固定输入下的 CBD(η₂) 采样示例
   - `pq_sample_ntt`：固定 seed 下的 SampleNTT 示例
   - `pq_ntt`：独立的 256 项 NTT 变换示例
   - `pq_mat_vec_mul`：`[1,2,3,4] × [1,2] mod 3329 = [5,11]` 的标量教学示例；与上面原语互不构成算法链
3. **生成代码**：点击「▶」选择 JavaScript。各块是独立输入/输出示例，不代表完整 KeyGen 或符合性验证。

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `pq_sample_poly_cbd` | CBD(η₂) 采样示例 | FIPS 203 Algorithm 8 `SamplePolyCBD`（原语级示例，不是完整 KeyGen） |
| `pq_sample_ntt` | SampleNTT 示例 | FIPS 203 Algorithm 7 `SampleNTT`（原语级示例，不是完整矩阵生成） |
| `pq_ntt` | NTT 变换示例 | FIPS 203 Algorithm 9 `NTT`（原语级示例） |
| `pq_mat_vec_mul` | 标量模矩阵向量教学辅助 | 无标准映射；不属于 ML-KEM/ML-DSA 符合性证据 |

---

## 场景 9：ML-KEM.Encaps（进阶，20 分钟）

### 目标
用后量子原子块搭完整 ML-KEM-512 Encaps 全链（k=2），核对该参数集随仓库登记的 FIPS 203 参考样例。

### 步骤

1. **加载 Demo**：导入 `demos/procedures/ML-KEM-Encaps.json`
2. **观察结构**（`procedures_defreturn` 参数 `ek: bytes` + `m: bytes`，STACK 存中间量，RETURN = c‖K）：
   - **H(ek)**：SHA3-256（keccak_state_init → sponge_pad(1088, 0x06) → absorb → squeeze 32）
   - **G(m‖H)**：SHA3-512（rate 576）→ 前 32B = K、后 32B = r
   - **t̂/rho 解码**：`pq_byte_decode`(d=12) 拆 ek → t0/t1 + rho
   - **A 矩阵**：4× `pq_sample_ntt`（rho‖i‖j，`pq_seed_with_nonce` 链式）
   - **噪声**：s/e1/e2 = `pq_sample_poly_cbd`(PRF(r, N))；ŝ = `pq_ntt`
   - **u/v**：`pq_ntt_mul` 点乘 + `pq_poly_add` 累加 → `pq_intt`；μ = Decompress(ByteDecode1(m))
   - **c1/c2**：`pq_compress`(d=10/4) → `pq_byte_encode` → concat
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：把生成代码在本机运行，与本页登记的固定期望值比对；同一实现另与 NIST ACVP 的 ML-KEM-512 encapsulation 用例（tgId=1，tcId 1–3）逐字节一致。这些用例随仓库提供，但不是完整的 ACVP 验证会话或认证

### 涉及块
| 块 | 功能 |
|----|------|
| `pq_sample_ntt` / `pq_sample_poly_cbd` | SampleNTT / SamplePolyCBD |
| `pq_ntt` / `pq_intt` / `pq_ntt_mul` | NTT / 逆 NTT / 点乘 |
| `pq_poly_add` / `pq_compress` / `pq_byte_encode` | 多项式加 / 压缩 / 编码 |
| `pq_seed_with_nonce` / `pq_prf` / `pq_xof` | 非扩展种子 / PRF / SHAKE |
| sponge 系列 | SHA3-256/512 哈希 |

---

**相关指南**：ML-KEM-768（k=3）的复合块/纯基础块搭建见 [fips203-ML-KEM/guides/](../standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md)；ML-DSA 签名搭建见 [fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md](../standards/fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md)；ZUC 密钥流搭建见 [gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md](../standards/gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md)（国密流密码，非后量子）。完整覆盖矩阵见 [standards/COVERAGE.md](../standards/COVERAGE.md)。

---

## 手动拼装：ML-KEM 多项式采样（从零拖块）

1. **种子**：拖 `data_value` 填 32 字节 rho（seed）
2. **非扩展**：拖 `pq_seed_with_nonce`，把 rho + nonce（j‖i，链式拼接成 34 字节）连进去
3. **采样**：拖 `pq_sample_ntt`（SampleNTT），MODULUS 下拉选 `3329`
4. **CBD 采样**（可选）：`pq_sample_poly_cbd` + `pq_prf`，η 下拉 2/3（FIPS 203 Alg 8 直接消费 PRF 输出）
5. **NTT**：拖 `pq_ntt`（q=3329, n=256）——注意 t̂ 已是 NTT 域，**不可再过 NTT**
6. **生成代码**：▶ Generate
7. **验证**：系数 ∈ [0, 3329)，与 FIPS 203 参考实现一致

> 完整 Encaps 链（SampleNTT→CBD→INTT→Compress→ByteEncode）见 `demos/procedures/ML-KEM-Encaps.json` 与 ML-KEM-768 搭建指南。

---

本页示例是项目固定回归；同一实现另与仓库提供的 ML-KEM-512 ACVP 用例（tgId=1，tcId 1–3）逐字节一致。这是官方用例子集核对，不是完整 ACVP 验证或认证。

---

## 场景 10：FORS 教学变体（参考 FIPS 205 §8，20 分钟）

### 目标
观察 FORS 的基本结构概念：多棵 Merkle 树、消息分块选叶、认证路径和森林根。本项目工作区是自定义教学变体，不是兼容 FIPS 205 的 SLH-DSA 实现。

### 步骤

1. **加载 Demo**：导入 `demos/procedures/FORS-Sign.json`
2. **观察结构**（`procedures_defreturn` 封装三个黑盒块）：
   - `FORS_Sign(sk_seed, m)`：项目固定 `n=32,k=4,a=4`，输入 32B 种子和 2B 消息 → 640B 项目签名
   - `FORS_PkFromSk(sk_seed)`：按项目自定义 SHAKE 拼接规则派生 32B 值
   - `FORS_Verify(pk, m, sig)`：用同一项目规则重建并比较；这是内部自洽检查
3. **选叶数学**：`fors_leaf_index(m, i)` 原子块——第 i 个 4-bit 块值即树内叶子索引（`demos/procedures/Tree-Index.json` 有分块断言：`0x3C A5` → [3, 12, 10, 5]）
4. **Merkle 结构**：`merkle_auth_path` 和 `merkle_root` 展示通用树的认证路径与根重建关系，不等同 SLH-DSA 的 XMSS/FORS 节点算法
5. **验证**：运行生成代码，检查签名往返、确定性和篡改检测；这里只做内部自洽检查，FORS 是教学变体，不是 FIPS 205 实现

### 涉及块
| 块 | 功能 |
|----|------|
| `fors_sign` / `fors_verify` / `fors_pk_from_sk` | 项目自定义 FORS 教学变体；不是 FIPS 205 算法实现 |
| `fors_leaf_index` | 消息 4-bit 块 → 叶子索引 |
| `merkle_auth_path` / `merkle_root` / `merkle_node` | Merkle 证明（认证路径 + 重建） |
| `slh_addr` / `slh_adrs_full` | ADRS 前缀/部分字段教学编码，不具备完整标准地址语义 |

> 本页只检查签验往返、确定性和篡改拒绝等项目内部性质；不是官方向量，也不证明与 FIPS 205 兼容，FIPS 205 的标准实现尚未完成。
>
> **相关标准**：[standards/fips205-SLH-DSA/](../standards/fips205-SLH-DSA/)（FIPS 205 全算法索引 + ADRS/WOTS+/FORS 分解）。

---

## 场景 11：Goppa 码与 Patterson 译码（McEliece，20 分钟）

### 目标
本 Demo 展示 McEliece/Goppa 基于纠错码的公钥密码所用数学构件：Goppa 码构造（GF(2^m) 系数多项式）与错误纠正（Patterson 译码）。它不是签名算法，也不实现完整 KEM。

### 步骤

1. **加载 Demo**：导入 `demos/procedures/Goppa-Decode.json`（GF(16) 子域 [14,6,5] 码，t=2）
2. **码构造**（原子链，可拼装）：
   - `GOPPA_G(alphas)`：`goppa_gen_poly([13, 81])` → G = [176, 92, 1]（z² + 92z + 176），根在 13/81（`GOPPA_EVAL` 求值为 0 验证）
   - `GOPPA_INV(a, g)`：`gf2m_poly_xgcd` + `arr_slice` 解析 → (z−α)⁻¹ mod g（逆元验证 `u·(z−177) ≡ 1`）
   - `GOPPA_SYN(a, b, g)`：syndrome 原子链 = Σ (z−αᵢ)⁻¹ mod g —— **Patterson 的教学入口**
3. **译码**（黑盒）：`GOPPA_DEC(y, g, L)` → Patterson 完整算法：syndrome → sqrt(z+S⁻¹)（16×16 Frobenius 开方）→ 扩展欧几里得 → σ 求根定错位 → 翻转
4. **验证**：运行生成代码，检查无错/单错/双错往返以及篡改生成矩阵后不可纠；这是纠错码教学构件的自洽检查，不是完整 McEliece 密码系统

### 涉及块
| 块 | 功能 |
|----|------|
| `goppa_gen_poly` / `syndrome_calc` | Goppa 生成多项式 / 线性码 syndrome |
| `gf2m_poly_add/mul/mod/xgcd/eval` | GF(2^m) 系数多项式（Patterson 原语） |
| `goppa_decode` | Patterson 完整译码（黑盒） |
| `arr_slice` | xgcd 展平输出解析 |
| `gf2_poly_*` / `bin_mat_*` / `ham_*` | GF(2) 多项式 / 二进制矩阵 / 汉明量 |

> 教学点：特征 2 域中 syndrome 的**对数导数恒等式** S = σ′/σ 使错误定位子可解；Patterson 的扩展欧几里得迭代与 Frobenius 开方是数据依赖算法（黑盒承担），syndrome 侧原子链展示数学入口。
>
> **相关标准**：[standards/mceliece-goppa/](../standards/mceliece-goppa/)（McEliece/Goppa 码全算法索引 + 码构造/Patterson 译码分解）。
