---
doc_type: issue-fix
issue: 2026-07-31-demos-broken-refs
status: confirmed
path: standard
fix_date: 2026-07-31
related: [demos-broken-refs-report.md]
tags: [demos, serialization, generator, migration]
---

# demos 损坏引用修复记录

## 转换方案

### 1. `crypto_func_def` → `procedures_defreturn`（14 文件）

- `fields.FUNC_NAME` → `fields.NAME`；删除 `RETURN_TYPE`（新系统 def 块返回值由 RETURN 链表达，`setCheck(null)` 不校验类型）
- `extraState` → `{params: [{name, id, type}], hasStatements: false}`（与 `saveExtraState`/`loadExtraState` 格式对齐；`hasStatements: false` 使导入后无 STACK input）
- `inputs.STACK` → `inputs.RETURN`（表达式链从 statement 移到 defreturn 的返回值 input）
- **变量 id 对齐**：参数 id = `param_` + 参数名（如 `state` → `param_state`），与 body 中 `variables_get` 的 VAR id 匹配（Blockly 12 变量按 id 引用）
- **SM4-Round 特殊**：旧导出 body 用 `sm4_round_func` 的 X0..X3 引用 `param_state_0..3`（state 拆 4 字）而 def 参数只有 `state` —— 参数改为 `state_0..3`（int）+ `rk`（int），id 与 body 变量完全对齐，生成代码变量全部由参数声明

### 2. `data_text` → `data_value`（2 文件）

- 同构替换：`TEXT` → `NUM`（`data_value` 为 FieldTextInput 任意文本，`setOutput(true, null)` 兼容）
- AES-Atomic-Round 占位文本 `"16-byte state..."` 改为合法 hex 字面量 `0x00112233445566778899aabbccddeeff`（`data_value` 生成器非数字原样输出，原值会生成非法代码）

### 3. 连带修复：def 块生成器 STACK 守卫（2 文件）

导入 `hasStatements: false` 的 def 块后，JS/Python 生成器直接 `statementToCode(block, 'STACK')` 抛 `Input "STACK" doesn't exist`。修复：`block.getInput('STACK')` 存在才取 STACK 代码，否则走空 body fallback（TODO 注释）。

## 验证

- 静态：17 文件无 `crypto_func_def`/`data_text` 残留；全部块类型 ∈ 注册集合；def 参数 id 与 body 变量 id 全对齐
- 浏览器（Chromium 实测 6 个代表）：AES-Round / SM4-Round / Mode-ECB / SM3-Hash / HMAC-SHA256 / AES-Atomic-Round 全部导入 0 警告 + JS/Python 双语言生成成功（含官方向量 hex 保留）
- 构建：vue-tsc 0 errors · eslint 0 errors · vite build ✓

## 遗留（已闭环）

- `demos/ML-KEM-Atomic.json` 引用 4 个已删除 `pq_*_vec` 便利块——**后续已修复**：映射到现有原子原语（旧块为 `_pq` 工厂黑盒，33fe4350 删除）——`pq_cbd_ntt_vec` → `pq_sample_poly_cbd`（ETA=2, q=3329）、`pq_ntt_vec` → `pq_ntt`（q=3329, n=256）、`pq_sample_ntt_mat` → `pq_sample_ntt`（q=3329）、`pq_mat_vec_mul_ntt` → `pq_mat_vec_mul`（q=3329）；K 下拉删除（原子块无 K 参数）。浏览器实测导入 0 警告 + 双语言生成全部原语正确。
