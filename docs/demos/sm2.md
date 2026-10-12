# SM2 演示


> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 椭圆曲线点乘示例，对应 [Demo 指南](../guides/DEMO.md)。

---

> 逐步块链以[分步拼装指南](../build/INDEX.md)为准；本页讲场景、输入输出与边界。

## 场景 8：SM2 点乘（10 分钟）

### 目标
用 ECC 语句块搭 sm2p256v1 曲线上的标量乘法，验证 GB/T 32918.5-2017 官方向量 k·G。

![在编辑器中导入 docs/demos/procedures/SM2-PointMul.json 后的工作区：SM2_PointMul 函数块与生成的 Python 代码](/docs-assets/demo-guides/sm2-demo-editor.png)

### 步骤

1. **加载 Demo**：导入 `demos/procedures/SM2-PointMul.json`
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

## 手动拼装：SM2 点乘 k·G（从零拖块）

1. **曲线参数**：工具箱「ECC」→ 拖 `ecc_load_curve_params`，填 SM2 推荐曲线参数（p/a/b/G/n，见 [GB/T 32918 SM2 标准目录](../standards/gbt32918-SM2/README.md)）
2. **基点**：拖 `ecc_load_point` 填 G 的 x/y 坐标
3. **标量乘**：拖 `ecc_multiply`，把曲线、基点、标量 k（`data_value`）依次连接
4. **生成代码**：▶ Generate（JS 生成器已用 BigInt——256-bit 域算术不会溢出）
5. **验证**：k·G 的 x 坐标 = `0x04ebfc71...`（GB/T 32918.5 官方向量）

> 对比：`demos/procedures/SM2-PointMul.json` 用函数封装同一链路；手拼版直接在工作区连线。

---

本页点乘示例使用仓库提供的固定输入，输出与 GB/T 32918.5 的 k·G 示例值一致。这是固定样例核对，不是完整算法验证。

---

## 对应标准指南

| 标准 | 指南 |
|------|------|
| GB/T 32918 SM2 | 暂无搭建指南（标准原文与算法拆解见 [`standards/gbt32918-SM2/`](../standards/gbt32918-SM2/README.md)） |

> 已有搭建指南的标准见 [standards/COVERAGE.md](../standards/COVERAGE.md) 覆盖矩阵。
