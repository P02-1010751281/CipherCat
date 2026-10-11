# RFC 8032 — EdDSA 数字签名算法

来源: RFC 8032 — Edwards-Curve Digital Signature Algorithm (EdDSA)
      全文: [rfc8032.txt](./rfc8032.txt)
      在线原文: https://www.rfc-editor.org/rfc/rfc8032.txt

## 关键算法

- **Ed25519**: Curve25519 上的 EdDSA 签名，128-bit 安全级别
- **Ed448**: Curve448 上的 EdDSA 签名，224-bit 安全级别
- 使用 SHA-512 哈希 (Ed25519) 或 SHAKE256 (Ed448)

## 实现状态

✅ 已实现：`eddsa_sign` / `eddsa_verify`（Ed25519，RFC 8032 TEST 1-3 官方向量）。Demo：`demos/procedures/EDDSA.json`。

Ed448 未实现。

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 8032 — EdDSA 数字签名算法**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `eddsa_sign` | — | — | — |
| `eddsa_verify` | — | — | — |

示例工作区：`demos/procedures/EDDSA.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
