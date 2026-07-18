# 块标准依据参考表

**版本**: 1.0 | **日期**: 2025-07-18

**总块数**: 117（排除重复定义和已废弃块，每个唯一块名计一次）

---

### 图例

| 符号 | 含义 |
|------|------|
| **层** | 1-原子原语 / 2-便利组合 / 3-一键封装 |
| **连接形式** | `value(→)` — 有输出值，可嵌入表达式；`stmt(→→)` — 语句块，有 previous+next 连接；`stmt+value` — 两者兼有 |
| **输入类型** | 值输入的 `setCheck` 类型；`null` 表示接受任意类型；多输入用 `&` 分隔 |
| **输出类型** | `setOutput` 类型；`—` 表示无输出（纯语句块） |
| **标准依据** | 引用的规范编号，见标准映射表 |

### 标准映射表

| 算法 | 标准号 | 简称 |
|------|--------|------|
| AES | FIPS 197 | FIPS 197 |
| SHA-256 | FIPS 180-4 | FIPS 180-4 |
| SHA-3/Keccak | FIPS 202 | FIPS 202 |
| SHAKE | FIPS 202 §6 | FIPS 202 |
| ML-KEM | FIPS 203 | FIPS 203 |
| ML-DSA | FIPS 204 | FIPS 204 |
| HMAC | FIPS 198-1 | FIPS 198-1 |
| PBKDF2 | NIST SP 800-132 | SP 800-132 |
| HKDF | RFC 5869 | RFC 5869 |
| Base64 | RFC 4648 | RFC 4648 |
| ECC | SEC 2 / NIST | SEC 2 |
| SM2 | GM/T 0003-2012 | GM/T 0003 |
| SM3 | GM/T 0004-2012 | GM/T 0004 |
| SM4 | GM/T 0002-2012 | GM/T 0002 |
| GF(2⁸) | FIPS 197 §4.2 | FIPS 197 |
| 数论/NTT | 通用数学 | Math |
| 位运算 | 通用 | Generic |
| S-box | 通用 | Generic |
| XOF/PRF | FIPS 202 | FIPS 202 |
| 压缩/编码 | FIPS 203 Alg 3-6 | FIPS 203 |
| 模式(ECB/CBC/CTR/GCM) | NIST SP 800-38A/D | SP 800-38 |
| 填充(PKCS#7) | RFC 2315 §10.3 | RFC 2315 |
| 编码转换 | 通用 | Generic |

---

## 完整块参考表

### AES 原子块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `aes_sub_bytes` | 1 | AES | value(→) | IntList | IntList | FIPS 197 | AES SubBytes：S-box 替换状态的每个字节 (§5.1.1) |
| `aes_shift_rows` | 1 | AES | value(→) | IntList | IntList | FIPS 197 | AES ShiftRows：第 i 行循环左移 i 个字节 (§5.1.2) |
| `aes_mix_columns` | 1 | AES | value(→) | IntList | IntList | FIPS 197 | AES MixColumns：GF(2⁸) 矩阵列混合 (§5.1.3) |
| `aes_add_round_key` | 1 | AES | value(→) | IntList & IntList | IntList | FIPS 197 | AES AddRoundKey：状态 ⊕ 轮密钥 (§5.1.4) |

### AES 便利块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `aes_round` | 2 | AES | value(→) | IntList & IntList | IntList | FIPS 197 | AES 完整轮：SubBytes→ShiftRows→MixColumns→AddRoundKey (§5.1) |
| `aes_last_round` | 2 | AES | value(→) | IntList & IntList | IntList | FIPS 197 | AES 最后一轮：SubBytes→ShiftRows→AddRoundKey（跳过 MixColumns） |
| `aes_key_schedule` | 2 | AES | value(→) | Bytes | IntList | FIPS 197 | AES 密钥扩展 128/192/256-bit → 轮密钥列表 (§5.2) |

### SM4 原子块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `sm4_round_func` | 1 | SM4 | value(→) | IntList & IntList & IntList & IntList & Number | IntList | GM/T 0002 | SM4 轮函数 F：四字+XOR→S-box→L 线性变换 |
| `sm4_linear_transform` | 1 | SM4 | value(→) | IntList | IntList | GM/T 0002 | SM4 L(B) = B ⊕ (B<<<2) ⊕ (B<<<10) ⊕ (B<<<18) ⊕ (B<<<24) |

### SM4 便利块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `sm4_round` | 2 | SM4 | value(→) | IntList & IntList & IntList & IntList & Number | IntList | GM/T 0002 | SM4 完整轮：F → S-box → L → XOR |
| `sm4_key_schedule` | 2 | SM4 | value(→) | Bytes | IntList | GM/T 0002 | SM4 32 轮密钥生成 |

### 填充块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `pad_pkcs7` | 1 | 填充 | value(→) | Bytes & Number | Bytes | RFC 2315 | PKCS#7 填充：填充 padLen 个值为 padLen 的字节 |
| `pad_zero` | 1 | 填充 | value(→) | Bytes & Number | Bytes | Generic | 零填充：填充 0x00 至 blockSize 整数倍 |

### 模式块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `mode_ecb` | 3 | 模式 | value(→) | Bytes & Bytes | Bytes | SP 800-38 | ECB 模式：每个 16 字节块独立加密 |
| `mode_cbc` | 3 | 模式 | value(→) | Bytes & Bytes & Bytes | Bytes | SP 800-38 | CBC 模式：C_i = E(P_i ⊕ C_{i-1}) |
| `mode_ctr` | 3 | 模式 | value(→) | Bytes & Bytes & Bytes | Bytes | SP 800-38 | CTR 模式：计数器 + nonce 加密后异或明文 |
| `mode_gcm` | 3 | 模式 | value(→) | Bytes & Bytes & Bytes | Bytes | SP 800-38 | GCM 模式：AES-CTR + GHASH 认证标签 |

### SHA-256 块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `hash_sha256_pad` | 1 | SHA-256 | value(→) | null | Bytes | FIPS 180-4 | SHA-256 消息填充：1 \|\| 0\* \|\| len，对齐 512-bit |
| `hash_sha256_pad_text` | 1 | SHA-256 | value(→) | null | Bytes | FIPS 180-4 | SHA-256 文本 UTF-8 填充 |
| `hash_sha256_pad_hex` | 1 | SHA-256 | value(→) | null | Bytes | FIPS 180-4 | SHA-256 十六进制字符串填充 |
| `hash_sha256_compress` | 1 | SHA-256 | value(→) | null & null | null | FIPS 180-4 | SHA-256 压缩函数：CF(V, W) → 8-word state XOR |

### SHA-3 / Keccak 块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `keccak_state_init` | 1 | SHA-3 | value(→) | — | null | FIPS 202 | Keccak-f[1600] 初始零状态 (5×5 lanes) |
| `keccak_f` | 1 | SHA-3 | value(→) | null | null | FIPS 202 | Keccak-f[b] 置换：24 轮 (θ→ρ→π→χ→ι) |
| `sponge_pad` | 1 | SHA-3 | value(→) | null | Bytes | FIPS 202 | SHA-3 pad10\*1：M \|\| d \|\| 0\* \|\| 0x80，可选 rate/suffix |
| `hash_sha3_pad_text` | 1 | SHA-3 | value(→) | null | Bytes | FIPS 202 | SHA-3 pad10\*1 填充（UTF-8 文本输入） |
| `hash_sha3_pad_hex` | 1 | SHA-3 | value(→) | null | Bytes | FIPS 202 | SHA-3 pad10\*1 填充（十六进制输入） |
| `sponge_absorb` | 1 | SHA-3 | value(→) | null & Bytes | null | FIPS 202 | Sponge absorb：State ^= P_i → Keccak-f(State) |
| `sponge_squeeze` | 1 | SHA-3 | value(→) | null & Number | Bytes | FIPS 202 | Sponge squeeze：从 state 读取 r 位输出 |

### SM3 块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `hash_sm3_pad` | 1 | SM3 | value(→) | null | Bytes | GM/T 0004 | SM3 消息填充：对齐 512-bit |
| `hash_sm3_pad_text` | 1 | SM3 | value(→) | null | Bytes | GM/T 0004 | SM3 文本 UTF-8 填充 |
| `hash_sm3_pad_hex` | 1 | SM3 | value(→) | null | Bytes | GM/T 0004 | SM3 十六进制字符串填充 |
| `hash_sm3_compress` | 1 | SM3 | value(→) | null & null & null | null | GM/T 0004 | SM3 压缩函数：CF(V, W, W') |

### XOF / PRF 块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `pq_xof` | 1 | XOF/PRF | value(→) | Bytes & Number | Bytes | FIPS 202 | XOF: SHAKE128/SHAKE256 可扩展输出函数 |
| `pq_prf` | 1 | XOF/PRF | value(→) | Bytes & Number & Number | Bytes | FIPS 202 | PRF: SHAKE256(seed \|\| nonce) → outLen 字节，用于 CBD 采样 |

### Hash 便利块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `hash_hmac` | 2 | Hash | value(→) | Bytes & Bytes | Bytes | FIPS 198-1 | HMAC(KEY, MSG) 认证码 |
| `md_iterate` | 2 | Hash | value(→) | IntList & IntList | IntList | FIPS 180-4 | Merkle-Damgård 迭代：H_i = compress(H_{i-1}, M_i) |
| `sponge_duplex` | 2 | SHA-3 | value(→) | IntList & Bytes | Bytes | FIPS 202 | 海绵双工：absorb→permutation→squeeze 一步完成 |

### 位运算块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `bit_operation` | 1 | 位运算 | value(→) | Number & Number | Number | Generic | 按位运算（AND/OR/XOR/>>/</>>>/<<<） |
| `bit_not32` | 1 | 位运算 | value(→) | Number | Number | Generic | 32 位按位取反 |
| `bit_expr_infix` | 1 | 位运算 | value(→) | Number & Number | Number | Generic | 表达式插入块：XOR/AND/OR/= |
| `bit_rotate_left` | 1 | 位运算 | stmt(→→) | Number | — | Generic | 32 位循环左移（固定位数，需输出变量） |
| `bit_rotate_right` | 1 | 位运算 | stmt(→→) | Number | — | Generic | 32 位循环右移（固定位数，需输出变量） |
| `bit_rotate_left_op` | 1 | 位运算 | stmt(→→) | Number | — | Generic | 循环左移后执行 XOR/AND/OR/ADD |
| `bit_rotate_right_op` | 1 | 位运算 | stmt(→→) | Number | — | Generic | 循环右移后执行 XOR/AND/OR/ADD |
| `bit_byte_substitute` | 1 | 位运算 | stmt(→→) | null | — | Generic | 字节替换：输入 → 输出 |

### 逻辑运算块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `lgc_operation` | 1 | 逻辑 | stmt(→→) | null & null & null | — | Generic | 逻辑运算 XOR/OR/AND（三输入，需输出变量） |
| `lgc_not` | 1 | 逻辑 | stmt(→→) | null | — | Generic | 非运算（需输出变量） |
| `lgc_compound` | 1 | 逻辑 | stmt(→→) | null & null & null | — | Generic | 复合逻辑运算（XOR^XOR / OR^XOR / AND^XOR 等） |

### 数论块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `nt_mod` | 1 | 数论 | value(→) | Number & Number | Number | Math | a mod n 模运算 |
| `nt_mod_pow` | 1 | 数论 | value(→) | Number & Number | Number | Math | a^b mod n 模幂 |
| `nt_div_rem` | 1 | 数论 | value(→) | Number & Number | Number | Math | 除余运算 |
| `nt_mod_inverse` | 1 | 数论 | stmt(→→) | null & null & null | — | Math | 模逆元计算 d = inv(e, φ(n)) |
| `nt_field_add` | 1 | 数论 | value(→) | null & null & null | null | Math | 有限域运算：add/sub/mul (A op B) mod P |
| `gf_mul` | 1 | 数论 | value(→) | Number & Number | Number | FIPS 197 | GF(2⁸) 域乘法（AES MixColumns 用，不可约多项式 0x11B） |
| `bn_add` | 1 | 数论 | value(→) | IntList & IntList | IntList | Math | 大数加法 |
| `bn_sub` | 1 | 数论 | value(→) | IntList & IntList | IntList | Math | 大数减法 |
| `bn_mul` | 1 | 数论 | value(→) | IntList & IntList | IntList | Math | 大数乘法 |
| `bn_div` | 1 | 数论 | value(→) | IntList & IntList | IntList | Math | 大数除法 |
| `pq_ntt` | 1 | 数论 | value(→) | IntList | IntList | FIPS 203 | NTT：Cooley-Tukey 蝶形，系数→NTT 评估形式 |
| `pq_intt` | 1 | 数论 | value(→) | IntList | IntList | FIPS 203 | INTT：Gentleman-Sande 蝶形，NTT 评估→系数形式 |
| `pq_ntt_mul` | 1 | 数论 | value(→) | IntList & IntList | IntList | FIPS 203 | Kyber half-NTT 域乘法，q=3329 |
| `pq_ntt_butterfly` | 1 | 数论 | value(→) | null & null & null | null | FIPS 203 | 蝶形运算原语：CT (NTT) 或 GS (INTT) |
| `pq_poly_add` | 1 | 数论 | value(→) | IntList & IntList | IntList | FIPS 203 | PolyAdd：R_q 域多项式逐系数加法 mod q |

### 数据块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `data_value` | 1 | 数据 | value(→) | — | null | Generic | 通用值/数值输入 |
| `seed_bytes` | 1 | 数据 | value(→) | — | Bytes | Generic | 当前种子原始字节 (data) |
| `seed_hex` | 1 | 数据 | value(→) | — | null | Generic | 当前种子十六进制字符串 (data.hex()) |
| `cipher_key_from_seed` | 1 | 数据 | value(→) | — | IntList | Generic | 从 seed 派生 4×32-bit 密钥 |
| `data_bit_length` | 1 | 数据 | value(→) | null | Number | Generic | 输入数据的位长度 |
| `data_byte_length` | 1 | 数据 | value(→) | null | Number | Generic | 输入数据的字节长度 |

### 数据转换块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `data_convert_to_int` | 1 | 数据 | stmt(→→) | null | — | Generic | 变量转为整数类型 |
| `data_convert_bits_to_bytes` | 1 | 数据 | stmt(→→) | null & null | — | Generic | 比特串 → 字节 |
| `data_convert_bytes_to_bits` | 1 | 数据 | stmt(→→) | null & null | — | Generic | 字节 → 比特串 |

### 数组块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `arr_partition_to_array` | 1 | 数组 | stmt(→→) | null & null & null | — | Generic | 分割输入数据为指定份数，写入目标数组 |

### 控制流块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `ctrl_iterate` | 1 | 控制 | stmt(→→) | — | — | Generic | 自定义迭代循环 (1–10240 次)，内嵌 Do 语句体 |

### 编码转换块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `base64_encode` | 1 | 编码 | value(→) | Bytes | String | RFC 4648 | Base64 编码 |
| `base64_decode` | 1 | 编码 | value(→) | String | Bytes | RFC 4648 | Base64 解码 |
| `hex_to_bytes` | 1 | 编码 | value(→) | String | Bytes | Generic | 十六进制字符串 → 字节 |
| `bytes_to_hex` | 1 | 编码 | value(→) | Bytes | String | Generic | 字节 → 十六进制字符串 |
| `endian_swap` | 1 | 编码 | value(→) | IntList | IntList | Generic | 字节序转换 |

### 后量子基础块 — 编码/压缩

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `pq_byte_concat` | 1 | ML-KEM/编码 | value(→) | Bytes & Bytes | Bytes | FIPS 203 | BytesConcat(A, B): 字节串拼接 A \|\| B |
| `pq_bytes_slice` | 1 | ML-KEM/编码 | value(→) | Bytes & null & null | Bytes | FIPS 203 | BytesSlice(B, start, end): 字节切片 B[start:end] |
| `pq_seed_with_nonce` | 1 | ML-KEM/编码 | value(→) | Bytes & null | Bytes | FIPS 203 | SeedWithNonce(seed, nonce): seed \|\| byte(nonce) |
| `pq_bytes_to_bits` | 1 | ML-KEM/编码 | value(→) | Bytes | Bits | FIPS 203 | BytesToBits: 字节数组→比特数组（小端序，Alg 4） |
| `pq_bits_to_bytes` | 1 | ML-KEM/编码 | value(→) | Bits | Bytes | FIPS 203 | BitsToBytes: 比特数组→字节数组（Alg 3） |
| `pq_byte_encode` | 1 | ML-KEM/编码 | value(→) | IntList | Bytes | FIPS 203 | ByteEncode_d: 多项式系数→紧凑字节（d-bit 打包，Alg 5） |
| `pq_byte_decode` | 1 | ML-KEM/编码 | value(→) | Bytes | IntList | FIPS 203 | ByteDecode_d: 紧凑字节→多项式系数（d-bit 解包，Alg 6） |
| `pq_compress` | 1 | ML-KEM/压缩 | value(→) | IntList | Bytes | FIPS 203 | Compress_q(x,d): 模 q 整数压缩为 d 位 (§4.2.1) |
| `pq_decompress` | 1 | ML-KEM/压缩 | value(→) | Bytes | IntList | FIPS 203 | Decompress_q(y,d): d 位整数解压回模 q (§4.2.1) |

### 后量子高级块 — 采样

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `pq_sample_ntt` | 2 | ML-KEM/采样 | value(→) | Bytes | IntList | FIPS 203 | SampleNTT: XOF(SHAKE128) 拒绝采样 NTT 域多项式 (Alg 7) |
| `pq_sample_poly_cbd` | 2 | ML-KEM/采样 | value(→) | Bytes | IntList | FIPS 203 | SamplePolyCBD_η: PRF(SHAKE256) CBD 分布采样 (Alg 8) |

### 后量子便利块 (M2.5)

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `pq_ntt_vec` | 2 | ML-KEM/便利 | value(→) | IntList | IntList | FIPS 203 | 向量 NTT |
| `pq_intt_vec` | 2 | ML-KEM/便利 | value(→) | IntList | IntList | FIPS 203 | 向量 INTT |
| `pq_cbd_ntt_vec` | 2 | ML-KEM/便利 | value(→) | IntList | IntList | FIPS 203 | CBD 采样+NTT 一步完成 |
| `pq_mat_vec_mul_ntt` | 2 | ML-KEM/便利 | value(→) | IntList | IntList | FIPS 203 | NTT 域矩阵×向量乘法 |
| `pq_vec_add` | 2 | ML-KEM/便利 | value(→) | IntList | IntList | FIPS 203 | 向量加法 |
| `pq_vec_sub` | 2 | ML-KEM/便利 | value(→) | IntList | IntList | FIPS 203 | 向量减法 |
| `pq_sample_ntt_mat` | 2 | ML-KEM/便利 | value(→) | Bytes | IntList | FIPS 203 | NTT 矩阵生成 (SampleNTT 逐元素) |

### ECC 块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `ecc_load_curve_params` | 1 | ECC | stmt(→→) | — | — | SEC 2 | 设置椭圆曲线参数 a, b, p |
| `ecc_load_point` | 1 | ECC | stmt(→→) | null | — | SEC 2 | 定义椭圆曲线上的点 (x, y) |
| `ecc_point_double` | 1 | ECC | stmt(→→) | null & null | — | SEC 2 | 椭圆曲线点倍运算 P2 = 2·P1 |
| `ecc_add` | 1 | ECC | stmt(→→) | null & null & null | — | SEC 2 | 椭圆曲线点加法 P3 = P1 + P2 |
| `ecc_multiply` | 1 | ECC | stmt(→→) | null & null | — | SEC 2 | 椭圆曲线标量乘法 P2 = k·P1 |

### S-Box 块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `sbox` | 1 | S-Box | value(→) | — | SBox | Generic | S-box 查找表：可配置 ROW×COL，支持 CSV 导入/导出 |
| `sbox_sub` | 1 | S-Box | stmt(→→) | null & SBox | — | Generic | S-box 替换：输入变量按 S-box 查表输出 |
| `sbox_variables_get` | 1 | S-Box | value(→) | — | SBox | Generic | SBox 类型变量读取块 |
| `sbox_variables_set` | 1 | S-Box | stmt(→→) | SBox | — | Generic | SBox 类型变量赋值块 |

### 函数封装块

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `crypto_return` | 1 | 函数 | stmt(→→) | null | — | Generic | 密码学函数返回值语句 |
| `crypto_func_def` | 1 | 函数 | stmt(→→) | — | — | Generic | 带密码学类型提示的函数模板定义 |
| `crypto_encrypt_func` | 1 | 函数 | stmt(→→) | — | — | Generic | 预置加密函数模板 🔐 |
| `crypto_decrypt_func` | 1 | 函数 | stmt(→→) | — | — | Generic | 预置解密函数模板 🔓 |
| `crypto_hash_func` | 1 | 函数 | stmt(→→) | — | — | Generic | 预置哈希函数模板 #️⃣ |

### 一键封装块 (L3)

| 块名 | 层 | 类目 | 连接形式 | 输入类型 | 输出类型 | 标准依据 | 说明 |
|------|----|------|----------|----------|----------|----------|------|
| `ml_kem_keygen` | 3 | ML-KEM | value(→) | Bytes | Bytes | FIPS 203 | ML-KEM 密钥生成：seed → (ek, dk) |
| `sm3_hash` | 3 | SM3 | value(→) | Bytes | Bytes | GM/T 0004 | SM3 哈希一键计算 |
| `sm3_hmac` | 3 | SM3 | value(→) | Bytes | Bytes | GM/T 0004 | HMAC-SM3 认证码一键计算 |
| `hmac_sha256` | 3 | HMAC | value(→) | Bytes | Bytes | FIPS 198-1 | HMAC-SHA256 认证码一键计算 |
| `kdf_pbkdf2` | 3 | KDF | value(→) | Bytes | Bytes | SP 800-132 | PBKDF2 密钥派生一键计算 |
| `kdf_hkdf` | 3 | KDF | value(→) | Bytes | Bytes | RFC 5869 | HKDF 密钥派生一键计算 |

---

## 已废弃块

| 块名 | 废弃原因 | 替代 |
|------|----------|------|
| `ctrl_assign` | 赋值语义已内化到各运算块中 | 各运算块自带的赋值输入 |

---

*此表由代码自动生成，基于 `src/blocks/` 目录下所有 `Blockly.Blocks['...']` 注册信息。*
