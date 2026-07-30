---
doc_type: audit-finding
id: 6
title: "Algorithm READMEs have widespread broken internal links"
severity: P1
nature: maintainability
confidence: high
recommendation: cs-issue
---

## 描述

多个算法规范目录的 `README.md` 中列出的文件链接与实际存在的文件不匹配。SHA-2、SM3、AES、SM4 四个核心算法的 README 共引用 14 个不存在的文件。

## 证据

| README | 引用不存在的文件 |
|--------|-----------------|
| `docs/fips180-4-SHA2/README.md` | `01-Functions-Constants.md`, `02-Preprocessing.md`, `03-HashComputation.md`（只有 `01-SHA2.md`） |
| `docs/gbt32905-SM3/README.md` | `01-Constants-Functions.md`, `02-Padding.md`, `03-MessageExpansion-Compression.md`, `04-Iteration-Appendix.md`（只有 `01-SM3.md`） |
| `docs/fips197-AES/README.md` | `03-MixColumns.md`, `04-AddRoundKey.md`, `06-InvCipher.md`, `07-Appendix-KeyExpansion-Examples.md`, `09-GF-Multiplication.md` |
| `docs/gbt32907-SM4/README.md` | `01-AlgorithmStructure.md`, `03-EncryptionKeySchedule.md` |

## 影响

用户按文档索引查找算法细节时点击死链接，信任度下降。对教学平台尤其严重——学生可能认为内容缺失而放弃学习路径。

## 修复方向

逐一核对 `docs/` 下所有算法目录的 README 与实际文件，更新链接或补齐缺失文件。
