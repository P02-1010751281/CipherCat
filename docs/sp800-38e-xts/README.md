# NIST SP 800-38E — XTS 磁盘加密模式

来源: NIST SP 800-38E — Recommendation for Block Cipher Modes: XTS-AES Mode
      PDF: [NIST.SP.800-38E.pdf](./NIST.SP.800-38E.pdf)

## 关键算法

- **AES-XTS**: XEX-based Tweaked-codebook mode with ciphertext Stealing
- 专为磁盘/存储加密设计，支持独立扇区加解密

## 文档文件

- `full.txt` — PDF 全文提取 (297 lines)
- `extracted.md` — pdfplumber 结构化提取

## CipherCat 状态

未实现。XTS 用于磁盘/存储加密，支持任意长度数据且无需填充。
