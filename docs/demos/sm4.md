# SM4 演示

> [English](./sm4.en.md) · [中文](./sm4.md)

> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 场景 1（轮函数）+ 场景 6（S-box 查表），对应 `docs/DEMO.md` 索引。

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

## 手动拼装：SM4 轮函数（从零拖块）

不导入 demo，从工具箱手动搭出场景 1 的轮函数：

1. **拖块**：工具箱「对称密码」类目 → 拖出 `sm4_round_func`（轮函数 F）
2. **连接状态字**：`sm4_round_func` 有 4 个状态字输入（X0-X3）+ 轮密钥 rk：
   - 拖 4 个 `data_value`（「数据」类目），分别填 32-bit 十六进制字（如 `0x01234567` / `0x89ABCDEF` / `0xFEDCBA98` / `0x76543210`）连到 X0..X3
   - 再拖 1 个 `data_value` 填轮密钥 rk（如 `0x01234567`）
3. **连接检查**：X0..X3/rk 均为 Number 类型，插头绿色即可连接
4. **线性变换**（可选）：拖 `sm4_linear_transform` 接到 F 输出，观察 L(B) 循环移位组合
5. **生成代码**：▶ Generate → JavaScript / Python
6. **验证**：输出为 4-word 整数列表（轮函数输出 = 新状态字）

> 对照：与 `demos/SM4-Atomic-Round.json` 块拓扑一致（demo 用 variables_set 存中间态，手拼用 data_value 直连）。

---

**官方向量验证**：`node dist-verify/verify-demo.js demos/procedures/SM4-Sbox.json --exec` → `=== ALL VECTORS PASS ===`
