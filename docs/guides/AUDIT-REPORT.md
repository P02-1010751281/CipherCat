# 密码原语完整性审计报告

> [English](./AUDIT-REPORT.en.md)
>
> 审计日期：2026-08-02 | 版本：v3.0（现状对账）| 上一版：v2.0（2026-07-18，对称密码缺失时代）

## 一、当前覆盖概况

**134 个自定义块 + 27 个函数模板**，**17 个工具箱类目**（15 自定义块类目 + 函数封装空间 + Crypto Templates；含 4 个 Blockly 原生类目——基础变量/基础数学/数组空间/逻辑运算单元；块数为 2026-08-03 浏览器实测）：

| 工具箱类目 | 块数 | 覆盖评价 |
|------|------|---------|
| 控制流编排 | 12 | ✅ 基础（ctrl_iterate 循环 + 原生） |
| 数据处理与转换 | 20 | ✅ 良好（字节/位/编码/seed） |
| 位运算单元 | 8 | ✅ 优秀 |
| 逻辑运算单元 | 3 | Blockly 原生 |
| 非线性运算单元（S-Box） | 4 | ✅ 优秀（CSV 自定义 + 4 预设：AES/SM4/ZUC S0/S1） |
| 哈希与填充单元 | 22 | ✅ **完整**（SHA-256/SHA-3/SM3/SHAKE/HMAC/KDF 族） |
| 对称密码 | 18 | ✅ **完整**（AES/SM4 全轮 + 模式 + CMAC/CCM/XTS/GCM/ASCON） |
| 数论与密钥推导单元 | 15 | ✅（NTT/GF(2^m)/模逆/模幂/RSA/DRBG/Argon2） |
| 椭圆曲线运算单元 | 19 | ✅ **完整**（点运算 + EdDSA/ECDSA/SM2 签名加密 + SM9 + ECDH + X25519） |
| 祖冲之序列密码 | 6 | ✅（GB/T 33133 官方向量） |
| 后量子基础块 | 9 | ✅（ML-KEM 底层 + ML-DSA 底层） |
| 后量子高级块 | 4 | ✅（ML-KEM/ML-DSA 顶层） |
| 数组空间 / 基础数学 / 基础变量 | — | Blockly 原生类目 |
| 函数封装空间 | 3+ | ✅ 模板化（28 个算法模板预填链） |
| Crypto Templates | 动态 | ✅（Manager 添加模板后出现） |

## 二、覆盖评价

### ✅ 已完整覆盖（相对 v2.0 新增标 ★）

- ★ **AES 全轮**：SubBytes/ShiftRows/MixColumns/AddRoundKey/KeyExpansion + `mode_*` 原子块内置完整 AES-128 加密/解密 helper
- ★ **SM4 全轮**：S-box（独立 `sm4_sbox` 块）/轮函数/密钥扩展 + 32 轮模板
- ★ **分组模式**：ECB/CBC/CTR（原子块 + 模板）+ PKCS#7/Zero 填充
- ★ **HMAC**：HMAC-SHA256 / HMAC-SM3（JS/Python 双生成器）
- ★ **KDF**：PBKDF2（原子块 `pbkdf2`，HASH 下拉 SHA-256 官方向量 + SM3 国密同构，双语言交叉一致）/ HKDF（原子块 `hkdf`，RFC 5869 §A.1 官方向量双语言通过）；模板保留
- ★ **ML-KEM 一键封装**：KeyGen / Encaps 模板（FIPS 203 原子链）
- ★ **官方向量验证**：SM4-Sbox（GM/T 0002）/ SM3（GB/T 32905）/ SM2 点乘（GB/T 32918.5）/ ML-KEM-512 Encaps（FIPS 203）双语言 PASS（`scripts/verify-demo.ts` harness）
- 原有：位运算全系列 / CSV 自定义 S-box / SHA-256 / Keccak-SHA-3 海绵 / SM3 pad+compress / SHAKE / 模运算 / NTT-INTT / ECC 点运算 / ML-KEM 底层原语 / 类型约束系统

### ⚠️ 部分覆盖

| 原语 | 已有 | 缺失 |
|------|------|------|
| SHA-2 系列 | SHA-256 | SHA-224/384/512 |
| SHA-3 系列 | Keccak 原语 + 模板 | 独立 SHA3-xxx 封装块 |
| ECC | 曲线运算 | ✅ ECDH/SM2 加密（2026-08-03） |
|| SM2 | 点乘 / 曲线参数（模板） | 签名 / 加密 / 密钥交换封装 |
|| ZUC | S0/S1 原子块 + L1/L2 + 非线性函数 F（2026-08-02） | 密钥流完整拼接（LFSR/BR 链 + 工作模式模板） |

### ❌ 完全缺失（按优先级）

| 优先级 | 原语 | 说明 |
|--------|------|------|
|| **P0** | RSA | ✅ 已补 5 块（`rsa_keygen`/`rsa_encrypt`/`rsa_decrypt`/`rsa_sign`/`rsa_verify`，FIPS 186-4 + PKCS#1 v1.5，cryptography 双向交叉验证） |
| P1 | AEAD 族 | 已全部补齐：CMAC（`cmac_mac`，SP 800-38B）、CCM（`ccm_encrypt`，SP 800-38C）、XTS（`xts_encrypt`，SP 800-38E）、GCM（`gcm_encrypt`，SP 800-38D）、ASCON（`ascon_encrypt`，SP 800-232）——均官方向量双语言通过 |
|| P1 | DRBG | ✅ 已补 `drbg_generate`（SP 800-90A HMAC-DRBG SHA-256，NIST CAVP 480 例双语言通过） |
|| P2 | Argon2 / BLAKE2 / SHA-1 / MD5 | ✅ Argon2 已补（`argon2_hash`，RFC 9106 三组官方向量含中间块双语言通过）；SHA-1/MD5 仍缺（低优先） |
|| P3 | SM9 | ✅ 已补 4 块（`sm9_master_key`/`sm9_user_key`/`sm9_sign`/`sm9_verify`，GB/T 38635.2 官方向量双语言通过，BN 曲线 R-ate 双线性对） |
|| P0 | EdDSA | ✅ 已补（`eddsa_sign`/`eddsa_verify`，RFC 8032 官方向量 3 组双语言通过） |
|| P0 | ECDSA | ✅ 已补（`ecdsa_sign`/`ecdsa_verify`，RFC 6979 确定性 P-256 官方向量双语言通过） |
|| P1 | SM2 签名 | ✅ 已补（`sm2_sign`/`sm2_verify`，GB/T 32918.2 附录 A 含 ZA/e/r/s 中间值双语言通过） |
|| P1 | ML-DSA | ✅ 已补（`mldsa_sign`/`mldsa_verify`，FIPS 204，NIST ACVP 30/30 双语言通过） |
|| P2 | 国密 RNG | ✅ 已补 `gm_rng`（GM/T 0103 框架 + SM3-HMAC-DRBG 实例化，SHA-256 版 480 例对拍 + SM3 双语言交叉） |

## 三、国密标准专项（v3.0 状态）

| 算法 | 标准号 | v2.0 状态 | v3.0 状态 |
|------|--------|----------|----------|
| **SM3** | GM/T 0004 / GB/T 32905 | ✅ pad+compress | ✅ + HMAC-SM3 + 一键哈希（模板） |
| **SM4** | GM/T 0002 / GB/T 32907 | ❌ P0 | ✅ 全轮 + 32 轮模板 + 官方向量 |
|| **SM2** | GM/T 0003 / GB/T 32918 | ⚠️ 可组合 | ✅ 点乘 + 签名/验签（`sm2_sign`/`sm2_verify`，GB/T 32918.2 附录 A 官方向量双语言通过）；加密/KEX 仍待封装 |
|| **ZUC** | GM/T 0001 / GB/T 33133 | ❌ | ✅ S0/S1/L1/L2/F 原子块（官方向量双语言通过），密钥流拼接待模板 |
|| **SM9** | GM/T 0044 / GB/T 38635 | ❌ | ✅ 4 块（`sm9_master_key`/`sm9_user_key`/`sm9_sign`/`sm9_verify`，GB/T 38635.2 官方向量双语言通过） |
| SM1 / SM7 | — | 无法实现 | 无法实现（算法未公开） |

国产后量子：中国密码学会后量子标准化工作组推进中，ML-KEM 全套原语（格基方向）届时可大幅复用。

## 四、路线图状态


| 里程碑 | 计划块数 | 内容 | 状态 |
|--------|------|------|------|
| **M1: 清理** | 71 | 移除复合块、类型系统收敛 | ✅ |
| **M2: 对称密码** | 85 | AES + SM4 + 模式 + 填充 | ✅ |
| **M3: 数学+辅助** | 94 | 模幂 / GF(2^m) / HMAC | ✅ |
| **M4: 协议封装** | 111 | ML-KEM 封装 / KDF / 编码 | ✅ |
|| **M5: 扩展** | ~130 | RSA / ZUC / ML-DSA / AEAD 族 | ✅ 完成（131 块，standards 缺口全部清零） |

## 五、核心结论

- **v2.0 最大缺口（对称密码）已闭环**：AES/SM4/模式/填充/HMAC/KDF 全齐，且 4 个核心算法通过官方测试向量双语言验证。
- 最强项：ML-KEM 全套底层 + 官方向量验证（国内可视化编程平台领先）。
- **standards 缺口全部清零**（134 块）。协议封装于 2026-08-03 闭环：ECDH 1 块（P-256，RFC 5903 §8.1 官方向量 + cryptography 交叉）、SM2 加密/解密 2 块（GB/T 32918.4 附录 A 示例 2 官方向量，双语言 PASS）；25/25 向量 demo 全绿。ZUC 序列密码原子块已于 2026-08-02 补齐（S0/S1/L1/L2/F/Keystream，官方向量验证通过）；CMAC 同日补齐（SP 800-38B）；CCM 同日补齐（SP 800-38C）；XTS 同日补齐（SP 800-38E）；X25519 同日补齐（RFC 7748）；ASCON 同日补齐（SP 800-232）；HKDF 同日补齐（RFC 5869）；PBKDF2 同日补齐（RFC 8018）；GCM 同日补齐（SP 800-38D）——AEAD 族全部闭环。
- **2026-08-02 第二波补齐（签名/KDF/DRBG 族）**：EdDSA（RFC 8032）、ECDSA（RFC 6979 确定性 P-256）、SM2 签名（GB/T 32918.2）、ML-DSA（FIPS 204 ACVP 30/30）、SM9 4 块（GB/T 38635.2 双线性对）、DRBG（SP 800-90A CAVP 480 例）、Argon2（RFC 9106）、国密 RNG（GM/T 0103 + SM3-HMAC-DRBG）——全部官方向量双语言通过。
- **RSA 收官（2026-08-02）**：5 块（FIPS 186-4 密钥生成 + PKCS#1 v1.5 加解密/签名），cryptography 双向交叉验证（1024 位生成代码被 cryptography 接受）——**standards 缺口全部清零**。
