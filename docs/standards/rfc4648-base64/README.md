# RFC 4648 — Base64 编码

来源: RFC 4648 — The Base16, Base32, and Base64 Data Encodings
      https://www.rfc-editor.org/rfc/rfc4648.txt
      全文: [rfc4648.txt](./rfc4648.txt)

## 相关块

| 块 | 说明 |
|----|------|
| `base64_encode` | Base64 编码 |
| `base64_decode` | Base64 解码 |

## 实现边界

块采用 RFC 4648 Base64 字母表和标准 `=` 填充；默认拒绝字母表以外字符、空白和缺失/错误填充。回归用例覆盖合法往返及非法输入拒绝。这些项目测试不是 RFC 认证或第三方验证。

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 4648 — Base64 编码**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `base64_encode` | — | — | — |
| `base64_decode` | — | — | — |

暂无示例工作区、模板或搭建指南。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
