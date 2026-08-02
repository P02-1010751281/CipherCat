# SM2 演示

> [English](./sm2.en.md) · [中文](./sm2.md)

> [← 返回索引](../guides/DEMO.md) · [demo 文件清单](../../demos/README.md)
>
> 场景 8（点乘），对应 `docs/DEMO.md` 索引。

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

## 手动拼装：SM2 点乘 k·G（从零拖块）

1. **曲线参数**：工具箱「ECC」→ 拖 `ecc_load_curve_params`，填 SM2 推荐曲线参数（p/a/b/G/n，见 `gbt32918-SM2/` 标准目录）
2. **基点**：拖 `ecc_load_point` 填 G 的 x/y 坐标
3. **标量乘**：拖 `ecc_multiply`，把曲线、基点、标量 k（`data_value`）依次连接
4. **生成代码**：▶ Generate（JS 生成器已用 BigInt——256-bit 域算术不会溢出）
5. **验证**：k·G 的 x 坐标 = `0x04ebfc71...`（GB/T 32918.5 官方向量）

> 对比：`demos/procedures/SM2-PointMul.json` 用函数封装同一链路；手拼版直接在工作区连线。

---

**官方向量验证**：`node dist-verify/verify-demo.js demos/procedures/SM2-PointMul.json --exec` → `=== ALL VECTORS PASS ===`
