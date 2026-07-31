---
doc_type: issue-analysis
issue: 2026-07-31-procedure-template-prefill
status: draft
root_cause_type: logic
related: [procedure-template-prefill-report.md]
tags: [procedure, template, prefill, hmac, decrypt, persistence]
---

# 模板预填机制缺陷（3 类）根因分析

## 1. 问题定位

| 关键位置 | 说明 |
|---|---|
| `src/blocks/procedure/blocks.ts:644-647` | `crypto_decrypt_func` 预填条目 = `['variables_get','mode_ecb_encrypt']`（与 encrypt 一字不差，应为解密） |
| `src/blocks/procedure/blocks.ts:664-667` | `proc_sm3_hmac` 预填链包 `hash_hmac` |
| `src/blocks/remaining.ts:23-29` | `hash_hmac` 块仅 KEY/MSG 输入，**无 HASH 字段** |
| `src/generators/javascript/remaining.ts:53-63` | `hash_hmac` JS 生成器硬编码 WebCrypto HMAC-SHA-256 |
| `src/generators/python/remaining.ts:35-36` | PY 生成器读不存在的 HASH 字段，回退 sha256 |
| `src/blocks/symmetric/modes/blocks.ts:11-13` | 仅 `mode_ecb/cbc/ctr_encrypt`，**无任何解密块** |
| `src/blocks/procedure/blocks.ts:792-824` | `_makeTemplateBlock` 模板块**无 saveExtraState/loadExtraState** |
| `src/blocks/procedure/blocks.ts:814-821` | onchange 用实例属性 `__prefilled`（内存态，序列化丢失） |

## 2. 失败路径还原

**正常路径**：拖出模板 → onchange 首次注入预填链 → 生成/保存/重载均保持一份正确链。

**失败路径**：
1. 拖出 🔓 解密 → 注入 `mode_ecb_encrypt`（分叉点：`blocks.ts:644-647` 条目复制粘贴错误，且无 decrypt 原子块可选）
2. 拖出 HMAC_SM3 → 注入 `hash_hmac` → JS 生成器输出 `{hash: 'SHA-256'}`（分叉点：`remaining.ts:53-63` 硬编码；块上无 HASH 字段可选 SM3；PY 读空字段回退 sha256）
3. 保存→重载：块重建，`__prefilled` 实例属性丢失 → onchange 再次触发注入（分叉点：`blocks.ts:814-821` 标记不持久化）

**分叉点**：均为确定路径，无环境依赖。

## 3. 根因

**根因类型**：logic（+ missing-guard）

**根因描述**：模板预填机制的手工维护缺陷三处独立成因——
1. `TEMPLATE_PREFILL` 条目错误（decrypt 复制 encrypt 未改）
2. `hash_hmac` 缺少算法选择能力且双生成器未实现 HMAC-SM3
3. 预填防重标记（`__prefilled`）仅内存态，未随序列化持久化

**是否有多个根因**：是（三个独立成因，共享修复面：`TEMPLATE_PREFILL` + 模板块工厂 + hash_hmac 链路）。

## 4. 影响面

- **影响范围**：三类均影响模板教学主流程；decrypt/sm3 为语义错误（无报错），重复注入为内容污染
- **潜在受害模块**：`proc_hmac_sha256`（同用 hash_hmac，当前默认 SHA-256 恰为正确语义，但无显式保证）；所有含预填链模板的重载场景
- **数据完整性风险**：有——重载累积重复块进入保存内容（finding-03）
- **严重程度复核**：维持 P1（教学主流程语义正确性）

## 5. 修复方案

### 方案 A（推荐）：通用 HASH 下拉 + ECB 解密块 + 预填持久化

- **做什么**：
  1. `hash_hmac` 块加 `HASH` 下拉（`SHA-256` / `SM3`）；JS 生成器实现纯 JS HMAC-SM3（HASH=SM3 时），Python 生成器实现纯 Python HMAC-SM3；默认 SHA-256 保持 `proc_hmac_sha256` 语义
  2. `TEMPLATE_PREFILL` 支持 `chainFields`（链块字段覆盖，如 `{hash_hmac: {HASH: 'SM3'}}`），`proc_sm3_hmac` 条目声明 HASH=SM3
  3. 新增 `mode_ecb_decrypt` 原子块（block + JS/PY 生成器 + AES 解密 helper：InvSbox/InvShiftRows/InvMixColumns + 逆序轮密钥）；`crypto_decrypt_func` 预填指向它
  4. 模板块加 `saveExtraState`/`loadExtraState` 持久化 `prefilled` 标记；onchange 增加注入防御（RETURN/BODY 已有子块则跳过）
- **优点**：符合"通用块 + 预设"设计原则；hash_hmac 一次升级服务两个模板；持久化修复根治 finding-03
- **缺点 / 风险**：改动面最大（blocks.ts + remaining.ts + modes + 双生成器 + helpers）；AES 解密与 HMAC-SM3 需双语言实现（机械但量大）
- **影响面**：`src/blocks/procedure/blocks.ts`、`src/blocks/remaining.ts`、`src/blocks/symmetric/modes/blocks.ts`、`src/generators/javascript/{remaining.ts, symmetric/modes/helpers.ts}`、`src/generators/python/{remaining.ts, symmetric/modes/helpers.ts}`、两生成器 index 注册

### 方案 B：专用 sm3_hmac 块 + 无状态防御

- **做什么**：1/2 改为新增专用 `sm3_hmac` 原子块（固定 SM3，双生成器纯实现），`proc_sm3_hmac` 预填改指它；3 同方案 A；4 仅用注入防御（RETURN/BODY 非空跳过），不碰序列化
- **优点**：不改预填机制；模板块无序列化改动
- **缺点 / 风险**：新增块 + 三处注册（blocks/modes? 不——hash 类目 + 两生成器 index）；HMAC-SM3 双实现不可省；**旧 workspace 中已加载的重叠链不清理**（防御只防新增）；序列化方案缺位则 finding-03 治标
- **影响面**：同 A 减去序列化部分

### 方案 C：A 的最小切片（分两次提交）

- **做什么**：先修 finding-01（decrypt：新增 mode_ecb_decrypt 块 + 预填条目）单独提交；再修 finding-02（hash_hmac HASH 下拉 + HMAC-SM3 + chainFields）单独提交；再修 finding-03（持久化）单独提交
- **优点**：三个独立小 diff，review/回滚清晰；符合 scoped-commit
- **缺点 / 风险**：三次 checkpoint 流程（若分别开 issue）；其余同 A
- **影响面**：同 A

### 推荐方案

**推荐方案 A**（可拆分为 C 的提交顺序执行）：根因最直接（三处成因全治）、符合通用块原则、finding-03 根治。改动面虽大但均为机械实现（AES 解密/ HMAC-SM3 有明确算法规范可对照）。执行时按 C 的三个切片顺序提交，便于 review。
