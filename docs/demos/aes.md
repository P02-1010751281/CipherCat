# AES 演示


> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 场景 2（单轮加密）+ 场景 5（函数封装），对应 `docs/DEMO.md` 索引。

---

## 场景 2：AES 单轮变换（10 分钟）

### 目标
按 FIPS 197 §5.1 的顺序执行一次 AES 单轮变换。`AES-Atomic-Round.json` 将四个原语块放在工作区顶层，生成代码依次调用并原地修改共享状态；画布上没有值接口连线。显式数据流连接见 `demos/procedures/AES-Round.json`。

### 步骤

1. **加载 demo**：导入 `demos/AES-Atomic-Round.json`
2. **观察结构**：
   - `variables_set`：16 字节状态与轮密钥，分别保存在共享变量 `i`、`j`
   - 四个顶层原语：`aes_sub_bytes`、`aes_shift_rows`、`aes_mix_columns`、`aes_add_round_key`
3. **执行顺序**：生成代码按工作区顺序调用原语，逐步修改同一状态；画布中的值接口没有互相连接
4. **生成代码**：点击“生成”，选择 Python 或 JavaScript，再在自己的环境中运行
5. **验证**：仓库回归测试对给定状态和轮密钥检查结果 `4807f3cfdcc929d006f1297cdb24c59f`。这是固定输入的项目回归值，不是 FIPS 197 附录 C.1 完整加密向量。

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
用 `procedures_defreturn`（Blockly 函数定义）将 AES 单轮的原子块封装为可复用函数；此 Demo 使用值接口显式连接各阶段。

### 步骤

1. **加载 demo**：导入 `demos/Procedure-AES-Round.json`
2. **观察结构**：
   - `procedures_defreturn` 块：函数名 `AES_Round`，参数 `state: int_list` + `round_key: int_list`（经齿轮 ⚙ mutator 添加）
   - 返回链：`aes_add_round_key(aes_mix_columns(aes_shift_rows(aes_sub_bytes(state))), round_key)`
3. **生成代码**：点击「▶」选择 Python
4. **观察输出**：
   ```python
   def aes_round(state: list[int], round_key: list[int]) -> list[int]:
       """AES_Round"""
       # AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)
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
2. **连链**：将 `aes_sub_bytes` 接到状态输入，再依次嵌套 `aes_shift_rows`、`aes_mix_columns`，最外层用 `aes_add_round_key` 并连接轮密钥，得到 `AddRoundKey(MixColumns(ShiftRows(SubBytes(state))), round_key)`
3. **状态输入**：拖 `data_value` 填 16 字节状态（IntList，如 `[0x00,0x01,...,0x0F]`）连到 `aes_sub_bytes`
4. **轮密钥**：`aes_add_round_key` 的 ROUND_KEY 输入拖 `data_value` 填 16 字节轮密钥
5. **生成代码**：▶ Generate
6. **验证**：检查输出为 16 字节列表；固定输入回归值为 `4807f3cfdcc929d006f1297cdb24c59f`，不是 FIPS 附录 C.1 官方完整加密向量

> 本页演示的是单轮变换，不是完整 AES-128 加密接口。完整流程还要正确连接初始 AddRoundKey、密钥扩展产生的轮密钥、9 个普通轮和末轮。当前模板只提供单轮结构及空的密钥扩展循环骨架，没有完整、已验证的 AES-128 端到端模板。

---

## 对应标准指南

| 标准 | 指南 |
|------|------|
| FIPS 197 AES | 暂无搭建指南（标准原文与算法拆解见 [`standards/fips197-AES/`](../standards/fips197-AES/README.md)） |

> 已有搭建指南的标准见 [standards/COVERAGE.md](../standards/COVERAGE.md) 覆盖矩阵。
