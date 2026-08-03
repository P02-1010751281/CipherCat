---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "security-02"
nature: security
severity: P2
confidence: medium
suggested_action: cs-issue
status: closed
closed_by: 62e4f90b
---

# Finding 07：导入 JSON/XML 零校验直喂 Blockly 反序列化

## 速答

导入路径无 schema/类型白名单/大小限制，`.txt` 宽松接受，JSON/XML 直接进 `Blockly.serialization` 反序列化。社交工程导入恶意 workspace 可致卡死/部分加载（深递归、超大块图、异常字段）。

## 关键证据

- `src/utils/workspace/serialization.ts` — `validTypes` 含 `.txt`，`loadJson`/`loadXml` 零校验直喂 Blockly
- `src/utils/workspace/index.ts` — `handleFileUpload` 按扩展名/Content-Type 猜测分发
- `src/components/CryptoFunctionPanel.vue` — 模板 JSON 导入 `blocks.append` 无校验
- `src/utils/migration.ts` — 深递归仅 try/catch 兜底

## 影响

本地导入场景主要威胁是恶意文件投递（用户主动导入攻击者提供的 workspace）。Blockly 反序列化对畸形输入无硬性崩溃保护，可致编辑器卡死。migration 无原型污染模式（已核查），但无输入门禁。

## 修复方向

导入前校验：文件大小上限 + 顶层块类型白名单 + JSON schema 轻量校验；`.txt` 降级为仅当内容可解析时才接受。

## 建议动作

`cs-issue`。
