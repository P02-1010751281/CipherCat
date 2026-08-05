# CipherCat 文档中心


🐱 **后量子密码学可视化编程平台** — 基于 Blockly 13.x 和 Vue 3 (Composition API + TypeScript)。


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
| [AUDIT-REPORT.md](./guides/AUDIT-REPORT.md) | 开发者 | 密码原语完整性审计（含国密专项） |
| [TYPE-SYSTEM.md](./guides/TYPE-SYSTEM.md) | 开发者 | 数据类型规范：定义、值域、转换规则、兼容矩阵 |

### 🔬 算法规范

完整覆盖矩阵（标准 ↔ 块 ↔ demo ↔ 模板 ↔ 指南）：[standards/COVERAGE.md](./standards/COVERAGE.md)。以下为全量标准目录列表：

| 文档 | 说明 |
|------|------|
| [blocks/INDEX.md](./blocks/INDEX.md) | 积木块标准依据参考（按类目拆分） |
| [COVERAGE.md](./standards/COVERAGE.md) | 标准覆盖矩阵（标准 ↔ 块 ↔ demo ↔ 模板 ↔ 指南） |
| [fips197-AES/](./standards/fips197-AES/) | FIPS 197 AES 算法参考 |
| [fips180-4-SHA2/](./standards/fips180-4-SHA2/) | FIPS 180-4 SHA-2 算法参考 |
| [fips202-SHA3/](./standards/fips202-SHA3/) | FIPS 202 SHA-3 / SHAKE / KECCAK-p |
| [fips198-1-hmac/](./standards/fips198-1-hmac/) | FIPS 198-1 HMAC 消息认证码 |
| [sp800-38a-modes/](./standards/sp800-38a-modes/) | SP 800-38A 分组密码模式 (ECB/CBC/CTR) |
| [sp800-38b-cmac/](./standards/sp800-38b-cmac/) | SP 800-38B CMAC 消息认证码 |
| [sp800-38c-ccm/](./standards/sp800-38c-ccm/) | SP 800-38C CCM 认证加密 |
| [sp800-38d-gcm/](./standards/sp800-38d-gcm/) | SP 800-38D GCM 认证加密 |
| [sp800-38e-xts/](./standards/sp800-38e-xts/) | SP 800-38E XTS 磁盘加密 |
| [sp800-90a-drbg/](./standards/sp800-90a-drbg/) | SP 800-90A DRBG 随机数发生器 |
| [sp800-132-pbkdf2/](./standards/sp800-132-pbkdf2/) | SP 800-132 PBKDF2 密钥派生 |
| [sp800-232-ascon/](./standards/sp800-232-ascon/) | SP 800-232 ASCON 轻量认证加密 |
| [fips186-5-ecdsa/](./standards/fips186-5-ecdsa/) | FIPS 186-5 ECDSA 数字签名 |
| [fips203-ML-KEM/](./standards/fips203-ML-KEM/) | FIPS 203 ML-KEM (Kyber) |
| [fips204-ML-DSA/](./standards/fips204-ML-DSA/) | FIPS 204 ML-DSA (Dilithium) |
| [fips205-SLH-DSA/](./standards/fips205-SLH-DSA/) | FIPS 205 SLH-DSA 无状态哈希签名 |
| [mceliece-goppa/](./standards/mceliece-goppa/) | McEliece / Goppa 码（编码基） |
| [rfc4648-base64/](./standards/rfc4648-base64/) | RFC 4648 Base64 编码 |
| [rfc2315-pkcs7/](./standards/rfc2315-pkcs7/) | RFC 2315 PKCS#7 填充 |
| [rfc5869-hkdf/](./standards/rfc5869-hkdf/) | RFC 5869 HKDF 密钥派生 |
| [rfc7748-x25519/](./standards/rfc7748-x25519/) | RFC 7748 X25519 密钥交换 |
| [rfc8017-pkcs1/](./standards/rfc8017-pkcs1/) | RFC 8017 PKCS#1 RSA 加解密/签名 |
| [rfc8032-eddsa/](./standards/rfc8032-eddsa/) | RFC 8032 EdDSA 数字签名 |
| [rfc5903-ecdh/](./standards/rfc5903-ecdh/) | RFC 5903 ECDH 密钥协商 (P-256) |
| [rfc9106-argon2/](./standards/rfc9106-argon2/) | RFC 9106 Argon2 密码哈希 |
| [gbt32905-SM3/](./standards/gbt32905-SM3/) | GB/T 32905 SM3 国密哈希 |
| [gbt32907-SM4/](./standards/gbt32907-SM4/) | GB/T 32907 SM4 国密分组密码 |
| [gbt32918-SM2/](./standards/gbt32918-SM2/) | GB/T 32918 SM2 国密公钥密码 |
| [gbt32915-randomness/](./standards/gbt32915-randomness/) | GB/T 32915 随机性检测（Go 后端） |
| [gbt33133-ZUC/](./standards/gbt33133-ZUC/) | GB/T 33133 ZUC 序列密码 |
| [gbt36624-aead/](./standards/gbt36624-aead/) | GB/T 36624 可鉴别加密 |
| [gbt38635-SM9/](./standards/gbt38635-SM9/) | GB/T 38635 SM9 标识密码 |
| [gbt15852-mac/](./standards/gbt15852-mac/) | GB/T 15852 MAC 消息认证码 |
| [gbt17964-modes/](./standards/gbt17964-modes/) | GB/T 17964 分组密码模式 |
| [gmt0091-kdf/](./standards/gmt0091-kdf/) | GM/T 0091 密钥派生 |
| [gmt0103-rng/](./standards/gmt0103-rng/) | GM/T 0103 随机数发生器 |
| [cnsa-pqc-tracking/](./standards/cnsa-pqc-tracking/) | CNSA 后量子迁移追踪 |

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
    └── AUDIT-REPORT.md          ← 原语覆盖审计（v3.0 现状）
```

跨项目同步计划沉淀于 `.codestable/compound/sync-plan.md`（CodeStable 产物，脚本 `scripts/sync-to-metacrypt.sh`）。

---

## 项目概览

- **前端框架**: Vue 3 (Composition API + TypeScript)
- **可视化编程**: Blockly 13.x
- **桌面封装**: Tauri 2.x
- **构建工具**: Vite + vue-tsc
- **代码规范**: ESLint 9.x + RULES.md
- **本地存储**: IndexedDB
- **代码生成**: JavaScript / Python
