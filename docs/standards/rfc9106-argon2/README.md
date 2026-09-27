# RFC 9106 — Argon2 密码哈希函数

来源: RFC 9106 — Argon2 Memory-Hard Function for Password Hashing
      https://www.rfc-editor.org/rfc/rfc9106.txt
      全文: [rfc9106.txt](./rfc9106.txt)

## 变体

| 变体 | 用途 | 块实现 |
|------|------|----------|
| Argon2d | 抗 GPU 攻击 (data-dependent) | `argon2_hash`（VARIANT 下拉）✅ |
| Argon2i | 抗侧信道 (data-independent) | `argon2_hash`（VARIANT 下拉）✅ |
| Argon2id | 混合模式 (推荐) | `argon2_hash`（VARIANT 下拉）✅ |

实现（RFC 9106 v1.3）：H0 = BLAKE2b-64 参数块、m′ = 4p·⌊m/4p⌋ 块矩阵、G 压缩（BLAKE2b 轮 + 乘法）、i/id 数据无关段预计算伪随机地址；RFC 9106 §5.1-5.3 官方向量 pre-hash + 每 pass 首末块 + Tag 全过。Demo：`demos/procedures/ARGON2.json`。

## 与 PBKDF2 对比

| 特性 | PBKDF2 | Argon2 |
|------|--------|--------|
| 内存硬化 | ❌ | ✅ |
| 并行硬化 | ❌ | ✅ |
| 标准化 | SP 800-132 | RFC 9106 |
| 平台 | `pbkdf2` ✅ | `argon2_hash` ✅ |
