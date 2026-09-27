# Demo 指南


预构建的 Blockly 工作区示例以原子块为基础：顶层原子 Demo 直接展示块链，Procedure Demo 则把原子块链放入可复用函数中；不使用便利封装块。文档按算法拆分，对应 Demo 文件见 [demos/README.md](../../demos/README.md)：

| 算法 | 搭建步骤 | 对应 Demo 文件 |
|------|----------|----------------|
| SM4 | [demos/sm4.md](../demos/sm4.md) | `SM4-Atomic-Round.json` / `procedures/SM4-Sbox.json` |
| AES | [demos/aes.md](../demos/aes.md) | `AES-Atomic-Round.json` / `Procedure-AES-Round.json` |
| 哈希 | [demos/hash.md](../demos/hash.md) | `SHA256-Atomic-Hash.json` / `procedures/SM3-Hash.json` |
| SM2 | [demos/sm2.md](../demos/sm2.md) | `procedures/SM2-PointMul.json` |
| 后量子 | [demos/post-quantum.md](../demos/post-quantum.md) | `ML-KEM-Atomic.json` / `procedures/ML-KEM-Encaps.json` |

> 标准搭建指南：ML-KEM-768 Encaps → [fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md](../standards/fips203-ML-KEM/guides/ML-KEM-768-Encaps-搭建指南.md) · ML-DSA 签名 → [fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md](../standards/fips204-ML-DSA/guides/ML-DSA-Sign-搭建指南.md) · ZUC 密钥流 → [gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md](../standards/gbt33133-ZUC/guides/ZUC-KeyStream-搭建指南.md)
> 完整标准↔块↔Demo↔模板↔指南覆盖矩阵见 [standards/COVERAGE.md](../standards/COVERAGE.md)。

---

## 快速开始

用户侧操作按[用户教程](./TUTORIALS.md)执行。本页用于按算法索引 Demo，并补充标准向量、原子块链和函数封装信息。

1. 打开编辑器 → 菜单“更多 → 导入工作区” → 选择 `demos/` 下的 `.json` 文件；
2. 检查块连接 → 点击“生成”查看 JavaScript/Python 输出；
3. 打开函数封装 Demo，检查函数在其他流程中的调用方式。

![“更多”菜单中的导入工作区入口（界面示例）](/docs-assets/tutorials/03-import-menu.png)

_图：先从“更多”菜单选择导入工作区。_

![导入的 AES 原子轮工作区（界面截图）](/docs-assets/tutorials/04-editor-imported.png)

_图：工作区中可见已导入的 AES 原子块链。点击“生成”后会显示相应代码。_

![生成的 Python 代码（界面截图）](/docs-assets/tutorials/05-generated-python.png)

_图：生成面板展示当前工作区对应的 Python 代码。_

## Demo 验证状态

当前登记的 59 个 Demo 均由自动化 harness 检查 Python 和 JavaScript 生成代码。测试规格包括标准向量、性质断言和独立实现交叉验证；命令和结果见 [demos/README.md](../../demos/README.md)。

---

## 进阶：自我探索

### 原子块串联
下列轮函数示例使用原子块直接串联（便利组合块已移除）：
- AES 原子 Demo 按工作区顺序对共享状态调用四个原语；显式值连接单轮见 `demos/procedures/AES-Round.json`。
- SM4 轮函数 = `sm4_round_func`（含 S-box + L 变换细节）

### 自定义函数封装
1. 选中当前密码学流程；
2. 使用 `procedures_defreturn` 封装为可复用函数；
3. 设置参数类型（`Bytes` / `IntList` / `Poly` / `Seed`）；
4. 通过导出和导入操作在其他项目中复用。

### 数据类型与连接

类型会影响积木是否能连接，也表示数据的用途。基础类型说明见[用户指南中的数据类型与积木连接](./USER-GUIDE.md)；生成器映射、值域和完整兼容规则见[开发文档中的类型系统规范](./TYPE-SYSTEM.md)。

---

## 相关文档

- [Demo 文件清单](../../demos/README.md) — 全部预构建工作区文件 + 测试规格验证命令
- [积木块索引](../blocks/INDEX.md) — 全部自定义积木块的完整列表
- [架构文档](./ARCHITECTURE.md) — 系统架构与数据流
- [开发指南](./DEVELOPMENT.md) — 环境搭建、添加新块
- [类型系统规范](./TYPE-SYSTEM.md) — 面向开发者的类型映射、值域与转换规则
