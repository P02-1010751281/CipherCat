# NIST SP 800-38C — CCM 认证加密模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-38C — Recommendation for Block Cipher Modes: CCM Mode for Authentication and Confidentiality
      PDF: [NIST.SP.800-38C.pdf](./NIST.SP.800-38C.pdf)

## 关键算法

- **AES-CCM**: CTR 加密 + CBC-MAC 认证的组合模式
- 提供机密性和认证性的 AEAD 方案

## 文档文件

- `01-CCM.md` — CCM 算法参考
- `NIST.SP.800-38C.pdf` — 标准原文

## 实现状态

✅ 已实现：`ccm_encrypt`，SP 800-38C 附录 C Example 1-3 官方向量（tagLen 4/6/8）+ pycryptodome 交叉。Demo：`demos/procedures/CCM-Encrypt.json`。

## 函数/原语索引

- [01-CCM.md](./01-CCM.md)：CCM 总览
- [02-Formatting.md](./02-Formatting.md)：B0、AAD 与计数器编码
- [03-CBC-MAC.md](./03-CBC-MAC.md)：认证链
- [04-CTR.md](./04-CTR.md)：CTR 加密与标签掩码
