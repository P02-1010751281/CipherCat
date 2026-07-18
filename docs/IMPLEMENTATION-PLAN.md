# CipherCat 密码原语完整实施计划

> 版本 v1.0 | 2026-07-18 | 基于审计报告 v2.0 + 类型系统分析 + 架构审查

## 一、当前基准

- **77 个块**（76 活跃 + 1 废弃），11 个类目
- **类型系统**：Bytes / IntList / Number / SBox（刚建立）
- **后量子最强**（ML-KEM 底层全覆盖），**对称密码完全缺失**

## 二、实施路线

### 阶段 0：清理 + 类型增强（先做，约 0 天）

| # | 操作 | 文件 | 块数变化 |
|---|------|------|---------|
| 0a | **移除 6 个不通用复合块**：`pq_atr_intt_add_e1`、`pq_tr_intt_add_e2_mu`、`pq_vec_compress_encode`、`pq_sample_ntt_mat`、`pq_cbd_ntt_vec`、`pq_build_vec3` | `post-quantum/advanced/operations.ts`、`sampling.ts` | **-6** |
| 0b | **新增 `TYPE_BITS` 类型**：`bits` | `block-types.ts` + `encoding.ts` | 0 |
| 0c | **重命名 5 个海绵/Keccak 块**：`hash_sha3_pad`→`sponge_pad` 等 | `hash/sha3.ts` + `migration.ts` + 2 个测试 JSON | 0 |
| 0d | **新增 `TYPE_MATRIX` 标签** | `block-types.ts` + `post-quantum/advanced/` | 0 |
| 0e | **`arr_partition_to_array` 改进**：添加显式类型参数替代变量名分支 | `array/partition.ts` + `migration.ts` | 0 |
| 0f | **S-box `updateShape` 空壳清理** | `blocks/sbox/sbox.ts` | 0 |

> 阶段 0 完成后：71 块，类型系统 5 种（Bytes/IntList/Number/SBox/Bits + Matrix 标签）

### 阶段 1：AES + SM4 对称密码（P0，约 3-5 天）

| # | 块名 | 类目 | 说明 |
|---|------|------|------|
| 1.1 | `aes_sub_bytes` | `symmetric/aes/` | AES SubBytes：对 16 字节状态执行 S-box 替换（FIPS 197 §5.1.1） |
| 1.2 | `aes_shift_rows` | `symmetric/aes/` | AES ShiftRows：循环左移第 i 行 i 个字节（§5.1.2） |
| 1.3 | `aes_mix_columns` | `symmetric/aes/` | AES MixColumns：GF(2⁸) 矩阵乘法（§5.1.3） |
| 1.4 | `aes_add_round_key` | `symmetric/aes/` | AES AddRoundKey：状态 ⊕ 轮密钥 |
| 1.5 | `aes_key_expansion` | `symmetric/aes/` | AES 密钥扩展：128/192/256-bit 密钥 → 轮密钥 |
| 1.6 | `sm4_round_func` | `symmetric/sm4/` | SM4 轮函数 F(x0,x1,x2,x3,rk) |
| 1.7 | `sm4_key_expansion` | `symmetric/sm4/` | SM4 密钥扩展（32 轮密钥） |
| 1.8 | `sm4_linear_transform` | `symmetric/sm4/` | SM4 线性变换 L(B) = B⊕(B<<<2)⊕(B<<<10)⊕(B<<<18)⊕(B<<<24) |
| 1.9 | `mode_ecb` | `symmetric/modes/` | ECB 模式：N 个分组独立加密 |
| 1.10 | `mode_cbc` | `symmetric/modes/` | CBC 模式：Ci = E(Pi⊕Ci-1) |
| 1.11 | `mode_ctr` | `symmetric/modes/` | CTR 模式：流密码 |
| 1.12 | `mode_gcm` | `symmetric/modes/` | GCM 模式：认证加密（需 GHASH） |
| 1.13 | `pad_pkcs7` | `symmetric/padding/` | PKCS#7 填充 |
| 1.14 | `pad_zero` | `symmetric/padding/` | 零填充 |

> 阶段 1 完成后：85 块（+14）

### 阶段 2：数学原语 + 通用辅助（P0，约 2-3 天）

| # | 块名 | 类目 | 说明 |
|---|------|------|------|
| 2.1 | `nt_mod` | `numtheory/` | 通用取模：a mod n |
| 2.2 | `nt_mod_pow` | `numtheory/` | 模幂：a^b mod n |
| 2.3 | `nt_div_rem` | `numtheory/` | 整数除法 + 余数 |
| 2.4 | `bn_add` | `numtheory/bignum/` | 大数加法（IntList limbs） |
| 2.5 | `bn_sub` | `numtheory/bignum/` | 大数减法 |
| 2.6 | `bn_mul` | `numtheory/bignum/` | 大数乘法 |
| 2.7 | `bn_div` | `numtheory/bignum/` | 大数除法 |
| 2.8 | `hash_hmac` | `hash/` | HMAC：可切换底层哈希（SHA-256/SM3） |
| 2.9 | `gf_mul` | `numtheory/` | GF(2⁸) 域乘法（AES MixColumns 需要） |

> 阶段 2 完成后：94 块（+9）

### 阶段 3：一键封装 + 协议层（P1，约 3-5 天）

| # | 块名 | 类目 | 说明 |
|---|------|------|------|
| 3.1 | `ml_kem_keygen` | `post-quantum/` | ML-KEM KeyGen：生成 (ek, dk) |
| 3.2 | `ml_kem_encaps` | `post-quantum/` | ML-KEM Encaps：ek → (K, c) |
| 3.3 | `ml_kem_decaps` | `post-quantum/` | ML-KEM Decaps：dk + c → K |
| 3.4 | `ecdh_key_exchange` | `ecc/` | ECDH 密钥交换 |
| 3.5 | `ecdsa_sign` | `ecc/` | ECDSA 签名 |
| 3.6 | `ecdsa_verify` | `ecc/` | ECDSA 验签 |
| 3.7 | `sm2_sign` | `symmetric/` 或 `ecc/` | SM2 数字签名 |
| 3.8 | `sm2_encrypt` | 同上 | SM2 公钥加密 |
| 3.9 | `kdf_pbkdf2` | `hash/` | PBKDF2 密钥派生 |
| 3.10 | `kdf_hkdf` | `hash/` | HKDF 密钥派生 |
| 3.11 | `sm3_hash` | `hash/` | SM3 一键完整哈希 |
| 3.12 | `sm3_hmac` | `hash/` | HMAC-SM3 |
| 3.13 | `base64_encode` | `data/` | Base64 编码 |
| 3.14 | `base64_decode` | `data/` | Base64 解码 |
| 3.15 | `hex_to_bytes` | `data/` | Hex → Bytes |
| 3.16 | `bytes_to_hex` | `data/` | Bytes → Hex |
| 3.17 | `endian_swap` | `data/` | 大端/小端转换 |

> 阶段 3 完成后：111 块（+17）

### 阶段 4：扩展生态（P2，按需）

| # | 块名 | 说明 |
|---|------|------|
| 4.1 | `sha1_pad` / `sha1_compress` | SHA-1 |
| 4.2 | `sha3_224` / `sha3_256` / `sha3_384` / `sha3_512` | SHA3 一键封装 |
| 4.3 | `blake2b` / `blake2s` | BLAKE2 |
| 4.4 | `argon2_hash` | Argon2 |
| 4.5 | ML-DSA (Dilithium) 全套 | 后量子签名（约 10+ 块） |
| 4.6 | ZUC 全套 | 国密序列密码（约 5-8 块） |
| 4.7 | `sbox_analyze` | S-box 非线性度/差分均匀度分析 |

## 三、目录结构（完成后）

```
src/blocks/
├── ctrl/                    # 控制流（1 块）
├── data/                    # 数据转换（9 + 4 = 13 块）
├── array/                   # 数组（1 块）
├── logic/                   # 逻辑（3 块）
├── bitwise/                 # 位运算（8 块）
├── sbox/                    # S-box（4 块）
├── symmetric/               # ⭐ 新建：对称密码
│   ├── index.ts
│   ├── aes/
│   │   ├── subbytes.ts
│   │   ├── shiftrows.ts
│   │   ├── mixcolumns.ts
│   │   ├── addroundkey.ts
│   │   └── key-expansion.ts
│   ├── sm4/
│   │   ├── round-func.ts
│   │   ├── key-expansion.ts
│   │   └── linear-transform.ts
│   ├── modes/
│   │   ├── ecb.ts
│   │   ├── cbc.ts
│   │   ├── ctr.ts
│   │   └── gcm.ts
│   └── padding/
│       ├── pkcs7.ts
│       └── zero.ts
├── hash/                    # 哈希（17 + 4 = 21 块：+HMAC +SM3一键 +SM3-HMAC +PBKDF2 +HKDF）
├── numtheory/               # 数论（7 + 7 = 14 块：+mod +modpow +divrem +GF +大数×3）
│   └── bignum/
│       ├── add.ts
│       ├── sub.ts
│       ├── mul.ts
│       └── div.ts
├── ecc/                     # ECC（5 + 3 = 8 块：+ECDH +ECDSAsign +ECDSAverify）
├── post-quantum/            # 后量子（11 块，已移除 6 个复合块）
└── procedure/               # 函数封装（5 块）
```

## 四、类型系统（完成后）

```
src/constants/block-types.ts

TYPE_BYTES   = 'Bytes'     # 字节序列
TYPE_INT_LIST = 'IntList'  # 整数列表 / 多项式系数
TYPE_BITS    = 'Bits'      # 比特数组 {0,1}
TYPE_NUMBER  = 'Number'    # 标量（Blockly 原生）
TYPE_SBOX    = 'SBox'      # S-box 查找表
TYPE_MATRIX  = 'Matrix'    # 矩阵（标签，无专用原语块）
TYPE_VECTOR  = 'Vector'    # 向量（可选标签）
```

## 五、Migration 处理

| 改动 | 需加映射 | 复杂度 |
|------|---------|--------|
| 移除 6 个复合块 | 无 | ⚪ |
| `hash_sha3_*` → `sponge_*`/`keccak_*` | **5 条映射** | 🟢 |
| `hash_sha3_state_init` → `keccak_state_init` | 同上 | 🟢 |
| `arr_partition` 加参数 | 无（不改块名） | ⚪ |
| TYPE_BITS / TYPE_MATRIX | 无（不影响序列化） | ⚪ |
| 所有新建块 | 无（全新无旧版） | ⚪ |

**Migration 总计：只需加 5 行映射 + 更新 2 个测试 JSON 中的块名。**

## 六、块设计规范

### 命名

```
块类型:  <category>_<name>       全小写下划线
文件:    kebab-case.ts
常量:    UPPER_SNAKE_CASE
导出:    <CATEGORY>_BLOCK_TYPES, type <Category>BlockType
```

### 结构模板

```typescript
import * as Blockly from 'blockly/core';
import { TYPE_BYTES, TYPE_INT_LIST } from '@/constants/block-types';

export const AES_BLOCK_TYPES = ['aes_sub_bytes'] as const;
export type AesBlockType = (typeof AES_BLOCK_TYPES)[number];

Blockly.Blocks['aes_sub_bytes'] = {
  init: function () {
    this.appendValueInput('STATE')
      .setCheck(TYPE_INT_LIST)
      .appendField('SubBytes(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);                        // 对称密码: 绿色系
    this.setTooltip('... (FIPS 197 §5.1.1)');
    this.setHelpUrl('https://...');
  },
};
```

### 颜色规范

| 类目 | 色号 |
|------|------|
| 对称密码 | 180 |
| 大数 | 60 |
| 填充 | 330 |
| 模式 | 160 |

### 类型对齐

每个块必须声明 `setCheck(TYPE_*)` 和 `setOutput(true, TYPE_*)`。生成器代码产生的运行时类型需与声明一致。

## 七、文档清单（需更新）

| 文件 | 更新内容 |
|------|---------|
| `docs/ARCHITECTURE.md` | 12 类目 + 类型系统 |
| `docs/DEVELOPMENT.md` | 新建 symmetric 类目示例 |
| `docs/README.md` | 块数 |
| `docs/AUDIT-REPORT.md` | 标记已实现项 |
| 本项目 `IMPLEMENTATION-PLAN.md` | 进度跟踪 |

## 八、里程碑

| 里程碑 | 块数 | 内容 |
|--------|------|------|
| **当前** | 77 | 11 类目 |
| **M1: 清理** | 71 | 移除复合块 + 类型增强 + 重命名 |
| **M2: 对称密码** | 85 | AES + SM4 + 模式 + 填充 |
| **M3: 数学+辅助** | 94 | 取模/模幂/大数/HMAC/GF |
| **M4: 协议封装** | 111 | ML-KEM封装 + ECDH/ECDSA + SM2 + KDF + 编码 |
| **M5: 扩展** | ~130 | SHA-1/SHA3/ML-DSA/ZUC |
