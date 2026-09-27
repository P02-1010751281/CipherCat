# 标准文档双层结构

`docs/standards/` 同时服务于 Blockly 构建和用户查阅，不能只保留摘要。
原文提取质量按 [SOURCE-QUALITY-AUDIT.md](./SOURCE-QUALITY-AUDIT.md) 分级；“有提取稿”不等于
“提取稿中的每个字符、公式和表格都可靠”。

## 两个层次

| 层次 | 文件 | 用途 |
|---|---|---|
| 原文/结构化拆分输入层 | 各标准目录的 `00-Standard-Source.md` | 保存仓库 PDF 经 `pdftotext -layout` 重新提取的文本和页序线索，作为函数、原语、公式、伪代码和表格拆分的事实输入。它保留提取原貌，不保证字体映射、公式字形、表格列或图形在 Markdown 中等价呈现。 |
| 结构化/用户参照层 | `README.md`、`01-*.md`、后续原语页 | 解释标准用途、参数、项目 Blockly 块、demo、实现边界和未覆盖项；公式、伪代码、算法步骤和表格必须完整保留所属规范单元。B/C 级来源若无法可靠恢复，只写明确缺项并回链 PDF，不把摘要冒充标准原文。 |

原文提取层保留排版造成的断行、页分隔符和文本层异常，不能替代 PDF 视觉复核，也不能单独证明合规、认证或互操作。
国标中出现的字体映射失真、数学字体私有区字符和 `?(cid:...)` 不会被猜测性替换；等级和处理方式见
[SOURCE-QUALITY-AUDIT.md](./SOURCE-QUALITY-AUDIT.md)。扫描 PDF 不做猜测性 OCR：GB/T 36624 的缺项见其
`01-Extraction-Gap.md`。

结构化条目与 source 的逐项关系见
[SOURCE-SPLIT-INVENTORY.md](./SOURCE-SPLIT-INVENTORY.md)。该清单是可重复生成并可用
`npm run standards:inventory` 验收的证据索引；其中章节级定位和原件缺项会显式保留，不把摘要升级为逐字引文。

## 已恢复原文提取层

| 标准目录 | 原文参照 |
|---|---|
| FIPS 180-4 / SHA-2 | [00-Standard-Source.md](./fips180-4-SHA2/00-Standard-Source.md) |
| FIPS 186-5 / ECDSA | [00-Standard-Source.md](./fips186-5-ecdsa/00-Standard-Source.md) |
| FIPS 197 / AES | [00-Standard-Source.md](./fips197-AES/00-Standard-Source.md) |
| FIPS 198-1 / HMAC | [00-Standard-Source.md](./fips198-1-hmac/00-Standard-Source.md) |
| FIPS 202 / SHA-3 | [00-Standard-Source.md](./fips202-SHA3/00-Standard-Source.md) |
| FIPS 203 / ML-KEM | [00-Standard-Source.md](./fips203-ML-KEM/00-Standard-Source.md) |
| FIPS 204 / ML-DSA | [00-Standard-Source.md](./fips204-ML-DSA/00-Standard-Source.md) |
| FIPS 205 / SLH-DSA | [00-Standard-Source.md](./fips205-SLH-DSA/00-Standard-Source.md) |
| GB/T 17964 | [00-Standard-Source.md](./gbt17964-modes/00-Standard-Source.md) |
| GB/T 32905 / SM3 | [00-Standard-Source.md](./gbt32905-SM3/00-Standard-Source.md) |
| GB/T 32907 / SM4 | [00-Standard-Source.md](./gbt32907-SM4/00-Standard-Source.md) |
| GB/T 32918 / SM2 | [00-Standard-Source.md](./gbt32918-SM2/00-Standard-Source.md) |
| GB/T 33133 / ZUC | [00-Standard-Source.md](./gbt33133-ZUC/00-Standard-Source.md) |
| GB/T 38635 / SM9 | [00-Standard-Source.md](./gbt38635-SM9/00-Standard-Source.md) |
| GM/T 0005 | [00-Standard-Source.md](./gmt0005-randomness/00-Standard-Source.md) |
| GM/T 0091 | [00-Standard-Source.md](./gmt0091-kdf/00-Standard-Source.md) |
| GM/T 0103 | [00-Standard-Source.md](./gmt0103-rng/00-Standard-Source.md) |
| NIST SP 800-132 | [00-Standard-Source.md](./sp800-132-pbkdf2/00-Standard-Source.md) |
| NIST SP 800-232 | [00-Standard-Source.md](./sp800-232-ascon/00-Standard-Source.md) |
| NIST SP 800-38A | [00-Standard-Source.md](./sp800-38a-modes/00-Standard-Source.md) |
| NIST SP 800-38B | [00-Standard-Source.md](./sp800-38b-cmac/00-Standard-Source.md) |
| NIST SP 800-38C | [00-Standard-Source.md](./sp800-38c-ccm/00-Standard-Source.md) |
| NIST SP 800-38D | [00-Standard-Source.md](./sp800-38d-gcm/00-Standard-Source.md) |
| NIST SP 800-38E | [00-Standard-Source.md](./sp800-38e-xts/00-Standard-Source.md) |
| NIST SP 800-90A | [00-Standard-Source.md](./sp800-90a-drbg/00-Standard-Source.md) |

## 研究来源索引（非标准原文）

- Classic McEliece / Goppa 码：[00-Research-Source.md](./mceliece-goppa/00-Research-Source.md)。仅整理公开论文、ISO 出版记录和 NIST 流程材料，不代替付费 ISO 标准全文。
- 研究材料：[00-Research-Source.md](./papers/00-Research-Source.md)。

## 不可恢复的原文层

- GB/T 36624：本地 PDF 为扫描件，当前只保留证据状态和缺项页。
- GB/T 15852：本地未保存标准 PDF，保留官方记录、实现映射和缺项页；取得原件后按同一规则增加 `00-Standard-Source.md`。
- Classic McEliece：ISO 全文需付费且受版权保护，未保存；本地研究来源层只收录公开下载的 NIST 状态报告和论文扫描件，并明确记录 OCR/原文缺项。
- RFC：仓库使用 RFC Editor `.txt` 原文，按 RFC 目录维护，不重复伪造 PDF 提取层。

## 结构化条目规范

`00-Standard-Source.md` 不是拆分结果。函数、原语、公式和算法阶段必须进入第二层的独立条目页，
并按 [STRUCTURED-ENTRY-SCHEMA.md](./STRUCTURED-ENTRY-SCHEMA.md) 提供标准定义、公式/伪代码、输入输出、
项目映射和核验/缺项。B/C 级来源的条目页必须带 PDF 页码或提取稿定位；概览页只导航，不替代条目页。
