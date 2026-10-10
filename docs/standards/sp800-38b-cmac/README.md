# NIST SP 800-38B — CMAC 认证模式

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST SP 800-38B — Recommendation for Block Cipher Modes: CMAC Mode for Authentication
      PDF: [NIST.SP.800-38B.pdf](./NIST.SP.800-38B.pdf)

## 关键算法

- **AES-CMAC**: 基于 AES 的消息认证码，用于数据完整性验证
- 可与任何 NIST 批准的分组密码配合使用

## 文档文件

- `01-CMAC.md` — CMAC 算法参考
- `NIST.SP.800-38B.pdf` — 标准原文

## 实现状态

✅ 已实现：`cmac_mac`（CIPHER 下拉：AES-128 / SM4）。AES-128 分支以 RFC 4493 与 SP 800-38B 共有的 AES-CMAC 示例值做双语言回归；SM4 分支目前只有密钥长度等契约检查，没有官方向量，仓库内无 pycryptodome 依赖或第三方交叉验证。

> 版本注：NIST 2025-01 提案修订 SP 800-38B（去除 3DES 依赖）；现行版仍为 2005。

## 函数/原语索引

- [01-CMAC.md](./01-CMAC.md)：CMAC 总览
- [02-Subkeys.md](./02-Subkeys.md)：`K1/K2` 子密钥
- [03-MAC.md](./03-MAC.md)：CBC-MAC 与标签输出
