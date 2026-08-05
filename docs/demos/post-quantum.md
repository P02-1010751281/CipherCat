# 后量子演示


> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 场景 4（ML-KEM 底层）+ 场景 9（ML-KEM.Encaps），对应 `docs/DEMO.md` 索引。

---

## 场景 4：ML-KEM 后量子底层（10 分钟）

### 目标
用原子块理解 ML-KEM 密钥生成的核心步骤：CBD 采样 → NTT 变换 → 矩阵生成 → 矩阵×向量。

### 步骤

1. **加载 demo**：导入 `demos/ML-KEM-Atomic.json`
2. **观察结构**：
   - 32-byte seed（ρ/σ 的 SHAKE-256 输出）
   - `pq_sample_poly_cbd`：CBD(η₂) 采样 → 秘密向量 ŝ/ê
   - `pq_sample_ntt`：从 seed 采样 NTT 矩阵 A ∈ Z_q^{K×K×256}
   - `pq_ntt`：对向量做 NTT 变换
   - `pq_mat_vec_mul`：A × ŝ 在 NTT 域
3. **生成代码**：点击「▶」选择 JavaScript

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `pq_sample_poly_cbd` | CBD(η₂) 采样 | FIPS 203 §4.2.2 |
| `pq_sample_ntt` | 伪随机 NTT 矩阵 A | FIPS 203 §4.2.2 |
| `pq_ntt` | 向量 NTT 域变换 | FIPS 203 §4.3 |
| `pq_mat_vec_mul` | NTT 域矩阵×向量 | FIPS 203 §4.3 |

---

## 场景 9：ML-KEM.Encaps（进阶，20 分钟）

### 目标
用后量子原子块搭完整 ML-KEM-512 Encaps 全链（k=2），验证 FIPS 203 官方向量。

### 步骤

1. **加载 demo**：导入 `demos/procedures/ML-KEM-Encaps.json`
2. **观察结构**（`procedures_defreturn` 参数 `ek: bytes` + `m: bytes`，STACK 存中间量，RETURN = c‖K）：
   - **H(ek)**：SHA3-256（keccak_state_init → sponge_pad(1088, 0x06) → absorb → squeeze 32）
   - **G(m‖H)**：SHA3-512（rate 576）→ 前 32B = K、后 32B = r
   - **t̂/rho 解码**：`pq_byte_decode`(d=12) 拆 ek → t0/t1 + rho
   - **A 矩阵**：4× `pq_sample_ntt`（rho‖i‖j，`pq_seed_with_nonce` 链式）
   - **噪声**：s/e1/e2 = `pq_sample_poly_cbd`(PRF(r, N))；ŝ = `pq_ntt`
   - **u/v**：`pq_ntt_mul` 点乘 + `pq_poly_add` 累加 → `pq_intt`；μ = Decompress(ByteDecode1(m))
   - **c1/c2**：`pq_compress`(d=10/4) → `pq_byte_encode` → concat
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：`node dist-verify/verify-demo.js demos/procedures/ML-KEM-Encaps.json --exec` → c（768B）‖K（32B）与 FIPS 203 参考一致

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

**官方向量验证**：`node dist-verify/verify-demo.js demos/procedures/ML-KEM-Encaps.json --exec` → `=== ALL VECTORS PASS ===`

---

## 场景 10：FORS 少时签名（FIPS 205 §8，20 分钟）

### 目标
理解 SPHINCS+ 的 FORS（森林少时签名）：k 棵 Merkle 树、消息按 4-bit 分块选叶、认证路径、森林根。

### 步骤

1. **加载 demo**：导入 `demos/procedures/FORS-Sign.json`
2. **观察结构**（`procedures_defreturn` 封装三个黑盒块）：
   - `FORS_Sign(sk_seed, m)`：sk_seed 32B + 消息摘要 m 2B（16 bit，按 4-bit 分块、块 0 最高位）→ **640B 签名**（4 树 × (32B 叶私钥 + 4×32B 认证路径)）
   - `FORS_PkFromSk(sk_seed)`：4 棵 FORS 树根 → `pk = H(ADRS(FORS_ROOTS) ‖ roots)`（与消息无关）
   - `FORS_Verify(pk, m, sig)`：由 sk + auth 重建树根 → 比对公钥
3. **选叶数学**：`fors_leaf_index(m, i)` 原子块——第 i 个 4-bit 块值即树内叶子索引（`demos/procedures/Tree-Index.json` 有分块断言：`0x3C A5` → [3, 12, 10, 5]）
4. **Merkle 证明**：`merkle_auth_path` 输出每层兄弟 → leaf + auth 用 `merkle_node` 链重建根 == `merkle_root` 全树根（Tree-Index demo 性质向量）
5. **验证**：`node dist-verify/verify-demo.js demos/procedures/FORS-Sign.json --exec` → 往返 / 确定性 / 篡改检测 PASS

### 涉及块
| 块 | 功能 |
|----|------|
| `fors_sign` / `fors_verify` / `fors_pk_from_sk` | FORS 黑盒三件套（FIPS 205 Alg 12-14） |
| `fors_leaf_index` | 消息 4-bit 块 → 叶子索引 |
| `merkle_auth_path` / `merkle_root` / `merkle_node` | Merkle 证明（认证路径 + 重建） |
| `slh_addr` / `slh_adrs_full` | ADRS 地址（SHAKE 域分隔） |

> 教学点：FORS 是"少时"签名——每对密钥只签少量消息；SPHINCS+ 用 Merkle 树聚合大量 WOTS+/FORS 密钥成树根。FORS 无独立官方向量（FIPS 205 KAT 为完整 SLH-DSA），性质向量覆盖。

---

## 场景 11：Goppa 码与 Patterson 译码（McEliece，20 分钟）

### 目标
理解编码基后量子签名的基础：Goppa 码构造（GF(2^m) 系数多项式）+ 错误纠正（Patterson 译码）。

### 步骤

1. **加载 demo**：导入 `demos/procedures/Goppa-Decode.json`（GF(16) 子域 [14,6,5] 码，t=2）
2. **码构造**（原子链，可拼装）：
   - `GOPPA_G(alphas)`：`goppa_gen_poly([13, 81])` → G = [176, 92, 1]（z² + 92z + 176），根在 13/81（`GOPPA_EVAL` 求值为 0 验证）
   - `GOPPA_INV(a, g)`：`gf2m_poly_xgcd` + `arr_slice` 解析 → (z−α)⁻¹ mod g（逆元验证 `u·(z−177) ≡ 1`）
   - `GOPPA_SYN(a, b, g)`：syndrome 原子链 = Σ (z−αᵢ)⁻¹ mod g —— **Patterson 的教学入口**
3. **译码**（黑盒）：`GOPPA_DEC(y, g, L)` → Patterson 完整算法：syndrome → sqrt(z+S⁻¹)（16×16 Frobenius 开方）→ 扩展欧几里得 → σ 求根定错位 → 翻转
4. **验证**：`node dist-verify/verify-demo.js demos/procedures/Goppa-Decode.json --exec` → 无错/单错/双错往返 + 篡改 G 不可纠 PASS

### 涉及块
| 块 | 功能 |
|----|------|
| `goppa_gen_poly` / `syndrome_calc` | Goppa 生成多项式 / 线性码 syndrome |
| `gf2m_poly_add/mul/mod/xgcd/eval` | GF(2^m) 系数多项式（Patterson 原语） |
| `goppa_decode` | Patterson 完整译码（黑盒） |
| `arr_slice` | xgcd 展平输出解析 |
| `gf2_poly_*` / `bin_mat_*` / `ham_*` | GF(2) 多项式 / 二进制矩阵 / 汉明量 |

> 教学点：特征 2 域中 syndrome 的**对数导数恒等式** S = σ′/σ 使错误定位子可解；Patterson 的扩展欧几里得迭代与 Frobenius 开方是数据依赖算法（黑盒承担），syndrome 侧原子链展示数学入口。
