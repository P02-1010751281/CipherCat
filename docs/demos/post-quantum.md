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

**相关指南**：ML-KEM-768（k=3）的复合块/纯基础块搭建见 [fips203-ML-KEM/guides/](../standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md)。

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
