---
doc_type: audit-finding
id: DOC-02
severity: P1
dimension: maintainability
status: resolved
---

# DOC-02 文档中心静默排除有效文档

## 证据

`src/views/DocsView.vue:216` 只接受 `standards/<category>/<file>` 三层路径。仓库共有 223 个 Markdown，但按该逻辑只能进入约 205 个条目；被排除的有效内容包括：

- `fips203-ML-KEM/guides/` 的 4 个搭建指南；
- `fips204-ML-DSA/guides/` 的中英文指南；
- `gbt33133-ZUC/guides/` 的中英文指南；
- `standards/papers/` 下的研究材料索引；
- `docs/research/` 的调研报告；
- `docs/README*.md` 与 `standards/COVERAGE*.md` 的总索引。

这与验收记录中的“185 个可见导航条目”相符：当前 UI 测到的是可见子集，不是仓库全部文档。

## 影响

用户从应用内无法发现关键搭建指南、标准覆盖矩阵和研究报告，容易误以为这些文档不存在；文档校验通过也不能证明 UI 文档入口完整。

## 处理方向

将文档发现规则改为显式、可测试的文档目录：至少纳入核心索引、研究报告和标准目录下任意深度的 Markdown，同时对 PDF/TXT 只保留可点击原件链接，不把它们当作 Markdown 条目。

## 修复结果

`DocsView.vue` 已纳入根文档、研究报告、标准索引、嵌套标准页、原文提取层、指南和 `standards/papers/`；`docs:check-links` 对 311 个 Markdown 文件扫描无断链。
