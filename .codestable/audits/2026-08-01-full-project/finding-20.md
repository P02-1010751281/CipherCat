---
doc_type: audit-finding
audit: 2026-08-01-full-project
finding_id: "docs-api-01"
nature: docs-api
severity: P2
confidence: high
suggested_action: cs-issue
status: closed
closed_by: 88619d47
---

# Finding 20：docs/blocks/ 层2 便利块清单全部失效（9+ 已删块）

## 速答

`docs/blocks/` 块索引完整列出已删除的层2 便利块：aes_round、aes_last_round、aes_key_schedule、sm4_round、sm4_key_schedule、mode_ecb、mode_cbc、mode_ctr、mode_gcm（symmetric.md）；sm3_hash（hash.md，仅剩 pad/compress 原子块 + proc_sm3_hash 模板）；pq_ntt_vec（post-quantum.md，proc_ntt_vec 模板替代）。convenience→procedure 重构已删，文档未跟上。

## 关键证据

- `docs/blocks/symmetric.md` — 9 个未注册块类型完整列出
- `docs/blocks/hash.md` — sm3_hash 块不存在
- `docs/blocks/post-quantum.md` — pq_ntt_vec 不存在

## 影响

文档声称的块拖不出来（未注册），教学用户按文档学习即碰壁；块清单是 docs/blocks/INDEX.md 全站引用的核心资产，失真即全站失真。

## 修复方向

docs/blocks/ 各子类目 md 与 INDEX.md 逐块对账注册事实（src/blocks/ 各 category 的 *_BLOCK_TYPES 数组），删除已删块、补充 procedure 模板映射说明。

## 建议动作

`cs-issue`（文档同步批次，与 finding-21/22 同批）。
