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
