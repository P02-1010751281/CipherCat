---
doc_type: audit-index
audit: 2026-09-07-full-project-review
scope: "CipherCat src/ + src-tauri/ + docs/ + demos/ + scripts/，覆盖 bug/security/performance/maintainability/docs-api；架构漂移因无 requirements/ADR 跳过"
created: 2026-09-07
status: superseded
superseded_by: 2026-09-12-ciphercat-full-review
total_findings: 3
---

# 全项目审计 — 2026-09-07（CipherCat）

## 结论

本次对源代码、原生端、文档、demo、模板校验脚本和质量门禁做了只读审查。没有发现新的 P0 或可直接确认的密码学实现错误；发现 1 条 P1 级质量门禁问题、2 条 P2 级可维护性/产品一致性问题。历史审计中的旧问题不在本次重复列出，旧索引已标记为 superseded。

`src-tauri/` 未发现自定义 IPC、shell/process/http 暴露或明显的权限扩大；文档相对链接扫描无断链，29/29 模板和 57/57 demo 校验通过。

## 验证矩阵

| 检查 | 结果 |
|---|---|
| `npm run build`（含 `vue-tsc --noEmit`） | 通过 |
| 模板校验 | 29/29 通过 |
| demo JS/Python 校验 | 57/57 通过 |
| 文档相对链接扫描 | 0 个断链 |
| `git diff --check` | 通过 |
| `npm run lint:check` | 失败：约 44,471 个问题，主要来自序列化预填充源文件和浏览器全局配置缺口 |
| `cargo test --manifest-path src-tauri/Cargo.toml --all-targets` | 环境阻塞：无法解析 `static.crates.io`，未进入编译/测试 |

## 发现清单

| 编号 | 维度 | 发现 | 严重度 | 置信度 | 建议 |
|---|---|---|---|---|---|
| CC-01 | maintainability | ESLint 规则未区分生成/序列化源文件，且缺少 `HTMLAnchorElement` 全局，导致 lint 不能作为有效质量门禁 | P1 | high | cs-refactor |
| CC-02 | bug / docs-api | `proc_zuc_keystream` 被注册到 PQC 子类，而不是 ZUC/流密码子类 | P2 | high | cs-issue |
| CC-03 | maintainability | procedure flyout 用空 catch 隐藏 Blockly 异常，并计算未使用的 `paramType` | P2 | high | cs-refactor |

详细证据：

- [CC-01](finding-01-eslint-gate.md)
- [CC-02](finding-02-zuc-template-category.md)
- [CC-03](finding-03-procedure-flyout-catch.md)

## 审计边界

`.codestable/requirements/adrs/` 不存在，因此没有做需求/ADR 架构漂移判定；这不等同于架构合规已证明。当前工作树中已有用户/前序工作未提交的文档与研究变更，本审计没有覆盖或重写它们。
