# 哈希块参考 (SHA + SM3 + Keccak + XOF)


## SHA-256 (FIPS 180-4)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sha256_pad` | 1 | value(→) | null→Bytes | MD填充 |
| `hash_sha256_pad_text` | 1 | value(→) | null→Bytes | UTF-8文本填充 |
| `hash_sha256_pad_hex` | 1 | value(→) | null→Bytes | Hex填充 |
| `hash_sha256_compress` | 1 | value(→) | null&null→null | 64轮压缩函数 |

## SHA-3 / Keccak (FIPS 202)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `keccak_state_init` | 1 | value(→) | —→null | 25×64-bit零状态 |
| `keccak_f` | 1 | value(→) | null→null | Keccak-f[b]置换(24轮) |
| `sponge_pad` | 1 | value(→) | null→Bytes | pad10*1填充 |
| `sponge_absorb` | 1 | value(→) | null&Bytes→null | 海绵吸收 |
| `sponge_squeeze` | 1 | value(→) | null&Number→Bytes | 海绵挤压 |
| `hash_sha3_pad_text` | 1 | value(→) | null→Bytes | SHA-3文本填充 |
| `hash_sha3_pad_hex` | 1 | value(→) | null→Bytes | SHA-3 Hex填充 |

## SM3 (GM/T 0004)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sm3_pad` | 1 | value(→) | null→Bytes | 消息填充 |
| `hash_sm3_pad_text` | 1 | value(→) | null→Bytes | UTF-8填充 |
| `hash_sm3_pad_hex` | 1 | value(→) | null→Bytes | Hex填充 |
| `hash_sm3_compress` | 1 | value(→) | null&null→null | 64轮压缩函数 |

## 密钥派生 HKDF (RFC 5869)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hkdf` | 1 | value(→) | IntList&Bytes&IntList&Number→Bytes | HKDF(salt, ikm, info, keyLen) → 派生密钥；Extract = HMAC-SHA256(salt, IKM)，Expand = HMAC(PRK, T‖info‖i) 串联截断；salt 空按 32 零字节兜底；官方向量（RFC 5869 §A.1） |

## 口令密钥派生 PBKDF2 (RFC 8018 / SP 800-132)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pbkdf2` | 1 | value(→) | Bytes&IntList&Number&Number→Bytes | PBKDF2(password, salt, iter, keyLen, HASH) → 派生密钥；U1 = PRF(P, S‖INT(i))，Uc = PRF(P, U_{c-1}) 串联截断；HASH 下拉 SHA-256（RFC 8018）/ SM3（GM/T 0091 同构，JS/Python 交叉一致）；官方向量（RFC 6070 / hashlib 交叉） |

## 随机数生成 DRBG (SP 800-90A)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `drbg_generate` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | HMAC-DRBG SHA-256（SP 800-90A）：entropy + nonce + perso → 请求位数的确定字节；NIST CAVP 480 例双语言通过 |

## 国密随机数 GM-RNG (GM/T 0103 框架)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gm_rng` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | SM3 实例化 HMAC-DRBG（GM/T 0103 框架 + GM/T 0105 软件 RNG 指南精神）：同输入同输出，确定性教学语义；SHA-256 版 480 例对拍 + SM3 双语言交叉 |

## 内存困难 KDF Argon2 (RFC 9106)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `argon2_hash` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Number&Number&Number&Number&Number→Bytes | Argon2d/i/id v1.3：password + salt + secret + ad + mCost + tCost + lanes + tagLen + variant → 派生密钥；官方向量三组（RFC 9106 §5，含 pre-hash 与中间块） |

## XOF / PRF (FIPS 202 §6)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pq_xof` | 1 | value(→) | Bytes&Number→Bytes | SHAKE XOF |
| `pq_prf` | 1 | value(→) | Bytes&Number&Number→Bytes | SHAKE PRF |

## HMAC (FIPS 198-1)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_hmac` | 1 | value(→) | Bytes&Bytes→Bytes | HMAC(SHA-256/SM3可选) |

## SHA-512 / SHA-384 (FIPS 180-4，64 位字)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sha512_pad` | 1 | value(→) | Bytes→Bytes | SHA-512 填充：1024-bit 块 + 128-bit 长度字段 |
| `hash_sha512_compress` | 1 | value(→) | IntList&Bytes→IntList | 64 位字压缩函数（80 轮），W 输入为填充块（内部扩展调度） |
| `hash_sha512_hash` | 1 | value(→) | Bytes→Bytes | 独立 SHA-384/512 封装（SIZE 下拉）：内嵌正确 IV + 截断；官方向量 FIPS 180-4（"abc"）双语言 PASS |

## 独立 SHA3-xxx 封装 (FIPS 202)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `sha3_hash` | 1 | value(→) | Bytes→Bytes | SHA3-224/256/384/512 一键哈希（SIZE 下拉）：pad10*1(0x06) + absorb + squeeze；官方向量 FIPS 202（"abc" 四档）双语言 PASS |

> 补齐说明（2026-08-03）：SHA-224 复用 `hash_sha256_compress`（不同 IV + 截断，见 demo `SHA224-Hash.json`）；SHA-384/512 用 64 位核（`hash_sha512_*`）；SHA-3 系列新增独立封装块。SHA-256 compress 语义统一为「收填充块、内部扩展调度」（原 JS 侧按字读 + 漏 feed-forward，均修复）。