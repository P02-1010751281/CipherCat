# MCL 伪代码生成器覆盖缺口（2026-08-03 盘点）

## 背景

metacrypt 编辑器三语言（python/javascript/mcl）。MCL（Meta Crypto Language）是 metacrypt 专属教学伪代码 DSL 生成器（`frontend/src/features/blockly/core/generators/mcl/`，不在 CipherCat 同步范围——CipherCat 无 MCL）。

用户工作区含 `argon2_hash` 块在 MCL 模式生成代码时抛 `MCL generator does not know how to generate code for block type "argon2_hash"`。

## 结论

- **覆盖现状**：136 个注册块类型，MCL 仅覆盖 **63**（hash 目录只含 sha256/sha3/shake/sm3；hash_hmac/sha512/keccak/argon2 等均缺）。
- **修复（metacrypt 35b7256）**：
  1. `argon2_hash` 正确生成器（`mcl/hash/argon2.ts`，RFC 9106 伪代码 `ARGON2_HASH(pwd, salt, secret, ad, mCost, tCost, lanes, tagLen, variant)`）
  2. `MCLGenerator.blockToCode` 兜底：未覆盖块生成 `UNSUPPORTED_OP("块名")` 占位而非抛错——73 个缺口不再阻断整段生成，其余块照常输出。
- **缺口清单（73 块）**：aes_*（4）、ascon_encrypt、base64_*、bytes_to_hex、ccm/cmac/gcm/xts_encrypt、crypto_return、data_value、drbg_generate、ecdh/ecdsa/eddsa、endian_swap、gf2m_mul、gm_rng、hash_hmac/sha512_*、hkdf、keccak_*、mldsa、mode_*、nt_mod_pow、pad_*、pbkdf2、pq_*、rsa_*、sm2_*、sm4_*、sm9_*、sponge_*、x25519、zuc_*。

## 待办建议

补全 MCL 覆盖按教学优先级排（对称 AES/SM4 轮链 > mode_* > 哈希 hmac/sha512 > 非对称），每块 5-10 行伪代码；兜底占位已保证不阻断，可分批推进。
