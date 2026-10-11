# GB/T 32907 — SM4 分组密码算法参考

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 32907-2016 — SM4分组密码算法
      PDF: [GBT-32907-2016-SM4.pdf](./GBT-32907-2016-SM4.pdf)

## 参数

| 参数 | 值 |
|------|-----|
| 分组长度 | 128 bit |
| 密钥长度 | 128 bit |
| 轮数 | 32 |

## 文件索引

| 序号 | 文件 | 名称 |
|:--:|------|------|
| 1 | [01-Overview.md](./01-Overview.md) | 算法概述 (§4–§5) |
| 2 | [02-RoundFunction.md](./02-RoundFunction.md) | 轮函数F (§6) |
| 3 | [03-Algorithm.md](./03-Algorithm.md) | 加密/解密/密钥扩展 (§7) |
| 4 | [04-Appendix.md](./04-Appendix.md) | 附录 运算示例 |

## 相关块

| 块 | 说明 |
|----|------|
| `sm4_round_func` | 轮函数 F |
| `sm4_linear_transform` | 线性变换 L |
| `proc_sm4_round` | 完整轮(含密钥异或)模板 |
| `proc_sm4_key_schedule` | 32轮密钥生成模板 |

> 算法主线见 [01-SM4.md](./01-SM4.md)，其余页面按标准章节拆分；原 PDF 保留用于逐条核验。

<!-- standard-body:start -->

## 标准内容

本目录对应 **GB/T 32907 — SM4 分组密码算法参考**，按标准条款拆分为 5 个结构化条目，覆盖 「GB/T 32907-2016 §4–§5」、「GB/T 32907-2016 — SM4 算法参考」、「SM4 — 6 轮函数 F」、「GB/T 32907-2016 §7，Eq. (4)–(8)」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [SM4 — 参数与算法结构](./01-Overview.md) | GB/T 32907-2016 §4–§5 | 参数与结构已用于实现映射 |
| [GB/T 32907-2016 — SM4 算法参考](./01-SM4.md) | GB/T 32907-2016 — SM4 算法参考 | 已实现（不代表完整标准覆盖） |
| [SM4 — 6 轮函数 F](./02-RoundFunction.md) | SM4 — 6 轮函数 F | 已实现（不代表完整标准覆盖） |
| [SM4 — 加密、解密与密钥扩展](./03-Algorithm.md) | GB/T 32907-2016 §7，Eq. (4)–(8) | 轮结构和密钥扩展可由模板拼装；高层实现状态见 README |
| [SM4 — 标准附录向量](./04-Appendix.md) | GB/T 32907-2016 附录 A（资料性） | 用于回归核验，不是新的算法块 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `sm4_sbox` | GB/T 32907 SM4 字节代换表查询；此表项本身不等于完整 SM4 轮函数或算法端点 | `sbox-block-contract.test.ts` 经真实 Blockly 块执行 JS/Python，逐项核对 0–255 全部 256 个 S-box 输出，并拒绝负数、256、分数和布尔输入 | 只验证表查询及输入域，不证明 `sm4_round_func`、密钥扩展、完整 SM4 标准向量或正式验证 |
| `sm4_round_func` | GB/T 32907-2016 轮函数 F（含 S 盒与线性变换 L） | `SM4-Atomic-Round.json`、`procedures/SM4-Round.json` 与 `Procedure-SM4-Round.json` 回归该标准附录 A 首轮输出 `27fad345`（`official-vector`）；`sm4-linear-transform.test.ts` 单独覆盖其中的线性变换 | 只覆盖首轮向量与线性变换；不证明密钥扩展、完整 SM4 或轮数之外的行为 |
| `sm4_linear_transform` | GB/T 32907-2016 轮函数式（3）的线性变换 `L`；详见标准拆分页 | `sm4-linear-transform.test.ts` 通过真实 Blockly 块执行 JS/Python，核验 `L(0x00000001)=0x01040405` | 仅一个固定输入，不覆盖全部输入域、完整 SM4 轮函数/密钥扩展向量或正式验证 |
| `sbox`(PRESET=SM4) | — | — | — |

示例工作区：`demos/SM4-Atomic-Round.json`、`demos/Procedure-SM4-Round.json`、`demos/procedures/SM4-Sbox.json`、`demos/procedures/SM4-Round.json`；Procedure 模板：`proc_sm4_round`、`proc_sm4_key_schedule（32 次空循环；无轮密钥计算）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
