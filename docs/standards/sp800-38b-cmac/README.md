# NIST SP 800-38B — CMAC 认证模式

来源: NIST SP 800-38B — Recommendation for Block Cipher Modes: CMAC Mode for Authentication
      PDF: [NIST.SP.800-38B.pdf](./NIST.SP.800-38B.pdf)

## 关键算法

- **AES-CMAC**: 基于 AES 的消息认证码，用于数据完整性验证
- 可与任何 NIST 批准的分组密码配合使用

## 文档文件

- `full.txt` — PDF 全文提取 (1172 lines)
- `extracted.md` — pdfplumber 结构化提取

## 实现状态

未实现。CMAC 是基于分组密码的消息认证码 (MAC)，提供数据来源认证和完整性保护。
