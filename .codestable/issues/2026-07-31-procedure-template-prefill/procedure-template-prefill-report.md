---
doc_type: issue-report
issue: 2026-07-31-procedure-template-prefill
status: draft
issue_path: standard
severity: P1
summary: 模板预填机制三类缺陷：decrypt 预填加密链、sm3_hmac 生成 SHA-256、重载后链重复注入
tags: [procedure, template, prefill, hmac, decrypt]
---

# 模板预填机制缺陷（3 类）Issue Report

> 来源：审计 finding-01/02/03（.codestable/audits/2026-07-31-procedure-system/），owner 已批准修复。

## 1. 问题现象

模板预填机制存在三类独立缺陷：

1. **`crypto_decrypt_func`（🔓 解密）模板注入的是 AES-ECB 加密链** —— 与 `crypto_encrypt_func` 一字不差
2. **`proc_sm3_hmac` 模板生成的代码是 HMAC-SHA256** —— 模板语义是 SM3-HMAC，但 `hash_hmac` 生成器硬编码 SHA-256，HMAC-SM3 不可生成
3. **含预填链的模板在 workspace 保存后重新加载/导入时链被重复注入** —— 每次重载累积一份重复算法链

## 2. 复现步骤

1. 拖出 `crypto_decrypt_func` 模板 → 观察 RETURN 链为 `mode_ecb_encrypt`（应为解密）；生成代码为加密语义
2. 拖出 `proc_sm3_hmac` 模板 → 生成代码：`hash_hmac` 的 JS 生成器输出 HMAC-SHA-256（WebCrypto `{name: 'HMAC', hash: 'SHA-256'}`），Python 回退 sha256
3. 拖出任一含预填链模板（如 `proc_aes_round`）→ 保存 workspace → 重新加载/导入 → 链块出现两份

复现频率：三类均稳定复现（代码路径确定）。

## 3. 期望 vs 实际

**期望行为**：
1. 🔓 解密模板注入解密语义链（如 ECB/CBC 解密路径），生成解密代码
2. `proc_sm3_hmac` 生成 HMAC-SM3 代码
3. 保存/重载不改变已注入内容，链只注入一次

**实际行为**：
1. 解密模板注入加密链，生成加密代码
2. `proc_sm3_hmac` 生成 HMAC-SHA256（国密语义静默错误）
3. 每次重载/导入追加一份链（`__prefilled` 标记仅内存态）

## 4. 环境信息

- 涉及模块 / 功能：procedure 模板预填系统（`TEMPLATE_PREFILL` + `injectPrefill` + 模板注册表）
- 相关文件 / 函数：
  - `src/blocks/procedure/blocks.ts:644-647` — `crypto_decrypt_func` 预填错误条目
  - `src/blocks/procedure/blocks.ts:664-667` — `proc_sm3_hmac` 包 `hash_hmac`
  - `src/generators/javascript/remaining.ts:53-63` — `hash_hmac` 硬编码 HMAC-SHA-256
  - `src/generators/python/remaining.ts:35-36` — 读不存在 HASH 字段回退 sha256
  - `src/blocks/procedure/blocks.ts:814-821` — `__prefilled` 实例属性不持久化
- 运行环境：dev
- 其他上下文：模板注册表纯手工维护（见审计 finding-14）；旧审计 blockly-coverage #3（sm3_hmac 存根）为 partial

## 5. 严重程度

**P1** — 模板是教学主流程入口；解密模板生成加密代码、国密 MAC 静默错误、重载污染内容均直接伤害教学正确性。快速通道判定：fix points > 2（blocks.ts + 双生成器 + 序列化持久化），跨模块 → 标准路径。

## 备注

- 审计 finding-01（high）/ finding-02（high）/ finding-03（medium）为证据来源
- 修复范围提示：finding-01 需解密原子块或模式块解密路径；finding-02 需 `hash_hmac` HASH 字段或专用 HMAC-SM3 实现；finding-03 需 `saveExtraState`/`loadExtraState` 持久化预填标记
