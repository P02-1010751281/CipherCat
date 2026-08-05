# NIST SP 800-38C — CCM 认证加密模式

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
