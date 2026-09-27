---
doc_type: audit-index
audit: 2026-09-12-ciphercat-full-review
scope: "CipherCat 源代码、生成器、模板、demo、脚本、Tauri 配置、文档、标准目录和本地文献证据链；同时核对前端与 metacrypt_server 测评边界"
created: 2026-09-12
status: active
total_findings: 4
---

# CipherCat 全项目审计 — 2026-09-12

## 结论

本次审计覆盖源代码、Blockly 块注册、JavaScript/Python 生成器、29 个模板、57 个 demo、脚本、Tauri 原生配置、文档/标准目录和下载文献。当前没有发现 P0 或可直接确认的密码学算法实现错误；此前发现的 ESLint 门禁、ZUC 模板分类和 procedure 静默异常已在工作树中修正。

当前主要残余风险是动态功能 chunk 仍较大，以及标准目录的向量来源/实现状态/安全边界仍需逐目录补齐。单元测试、标准身份/来源/哈希/Errata manifest、循环依赖扫描和 CI 门禁已经落地。前端可信度边界已经写入规则和文档：可信随机性测评、隔离执行和最终报告归 `metacrypt_server` 后端，CipherCat 只负责编辑、生成和用户试运行。

## 验证矩阵

| 检查 | 结果 |
|---|---|
| `npm run lint:check` | 通过：0 errors，0 warnings |
| `npm run type-check` | 通过 |
| `npm run test:unit` | 通过：3 个测试文件、10 个测试 |
| `npm run standards:check` | 通过：37 个目录、33 个本地 PDF artifacts、0 errors |
| `npm run cycles:check` | 通过：357 个 TypeScript/Vue 文件、无循环依赖 |
| `npm run build` | 通过；首屏入口约 31.6 kB，动态 Mermaid/docs-renderer 仍较大 |
| `npm run build:check-bundle` | 通过：首屏入口 31,570 bytes，预算 65,536 bytes |
| `npm run verify:all` | 29/29 模板、57/57 demo 通过（JS/Python） |
| `npm run docs:check-links` | 229 个 Markdown 文件，0 个断链 |
| `git diff --check` | 通过 |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | 通过 |
| `cargo test --manifest-path src-tauri/Cargo.toml --all-targets` | 通过：0 tests，0 failures |
| `npm audit --registry=https://registry.npmjs.org --omit=dev --audit-level=high` | 通过：0 vulnerabilities |

## 发现清单

| 编号 | 维度 | 发现 | 严重度 | 置信度 | 状态 |
|---|---|---|---|---|---|
| CC-20260912-01 | performance | 动态功能仍有大于 500 kB 的 chunk，但首屏入口已按路由拆出 | P2 | high | mitigated |
| CC-20260912-02 | testing | 已有可执行回归 harness，现已补 Vitest 单元测试门禁 | P2 | high | resolved |
| CC-20260912-03 | standards/docs | 标准身份、版本、来源、PDF 哈希和 Errata 已统一进 manifest；逐目录向量/安全边界仍需补全 | P2 | high | mitigated |
| CC-20260912-04 | security/docs-api | 前端试运行与后端可信测评边界此前容易被误读；本次已在规则、研究和标准索引中明确 | P1 | high | resolved |

详细证据：

- [CC-20260912-01 大 chunk](finding-01-large-chunks.md)
- [CC-20260912-02 单元测试缺口](finding-02-unit-test-gap.md)
- [CC-20260912-03 标准证据元数据](finding-03-standard-provenance.md)
- [CC-20260912-04 测评执行面边界](finding-04-assessment-boundary.md)

## 审计边界

未把 `.git`、依赖目录、构建产物或第三方源码内部当作项目源代码审查；只核对其版本、来源和构建一致性。`madge` 当前已作为开发依赖接入，已对 357 个 TypeScript/Vue 源文件完成扫描；该结果不覆盖第三方源码内部，也不替代运行时安全审计。远程仓库同步/推送不属于本次授权动作。
