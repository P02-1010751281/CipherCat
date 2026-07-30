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
   - `data_text`："abc"（SHA-256 最经典测试向量）
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
   - `pq_cbd_ntt_vec`（K=2）：CBD(η₂) 采样 + NTT 变换 → 秘密向量 ŝ/ê
   - `pq_ntt_vec`（K=2）：对向量做 NTT 变换
   - `pq_sample_ntt_mat`（K=2）：从 seed 采样 NTT 矩阵 A ∈ Z_q^{K×K×256}
   - `pq_mat_vec_mul_ntt`（K=2）：A × ŝ 在 NTT 域
3. **调节 K**：K 下拉可选 2/3/4，对应 Kyber-512/768/1024
4. **生成代码**：点击「▶」选择 JavaScript

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `pq_cbd_ntt_vec` | CBD(η₂) 采样 + NTT | FIPS 203 §8.2 |
| `pq_ntt_vec` | 向量 NTT 域变换 | FIPS 203 §9.1 |
| `pq_sample_ntt_mat` | 伪随机 NTT 矩阵 A | FIPS 203 §9.3 |
| `pq_mat_vec_mul_ntt` | NTT 域矩阵×向量 | FIPS 203 §9.2 |


## 场景 5：函数封装（5 分钟）

### 目标
用 `crypto_func_def` 将原子块链封装为可复用函数——密码学教学的最终目标：**一次搭建，到处调用**。

### 步骤

1. **加载 demo**：导入 `demos/Procedure-AES-Round.json`
2. **观察结构**：
   - `crypto_func_def` 块：函数名 `AES_Round`，参数 `state: int_list` + `round_key: int_list`
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
| `crypto_func_def` | 定义带密码学类型参数的函数 |
| `crypto_encrypt_func`（模板） | 预置加密函数模板 |
| `crypto_decrypt_func`（模板） | 预置解密函数模板 |
| `crypto_return` | 显式返回语句 |

---
## 进阶：自我探索

### 展开原子块
右键→展开 可将高频块展开为其子块：
- `aes_round` 展开为 SubBytes→ShiftRows→MixColumns→AddRoundKey
- `sm4_round_func` 展开为 S-box + L 变换细节

### 自定义函数封装
1. 选中你搭建好的密码学流程
2. 用 `crypto_func_def` 模板封装为可复用函数
3. 设置参数类型（bytes / int_list / poly / seed）
4. 其他项目 → 右键导出 → 导入复用

### 类型系统
- `Bytes`（黄色）：Uint8Array / bytes — 密钥、密文、seed
- `IntList`（蓝色）：number[] / list[int] — 多项式系数、状态字
- `Number`（粉色）：Blockly 原生数字 — 标量参数

Blockly 自动检查连接类型——不匹配的连接会被阻止。

---

## 相关文档

- [积木块索引](./blocks/INDEX.md) — 全部 118 个块的完整列表（12 类目）
- [架构文档](./ARCHITECTURE.md) — 系统架构与数据流
- [开发指南](./DEVELOPMENT.md) — 环境搭建、添加新块
- [类型系统](./TYPE-SYSTEM.md) — 数据类型规范与转换规则
