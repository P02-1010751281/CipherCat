# GB/T 38635 — SM9 标识密码算法

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 38635-2020 — 信息安全技术 SM9标识密码算法（2020-11-01 实施；行业标准前身为 GM/T 0044-2016）
      第1部分: [GBT+38635.1-2020.pdf](./GBT+38635.1-2020.pdf) · 第2部分: [GBT+38635.2-2020.pdf](./GBT+38635.2-2020.pdf)

## 组成

| 部分 | 内容 | 块实现 |
|------|------|----------|
| 第1部分 | 总则 | 参数与通用机制参考，见 [参数与 H1/H2](./02-H1-H2-and-Parameters.md) |
| 第2部分第5章 | 算法参数与辅助函数 | 参数、H1/H2 已结构化整理；完整性仍须对照原文核验 |
| 第2部分第6章 | 数字签名算法 | `sm9_sign` · `sm9_verify`；附录 A 向量回归通过，范围与限制见 [签名条目](./03-Signature.md) |
| 第2部分第7章 | 密钥交换协议 | 未实现 |
| 第2部分第8章 | 密钥封装机制 | 未实现 |
| 第2部分第9章 | 公钥加密算法 | 未实现 |

## 依赖

SM9 标准定义双线性对 `e: G1 × G2 → GT`。本项目当前实现使用 BN 曲线上的 R-ate pairing；Weil、Tate 等是双线性对的其他构造，不能用来描述当前代码路径。

Demo 工作区 `demos/procedures/SM9-Sign.json` 含 `sm9_master_key`、`sm9_user_key` 和 `sm9_sign`。回归的双语驱动另直接调用 `sm9_verify` 检查附录 A 向量；Blockly 验签块本身的生成代码与拒绝路径也有回归覆盖。

> `01-SM9.md` 是从标准目录、曲线参数和签名流程整理的结构化参考；原 PDF 保留用于条款核验。

## 函数/原语索引

- [02-H1-H2-and-Parameters.md](./02-H1-H2-and-Parameters.md)：第 2 部分第 5.2–5.3.2.3 节参数材料与 H1/H2
- [03-Signature.md](./03-Signature.md)：`sm9_sign` / `sm9_verify`
- [04-Protocol-Gaps.md](./04-Protocol-Gaps.md)：密钥交换、公钥加密和验证缺项

<!-- standard-body:start -->

## 标准内容

本目录对应 **GB/T 38635 — SM9 标识密码算法**，按标准条款拆分为 8 个结构化条目，覆盖 「SM9 — 标识密码算法（签名部分）」、「GB/T 38635.2-2020 §5.2–§5.3.2.3 — 参数与 H1/H2 原语」、「GB/T 38635.1-2020 §5.5、§7.2.7、§7.2.9；GB/T 38635.2-2020 §6.2、§6.4（流程图：§6.3、§6.5）」、「SM9 — 未覆盖协议与验证缺项」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [SM9 — Identity-Based Signature Algorithm Overview](./01-SM9.en.md) | — | — |
| [SM9 — 标识密码算法（签名部分）](./01-SM9.md) | SM9 — 标识密码算法（签名部分） | 部分实现（不代表完整标准覆盖） |
| [SM9 — Parameters and H1/H2 Primitives](./02-H1-H2-and-Parameters.en.md) | — | — |
| [GB/T 38635.2-2020 §5.2–§5.3.2.3 — 参数与 H1/H2 原语](./02-H1-H2-and-Parameters.md) | GB/T 38635.2-2020 §5.2–§5.3.2.3 — 参数与 H1/H2 原语 | 仅参考（未映射为块实现） |
| [SM9 — Digital Signature and Verification](./03-Signature.en.md) | — | — |
| [SM9 — 数字签名与验签](./03-Signature.md) | GB/T 38635.1-2020 §5.5、§7.2.7、§7.2.9；GB/T 38635.2-2020 §6.2、§6.4（流程图：§6.3、§6.5） | 已有实现；下列测试覆盖不等同完整符合性结论、第三方算法验证或产品认证 |
| [SM9 — Unimplemented Protocols and Verification Gaps](./04-Protocol-Gaps.en.md) | — | — |
| [SM9 — 未覆盖协议与验证缺项](./04-Protocol-Gaps.md) | SM9 — 未覆盖协议与验证缺项 | 部分实现（不代表完整标准覆盖） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `sm9_master_key` | GB/T 38635.2-2020 §6.1：计算签名主公钥 `Ppub=[ks]P2`；见原文定位及参数条目 | `sm9-keygen-range.test.ts` 双语言检查输出长度、`ks` 边界和精确 `Uint8Array` / `bytes` 容器；`demos/tests.json` 的 SM9 附录 A 驱动还覆盖其在签名流程中的组合使用 | 独立主公钥已知答案集、完整系统参数生成/发布流程 |
| `sm9_user_key` | GB/T 38635.2-2020 §6.1：按签名用途 HID `0x01` 和身份提取关系生成 `deA`；见原文定位及参数条目 | `sm9-keygen-range.test.ts` 检查密钥标量、身份字节、边界及精确 `Uint8Array` / `bytes` 容器；`sm9-block-contract.test.ts` 检查块与双语言 HID 契约；`demos/tests.json` 的附录 A 驱动覆盖签名流程中的组合使用 | 完整 KGC 密钥管理、密钥发放与撤销流程 |
| `sm9_sign` | GB/T 38635.2-2020 §6.2，并按 GB/T 38635.1-2020 检查曲线点及域元素 | `sm9-randomness.test.ts` 双语言执行生成块，覆盖附录 A 向量、随机/指定标量、非规范/离曲线 `DS` 与 `Ppub`，以及 `Ppub` 非子群点和 `l=0` 故障注入分支；`public-key-bytes-output-contract.test.ts` 核对 Demo Procedure 签名输出容器 | 完整官方负例集合、独立熵源质量及正式算法验证 |
| `sm9_verify` | GB/T 38635.2-2020 §6.4，并按 GB/T 38635.1-2020 检查点编码、曲线与子群 | `sm9-verification.test.ts` 双语言执行生成块，覆盖附录 A 向量、篡改消息/身份/散列、非法长度与字节、非规范/离曲线输入及 `Ppub` 非子群点；`sm9-block-contract.test.ts` 核对 HID 契约；`sm9-randomness.test.ts` 通过实际生成的 SM9-Sign Blockly Procedure，核对附录 A 签名、`Ppub` 和 `ds` 已登记期望值，再将公开 `Bytes` 输出传入 Python 验签；另确认 `bytes`/`bytearray`/`tuple`/`list` 可用，非法容器/字节返回 `False` | 完整官方测试集、所有系统参数/密钥不一致情形及正式算法验证 |

示例工作区：`demos/procedures/SM9-Sign.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
