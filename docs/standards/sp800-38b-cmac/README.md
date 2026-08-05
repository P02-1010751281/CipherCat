# NIST SP 800-38B — CMAC 认证模式

来源: NIST SP 800-38B — Recommendation for Block Cipher Modes: CMAC Mode for Authentication
      PDF: [NIST.SP.800-38B.pdf](./NIST.SP.800-38B.pdf)

## 关键算法

- **AES-CMAC**: 基于 AES 的消息认证码，用于数据完整性验证
- 可与任何 NIST 批准的分组密码配合使用

## 文档文件

- `01-CMAC.md` — CMAC 算法参考
- `NIST.SP.800-38B.pdf` — 标准原文

## 实现状态

✅ 已实现：`cmac_mac`（CIPHER 下拉：AES-128 / SM4），SP 800-38B 官方向量 + pycryptodome 交叉（双语言）。

> 版本注：NIST 2025-01 提案修订 SP 800-38B（去除 3DES 依赖）；现行版仍为 2005。
