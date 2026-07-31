---
doc_type: issue-report
issue: 2026-07-31-demos-broken-refs
status: confirmed
issue_path: standard
severity: P2
summary: demos/ 17 个 JSON 引用已删除块类型（crypto_func_def ×14、data_text ×2），导入必失败；另有 ML-KEM-Atomic 引用 4 个已删 pq_*_vec 块
tags: [demos, block-registry, serialization, migration]
---

# demos 损坏引用 Issue Report

## 问题

`demos/` 下 17 个 `.json` 工作区文件引用**已删除的块类型**，导入即创建 error 块 / 失败：

| 块类型 | 引用文件数 | 状态 |
|---|---|---|
| `crypto_func_def`（Session 3 移除的自定义函数块） | 14 | 已修复 |
| `data_text`（从未注册的文本字面量块） | 2（AES-Atomic-Round、SHA256-Atomic-Hash） | 已修复 |
| `pq_cbd_ntt_vec` / `pq_ntt_vec` / `pq_sample_ntt_mat` / `pq_mat_vec_mul_ntt`（已删除的 PQ 向量块） | 1（ML-KEM-Atomic） | **待决策** |

## 根因

Session 3 重构（`df798657` 等）将自定义函数块 `crypto_func_def` 移除、改用原生 `procedures_defreturn` 覆盖实现，但 `demos/` 导出文件未随迁移更新。`data_text` 为更早的便利块残留，git 历史中从未在 `src/` 注册。

## 影响

- 14 个 procedure demo 全部无法导入（教学示例失效）
- 2 个原子 demo 含未注册块（导入出现 error 块）

## 修复范围

本次修复 16 个文件（14 × `crypto_func_def` 转换 + 2 × `data_text` 替换）；`ML-KEM-Atomic` 的 `pq_*_vec` 替换涉及块语义映射决策（`pq_ntt` vs `pq_ntt_vec` 等），单列遗留。
