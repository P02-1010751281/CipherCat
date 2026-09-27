# 标准原文提取质量复核

核对日期：2026-09-26

## 结论

本次复核区分了两件事：PDF 页面本身是否正常，以及 PDF 内嵌文本层是否能可靠转成 Markdown。
抽样渲染的 PDF 页面中，公式、表格、图和中文排版均可正常阅读；异常主要来自字体的
`ToUnicode` 映射，而不是 PDF 页面损坏。因此，`00-Standard-Source.md` 不能一律称为
“可读原文”：它是可追溯的文本提取证据，可靠性必须按下面的等级理解。

## 分级

| 等级 | 含义 | 使用规则 |
|---|---|---|
| A | 正文和常用符号可直接搜索；未发现明显的替换字符或国标字体映射标记 | 可用于搜索和初步定位；公式、表格仍以 PDF 视觉版式复核 |
| B | 正文基本可搜索，但公式符号、数学字形或个别字符使用私有区字形/替换字符 | `00-Standard-Source.md` 只用于搜索线索；公式以 PDF 和结构化条目为准 |
| C | 中文正文、章节名或表头受到嵌入字体映射影响，出现 `犌犅`、`犌犕`、`?(cid:...)` 等失真 | PDF 是原文主证据；结构化条目是用户/Blockly 参照；提取稿不能单独作为定义依据 |
| D | 扫描图像或文本层不足以恢复条款 | 不做猜测性 OCR；保留缺项页，待可检索原件或人工逐页转录 |

这里的字符计数只是筛查信号，不是“损坏字符”的精确数量：数学字体的私有区字符有时是
合法字形编码，但它们不能保证在不同 Markdown 查看器中稳定显示。

## 25 个标准原文提取层

### A：文本层基本可用（8）

[FIPS 198-1 / HMAC](./fips198-1-hmac/00-Standard-Source.md)、
[FIPS 203 / ML-KEM](./fips203-ML-KEM/00-Standard-Source.md)、
[FIPS 204 / ML-DSA](./fips204-ML-DSA/00-Standard-Source.md)、
[NIST SP 800-232 / Ascon](./sp800-232-ascon/00-Standard-Source.md)、
[NIST SP 800-38A](./sp800-38a-modes/00-Standard-Source.md)、
[NIST SP 800-38C](./sp800-38c-ccm/00-Standard-Source.md)、
[NIST SP 800-38D](./sp800-38d-gcm/00-Standard-Source.md)、
[NIST SP 800-38E](./sp800-38e-xts/00-Standard-Source.md)。

“基本可用”不等于保持了 PDF 的图形、列宽和数学排版。

### B：公式/字形需要回看 PDF（10）

| 标准 | 筛查信号 | 处理 |
|---|---:|---|
| [FIPS 180-4 / SHA-2](./fips180-4-SHA2/00-Standard-Source.md) | 私有区 466 | 公式以 PDF 和 SHA-2 结构化条目为准 |
| [FIPS 186-5 / ECDSA](./fips186-5-ecdsa/00-Standard-Source.md) | 私有区 66，替换字符 0；本轮已按 PDF 视觉页修复可确认公式 | 椭圆曲线公式和算法步骤以 PDF/结构化条目为准 |
| [FIPS 197 / AES](./fips197-AES/00-Standard-Source.md) | 本轮已视觉核对并修复 5 处提取替换字符 | AES 公式、表格和向量仍以 PDF/结构化条目为准 |
| [FIPS 202 / SHA-3](./fips202-SHA3/00-Standard-Source.md) | 私有区 33 | Keccak 公式和位序以 PDF/结构化条目为准 |
| [FIPS 205 / SLH-DSA](./fips205-SLH-DSA/00-Standard-Source.md) | 替换字符 0；Figure 12 文本层已按 PDF 视觉页修复 | 参数表和算法伪代码以 PDF 为准 |
| [GB/T 32905 / SM3](./gbt32905-SM3/00-Standard-Source.md) | 正文可搜索；位运算符使用私有区字形，公式跨行 | 公式已按 PDF 物理第 5–7 页复核并补入规范化转录；PDF 仍是版式依据 |
| [GB/T 32907 / SM4](./gbt32907-SM4/00-Standard-Source.md) | 正文可搜索；公式符号及 S 盒表格跨行 | §6–§7 已按 PDF 物理第 5–7 页复核；公式、S 盒表和固定参数以 PDF 为准 |
| [NIST SP 800-132 / PBKDF2](./sp800-132-pbkdf2/00-Standard-Source.md) | 私有区 18 | PBKDF2 公式以 PDF/结构化条目为准 |
| [NIST SP 800-38B / CMAC](./sp800-38b-cmac/00-Standard-Source.md) | 私有区 10 | 子密钥公式以 PDF/结构化条目为准 |
| [NIST SP 800-90A](./sp800-90a-drbg/00-Standard-Source.md) | 私有区 28 | DRBG 状态机和伪代码以 PDF/结构化条目为准 |

### C：字体映射导致提取稿失真（7）

| 标准 | 筛查信号 | 可读参照 |
|---|---:|---|
| [GB/T 17964](./gbt17964-modes/00-Standard-Source.md) | 大量国标字体映射失真；私有区 101 | PDF；[结构化模式条目](./gbt17964-modes/01-Modes.md) |
| [GB/T 32918 / SM2](./gbt32918-SM2/00-Standard-Source.md) | 国标字体映射失真；私有区 8 | PDF；SM2 各结构化条目 |
| [GB/T 33133 / ZUC](./gbt33133-ZUC/00-Standard-Source.md) | 国标字体映射失真；私有区 41 | PDF；[ZUC 参考页](./gbt33133-ZUC/01-ZUC.md)及原语页 |
| [GB/T 38635 / SM9](./gbt38635-SM9/00-Standard-Source.md) | 大量国标字体映射失真；私有区 280 | PDF；SM9 结构化条目 |
| [GM/T 0005](./gmt0005-randomness/00-Standard-Source.md) | 大量国标字体映射失真；私有区 52 | PDF；[检测条目](./gmt0005-randomness/02-Test-Suites.md)至 `07-*` |
| [GM/T 0091](./gmt0091-kdf/00-Standard-Source.md) | 国标字体映射失真；私有区 167 | PDF；[KDF 条目](./gmt0091-kdf/02-KDF.md) |
| [GM/T 0103](./gmt0103-rng/00-Standard-Source.md) | 国标字体映射失真；私有区 7 | PDF；GM/T 0103 结构化条目 |

ZUC 的 `pdfminer.six` 和 Ghostscript 文本输出在部分页面改善了字距或中文标题，但会破坏
表格列、公式布局或英文术语，不能安全地整体替换现有 `pdftotext -layout` 证据层。因此没有
把“看起来更顺”的替代输出冒充为标准原文。

## 结构化拆分完成度

25 个带 `00-Standard-Source.md` 的标准目录目前有 221 个细粒度 Markdown 条目页（不含
`README.md` 和 `00-*`）。其中带独立算法编号的 7 个目录共 123 个算法，已经按
`SOURCE-SPLIT-COVERAGE.md` 逐算法拆页，并由 `npm run standards:split-check` 防回归；另有
`pC`/`pS`/`pL`、`inc32` 等无算法编号但可独立核对的原语页。其余概览/组合页保留标准标题或
章节定位，不伪造唯一行号；`npm run standards:check` 只检查字段和证据回链，不代表每个公式、
表格或项目实现都已获得合规结论。

全部 227 个结构化条目（221 个 source-backed 页 + 6 个外部/历史参考页）现在都有显式的
`公式或伪代码` 字段；其中 207 页包含 Markdown 代码块，2 页是回链完整 RFC `.txt` 的证据层页，22 页（20 个中文条目及 2 个英文对应页）是组合/概览、参数边界或证据缺项页，
字段中明确写出“本条目无独立公式/伪代码”或“没有可直接核对的单一标准原件”。123 个编号算法页另由
`split-check` 检查完整 source 算法块。该字段覆盖不等于所有 PDF 表格、图和失真公式都已完成
视觉核验，不能把 227 页统称为逐公式、逐表格认证结论。

上述 227 个是中文规范条目；目前只有 4 个条目有结构化英文对应页。英文条目覆盖仍不完整，不能把公式门禁覆盖的 231 个中英文页面误写成 231 个规范条目。

另有 6 个没有统一标准 source 页的历史/外部参考页面：GB/T 15852 无本地原件、GB/T 36624
只有扫描 PDF、McEliece 页面来自论文/提案、RFC 页面来自本地 RFC 文本。它们已明确记录证据
边界，不伪造 `00-Standard-Source.md` 或标准条款定位。

## 研究材料提取层

研究材料不计入上面的 25 个标准目录。`papers/00-Research-Source.md` 现已明确链接到两个
本地 PDF：SEC 2 v2.0 和 Rijndael AES Proposal。SEC 2 正文基本可搜索；Rijndael PDF 的页面
视觉内容可读，但部分页眉、公式字形和字距在文本层/渲染中不稳定。它们只能作为研究背景和
历史参考；Rijndael 提案 source 仍保留 PDF 页眉/页脚中无法映射的字体字符，不能把这些字符当作正文；
当前 AES 定义应回到 [FIPS 197](./fips197-AES/00-Standard-Source.md) 及其结构化条目。

### D：扫描件

[GB/T 36624-2018](./gbt36624-aead/01-Extraction-Gap.md) 的本地 PDF 文本层不足以可靠恢复
条款、公式和表格；继续保留缺项说明，不依据 GCM、CCM 或 Ascon 文档推断其内容。

## 视觉抽样

已用 `pdftoppm` 渲染并人工核对以下页面：

- GB/T 17964-2021：物理第 10 页，CBC 公式、流程图和注释可读；
- GM/T 0005-2021：物理第 10 页，矩阵秩/二元推导相关公式可读；
- GB/T 33133.1-2016：物理第 10 页，ZUC S 盒表格可读；
- FIPS 197：AES 向量及密钥扩展表抽样页可读；
- FIPS 186-5：ECDSA 算法说明抽样页可读。
- GB/T 32905-2016：SM3 常数、函数及压缩伪代码，物理第 5–7 页可读。
- GB/T 32907-2016：SM4 轮函数、S 盒和算法参数，物理第 5–7 页可读。

因此本轮完成的是“source 目录完整保留与部分细粒度结构化入口修复”，不是全目录函数/原语/公式/表格拆分，
也不是把 PDF 文本层重新猜写成另一份正文。当前仍需逐源修复 C 级文本层，或为每个受影响章节建立经 PDF
视觉核验的可读转录；不能把另一个摘要页当成 source 或结构化拆分已完成的证明。

## 后续规则

1. PDF 原件和 `standards-manifest.json` 的哈希是不可替代的证据。
2. `00-Standard-Source.md` 保留检索线索和提取原貌；不删除失真字符，不凭上下文猜补。
3. 公式、表格、图和伪代码在 C/B 等级文档中必须同时给出 PDF 页码或结构化条目定位；可恢复时保留完整规范单元。
4. 结构化条目中的公式/伪代码必须是完整规范单元；PDF 视觉复核仍是标准证据，不声称条目页替代标准全文。
5. 需要逐条合规、认证或互操作结论时，必须回到 PDF/官方原件和独立测试证据。
