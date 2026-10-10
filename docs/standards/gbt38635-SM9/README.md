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
