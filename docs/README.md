# CipherCat 文档中心

> [English](./README.en.md)

🐱 **后量子密码学可视化编程平台** — 基于 Blockly 12.x 和 Vue 3 (Composition API + TypeScript)。


---

## 文档索引

### 📖 项目文档

| 文档 | 受众 | 说明 |
|------|------|------|
| [BLOCKLY-GUIDE.md](./guides/BLOCKLY-GUIDE.md) | 用户/开发者 | Blockly 使用指南：编辑器操作、类型系统、函数模板、算法拼装样例 |
| [DEMO.md](./guides/DEMO.md) | 用户/开发者 | 演示指南索引（按算法拆分：SM4/AES/哈希/SM2/后量子，含官方向量验证） |
| [ARCHITECTURE.md](./guides/ARCHITECTURE.md) | 开发者 | 系统架构、数据流、模块组织、类型系统 |
| [DEVELOPMENT.md](./guides/DEVELOPMENT.md) | 开发者 | 环境搭建、添加积木块步骤、i18n、代码风格 |

### 📊 规划与审计

| 文档 | 受众 | 说明 |
|------|------|------|
| [IMPLEMENTATION-PLAN.md](./guides/IMPLEMENTATION-PLAN.md) | 开发者/PM | 完整实施计划：7 里程碑 77→140 块 |
| [AUDIT-REPORT.md](./guides/AUDIT-REPORT.md) | 开发者 | 密码原语完整性审计（含国密专项） |
| [TYPE-SYSTEM.md](./guides/TYPE-SYSTEM.md) | 开发者 | 数据类型规范：定义、值域、转换规则、兼容矩阵 |

### 🔬 算法规范

| 文档 | 说明 |
|------|------|
| [blocks/INDEX.md](./blocks/INDEX.md) | 积木块标准依据参考（按类目拆分） |
| [fips197-AES/](./standards/fips197-AES/) | FIPS 197 AES 算法参考 |
| [fips180-4-SHA2/](./standards/fips180-4-SHA2/) | FIPS 180-4 SHA-2 算法参考 |
| [fips202-SHA3/](./standards/fips202-SHA3/) | FIPS 202 SHA-3 / SHAKE / KECCAK-p |
| [fips203-ML-KEM/](./standards/fips203-ML-KEM/) | FIPS 203 ML-KEM (Kyber) |
| [fips204-ML-DSA/](./standards/fips204-ML-DSA/) | FIPS 204 ML-DSA (Dilithium) |
| [gbt32907-SM4/](./standards/gbt32907-SM4/) | GB/T 32907 SM4 国密分组密码 |
| [gbt32905-SM3/](./standards/gbt32905-SM3/) | GB/T 32905 SM3 国密哈希 |
| [sp800-38a-modes/](./standards/sp800-38a-modes/) | SP 800-38A 分组密码模式 (ECB/CBC/CTR) |
| [sp800-38d-gcm/](./standards/sp800-38d-gcm/) | SP 800-38D GCM 认证加密 |
| [fips198-1-hmac/](./standards/fips198-1-hmac/) | FIPS 198-1 HMAC 消息认证码 |
| [fips186-5-ecdsa/](./standards/fips186-5-ecdsa/) | FIPS 186-5 ECDSA 数字签名 |
| [sp800-132-pbkdf2/](./standards/sp800-132-pbkdf2/) | SP 800-132 PBKDF2 密钥派生 |
| [rfc5869-hkdf/](./standards/rfc5869-hkdf/) | RFC 5869 HKDF 密钥派生 |
| [rfc4648-base64/](./standards/rfc4648-base64/) | RFC 4648 Base64 编码 |
| [rfc2315-pkcs7/](./standards/rfc2315-pkcs7/) | RFC 2315 PKCS#7 填充 |

### 📝 规范文件（根目录）

| 文件 | 说明 |
|------|------|
| [README.md](../README.md) | 项目介绍、快速开始 |
| [RULES.md](../RULES.md) | 工程行为准则 |
| [eslint.config.js](../eslint.config.js) | ESLint 规则 |
| [tsconfig.json](../tsconfig.json) | TypeScript 配置 |
| [package.json](../package.json) | 依赖与脚本 |

---

## 文档关系图

```
RULES.md               ← 最高权威（代码规范）
    │
    ▼
DEVELOPMENT.md         ← 开发操作指南（引用 RULES.md）
    │
    ▼
ARCHITECTURE.md        ← 系统架构说明
    │
    ├── BLOCKLY-GUIDE.md         ← Blockly 使用指南（用户操作 + 拼装样例）
    ├── DEMO.md                  ← 演示指南索引（按算法，见 demos/）
    ├── IMPLEMENTATION-PLAN.md   ← 实施路线图（已实施完成，历史记录）
    └── AUDIT-REPORT.md          ← 原语覆盖审计（v3.0 现状）
```

跨项目同步计划沉淀于 `.codestable/compound/sync-plan.md`（CodeStable 产物，脚本 `scripts/sync-to-metacrypt.sh`）。

---

## 项目概览

- **前端框架**: Vue 3 (Composition API + TypeScript)
- **可视化编程**: Blockly 12.x
- **桌面封装**: Tauri 2.x
- **构建工具**: Vite + vue-tsc
- **代码规范**: ESLint 9.x + RULES.md
- **本地存储**: IndexedDB
- **代码生成**: JavaScript / Python
