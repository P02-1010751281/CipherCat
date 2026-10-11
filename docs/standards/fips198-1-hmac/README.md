# FIPS 198-1 — HMAC 消息认证码

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 198-1 — The Keyed-Hash Message Authentication Code (HMAC)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.198-1.pdf
      PDF: [NIST.FIPS.198-1.pdf](./NIST.FIPS.198-1.pdf)

## 公式

HMAC(K, text) = H((K₀ ⊕ opad) ‖ H((K₀ ⊕ ipad) ‖ text))

## 相关块

| 块 | 说明 |
|----|------|
| `hash_hmac` | HMAC（SHA-256 为 NIST 批准哈希选项；SM3-HMAC 是项目扩展，不属于 FIPS 198-1 的 NIST 批准哈希选项） |
| `hmac_sha256` / `sm3_hmac` | 生成器内部 helper；模板 `proc_hmac_sha256` / `proc_sm3_hmac` 复用 `hash_hmac` |

SHA-256 遵循 FIPS 198-1 对批准底层哈希函数的适用范围；SM3-HMAC 的存在不代表 NIST 认可或验证。项目回归不等于完整 CAVP 算法验证或产品认证。

## 函数/原语索引

- [01-HMAC.md](./01-HMAC.md)：HMAC 总览
- [02-Key-Normalization.md](./02-Key-Normalization.md)：密钥规范化
- [03-Construction.md](./03-Construction.md)：ipad/opad 内外层构造

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 198-1 — HMAC 消息认证码**，按标准条款拆分为 3 个结构化条目，覆盖 「§4」、「FIPS 198-1 §3」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [NIST FIPS 198-1 — HMAC 参考](./01-HMAC.md) | §4 | 仅参考（未映射为块实现） |
| [HMAC — 密钥规范化原语](./02-Key-Normalization.md) | FIPS 198-1 §3 | 由 `hash_hmac` 内部实现 |
| [HMAC — 内外层构造原语](./03-Construction.md) | §4 | 仅参考（未映射为块实现） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `hash_hmac`(HASH 下拉：SHA-256 / SM3) | FIPS 198-1 HMAC；SHA-256 使用批准底层哈希，SM3-HMAC 标为项目扩展，不冒称 NIST 批准选项 | `hmac-block-contract.test.ts` 通过真实 Blockly 块双语执行：RFC 4231 SHA-256 case 1/6、Node/OpenSSL SM3 交叉结果、非法字节与孤立代理项拒绝、合法 Unicode 一致性、公开输出为 JS `Uint8Array` / Python `bytes` 及同步组合；HMAC Demo 59 项回归中的对应工作区也通过 | 完整官方 HMAC 测试集、完整 GB/T/GM/T 符合性、密钥擦除/常量时间、CAVP 或产品认证 |

示例工作区：`demos/procedures/HMAC-SHA256.json`；Procedure 模板：`proc_hmac_sha256`、`proc_sm3_hmac（模板消息输入留空）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
