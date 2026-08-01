# CipherCat 演示指南

本指南通过 4 个实战场景带你从零搭建密码学流程——**全部使用原子块**，理解每个原语的底层实现。

---

## 场景 1：SM4 国密轮函数（5 分钟）

### 目标
用原子块搭建 SM4 的轮函数 F 和线性变换 L，理解国密标准 §7.3。

### 步骤

1. **加载 demo**：导入 `demos/SM4-Atomic-Round.json`
2. **观察结构**：
   - 5 个 `variables_set`：X0 X1 X2 X3（4 个 32-bit 状态字）+ RK（轮密钥）
   - `sm4_round_func`：F(X0,X1,X2,X3,rk) = (X0⊕X1⊕X2⊕X3⊕rk) 经 S-box + L 变换
   - `sm4_linear_transform`：L(B) = B ⊕ (B<<<2) ⊕ (B<<<10) ⊕ (B<<<18) ⊕ (B<<<24)
3. **生成代码**：点击「▶」选择 JavaScript
4. **验证**：输出为一个 4-word 整数列表（新的 X0 X1 X2 X3）

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `sm4_round_func` | F(X0,X1,X2,X3,rk) | GM/T 0002 §7.3 |
| `sm4_linear_transform` | L(B) 32-bit 循环移位组合 | GM/T 0002 §7.2.2 |
| `variables_set` / `variables_get` | 变量赋值/读取 | Blockly 内置 |

---

## 场景 2：AES 单轮加密（10 分钟）

### 目标
用 4 个原子块串联一次完整的 AES 轮，理解 FIPS 197 §5.1 的四步结构。

### 步骤

1. **加载 demo**：导入 `demos/AES-Atomic-Round.json`
2. **观察结构**：
   - `variables_set`：16-byte STATE + 16-byte ROUND_KEY
   - `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
3. **串联关系**：每个块的 STATE 输出连接到下一个块的 STATE 输入
4. **生成代码**：点击「▶」选择 Python
5. **验证**：输出为 16-word 整数列表（一轮后的状态矩阵）

### 涉及原子块
| 块 | 功能 | S-Box 标准 |
|----|------|------------|
| `aes_sub_bytes` | 16 字节 S-Box 替换 | FIPS 197 §5.1.1 |
| `aes_shift_rows` | 行循环移位 | FIPS 197 §5.1.2 |
| `aes_mix_columns` | GF(2⁸) 列混合 | FIPS 197 §5.1.3 |
| `aes_add_round_key` | 状态 ⊕ 轮密钥 | FIPS 197 §5.1.4 |

---

## 场景 3：SHA-256 哈希（5 分钟）

### 目标
对文本计算 SHA-256 哈希值，理解填充和压缩两步。

### 步骤

1. **加载 demo**：导入 `demos/SHA256-Atomic-Hash.json`
2. **观察结构**：
   - `data_value`："abc"（SHA-256 最经典测试向量）
   - `hash_sha256_pad`：填充（追加 1+0*+64-bit 长度），输出 512-bit 块列表
   - `hash_sha256_compress`：64 轮压缩（σ0 σ1 Σ0 Σ1 Ch Maj 位运算）
3. **生成代码**：点击「▶」选择 JavaScript
4. **验证**：输出 8×32-bit 整数 = 256-bit 哈希值

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `data_text` | UTF-8 文本输入 | — |
| `hash_sha256_pad` | SHA-256 消息填充 | FIPS 180-4 §5.1 |
| `hash_sha256_compress` | 64 轮压缩函数 | FIPS 180-4 §6.2 |

### 验证方法
SHA-256("abc") = `ba7816bf 8f01cfea 414140de 5dae2223 b00361a3 96177a9c b410ff61 f20015ad`。生成代码后运行对比。

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


## 场景 5：函数封装（5 分钟）

### 目标
用 `procedures_defreturn`（Blockly 原生函数定义）将原子块链封装为可复用函数——密码学教学的最终目标：**一次搭建，到处调用**。

### 步骤

1. **加载 demo**：导入 `demos/Procedure-AES-Round.json`
2. **观察结构**：
   - `procedures_defreturn` 块：函数名 `AES_Round`，参数 `state: int_list` + `round_key: int_list`（经齿轮 ⚙ mutator 添加）
   - 函数体内：`aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
3. **生成代码**：点击「▶」选择 Python
4. **观察输出**：
   ```python
   def aes_round(state: list[int], round_key: list[int]) -> list[int]:
       """AES_Round"""
       # SubBytes → ShiftRows → MixColumns → AddRoundKey
       ...
   ```
5. **调用**：在工作区 Flyout 中找到 `AES_Round` 函数块，拖出后传入 state 和 round_key

### 导出复用
- 右键函数块 → 「📤 导出函数块」→ 保存为 `.json`
- 其他项目 → Flyout 底部「📥 导入函数」

### 涉及块
| 块 | 功能 |
|----|------|
| `procedures_defreturn` | 定义带密码学类型参数的函数 |
| `crypto_encrypt_func`（模板） | 预置加密函数模板 |
| `crypto_decrypt_func`（模板） | 预置解密函数模板 |
| `crypto_return` | 显式返回语句 |

---

## 场景 6：SM4 S-box 查表（3 分钟）

### 目标
用 `procedures_defreturn` 封装 `sm4_sbox` 原子块，验证 GM/T 0002-2012 S-box 表。

### 步骤

1. **加载 demo**：导入 `demos/procedures/SM4-Sbox.json`
2. **观察结构**：
   - `procedures_defreturn` 块：函数名 `SM4_Sbox`，参数 `x: int`
   - 函数体 RETURN：`sm4_sbox(x)` 查表
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：
   - Python：`SM4_Sbox(1)` → `144`（0x90）
   - 官方向量：S(0x01)=0x90（GM/T 0002-2012 附录）

### 涉及块
| 块 | 功能 |
|----|------|
| `sm4_sbox` | SM4 8×8 S-box 查找（GM/T 0002-2012） |
| `procedures_defreturn` | 定义带类型参数的函数 |

---

## 场景 7：SM3 哈希（10 分钟）

### 目标
用原子块搭 SM3 填充 + 压缩，封装为 `SM3_Hash(msg)`，验证 GB/T 32905-2016 官方向量。

### 步骤

1. **加载 demo**：导入 `demos/procedures/SM3-Hash.json`
2. **观察结构**：
   - `procedures_defreturn` 块：函数名 `SM3_Hash`，参数 `msg: message`
   - 函数体 RETURN：`hash_sm3_compress(V=IV 常量, W=hash_sm3_pad(msg))`
   - IV 常量 = 8 个 32-bit 字（`0x7380166f, 0x4914b2b9, ...`）用 `data_value` 数组字面量
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：
   - Python：`SM3_Hash("abc")` → `66c7f0f4 62eeedd9 ... b0fb0e4e`
   - 官方向量：SM3("abc") = `66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0`（GB/T 32905-2016 A.1）

> 注意：demo 演示单块消息（≤55 字节）路径；多块消息需 `ctrl_iterate` 循环，留作扩展。

### 涉及块
| 块 | 功能 |
|----|------|
| `hash_sm3_pad` | SM3 消息填充（1‖0*‖64-bit 长度） |
| `hash_sm3_compress` | CF 压缩函数（64 轮，W/W′ 内部展开） |
| `data_value` | 原样透传表达式（IV 数组字面量） |

---

## 场景 8：SM2 点乘（10 分钟）

### 目标
用 ECC 语句块搭 sm2p256v1 曲线上的标量乘法，验证 GB/T 32918.5-2017 官方向量 k·G。

### 步骤

1. **加载 demo**：导入 `demos/procedures/SM2-PointMul.json`
2. **观察结构**（`procedures_defreturn` 含 STACK 语句 + RETURN 值）：
   - STACK：`ecc_load_curve_params`（sm2p256v1 a/b/p）→ `ecc_load_point`（G 坐标）→ `ecc_multiply`（k·G → 变量 R）
   - RETURN：变量 R（点 `{x, y}`）
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：
   - 输出 x = `04ebfc71 8e8d1798 ...`，y = `e858f9d8 1e5430a5 ...`
   - 官方向量：k·G 的 x 坐标与 GB/T 32918.5-2017 示例一致（k = `59276E27...`）

> JS 生成器已改用 BigInt——256-bit 域算术必须任意精度，普通 number 会溢出。

### 涉及块
| 块 | 功能 |
|----|------|
| `ecc_load_curve_params` | 设定曲线 a/b/p |
| `ecc_load_point` | 定义曲线点（G） |
| `ecc_multiply` | 倍加算法标量乘法 k·G |

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

## 官方向量验证（场景 6-9 通用）

全部 4 个 demo 的生成代码（Python + JavaScript）经 headless harness 实测通过官方测试向量：

```bash
npx vite build --config vite.verify.config.ts   # 构建 headless harness
node dist-verify/verify-demo.js demos/procedures/SM4-Sbox.json --exec
node dist-verify/verify-demo.js demos/procedures/SM3-Hash.json --exec
node dist-verify/verify-demo.js demos/procedures/SM2-PointMul.json --exec
node dist-verify/verify-demo.js demos/procedures/ML-KEM-Encaps.json --exec
```

`--exec` 模式加载工作区 → 生成 Python/JS → 追加测试 driver 执行 → 与 `demos/tests.json` 期望值比对。全部 PASS 输出 `=== ALL VECTORS PASS ===`。

---
## 进阶：自我探索

### 原子块串联
所有轮函数均为原子块直接串联（便利组合块已移除）：
- AES 单轮 = `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key`
- SM4 轮函数 = `sm4_round_func`（含 S-box + L 变换细节）

### 自定义函数封装
1. 选中你搭建好的密码学流程
2. 用 `procedures_defreturn` 封装为可复用函数
3. 设置参数类型（bytes / int_list / poly / seed）
4. 其他项目 → 右键导出 → 导入复用

### 类型系统
- `Bytes`（黄色）：Uint8Array / bytes — 密钥、密文、seed
- `IntList`（蓝色）：number[] / list[int] — 多项式系数、状态字
- `Number`（粉色）：Blockly 原生数字 — 标量参数

Blockly 自动检查连接类型——不匹配的连接会被阻止。

---

## 相关文档

- [积木块索引](./blocks/INDEX.md) — 全部 98 个自定义积木块的完整列表（13 类目，另有 27 个函数模板）
- [架构文档](./ARCHITECTURE.md) — 系统架构与数据流
- [开发指南](./DEVELOPMENT.md) — 环境搭建、添加新块
- [类型系统](./TYPE-SYSTEM.md) — 数据类型规范与转换规则
