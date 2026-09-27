---
doc_type: audit-finding
id: DOC-01
severity: P1
dimension: bug
status: resolved
---

# DOC-01 标准 Markdown 存在提取损坏

## 证据

- [`docs/standards/fips197-AES/01-AES.md:370`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/fips197-AES/01-AES.md:370) 的 AES 字节索引与状态矩阵被拆成孤立字符和伪表格；同目录 PDF 第 6 页渲染后公式和表格均完整。
- [`docs/standards/sp800-38a-modes/02-CBC.md:14`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/sp800-38a-modes/02-CBC.md:14) 的 CBC 公式位于无法表达公式的 Markdown 表格中，图示出现反序字符串 `TPYRCNE`、`TPYRCED`，且相邻行重复。
- [`docs/standards/gbt32918-SM2/01-SM2.md:8`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/gbt32918-SM2/01-SM2.md:8) 将 `GB/T32918.1-2016`、中文标题和部分编号拆坏；文件后段存在大量孤立的 `n`、`m`、`i` 等公式片段。
- [`docs/standards/gbt33133-ZUC/01-ZUC.md:7`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/gbt33133-ZUC/01-ZUC.md:7) 的标准标题/部分编号缺失，算法公式段落在 [`:215`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/gbt33133-ZUC/01-ZUC.md:215) 起被拆成不可复核的表格碎片。
- [`docs/standards/gmt0005-randomness/01-Randomness.md:760`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/gmt0005-randomness/01-Randomness.md:760) 起的检测统计量和 [`:794`](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/gmt0005-randomness/01-Randomness.md:794) 起的游程公式存在分子/分母和上下标丢失。

## 复核方法

对仓库内 35 个 PDF 运行 `pdfinfo`、`pdftotext -raw`、`pdftotext -layout`，并用 `pdftoppm` 渲染 SM3、AES、GCM 代表页。PDF 文件可读，代表页视觉内容完整；因此问题定位在转录/拆分层，不是标准原件损坏。

## 影响

这些文件目前不适合被当作规范正文直接引用。尤其是公式或编码步骤被误读时，可能把教学实现、代码审查或后端测评参数带偏。

## 处理方向

将算法参考页重建为人工核对的结构化摘要（公式使用代码块/LaTeX，表格使用真正 Markdown 表格），保留同目录 PDF 作为唯一逐字原文；不再声称损坏文本层是“全文提取”。

## 修复结果

已完成主要受影响入口页的结构化重写，原始 PDF 未修改；残余可疑文本扫描为 0。复核记录见 [REEXTRACTION-REPORT.md](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/REEXTRACTION-REPORT.md)。
