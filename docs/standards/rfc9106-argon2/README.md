# RFC 9106 — Argon2 密码哈希函数

来源: RFC 9106 — Argon2 Memory-Hard Function for Password Hashing
      https://www.rfc-editor.org/rfc/rfc9106.txt
      全文: [rfc9106.txt](./rfc9106.txt)

## 变体

| 变体 | 用途 | 块实现 |
|------|------|----------|
| Argon2d | 抗 GPU 攻击 (data-dependent) | 未实现 |
| Argon2i | 抗侧信道 (data-independent) | 未实现 |
| Argon2id | 混合模式 (推荐) | 未实现 |

## 与 PBKDF2 对比

| 特性 | PBKDF2 | Argon2 |
|------|--------|--------|
| 内存硬化 | ❌ | ✅ |
| 并行硬化 | ❌ | ✅ |
| 标准化 | SP 800-132 | RFC 9106 |
| 平台 | `kdf_pbkdf2` ✅ | 未实现 |
