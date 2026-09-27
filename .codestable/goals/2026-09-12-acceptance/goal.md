---
doc_type: goal
goal: acceptance-2026-09-12
status: complete
---

# CipherCat 全量人工产品验收

## Objective

实际启动本地 CipherCat，逐一操作可见项目、编辑器、积木分类、模板、正式 Demo 和文档入口；对验收中发现的阻断问题做最小修复，并以工程门禁和独立复核结果形成可追溯验收记录。

## Scope

- 本地 Vite 应用：`http://127.0.0.1:3001/#/`
- 工作区项目管理、Blockly 编辑器、双语言代码生成、模板面板、工作区导入/导出入口
- `demos/` 中正式工作区 Demo 与文档中心可见条目
- 代码、标准元数据、文档链接、构建、模板/Demo 回归、Rust 和依赖安全检查

## Non-Goals

- 不宣称 CAVP/ACVTS、CMVP/FIPS 140-3、形式化验证或侧信道认证。
- 不把可信测评逻辑放回前端；本仓库的前端仅负责用户构建和代码试运行。
- 不点击会删除用户工作区的“清空工作区”，不提交或 push。

## Acceptance Criteria

- 正式 Demo 能通过 UI 逐一导入并生成非空代码。
- 文档中心每个可见导航条目能打开正文，且搜索可定位 ZUC 文档。
- 编辑器分类、模板增删、项目保存/重开、双语言生成可操作。
- `lint:check`、`type-check`、`test:unit`、`build`、bundle、文档、标准、循环依赖、Rust、模板/Demo 和依赖审计通过。
- 证据、残余风险和未覆盖项写入 iteration 与功能验收记录。

## Current State

人工验收已完成，报告见 `functional-acceptance.md`。独立只读复核任务已派发；当前任务列表接口未返回其可读取结果，因此不把它伪造为额外通过证据。
