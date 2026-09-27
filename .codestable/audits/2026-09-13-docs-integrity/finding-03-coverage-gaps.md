---
doc_type: audit-finding
id: DOC-03
severity: P1
dimension: maintainability
status: partial
---

# DOC-03 覆盖矩阵遗漏分册和现行标准边界

## 证据

- `docs/standards/COVERAGE.md` 声称 37 个标准目录、0 个无标准目录的算法族，但矩阵只按目录计数，未把 SM2 五个现行分册、ZUC 三个国家标准分册、SM9 的组成部分分别列成文档资产。
- `docs/standards/gbt32918-SM2/README.md` 列出第 1–5 部分和 5 个 PDF，但目录只有一个 `01-SM2.md`，且没有第 3 部分密钥交换和第 5 部分参数的独立参考页。
- `docs/standards/gbt38635-SM9/README.md` 只保存第 1、2 部分 PDF，却把第 3–5 部分作为组成项列出；需要明确“未下载”和“未覆盖”的区别。
- `docs/standards/gmt0005-randomness/` 只有 GM/T 0005，研究文档已经下载 NIST SP 800-90B、SP 800-90C，但标准目录和覆盖矩阵没有对应的标准参考页。
- 官方 NIST 页面显示 SP 800-90C 已于 2025-09-25 发布 Final，SP 800-90B 页面在 2025-05-29 标注存在两个待修正 errata；官方 NIST 页面还显示 SP 800-90A Rev.2 仍是预草案。现有矩阵没有把这三个状态差异表达出来。
- 国家密码管理局公告显示 `GM/T 0001.4-2024` 已于 2025-07-01 实施；当前 ZUC README 只把它写成未覆盖的相关标准，没有加入标准清单的版本/状态字段。

## 影响

“37 个目录”在目录卫生意义上成立，但不是标准条款、分册、向量、实现和 UI 入口的完整覆盖。当前统计容易把“目录存在”误读为“规范已核实、功能已实现”。

## 处理方向

扩展标准元数据和覆盖矩阵的统计口径：分别记录标准分册、原件、结构化参考、块、demo、负例、后端测评和 UI 入口；对未下载/未实现/不在前端范围的项使用不同状态。

## 修复结果

已新增 [DOCUMENT-STATUS.md](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/DOCUMENT-STATUS.md) 和 [SOURCE-SPLIT-INVENTORY.md](/run/media/user/6b058d20-a617-484d-b7c6-cd7146baf77c/Projects/CipherCat/docs/standards/SOURCE-SPLIT-INVENTORY.md)，明确区分标准原件、结构化参考、实现子集、后端测评和未补项，并已对 37 个目录、227 个条目建立逐项 source 回链。覆盖矩阵仍保留目录级统计，因此分册级条款矩阵、负例资产和 43 个章节级锚点仍是后续工作。
