---
doc_type: goal
goal: quality-followups
status: active
---

# 审查后质量改进

## Objective

完成上一轮全项目审计留下的后续工作：建立最小正式单元测试体系，统一标准元数据并复核 Errata，改善前端拆包，补充循环依赖扫描与持续集成检查，最后重新验收。

## Starting Point

上一轮已完成文档调研、文献下载、模板/Demo 回归、TypeScript/Vite/Rust 检查和生产依赖审计。当前工作树包含既有未提交修改，本 goal 只追加必要变更并保留这些修改。

## Acceptance Criteria

- `test:unit` 可重复运行并通过，且覆盖核心纯函数和边界行为。
- 标准元数据检查可重复运行，当前标准版本、来源、PDF 哈希和 Errata 状态可追溯。
- 生产构建拆分策略有实际效果，或将无法进一步拆分的原因记录为残余风险。
- CI 包含依赖安装、lint、类型检查、构建、文档链接、模板/Demo 验证、单元测试和循环依赖检查。
- 全量验收通过并写入 iteration 与功能验收记录。

## Non-Goals

- 不宣称任何密码算法或模块已取得 CAVP/CMVP 认证。
- 不把可信测评逻辑移回浏览器，不改变后端测评边界。
- 不提交、不 push。

## Decisions And Assumptions

- 遵循 ponytail：优先复用现有纯函数和已安装工具，仅在缺能力时增加 Vitest 与 madge。
- 标准元数据校验采用仓库内可审查的 manifest，不重写已有标准正文。
- 大 chunk 优先通过动态导入和现有 Vite 配置解决，不引入新的运行时框架。

## Current State

实现与本地验证已完成：新增 10 个 Vitest 单元测试、37 项标准元数据 manifest 与校验器、64 KiB 首屏入口预算、madge 循环依赖检查和 GitHub Actions 质量门禁；前端入口已将编辑器注册与重型渲染依赖按路由/功能拆分。当前证据见上一轮审计报告：`.codestable/audits/2026-09-12-ciphercat-full-review/index.md`。

## Unresolved Assumptions

- Rust crate 当前没有测试用例，`cargo test --all-targets` 的通过结论仅表示编译与测试运行器成功。
- 64 KiB 预算针对 Vite 生成的 `index-*.js` 首屏入口；编辑器、文档渲染和 Mermaid 的动态 chunk 仍保留独立加载成本。
- 标准 manifest 已统一身份、版本、来源、Errata 和本地 PDF 哈希；逐目录向量来源、实现状态与安全边界仍按后续研究计划补齐。

## Next Action

等待独立功能验收结果，写入 iteration 与 functional-acceptance 证据，并在所有 acceptance criteria 满足后关闭 goal。
