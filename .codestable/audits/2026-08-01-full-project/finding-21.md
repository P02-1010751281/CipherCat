---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "docs-api-02"
nature: docs-api
severity: P2
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 88619d47
---

# Finding 21：DEMO.md / ecc-sbox.md 引用不存在的 crypto_func_def

## 速答

`docs/DEMO.md` 的 Procedure 封装教学章节（112/118/137/152 行）引用 `crypto_func_def` 块——该块在 2026-07-31 对齐原生 procedure 系统时已删除（df798657），"＋新建"现插入原生 `procedures_defreturn`。`docs/blocks/ecc-sbox.md:31` 函数封装类目同样列 crypto_func_def。

## 关键证据

- `docs/DEMO.md:112/118/137/152` — crypto_func_def 教学路径
- `docs/blocks/ecc-sbox.md:31` — 函数封装类目列 crypto_func_def
- 代码事实：`src/blocks/procedure/` 已无 crypto_func_def 注册（原生 procedures_defreturn/callreturn 覆盖）

## 影响

按 DEMO 教学的用户创建不出文档描述的块；函数封装核心教学路径失效。与 Session 4/5 修过的 demos/*.json 同源（JSON 已修，文档漏修）。

## 修复方向

DEMO.md 与 ecc-sbox.md 的 crypto_func_def 引用改为 procedures_defreturn + 类型参数说明（CRYPTO_PARAM_TYPES）。

## 建议动作

`cs-issue`（文档同步批次）。
