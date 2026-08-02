---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "maintainability-01"
nature: maintainability
severity: P2
confidence: high
suggested_action: cs-refactor
status: closed
closed_by: 88619d47
---

# Finding 15：CryptoFunctionPanel PANEL_PARAM 手工清单（第 4 份）

## 速答

面板注释自述"模板清单从注册表派生（单一数据源）"，但参数展示文案仍用手工 `PANEL_PARAM` 清单重复注册表已有的 paramName/paramType。13/27 覆盖、大小写与注册表不一致（Bytes vs bytes）、其余 14 个静默回退 '1 param'。

## 关键证据

- `src/components/CryptoFunctionPanel.vue:69-83` — `PANEL_PARAM` 13 键手工清单；`:100` `param: PANEL_PARAM[type] || '1 param'`
- `src/blocks/procedure/blocks.ts:884-888` — 注册表已有 paramName/paramType；`:948-971` 注册调用（`proc_mode_ecb` paramType='bytes'，面板显示 'Bytes'）

## 影响

新增/改名模板只改注册表时面板展示陈旧或缺失，无编译期/运行期告警。双份维护必然漂移。

## 修复方向

删 PANEL_PARAM，改为 `1 param: ${info.paramName}:${info.paramType}` 从 TEMPLATE_REGISTRY 派生。

## 建议动作

`cs-refactor`。
