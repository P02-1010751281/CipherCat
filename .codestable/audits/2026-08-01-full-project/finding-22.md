---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "docs-api-03"
nature: docs-api
severity: P2
confidence: high
suggested_action: cs-issue
---

# Finding 22：块数统计三处文档三个数字（118/110+/71）全与代码不符

## 速答

`docs/blocks/INDEX.md` 标题 118 块、`docs/README.md` 声称 110+ 块 12 类目、根 `README.md` 声称 71 块——三个数字互不相同且均与当前注册数不符（convenience→procedure 重构后块集已变）。

## 关键证据

- `docs/blocks/INDEX.md:3` — 总块数 118 及分项计数
- `docs/README.md:5` — 110+ 块 12 类目
- `README.md` — 71 块
- 代码事实：`src/utils/toolbox-config.ts` 16 类目 + `ALL_BLOCK_TYPES` 联合（含 procedure 模板 27 个）

## 影响

块数是文档站核心宣传数字，三处三值直接暴露文档无人维护；用户无法从文档获知真实能力面。

## 修复方向

统一从代码派生块数（脚本统计 ALL_BLOCK_TYPES 长度），文档只写"以注册表为准"或注入实际数字。

## 建议动作

`cs-issue`（文档同步批次）。
