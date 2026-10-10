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

✅ 已实现：`xts_encrypt` 支持整块与末尾部分块 ciphertext stealing；拒绝相同 K1/K2，数据单元限制为 16 字节至 16 MiB。Demo 核对 16、17、31、47 字节输入，属项目固定回归；IEEE 1619-2007 为付费文档且未随仓库分发，仓库内无第三方实现交叉复算。XTS 子密钥相同需在使用前拒绝，依据 [NIST FIPS 140-3 Implementation Guidance C.I](https://csrc.nist.gov/csrc/media/Projects/cryptographic-module-validation-program/documents/fips%20140-3/Archived/FIPS%20140-3%20IG%20%5B2024-12-20%5D.pdf)。Demo：`demos/procedures/XTS-Encrypt.json`。该回归不是 NIST 认证测试。

## 函数/原语索引

- [01-XTS.md](./01-XTS.md)：XTS 总览
- [02-Tweak.md](./02-Tweak.md)：tweak 与有限域加倍
- [03-Data-Unit.md](./03-Data-Unit.md)：数据单元与 ciphertext stealing 边界
