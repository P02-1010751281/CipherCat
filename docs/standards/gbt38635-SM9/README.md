# GB/T 38635 — SM9 标识密码算法

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: GB/T 38635-2020 — 信息安全技术 SM9标识密码算法（2020-11-01 实施；行业标准前身为 GM/T 0044-2016）
      第1部分: [GBT+38635.1-2020.pdf](./GBT+38635.1-2020.pdf) · 第2部分: [GBT+38635.2-2020.pdf](./GBT+38635.2-2020.pdf)

## 组成

| 部分 | 内容 | 块实现 |
|------|------|----------|
| 第1部分 | 总则 | — |
| 第2部分 | 数字签名算法 | `sm9_sign` · `sm9_verify` ✅（GB/T 38635.2-2020 附录 A + Go 交叉） |
| 第3部分 | 密钥交换协议 | 未实现 |
| 第4部分 | 公钥加密算法 | 未实现 |
| 第5部分 | 参数定义 | — |

## 依赖

SM9 基于双线性对 (Weil/Tate pairing)，实现复杂度极高。
需 BN 曲线或 SM9 曲线上的 pairing 运算。

Demo：`demos/procedures/SM9-Sign.json`（`sm9_master_key` · `sm9_user_key` · `sm9_sign` · `sm9_verify`）。

> `01-SM9.md` 是从标准目录、曲线参数和签名流程整理的结构化参考；原 PDF 保留用于条款核验。

## 函数/原语索引

- [02-H1-H2-and-Parameters.md](./02-H1-H2-and-Parameters.md)：参数材料与 H1/H2
- [03-Signature.md](./03-Signature.md)：`sm9_sign` / `sm9_verify`
- [04-Protocol-Gaps.md](./04-Protocol-Gaps.md)：密钥交换、公钥加密和验证缺项
