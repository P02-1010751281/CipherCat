# 标准文档重新提取与核验报告

初核日期：2026-09-23
清单复核日期：2026-09-26

## 目标

检查 `docs/standards/` 下的标准文档是否仍把损坏的 PDF 文本层当作用户可读参考，重新提取本地 PDF，并核对标题、版本、目录、关键参数、算法流程和已声明的项目映射。

## 提取方法

本次使用本地工具完成，不改写 PDF 原件：

```bash
pdfinfo <source.pdf>
pdftotext -raw <source.pdf> <raw.txt>
pdftotext -layout <source.pdf> <layout.txt>
pdftoppm -f <page> -l <page> -png -r 150 <source.pdf> <page.png>
```

`-raw` 用于搜索章节和术语，`-layout` 用于发现表格/列顺序异常，渲染页用于确认文本层问题是否来自 PDF 本身。原件的 SHA-256 由 `standards-manifest.json` 维护。

## 结果

| 项目 | 数量/状态 |
|---|---|
| 标准目录 | 38，全部有 README 和 manifest 条目；GB/T 32915 当前仅登记状态，原件与结构化拆分待办未完成 |
| 本地 PDF | 37（35 个算法/参考目录 + `standards/papers/` 2）；目录内 PDF 由 manifest 校验，研究材料由 README 校验 |
| 有文本层的 PDF | 35；源质量分级覆盖 25 个标准原文目录，其中 10 个 A 级、8 个 B 级、7 个 C 级；另有 7 份国标存在严重字体映射失真，不能把有文本层都称为“可读原文” |
| 扫描 PDF | 2：GB/T 36624-2018 和 McEliece 1978 论文均无可靠文本层 |
| Markdown 断链 | `npm run docs:check-links` 当前检查结果为 0 处 |
| 原文与研究证据层 | 25 个标准目录保存 `00-Standard-Source.md` 原文提取；McEliece 和论文目录各有 `00-Research-Source.md` 研究索引，不计作标准全文提取。RFC `.txt` 和两个历史 `part1.txt` 继续作为原始证据 |
| 文本层质量 | 25 个有 source 的标准目录中 10 个 A 级、8 个 B 级、7 个 C 级；GB/T 36624 为 D 级缺项 | [SOURCE-QUALITY-AUDIT.md](./SOURCE-QUALITY-AUDIT.md) |
| 结构化条目字段 | 规范清单统计 227 个条目，4 个另有结构化英文对应稿；公式检查覆盖 231 个中英文页面，均有 `公式或伪代码` 字段，207 个含 Markdown 代码块，22 个明确说明无独立公式/伪代码单元或当前无可核验原件。规范条目有 220 个标准原文锚点（185 行号、35 个精确 PDF 页码）、2 个 RFC 全文证据项、2 个研究书目回链；另有官方记录、扫描件缺项及非规范性项目说明各 1 项。书目回链不计作标准原文锚点 | [STRUCTURED-ENTRY-SCHEMA.md](./STRUCTURED-ENTRY-SCHEMA.md) |

## 已修复的异常类型

- 从面向用户的结构化主参考页中删除/改写 PDF 直转造成的反向字样、伪表格、乱码 token、断裂标题和缺失伪代码；`00-Standard-Source.md` 仍保留提取原貌，并按质量等级使用。
- 将 AES、SM3、SM2、ZUC、SM4、SHA-2、ECDSA、HMAC、PBKDF2、CMAC、CCM、GCM、XTS、DRBG、Ascon、GM/T 0005、GM/T 0103 以及 ML-DSA Algorithm 48 改成结构化参考，并恢复对应 PDF 的 `00-*.md` 原文提取层。
- 把标准原件、历史草案、项目实现子集、demo 向量和认证边界分开写，避免“有 demo”被误读为“完整标准覆盖”。
- 修正 GM/T 0005 的检测项列表，修正 SP 800-90A 项目实现误标为 CTR-DRBG，确认 SP 800-232 使用最终版而不是 2024 IPD 草案。
- Docs 导航现已包含根文档、研究报告、标准索引、嵌套指南和文献目录，不再因固定目录深度静默漏项。
- 新增 [FUNCTION-PRIMITIVE-INDEX.md](./FUNCTION-PRIMITIVE-INDEX.md)，并将薄的总览页继续拆成可独立核验的函数/原语族页面；没有独立块的内部阶段明确标注为“高层块内部实现”。

## 抽样核验页

- FIPS 197：渲染页确认原 PDF 的 AES-128 向量和密钥扩展表可读；参考页保留 `001122…ff → 69c4e0…c55a`。
- GB/T 32905：核对 `abc` 向量和 SM3 的 `W/W'`、`P0/P1`、`FF/GG` 结构。
- NIST SP 800-38D：核对 GCM 的 `H`、`J0`、GHASH、GCTR 和标签关系。
- NIST SP 800-232：以 2025-08-13 Final PDF 为准；本报告初次整理时 Hash/XOF 尚未实现，当前已补齐单次调用块并另行标注官方 KAT/流式 API 缺项，旧 IPD 不再作为现行依据。
- 字体映射复核：GB/T 17964、GM/T 0005、GB/T 33133 等 PDF 页面视觉正常，但 `pdftotext`/`pdftohtml` 的中文映射失真；替代提取器不能同时保持公式和表格布局，因此保留原始提取层，并在结构化页补充可读参照。

## 仍需人工/外部来源补齐

- GB/T 36624 的官方记录、发布日期、实施日期及 2025 年复审结论已核实；官方系统说明因版权不提供文本阅读服务。本地 28 页扫描件的来源链未核验且无文本层，须取得可合法使用的清晰原件后逐页校对；现有 GCM/CCM/Ascon 文档不能替代。
- GB/T 15852 已核对 `.1-2020`、现行 `.2-2024` 和 `.3-2019` 官方记录，但仍需要保存可追溯原件、拆分 `.1/.2/.3` 条款矩阵并核验 `.3` 状态。
- 逐条合规审查、独立实现差分测试、负例/拒绝路径、熵评估和 CMVP/CAVP 证据不属于本次 Markdown 清理的自动结果。
- B/C 级原文的完整逐页 OCR 或人工转录仍未完成；当前 PDF 视觉版、结构化条目和提取稿定位共同构成可核验参照。

完整缺项及实现边界见 [DOCUMENT-STATUS.md](./DOCUMENT-STATUS.md)。
