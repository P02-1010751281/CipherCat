# AES 演示


> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 场景 2（单轮加密）+ 场景 5（函数封装），对应 `docs/DEMO.md` 索引。

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

## 手动拼装：AES 单轮加密（从零拖块）

1. **拖块**：工具箱「对称密码」→ 拖出 `aes_sub_bytes`（字节替换）
2. **连链**：依次把 `aes_shift_rows` 接到 SubBytes 输出 → `aes_mix_columns` → `aes_add_round_key`，得到 `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))))`
3. **状态输入**：拖 `data_value` 填 16 字节状态（IntList，如 `[0x00,0x01,...,0x0F]`）连到 `aes_sub_bytes`
4. **轮密钥**：`aes_add_round_key` 的 ROUND_KEY 输入拖 `data_value` 填 16 字节轮密钥
5. **生成代码**：▶ Generate
6. **验证**：输出 16 字节列表；单轮中间态与 FIPS-197 C.1 附录向量一致

> 完整 AES-128 = 10 轮 + 密钥扩展——用函数管理里的 AES 模板（自动注入 ctrl_iterate 循环）或手动拖 `ctrl_iterate` 展开。

---

## 对应标准指南

| 标准 | 指南 |
|------|------|
| FIPS 197 AES | 暂无搭建指南（标准原文与算法拆解见 [`standards/fips197-AES/`](../standards/fips197-AES/README.md)） |

> 已有搭建指南的标准见 [standards/COVERAGE.md](../standards/COVERAGE.md) 覆盖矩阵。
