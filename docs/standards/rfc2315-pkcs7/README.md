# RFC 2315 — PKCS#7 填充

来源: RFC 2315 §10.3 — PKCS #7: Cryptographic Message Syntax
      https://www.rfc-editor.org/rfc/rfc2315.txt
      全文: [rfc2315.txt](./rfc2315.txt)

## 相关块

| 块 | 说明 |
|----|------|
| `pad_pkcs7` | PKCS#7 填充 |

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 2315 — PKCS#7 填充**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `pad_pkcs7`（填充语义） | RFC 2315 §10.3：填充块长须为 1–255 bytes，填充值编码长度；整块输入仍追加完整填充块 | `symmetric-padding-mode-contract.test.ts` 真实 Blockly 双语测试覆盖 0/1/15/16/17-byte 输入、JS `Uint8Array` / Python `bytes` 输出及 0、负数、非整数、256 的拒绝 | 完整 RFC/实现测试集、对所有块长及超大输入的资源行为 |

暂无示例工作区、模板或搭建指南。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
