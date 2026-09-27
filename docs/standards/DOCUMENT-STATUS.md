# 标准文档完整性与缺项清单

核对日期：2026-09-25

## 结论

仓库此前把若干 PDF 文本层直接放进 Markdown，造成标题、表格、公式和章节编号混乱。现在的规则是：

- PDF 是原文原件；`standards-manifest.json` 记录来源、核对日期和 SHA-256。
- `00-Standard-Source.md` 是从本地 PDF 重新提取的结构化拆分输入和回溯入口；`README.md`、`01-*.md` 和原语页必须从 source 定位并结合 PDF、代码和向量形成结构化用户参照。
- RFC `.txt` 和历史 PDF 文本层只作为原始证据保留，不作为算法参考页。
- “有目录/有 PDF/有一次成功 demo”均不等于“完整实现、合规或认证”。

## 已重新核对

| 范围 | 当前状态 | 证据 |
|---|---|---|
| 标准目录 | 38 个目录，均有 `README.md` 和 manifest 条目；GB/T 32915 当前仅有状态入口，原件与拆分待办未完成 | `npm run standards:check` |
| 本地标准 PDF | 37 份（算法/参考目录 35 + `standards/papers/` 2）；目录内 PDF 由 manifest 登记，研究材料另由相应 README 登记 SHA-256 | `standards-manifest.json`、`papers/README.md` |
| 另存调研 PDF | `docs/research/sources/` 3 份、`paper/references/` 19 份；连同标准目录共 59 个文件，按 SHA-256 统计有 6 组重复、53 份不同内容 | `docs/research/sources/README.md`、`paper/references/README.md` |
| 含文本层的 PDF | 35 份；源质量分级覆盖 25 个有标准原文 source 的目录，其中 10 个 A 级、8 个 B 级、7 个 C 级；C 级国标不能把提取稿当作可读正文 | `SOURCE-QUALITY-AUDIT.md`、`pdftotext`、渲染页复核 |
| 扫描版 PDF | 2 份：GB/T 36624-2018 标准和 McEliece 1978 论文，均无可靠文本层 | `gbt36624-aead/README.md`、`mceliece-goppa/00-Research-Source.md` |
| 原文/研究证据层 | 25 个标准目录有 `00-Standard-Source.md`；1 个 Classic McEliece 参考目录有 `00-Research-Source.md`，另有研究文献目录。研究索引不计作标准原文提取层；GB/T 36624 扫描件、GB/T 15852 无本地 PDF 的目录不伪造正文 | `SOURCE-LAYERS.md`、各目录 `00-*.md` |
| 结构化主参考页 | 已重写 AES、SM3、SM2、ZUC、SM4、SHA-2、ECDSA、HMAC、PBKDF2、CMAC、CCM、GCM、XTS、DRBG、Ascon、GM/T 0005、GM/T 0103 及 ML-DSA NTT 页 | 各目录 `01-*.md` |
| 结构化条目字段 | 清单统计 227 个规范条目（25 个标准原文目录共 221 个；另有 2 个 RFC `.txt` 全文证据项、2 个研究书目回链和 2 个无原件来源项）；另有 4 个结构化英文对应页。公式检查覆盖 231 个中英文页面，均有 `公式或伪代码` 字段，其中 207 个含 Markdown 代码块；20 个规范条目明确说明无独立公式/伪代码或暂无可核对的单一原件，按页面统计为 22 页（含两个英文对应页）；123 个编号算法页逐页保留完整算法块并指向 source 行号 | `SOURCE-QUALITY-AUDIT.md`、`SOURCE-SPLIT-COVERAGE.md`、`STRUCTURED-ENTRY-SCHEMA.md` |
| 函数/原语族拆分 | 38 个目录共 227 个结构化条目已有统一清单；其中 123 个编号算法逐页通过。GB/T 32915 尚无本地原文拆分。标准原文锚点共 220 个（185 个行号、35 个精确 PDF 物理页）；同时具备行号和页码的条目按 PDF 页码分类，两个链接仍都保留。另有 2 个 RFC 全文证据项、2 个研究书目回链、1 个官方记录项、1 个扫描件提取缺项、1 个非规范性架构说明；0 个条目缺少来源/出处链接 | `FUNCTION-PRIMITIVE-INDEX.md`、`SOURCE-SPLIT-INVENTORY.md`、`SOURCE-SPLIT-COVERAGE.md` |
| 文档导航 | 根文档、研究报告、标准索引、嵌套指南和文献目录纳入 Docs 页面 | `src/views/DocsView.vue` |

## 尚未补齐的内容

### 标准证据

| 项目 | 缺项 | 处理 |
|---|---|---|
| GB/T 36624-2018 | 官方记录为现行（2018-09-17 发布、2019-04-01 实施），但本地 PDF 是扫描图像，暂无可靠文本层；现有 GCM 不能证明覆盖本标准 | 保留为 `review`，待取得可检索官方原件或人工逐页转录 |
| GB/T 15852 | 已确认 `.1-2020`、现行 `.2-2024` 和官方通知中的 `.3-2019`；目录没有随仓库保存 PDF，且分部分覆盖关系需分开核验 | 保留为 `review`，补齐原件、`.1/.2/.3` 条款矩阵和 `.3` 状态核验后再升格 |
| RFC 目录 | 当前 8 个目录保存 RFC Editor `.txt` 原文而非 PDF；这对 RFC 可追溯性足够，但不应在 PDF 统计中计数，也不应被列为缺少 source artifact | 继续以 RFC Editor 原文和 errata 页面为准 |
| Classic McEliece / 中国抗量子密码进展 | ISO 标准参考与官方研究/标准化信息追踪；不属于 CipherCat 的完整算法标准实现 | 分别标记为 `reference/tracking`，不计入“完整标准实现” |

### 实现与测评

- ZUC 128-EIA3 已有 MAC 块、GB/T 33133.3-2021 附录 B 两个向量（1 bit、577 bit）和参数拒绝回归；更广泛的互操作性、认证与侧信道保证仍未覆盖。
- Ascon-Hash256、Ascon-XOF128、Ascon-CXOF128 和 AEAD 解密/标签拒绝路径已补齐；扩展 Demo 覆盖空消息、`abc` 定制字符串、双语言生成和错误标签拒绝。完整官方 KAT/流式 API 仍需按标准清单继续扩展。
- GCM、CCM、XTS 当前只有明确标注的加密/整块子集；没有把“有加密块”写成完整 AEAD/磁盘模式覆盖。
- SP 800-90A 当前只实现 HMAC-SHA-256 的一次性生成子集；Hash_DRBG、CTR_DRBG、reseed、additional input、预测抗性和健康测试仍缺。
- GM/T 0005 的平台后端随机性测评由 `metacrypt_server` Python 隔离样本生成与 Go 检测链路执行；CipherCat 前端用于用户试跑代码和展示报告，不能自行给出后端结论或认证结论。
- 成功向量还需要配套负例：错误标签、非法长度、非法编码、无效点、失败解封装、nonce 重用和健康测试失败。

## 用户文档插图状态

插图只用于解释真实界面操作，不用于替代标准原文、测试输出或后端测评证据。当前已登记的真实页面截图覆盖如下：

| 文档 | 当前插图 | 说明 |
|---|---:|---|
| [USER-GUIDE.md](../guides/USER-GUIDE.md) | 2 | 导入工作区、生成代码 |
| [BLOCKLY-GUIDE.md](../guides/BLOCKLY-GUIDE.md) | 3 | 编辑器布局、函数定义、代码面板 |
| [TUTORIALS.md](../guides/TUTORIALS.md) | 9 个图片引用，使用 7 张不同图片 | 覆盖项目列表、导入、生成代码和函数 Demo |
| [SETUP.md](../guides/SETUP.md) | 2 | 文档分组和开发模式验收 |
| [DEMO.md](../guides/DEMO.md) | 3 | 导入入口、工作区和生成代码 |

上述截图均有非空 alt 文本、图注和资源登记。后端测评报告页暂不放截图：只有已登录的 `metacrypt_server` 任务详情页实际截取并绑定参数、版本和原始结果后，才应补入；不使用登录页、401 页面或伪造报告。

## 验收口径

文档变更至少应通过：

```bash
npm run docs:check-links
npm run standards:check
npm run type-check
npm run test:unit
npm run build
```

标准条款的最终解释以发布机构原文为准；项目文档的“已覆盖”只表示仓库中存在可追溯的参考页、实现映射或测试资产，并不表示 CAVP、ACVTS、CMVP、形式化验证或侧信道认证已经完成。
