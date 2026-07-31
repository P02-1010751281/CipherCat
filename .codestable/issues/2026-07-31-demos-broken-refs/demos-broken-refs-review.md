---
doc_type: issue-review
issue: 2026-07-31-demos-broken-refs
status: passed
reviewer: self
review_date: 2026-07-31
related: [demos-broken-refs-report.md, demos-broken-refs-fix-note.md]
tags: [demos, serialization, generator]
---

# demos 损坏引用修复 Review

## 审查结论：通过（0 🔴 0 🟡）

## 验证证据链

| 维度 | 证据 |
|---|---|
| 静态残留 | 17 文件 grep 无 `crypto_func_def` / `data_text` 残留 |
| 注册覆盖 | demo 全部块类型 ∈ src/blocks 注册集合（97 注册块 + 原生） |
| 变量对齐 | 每个 def 块 params id 与 body `variables_get` VAR id 差集为空（含 SM4 拆字特殊场景） |
| 浏览器导入 | 6 个代表 demo（链型/拆字/骨架/哈希/HMAC/原子）导入 0 警告、0 error 块、顶层块数正确 |
| 浏览器生成 | JS/Python 双语言均成功：`return aesSubBytes(...)`、`return sm4RoundFunc(state_0..3, rk)`、`return hmac(key,msg)`、hex 字面量保留 |
| 构建门禁 | vue-tsc 0 errors · eslint 0 errors · vite build ✓ |

## 关键风险核验

1. **`hasStatements: false` 序列化兼容**：loadExtraState 先处理（setStatements_(false) 移除 STACK），RETURN input 连接不受影响——浏览器实测通过
2. **生成器 STACK 守卫**：修复后空 STACK def 块生成 `// TODO` body + RETURN 表达式，行为正确（JS/PY 双实测）
3. **变量 id 稳定性**：`param_` + 名字规则与旧导出一致，body 引用不漂移——静态差集为空佐证

## 遗留（已闭环）

- `ML-KEM-Atomic.json` 4 个 `pq_*_vec` 块已映射到现有原子原语（`pq_sample_poly_cbd` / `pq_ntt` / `pq_sample_ntt` / `pq_mat_vec_mul`），浏览器实测导入 0 警告 + JS/Python 双语言生成全部原语正确，README ⚠️ 已移除
