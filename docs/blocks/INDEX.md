# 积木块总览与标准依据入口


**版本**: 2.16 | **日期**: 2026-09-24 | **总块数**: 194 个唯一自定义块类型（29 个模板注册项，其中 3 个重叠；合并去重后 220 个类型）

本页是积木块文档的总览，不按篇幅表示能力权重。分类详情页使用统一的证据入口：标准原文/结构化条目说明规范内容，`src/blocks/` 说明实际注册与生成实现，`demos/` 和测试说明可执行范围，覆盖矩阵和边界说明负责区分“已实现”“教学子集”和“尚未覆盖”。

## 阅读路径

```text
积木块总览（本页）
  → 分类详情（对称/散列/公钥/序列/后量子/数学与编码）
    → 标准原文与结构化条目
    → 源码、Demo 与测试
    → 覆盖矩阵与缺项边界
```

## 分类详情与统一证据入口

| 分类 | 详情页 | 标准/原文入口 | 实现与可执行入口 | 覆盖边界 |
|------|--------|---------------|------------------|----------|
| 分组密码、模式与 AEAD | [symmetric.md](symmetric.md) | FIPS 197、GB/T 32907、SP 800-38 系列 | `src/blocks/symmetric/`、AES/SM4/模式 Demo | 原子轮、模式和选定向量；完整接口按算法/模式分别核对 |
| 哈希、XOF 与海绵 | [hash.md](hash.md) | FIPS 180-4、FIPS 202、GB/T 32905、FIPS 198-1 | `src/blocks/hash/`、SHA/SM3/HMAC Demo | 哈希、XOF、HMAC 和部分后量子哈希构件；参数与封装逐项核对 |
| 经典公钥与椭圆曲线 | [ecc-sbox.md](ecc-sbox.md)、[numtheory.md](numtheory.md) | FIPS 186-5、RFC 5903/7748/8032、GB/T 32918/38635、RFC 8017 | `src/blocks/ecc/`、`src/blocks/*dh/`、签名/加密 Demo | 选定曲线、编码和协议链；不泛化为所有参数集 |
| 流密码 | [zuc.md](zuc.md) | GB/T 33133、3GPP EEA3/EIA3 相关依据 | `src/blocks/zuc/`、`demos/procedures/EEA3.json`、`EIA3.json` | ZUC 密钥流、EEA3 教学链和 EIA3 MAC 向量覆盖；不代表认证 |
| 后量子密码 | [post-quantum.md](post-quantum.md) | FIPS 203/204/205、McEliece/Goppa 参考 | `src/blocks/post-quantum/`、ML-KEM/ML-DSA/SLH-DSA/基于纠错码的教学 Demo | 公共构件、选定算法链和教学原语；不宣称完整参数族或认证 |
| 数学、编码与通用构件 | [bitwise-logic.md](bitwise-logic.md)、[data-encoding.md](data-encoding.md)、[ecc-sbox.md](ecc-sbox.md)、[numtheory.md](numtheory.md) | 对应算法标准及 [覆盖矩阵](../standards/COVERAGE.md) | `src/blocks/bitwise/`、`src/blocks/data/`、`src/blocks/numtheory/`、数学 Demo | 为多类算法提供可组合构件，不单独等同于密码方案 |

## 证据入口的含义

| 证据层 | 入口 | 能证明什么 | 不能证明什么 |
|--------|------|------------|--------------|
| 规范证据 | `docs/standards/<id>/00-Standard-Source.md`、PDF、结构化条目 | 标准定义、公式、伪代码、条款位置 | 项目实现已经完整或通过认证 |
| 实现证据 | `src/blocks/`、本页分类详情 | 块是否注册、输入输出和生成器映射 | 所有参数集、侧信道安全或正式认证 |
| 可执行证据 | `demos/`、`demos/tests.json`、`npm run verify:all` | 登记 Demo、向量、性质和工程回归 | 生产安全性、完整标准覆盖或后端测评结论 |
| 平台后端测评报告 | `metacrypt_server` 的测评报告 | 样本、参数、检测结果和判定边界 | 前端截图、块存在或 Demo 通过本身 |

分类详情页中的“证据入口”只用于导航和限定结论；最终标准定位以标准目录的 source、结构化条目和 PDF 为准，不能用项目实现反推标准原文。

## 图例

| 符号 | 含义 |
|------|------|
| **层** | 1-原子原语 / 2-便利组合 / 3-一键封装 |
| **连接形式** | `value(→)` 输出块 / `stmt(→→)` 语句块 |
| **类型** | 输入→输出 setCheck/setOutput 类型 |

## 标准映射

| 标准号 | 简称 | 文档目录 |
|--------|------|---------|
| FIPS 197 | FIPS 197 (AES) | `fips197-AES/` |
| FIPS 180-4 | FIPS 180-4 (SHA-2) | `fips180-4-SHA2/` |
| FIPS 202 | FIPS 202 (SHA-3) | `fips202-SHA3/` |
| FIPS 203 | FIPS 203 (ML-KEM) | `fips203-ML-KEM/` |
| FIPS 204 | FIPS 204 (ML-DSA) | `fips204-ML-DSA/` |
| FIPS 205 | FIPS 205 (SLH-DSA) | `fips205-SLH-DSA/` |
| McEliece | McEliece / Goppa 码 | `mceliece-goppa/` |
| RFC 8017 | RFC 8017 (PKCS#1 RSA) | `rfc8017-pkcs1/` |
| RFC 5903 | RFC 5903 (ECDH) | `rfc5903-ecdh/` |
| GM/T 0002 | GB/T 32907 (SM4) | `gbt32907-SM4/` |
| GM/T 0004 | GB/T 32905 (SM3) | `gbt32905-SM3/` |
| GB/T 33133 | GB/T 33133 (ZUC) | `gbt33133-ZUC/` |
| NIST SP 800-38 | SP 800-38 (分组模式) | — |
| RFC 5869 | RFC 5869 (HKDF) | — |
| NIST SP 800-38A | SP 800-38A (分组模式) | `sp800-38a-modes/` |
| NIST SP 800-38D | SP 800-38D (GCM) | `sp800-38d-gcm/` |
| FIPS 198-1 | FIPS 198-1 (HMAC) | `fips198-1-hmac/` |
| FIPS 186-5 | FIPS 186-5 (ECDSA) | `fips186-5-ecdsa/` |
| NIST SP 800-132 | SP 800-132 (PBKDF2) | `sp800-132-pbkdf2/` |
| RFC 2315 | RFC 2315 (PKCS#7) | `rfc2315-pkcs7/` |
| RFC 4648 | RFC 4648 (Base64) | `rfc4648-base64/` |
| SP 800-90A | SP 800-90A (DRBG) | `sp800-90a-drbg/` |
| SEC 2 | SEC 2 (ECC) | — |

## 按能力家族（对应 17 个运行时工具箱类目）

| 能力家族 / 工具箱类目 | 代表范围 | 文档 |
|------|------|------|
| 控制流与 Blockly 原生块 | 迭代、变量、数学、数组、逻辑 | — |
| 数据处理与转换 | 字节/位/编码/种子/长度处理 | [data-encoding.md](data-encoding.md) |
| 位运算与 S-Box | 逻辑、移位、替换及算法预设 | [bitwise-logic.md](bitwise-logic.md)、[ecc-sbox.md](ecc-sbox.md) |
| 散列、XOF 与填充 | SHA-2、SHA-3、SHAKE、SM3、HMAC | [hash.md](hash.md) |
| 对称密码与分组模式 | AES、SM4、模式、MAC 与 AEAD | [symmetric.md](symmetric.md) |
| 公钥与椭圆曲线 | RSA、ECDH、ECDSA、EdDSA、SM2、SM9 | [ecc-sbox.md](ecc-sbox.md)、[numtheory.md](numtheory.md) |
| 序列密码 | ZUC 状态变换、密钥流、EEA3/EIA3 | [zuc.md](zuc.md) |
| 后量子密码 | ML-KEM/ML-DSA、SLH-DSA 与纠错码教学构件 | [post-quantum.md](post-quantum.md) |
| 数学、编码与函数模板 | NTT、有限域、多项式、通用编码及 29 个模板注册项 | [numtheory.md](numtheory.md)、[data-encoding.md](data-encoding.md) |

> 本表归纳能力家族，不逐一对应工具箱类别，也不提供可相加的小计；NTT 等共享原语会在多个算法族中复用。完整类型总数以 `ALL_BLOCK_TYPES` 的递归去重结果为准。
