# 哈希块参考 (SHA + SM3 + Keccak + XOF)

## 文档定位与证据入口

本页是[积木块总览](INDEX.md)的分类详情页。这里的“哈希”包含摘要、XOF、海绵、HMAC 及明确标注的哈希基构件；FIPS 205 的完整方案仍以独立后量子文档为准。

| 入口 | 内容 |
|------|------|
| 标准原文与结构化条目 | [FIPS 180-4 SHA-2](../standards/fips180-4-SHA2/)、[FIPS 202 SHA-3](../standards/fips202-SHA3/)、[GB/T 32905 SM3](../standards/gbt32905-SM3/)、[FIPS 198-1 HMAC](../standards/fips198-1-hmac/)、[标准覆盖矩阵](../standards/COVERAGE.md) |
| 实现 | 工具箱中的对应积木与代码生成器 |
| 示例工作区 | [Demo 指南](../guides/DEMO.md)、`demos/procedures/` 中的 SHA/SM3/HMAC/HKDF/PBKDF2/ARGON2 工作区 |
| 边界 | 已登记算法、向量和后量子哈希构件分别核对；哈希块存在不等于完整签名方案或所有参数集已实现 |


## SHA-256 (FIPS 180-4)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sha256_pad` | 1 | value(→) | null→Bytes | 字节序列填充；字节值限 `0..255`，兼容严格 UTF-8 文本 |
| `hash_sha256_pad_text` | 1 | value(→) | null→Bytes | 严格 UTF-8 文本填充；拒绝孤立代理项 |
| `hash_sha256_pad_hex` | 1 | value(→) | null→Bytes | 严格 Hex 填充；需偶数长度连续十六进制字符，不接受空白 |
| `hash_sha256_compress` | 1 | value(→) | IntList&Bytes→IntList | 输入 8 个 32-bit 链状态字和恰好 64-byte 消息块；内部扩展调度并执行 64 轮 |
| `hash_sha224_hash` | 1 | value(→) | null→Bytes | SHA-224 一键哈希（FIPS 180-4：sha256 核 + SHA-224 IV，28 字节输出） |

## SHA-3 / Keccak (FIPS 202)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `keccak_state_init` | 1 | value(→) | —→IntList | 为 Keccak-f 生成包含 25 个零 lane 的状态 |
| `keccak_f` | 1 | value(→) | null→IntList | Keccak-f[200/400/800/1600]，分别 18/20/22/24 轮；每个 lane 为无符号 `w` 位值。SHA-3/SHAKE 仅使用 1600/24；其余宽度只是置换原语 |
| `sponge_pad` | 1 | value(→) | null→Bytes | pad10*1填充；字节值限 `0..255`，文本按严格 UTF-8 编码 |
| `sponge_absorb` | 1 | value(→) | IntList&Bytes→IntList | 海绵吸收；输入长度须为 rate 字节整数倍，不对短尾块补零 |
| `sponge_squeeze` | 1 | value(→) | null&Number→Bytes | 海绵挤压 |
| `hash_sha3_pad_text` | 1 | value(→) | null→Bytes | SHA-3 严格 UTF-8 文本填充；拒绝孤立代理项和非文本输入 |
| `hash_sha3_pad_hex` | 1 | value(→) | null→Bytes | SHA-3 严格 Hex 填充；需偶数长度连续十六进制字符 |

## SM3 (GB/T 32905-2016)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sm3_pad` | 1 | value(→) | null→Bytes | 512-bit 分组填充，长度字段为 64-bit 大端；字节值限 `0..255`，兼容严格 UTF-8 文本 |
| `hash_sm3_pad_text` | 1 | value(→) | null→Bytes | 严格 UTF-8 文本填充；拒绝孤立代理项和非文本输入 |
| `hash_sm3_pad_hex` | 1 | value(→) | null→Bytes | 严格 Hex 填充；需偶数长度连续十六进制字符 |
| `hash_sm3_compress` | 1 | value(→) | null&null&null→IntList | 64 轮压缩函数；输入为状态 V 和填充后的块 W |

## 密钥派生 HKDF (RFC 5869)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hkdf` | 1 | value(→) | IntList&Bytes&IntList&Number→Bytes | HKDF(salt, ikm, info, keyLen) → 派生密钥；Extract = HMAC-SHA256(salt, IKM)，Expand = HMAC(PRK, T‖info‖i) 串联截断；salt 空按 32 零字节兜底；官方向量（RFC 5869 §A.1） |

## 口令密钥派生 PBKDF2 (RFC 8018 / SP 800-132)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pbkdf2` | 1 | value(→) | Bytes&IntList&Number&Number→Bytes | PBKDF2(password, salt, iter, keyLen, HASH) → 派生密钥；先算 U1 = PRF(P, S‖INT(i))、Uc = PRF(P, U_{c-1})，令 Ti = U1 ⊕ U2 ⊕ … ⊕ Uc 再截断；HASH 下拉 SHA-256（RFC 8018）/ SM3（GM/T 0091 同构）；PBKDF2-HMAC-SHA-256 的期望值由 Python `hashlib` 现场复算（RFC 6070 只提供 HMAC-SHA1 附录值，不适用于本变体） |

## 随机数生成 DRBG (SP 800-90A)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `drbg_generate` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | HMAC-DRBG SHA-256（SP 800-90A）：entropy + nonce + perso → 请求位数的确定字节；Demo 含少量实例化/重播种固定回归，未运行完整 CAVP 向量集 |

## 确定性随机生成示例（GM/T 0103 框架参考）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gm_rng` | 1 | value(→) | Bytes&Bytes&Bytes&Number→Bytes | 借鉴 HMAC_DRBG 结构的确定性 SM3-HMAC 教学路径，长度为 0–65536 字节；不是 GM/T 0103/0105 或 SP 800-90A 的符合实现，不接入或评估真实熵源；有限 OpenSSL 交叉回归不是官方向量验证 |

## 内存困难 KDF Argon2 (RFC 9106)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `argon2_hash` | 1 | value(→) | Bytes&Bytes&Bytes&Bytes&Number&Number&Number&Number→Bytes | Argon2d/i/id v1.3：password + salt + secret + ad + mCost + tCost + lanes + tagLen，variant 为下拉 → 派生密钥；要求整数参数、mCost≥8×lanes；RFC 9106 规定 P/S/K/X 各不超过 2^32−1 bytes，推荐 16-byte salt（未规定最小长度）。项目仅接受字节序列或 UTF-8 文本，不接受任意迭代器；每项输入限制为 1 MiB。执行参数上限为 mCost≤65,536 KiB、tCost≤10、lanes≤16、tagLen≤1,024 bytes、mCost×tCost≤65,536 KiB-pass；该实现不支持 RFC 推荐的生产参数配置。RFC 9106 §5.1–5.3 向量由 Demo 回归执行，不代表完整测试集 |

## XOF / PRF（SHAKE：FIPS 202 §6；ML-KEM PRFη：FIPS 203 §4.1 式 (4.3)）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `pq_xof` | 1 | value(→) | Bytes&Number→Bytes | SHAKE128/256 XOF；仅支持字节对齐输入；字符串按 UTF-8 编码、数组元素须为数值上等于 `0..255` 整数的字节；`outLen` 是字节数 |
| `pq_prf` | 1 | value(→) | Bytes&Number&Number→Bytes | `SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte seed、`64·η`-byte 输出和 SHAKE256 组合对应 ML-KEM `PRFη`；其他参数及 SHAKE128 是项目扩展 |

## HMAC (FIPS 198-1)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_hmac` | 1 | value(→) | Bytes&Bytes→Bytes | HMAC；SHA-256 对应 FIPS 198-1 的批准底层哈希范围，SM3-HMAC 是项目扩展，不是 NIST 批准选项 |

HMAC 块的回归对生成的 JavaScript/Python 代码核验 SHA-256 的 RFC 4231 case 1、长密钥 case 6，以及 SM3 的 Node/OpenSSL 交叉结果；同时检查非法字节输入、孤立代理项拒绝、合法 Unicode 文本、同步组合到下游字节块、JavaScript `Uint8Array` / Python `bytes` 输出类型和两语言结果一致。SM3-HMAC 是项目扩展，不代表 NIST 批准或验证。上述回归不是完整标准测试集或认证。

## SHA-512 / SHA-384 (FIPS 180-4，64 位字)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_sha512_pad` | 1 | value(→) | Bytes→Bytes | SHA-512 填充：1024-bit 块 + 128-bit 长度字段 |
| `hash_sha512_compress` | 1 | value(→) | IntList&Bytes→IntList | 64 位字压缩函数（80 轮），W 输入为填充块（内部扩展调度） |
| `hash_sha512_hash` | 1 | value(→) | Bytes→Bytes | 独立 SHA-384/512 封装（SIZE 下拉）：内嵌正确 IV + 截断；官方向量 FIPS 180-4（"abc"）双语言 PASS |

## SHA3-224/256/384/512 封装 (FIPS 202)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `sha3_hash` | 1 | value(→) | Bytes→Bytes | SHA3-224/256/384/512（SIZE 下拉）；仅支持字节对齐输入；双语言固定结果覆盖 `abc` 和各自 rate−1 字节输入，非完整官方测试集 |

上述填充与压缩块的回归覆盖：SHA-2 与 SM3 的填充边界（含 SM3 64-bit 长度字段 `2^32` bit 边界）、严格 UTF-8/Hex 与非法字节拒绝、海绵吸收的整块与部分 rate 块、SHAKE 的字节输入契约，以及 SHA-256 压缩块的状态/块长度和两种语言的输出一致性。这些是项目回归，不代表完整官方测试集或正式认证。
## 哈希基密码教学结构件（参考 SLH-DSA / FIPS 205）

> 本节是教学/研究辅助积木，不是 FIPS 205 算法实现。项目中的简化 SHAKE 拼接不含标准要求的 `PK.seed`、函数专用 `H/F/PRF/T_k` 调用和完整 ADRS 状态更新；哈希链与通用 Merkle 树也不能替代 WOTS+/XMSS/FORS 标准过程。当前 FORS 固定使用项目参数 `n=32, k=4, a=4`，签验往返仅为内部自洽性质测试，不能据此声称 SLH-DSA 符合性。

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `hash_chain` | 1 | value(→) | Bytes&Number→Bytes | 反复应用项目 SHAKE-256 摘要；无 FIPS 205 `F(PK.seed, ADRS, ·)` 与链地址更新 |
| `merkle_leaf` | 1 | value(→) | Bytes&Bytes→Bytes | 通用教学叶子 `SHAKE256(ADRS‖MSG, 32)`，非 XMSS/FORS 标准叶生成 |
| `merkle_node` | 1 | value(→) | Bytes&Bytes&Bytes→Bytes | 通用教学节点 `SHAKE256(ADRS‖L‖R, 32)`，非标准 `H/T_l` 调用 |
| `merkle_root` | 1 | value(→) | Bytes&Number&Bytes→Bytes | 通用叶序列的教学 Merkle 根，非 FIPS 205 树算法 |
| `merkle_auth_path` | 1 | value(→) | Bytes&Number&Bytes&Number→Bytes | 认证路径：每层取目标 idx 的兄弟拼接——Merkle 证明核心 |
| `fors_leaf_index` | 1 | value(→) | Bytes&Number→Number | FORS 选叶：消息第 I 个 4-bit 块 → 0..15（与 fors_sign 同约定） |
| `slh_addr` | 1 | value(→) | Number&Number&Number→Bytes | ADRS 前缀教学编码：layer/tree/leaf 加 type 下拉，末尾 8 字节清零；不是完整地址语义 |
| `slh_adrs_full` | 1 | value(→) | Number&Number&Number&Number&Number→Bytes | 覆盖部分 type 字段布局；限安全整数，不能表示完整 96-bit tree address，不是完整 FIPS 205 编码 |
| `fors_root` | 1 | value(→) | Bytes&Bytes→Bytes | 项目 SHAKE 拼接树根，不是 FIPS 205 `T_k(PK.seed, ADRS, roots)` |
| `wots_checksum` | 1 | value(→) | Bytes→IntList | WOTS+ 校验和（w=16，4-bit 块）；消息块增大 → csum 减小（防伪造） |

`slh_adrs_full` 的 32 字节输出按标准 word 边界写入：`0..3` layer、`4..15` tree、`16..19` type、`20..23` word4、`24..27` word5、`28..31` word6。TREE(type 2) 的 word4 是零填充；其余类型按各自规则写 keypair 或零。type 0/2/3/5/6 分别按 WOTS_HASH、TREE、FORS_TREE、WOTS_PRF、FORS_PRF 的规则写 word5/word6；其他 type 的末尾字段保持为零。输入限可由 JavaScript `Number` 精确表示的非负安全整数，因此不能表示全部 96-bit tree 值。

## FORS 教学变体（参考 FIPS 205 §8）

当前实现将 `SHAKE256(SK.seed‖ADRS)` 用作项目内部叶值派生，并以项目自定义方式拼接节点/根；它没有实现 FIPS 205 的 `PRF(PK.seed, SK.seed, ADRS)`、标准 `F/T_k` 参数化调用或标准参数集。请将其作为算法结构演示，不要用于标准符合性或安全用途。

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `fors_sign` | 1 | value(→) | Bytes&Bytes→Bytes | 固定教学参数 `n=32,k=4,a=4`；640B 项目签名，不兼容 FIPS 205 参数/编码 |
| `fors_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | 项目签名内部重建根并比较；仅自洽验证 |
| `fors_pk_from_sk` | 1 | value(→) | Bytes→Bytes | 项目教学变体的公钥派生 |

> 测试证据仅为确定性、签名-验证往返和篡改拒绝；不是官方向量。FIPS 205 KAT 针对完整 SLH-DSA，当前项目没有可据此声称通过的 SLH-DSA KAT。
