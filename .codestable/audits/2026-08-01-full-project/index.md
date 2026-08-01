---
doc_type: audit-index
audit: 2026-08-01-full-project
scope: "CipherCat 全仓库 src/ + src-tauri/ + docs/ + demos/，五维全扫（bug/security/performance/maintainability/docs-api），用户重点强调文档与 API 边缘"
created: 2026-08-01
status: active
total_findings: 24
---

# 全仓库审计 — 2026-08-01（CipherCat）

## 范围

- `src/` 全部 `.ts`/`.vue`（blocks / generators / components / composables / utils / router）：bug / security / performance / maintainability 四维
- `src-tauri/` + 配置文件（index.html CSP、tauri.conf.json、capabilities）：security
- `docs/`（README/DEMO/ARCHITECTURE/DEVELOPMENT/TYPE-SYSTEM/IMPLEMENTATION-PLAN/SYNC-PLAN/BLOCK-STANDARDS + blocks/INDEX.md 块清单）+ 根 README + `demos/`：**docs-api 维（用户重点强调）**
- arch-drift 跳过（`.codestable/requirements/adrs/` 不存在）
- 5 个并行只读 scout（BugScan / SecurityScan / PerfScan / MaintainabilityScan / DocsApiScan），每维上限 5 条

## 总评

共 **24 条**发现：bug 5 / security 4 / performance 5 / maintainability 5 / docs-api 5；**P1 共 2 条**，其余 P2。

**最值得关注（P1）**：
1. **`nt_mod_pow` 双生成器硬编码模数 1 → 恒输出 0**（finding-01）——`pow(a, b, 1)`，Python 与 JS 同根因，模幂教学块静默全错
2. **编辑器内"新建工作区"同路由复用 → 保存静默全失败**（finding-02）——`router.push('/editor/${newId}')` 不触发重挂载，`loadProject` 不再执行，`projectId` 恒 null，`doSave` 守卫拦截且无提示

**docs-api 维（用户重点强调）**：`docs/blocks/` 块索引是重灾区——层2 便利块（aes_round、sm4_round、mode_ecb 等 9+ 块）在 convenience→procedure 重构后已删除，文档仍完整列出（finding-20/21）；块数统计三处文档三个数字（118/110+/71）全与代码不符（finding-22）；根 README 目录结构/技术栈（core/、number-theory/、SHA-1）早已过时 + Metacrypto 品牌残留侵入 CipherCat 文档与源码头注释（finding-23/24）。

正面：src-tauri 表面极简干净（零自定义 IPC 命令、仅 dialog+fs 两插件、无 shell/process/http、withGlobalTauri=false、v-html 两处均经 DOMPurify/hljs 转义、依赖全部当前版本）；循环依赖零命中；locale.ts ZH/EN 键集合已同步；demos/ 全部 JSON 引用块均已注册（无损坏引用）；空 catch 全仓库未检出。

## 发现清单

| # | finding | 性质 | 严重度 | 置信度 | 建议 |
|---|---|---|---|---|---|
| 01 | nt_mod_pow 双生成器模数硬编码 1 恒 0 | bug | **P1** | high | cs-issue |
| 02 | 新建工作区同路由复用致保存静默失败 | bug | **P1** | high | cs-issue |
| 03 | 模板函数改名后 call 块参数同步失效 | bug | P2 | medium | cs-issue |
| 04 | keccak_f 非 1600 宽度双语言生成坏代码 | bug | P2 | high | cs-issue |
| 05 | def 块 compose() 无条件 push null VariableModel | bug | P2 | medium | cs-issue |
| 06 | fs:allow-write-text-file 三目录 scope 无用户交互门槛 | security | P2 | medium | cs-refactor |
| 07 | 导入 JSON/XML 零校验直喂 Blockly 反序列化 | security | P2 | medium | cs-issue |
| 08 | CSP meta+config 双处重复定义，缺 base-uri/object-src | security | P2 | low | cs-refactor |
| 09 | 密码学工作区数据明文落盘 IndexedDB 与导出文件 | security | P2 | low | cs-refactor |
| 10 | call 块 onchange BLOCK_DELETE O(M×N) 全量扫描 | performance | P2 | high | cs-refactor |
| 11 | 加载路径双重全树遍历 + 20+ console.log 残留 | performance | P2 | high | cs-refactor |
| 12 | buildCallOptions 每次下拉打开全量重建 | performance | P2 | high | cs-refactor |
| 13 | sbox 弹窗 document listener/DOM events-disabled 泄漏 | performance | P2 | medium | cs-issue |
| 14 | 批量模板导出 30× initSvg+render + 变量表双扫 | performance | P2 | medium | cs-refactor |
| 15 | CryptoFunctionPanel PANEL_PARAM 手工清单（第 4 份） | maintainability | P2 | high | cs-refactor |
| 16 | buildCategories 类目键与注册类目双份硬编码（第 5 份） | maintainability | P2 | high | cs-refactor |
| 17 | i18n 缺 CRYPTO_CATEGORY_CRYPTO_TEMPLATES + POSTQUANTUM 死键 | maintainability | P2 | high | cs-issue |
| 18 | makeDefBlock/makeCallBlock 近 200 行重复逻辑 | maintainability | P2 | high | cs-refactor |
| 19 | migrateBlockType 死导出 | maintainability | P2 | high | cs-refactor |
| 20 | docs/blocks/ 层2 便利块清单全部失效（9+ 已删块） | docs-api | P2 | high | cs-issue |
| 21 | DEMO.md / ecc-sbox.md 引用不存在的 crypto_func_def | docs-api | P2 | high | cs-issue |
| 22 | 块数统计三处文档三个数字（118/110+/71）全不符 | docs-api | P2 | high | cs-issue |
| 23 | 根 README 目录结构/技术栈过时（core/、SHA-1 等） | docs-api | P2 | medium | cs-issue |
| 24 | Metacrypto 品牌残留侵入 CipherCat 文档与源码头注释 | docs-api | P2 | medium | cs-issue |

## 建议下一步

- **P1 共 2 条**（finding-01/02）：建议立刻开 cs-issue 修——模幂块是教学主线，保存失败是主流程静默丢数据
- **P2 共 22 条**：docs-api 维 5 条（finding-20~24）与 maintainability 维清单漂移（15/16）建议同批排入下个迭代（文档同步 + 清单单一数据源收尾）；security 维 4 条为纵深加固，可缓
- 本审计 supersede `2026-07-31-procedure-system`（18 条已全关，旧审计 index 已标 superseded）
