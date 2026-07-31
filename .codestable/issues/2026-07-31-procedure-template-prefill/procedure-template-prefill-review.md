---
doc_type: issue-review
issue: 2026-07-31-procedure-template-prefill
status: passed
reviewer: subagent
reviewed: 2026-07-31
round: 2
lane_a_state: completed
lane_a_ref: ReviewTemplateFix
lane_a_reason: ""
lane_b_state: unavailable
lane_b_reason: OCR CLI 未启用；密码学正确性以官方向量交叉验证代替
---

# 模板预填缺陷修复 代码审查报告

## 1. Scope And Inputs

- Report: `procedure-template-prefill-report.md`（confirmed, standard）
- Analysis: `procedure-template-prefill-analysis.md`（confirmed，方案 A）
- Fix-note: `procedure-template-prefill-fix-note.md`（含 review-fix 记录）
- Diff basis: `git diff`（11 文件：procedure/blocks.ts、remaining.ts×2、modes/blocks.ts×3、modes/helpers.ts×2、lib.rs 无关基线）
- Review mode: full-rereview（round 2，首轮 2 blocking 修复后）

### Independent Review

- 环节 A: independent-agent reviewer（ReviewTemplateFix）round 1 + round 2 均 completed
  - round 1: 2 🔴（MixColumns 行列混淆、Python rcon 溢出）
  - round 2（修复后复审）: **No issues. totals: 0🔴 0🟡 0🔵**
- 环节 B OCR: unavailable（密码学实现以 FIPS-197/SP 800-38A 官方向量交叉验证代替）
- Merge policy: 两轮 reviewer 结论逐条本地核验（修复 + 向量复现）

## 2. Diff Summary

- 新增：`mode_ecb_decrypt` 块 + JS/PY 生成器 + AES 解密 helper（逆 S-box/逆轮/逆列混合）
- 修改：`hash_hmac` HASH 下拉 + 双生成器 SM3/HMAC 分支；`TEMPLATE_PREFILL` chainFields + decrypt 条目；模板块 save/loadExtraState + 注入防御；**既有 encrypt helper 列布局修正 + Python RCON 表**（review-fix）
- 风险热点：密码学实现（AES/SM3）

## 3. Adversarial Pass

- 假设的生产 bug：新增 decrypt 生成非标准 AES 密文/崩溃 → 首轮确认（🔴）；修复后以 FIPS-197 C.1 + SP 800-38A 第二组向量双向验证，反例消除
- SM3 实现：reviewer 确认通过官方 SM3 向量，JS/Python HMAC 输出一致
- 攻击过的反例：列读写不一致（读取改列回写未改）、rcon 越界（256/512）、JS 32 位溢出（>>>0 处理）、chainFields 未生效、二次注入绕过——全部核验

## 4. Findings

### blocking

- [x] REV-001 `src/generators/.../modes/helpers.ts` — MixColumns 对行混合（enc/dec 同源错，密文非标准 AES）→ 已修复（读取+回写均列布局），向量通过
- [x] REV-002 `src/generators/python/symmetric/modes/helpers.ts:170` — rcon 溢出 256/512 → SBOX 越界 IndexError → 已修复（RCON 表），无崩溃

### important

none

### nit

none

## 5. Test And QA Focus

- QA 复核点：`mode_ecb_encrypt` 输出行为变化（非标准→标准 AES，教学正确性提升）；`proc_hmac_sha256` 默认分支回归（代码未变）
- 官方向量：FIPS-197 C.1（69c4e0d8…）+ SP 800-38A（2b7e1516…↔3ad77bb4…）JS/Python 双向通过

## 6. Residual Risk

- 无 blocking/important 残留；既有 encrypt 行为修正属预期（同根因修复），用户侧无需迁移（旧密文为新密文替换）

## 7. Verdict

- Status: passed
- Next: issue 收尾——ConfirmFixCompletion 确认后关闭；审计 finding-01/02/03 标 closed

## 8. Focused Closure

none（round 2 完整复审）
