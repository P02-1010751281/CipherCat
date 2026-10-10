# SM4 演示


> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 轮函数与 S-box 查表两个示例，对应 [Demo 指南](../guides/DEMO.md)。

---

> 逐步块链以[分步拼装指南](../build/INDEX.md)为准；本页讲场景、输入输出与边界。

## 场景 1：SM4 国密轮函数（5 分钟）

### 目标
观察 SM4 单轮函数 F。`sm4_round_func` 已在一个块内完成 S 盒代换和线性变换 L；本 Demo 不把 L 拆成第二个块。

### 步骤

1. **加载 Demo**：导入 `demos/SM4-Atomic-Round.json`
2. **观察结构**：
   - 四个输入变量 `i`、`j`、`k`、`m`：分别表示一个 32-bit 状态字，以 4 字节大端列表输入
   - `RK`：直接接入数值 `0xF12186F9`
   - 变量 `n` 接收 `sm4_round_func(i,j,k,m,RK)` 的 4 字节输出
   - `sm4_round_func` 计算 `F = X0 ⊕ L(τ(X1 ⊕ X2 ⊕ X3 ⊕ RK))`；S 盒与 L 已包含在该块中
3. **生成代码**：点击「▶」，选择 JavaScript 或 Python
4. **验证**：变量 `n` 为 `27fad345`，对应 GB/T 32907-2016 附录 A.1 的首轮输出；这只是单轮向量，不是完整加密测试套件

### 涉及原子块
| 块 | 功能 | 标准 |
|----|------|------|
| `sm4_round_func`（本工作区实际使用） | 完整单轮 F，包含 S 盒与 L | GB/T 32907-2016 §7.3 |
| `variables_set` / `variables_get` | 变量赋值/读取 | Blockly 内置 |

`sm4_linear_transform` 是另一个可用的原语块，但不在此工作区中。单独演示 L 时，搭建 `data_value(B) → sm4_linear_transform → variables_set(C)`，即可在生成代码中看到 C。输入 `B=[0x00,0x00,0x00,0x01]` 时，按标准式 (3) 得 `C=[0x01,0x04,0x04,0x05]`。不要把 L 接到 `sm4_round_func` 的输出，否则计算的是 `L(F(...))`，不是轮函数内部的 L。

---

## 场景 6：SM4 S-box 查表（3 分钟）

### 目标
用 `procedures_defreturn` 封装 `sm4_sbox` 原子块，核对 GB/T 32907-2016 附录 A 的 S-box 表。

### 步骤

1. **加载 Demo**：导入 `demos/procedures/SM4-Sbox.json`
2. **观察结构**：
   - `procedures_defreturn` 块：函数名 `SM4_Sbox`，参数 `x: int`
   - 函数体 RETURN：`sm4_sbox(x)` 查表
3. **生成代码**：点击「▶」选择 Python 或 JavaScript
4. **验证**：
   - Python：`SM4_Sbox(1)` → `144`（0x90）
   - 标准样例：S(0x01)=0x90（GB/T 32907-2016 附录 A）

### 涉及块
| 块 | 功能 |
|----|------|
| `sm4_sbox` | SM4 8×8 S-box 查找（GB/T 32907-2016） |
| `procedures_defreturn` | 定义带类型参数的函数 |

---

## 手动拼装：SM4 轮函数（从零拖块）

不导入 demo，从工具箱手动搭出场景 1 的轮函数：

1. **拖块**：工具箱「对称密码」类目 → 拖出 `sm4_round_func`（轮函数 F）
2. **连接状态字**：X0-X3 插槽接受 `IntList`，每个输入是一个 4 字节大端列表；例如 `[0x01,0x23,0x45,0x67]`。轮密钥 `RK` 插槽接受 `Number`，例如 `0xF12186F9`。
3. **连接检查**：确认 X0-X3 接入 4 字节列表，RK 接入数值；`sm4_round_func` 输出为 4 字节列表。
4. **单独观察 L（可选）**：另拖一个 `data_value` 提供 4 字节大端值 `B`，接到 `sm4_linear_transform`，再把其输出接入 `variables_set` 保存为 `C`。例如 `B=[0x00,0x00,0x00,0x01]` 时，`C=[0x01,0x04,0x04,0x05]`；不要把 L 接在完整 F 输出之后。
5. **生成代码**：▶ Generate → JavaScript / Python
6. **验证**：输出为 4 字节列表，按大端表示下一轮状态字 `X4`

> 对照：两种搭建都调用完整单轮 `sm4_round_func`；Demo 用变量保存四个输入并把结果写入 `n`，手拼方式可用 `data_value` 直接提供输入。

---

本页样例将工作区生成的结果变量 `n` 与 GB/T 32907-2016 附录 A.1 的首轮值 `27fad345` 对照；`SM4-Sbox.json` 另核对 S(0x01)=0x90。二者都只覆盖所列样例，不是完整算法认证。

---

## 对应标准指南

| 标准 | 指南 |
|------|------|
| GB/T 32907 SM4 | 暂无搭建指南（标准原文与算法拆解见 [`standards/gbt32907-SM4/`](../standards/gbt32907-SM4/README.md)） |
| GB/T 32905 SM3 | 暂无搭建指南（标准原文见 [`standards/gbt32905-SM3/`](../standards/gbt32905-SM3/README.md)） |

> 已有搭建指南的标准见 [standards/COVERAGE.md](../standards/COVERAGE.md) 覆盖矩阵。
