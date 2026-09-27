---
doc_type: audit-index
status: remediated-with-gaps
scope: "README、docs、标准原件及文档同步链路"
dimensions:
  - bug
  - maintainability
---

# 文档完整性与提取质量审计

## 范围

审计仓库内 README、`docs/` 文档、标准目录中的 PDF/TXT 原件、标准 manifest、文档同步脚本，以及文档与 Blockly 块/Demo 的覆盖关系。

## 目标

确认文档是否存在异常提取、乱码、截断、模板占位、链接错配、重复/空文档和标准覆盖缺项；对可核实的问题记录文件、行号和来源证据。

## 当前状态

初步发现已完成修复复核。标准 PDF 原件可读，主要问题位于 PDF 文本层到 Markdown 的转录/拆分；当前同时保留 `00-*.md` 原文提取证据层和人工核对的结构化用户参考页。GB/T 36624 扫描件、部分标准分册证据和实现负例仍是后续缺项，见 `docs/standards/DOCUMENT-STATUS.md`。

## 发现矩阵

| ID | 性质 | 严重度 | 状态 |
|---|---|---|---|
| DOC-01 | bug | 多个标准 Markdown 是损坏的 PDF 文本层转录，公式、表格、页眉和图示混入正文 | P1 | resolved |
| DOC-02 | maintainability | 文档中心只收录固定三层路径，标准搭建指南和研究索引被静默排除 | P1 | resolved |
| DOC-03 | maintainability | 标准覆盖矩阵把“有目录/有 PDF”当作充分覆盖，未反映多分册和现行新增标准 | P1 | partial |
| DOC-04 | bug | 部分算法参考页的标题、伪代码或章节编号已被提取过程截断 | P1 | resolved |

## 修复复核

- 结构化入口页与证据边界：[REEXTRACTION-REPORT.md](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/REEXTRACTION-REPORT.md)。
- 缺项与未覆盖内容：[DOCUMENT-STATUS.md](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/DOCUMENT-STATUS.md)。
- `npm run docs:check-links`：371 个 Markdown，0 断链。
- `npm run standards:check`：37/37 目录，33 个算法 PDF artifact，0 错误。
- `npm run standards:inventory`：37 个目录、227 个结构化条目；178 个行号锚点、43 个章节级锚点、4 个明确 source/证据缺口。
- `npm run type-check`、`npm run test:unit`、`npm run build`、`npm run lint:check`、`npm run cycles:check` 和 `npm run verify:all` 已通过；受限沙箱下的子进程 EPERM 通过受控环境复跑确认不是代码失败。
