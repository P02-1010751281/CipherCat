# NIST SP 800-38E — XTS 磁盘加密模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-38E — Recommendation for Block Cipher Modes: XTS-AES Mode
      PDF: [NIST.SP.800-38E.pdf](./NIST.SP.800-38E.pdf)

## 关键算法

- **AES-XTS**: XEX-based Tweaked-codebook mode with ciphertext Stealing
- 专为磁盘/存储加密设计，支持独立扇区加解密

## 文档文件

- `01-XTS.md` — XTS 算法参考
- `NIST.SP.800-38E.pdf` — 标准原文

## 实现状态

✅ 已实现：`xts_encrypt`，IEEE 1619-2007 经典向量（key=0/tweak=0/data=0 → 917cf69e...）+ cryptography 交叉。Demo：`demos/procedures/XTS-Encrypt.json`。

## 函数/原语索引

- [01-XTS.md](./01-XTS.md)：XTS 总览
- [02-Tweak.md](./02-Tweak.md)：tweak 与有限域加倍
- [03-Data-Unit.md](./03-Data-Unit.md)：数据单元与 ciphertext stealing 边界
