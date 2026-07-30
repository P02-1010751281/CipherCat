# NIST SP 800-38C — CCM 认证加密模式

来源: NIST SP 800-38C — Recommendation for Block Cipher Modes: CCM Mode for Authentication and Confidentiality
      PDF: [NIST.SP.800-38C.pdf](./NIST.SP.800-38C.pdf)

## 关键算法

- **AES-CCM**: CTR 加密 + CBC-MAC 认证的组合模式
- 提供机密性和认证性的 AEAD 方案

## 文档文件

- `full.txt` — PDF 全文提取 (1188 lines)
- `extracted.md` — pdfplumber 结构化提取

## CipherCat 状态

未实现。CCM 结合 CTR 模式的加密和 CBC-MAC 的认证，提供认证加密 (AEAD)。
