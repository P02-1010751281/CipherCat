# MCL 伪代码生成器覆盖缺口（2026-08-03 盘点）

## 背景

metacrypt 编辑器三语言（python/javascript/mcl）。MCL（Meta Crypto Language）是 metacrypt 专属教学伪代码 DSL 生成器（`frontend/src/features/blockly/core/generators/mcl/`，不在 CipherCat 同步范围——CipherCat 无 MCL）。

用户工作区含 `argon2_hash` 块在 MCL 模式生成代码时抛 `MCL generator does not know how to generate code for block type "argon2_hash"`。

## 结论

- **覆盖现状**：136 个注册块类型，MCL 仅覆盖 **63**（hash 目录只含 sha256/sha3/shake/sm3；hash_hmac/sha512/keccak/argon2 等均缺）。
- **修复（metacrypt 35b7256）**：
  1. `argon2_hash` 正确生成器（`mcl/hash/argon2.ts`，RFC 9106 伪代码 `ARGON2_HASH(pwd, salt, secret, ad, mCost, tCost, lanes, tagLen, variant)`）
  2. `MCLGenerator.blockToCode` 兜底：未覆盖块生成 `UNSUPPORTED_OP("块名")` 占位而非抛错——73 个缺口不再阻断整段生成，其余块照常输出。
- **全量补完（metacrypt 后续批次）**：6 组并行 agent + 主线程补 ecdsa/eddsa，**73 缺口全部补齐**（argon2 已在首轮）——hash 13 / symmetric 15（新建目录）/ data 8 / ecc 15（含 ecdsa/eddsa）/ numtheory+pq 16 / zuc+ascon 8。语法契约见 `.codestable/compound/2026-08-03-mcl-generator-syntax.md`（双参签名 `(block, generator)`、大写指令、`UNSUPPORTED_OP` 兜底）。验证：vue-tsc 0、vite build ✓、浏览器 76 块全量生成 0 失败 0 UNSUPPORTED_OP。
- **剩余非缺口**：`procedures_mutatorarg`/`procedures_mutatorcontainer` 是 procedure mutator 内部 UI 块，不出现在主 workspace 生成链，正确无需生成器。

## 待办建议

补全 MCL 覆盖按教学优先级排（对称 AES/SM4 轮链 > mode_* > 哈希 hmac/sha512 > 非对称），每块 5-10 行伪代码；兜底占位已保证不阻断，可分批推进。
