# CipherCat 密码原语完整实施计划

> 版本 v2.0 | 2026-07-18 | 三层原语体系 + 完整里程碑

## 一、当前基准

- **77 个块**（76 活跃 + 1 废弃），11 个类目
- **类型系统**：Bytes / IntList / Number / SBox（刚建立）
- **后量子最强**（ML-KEM 底层全覆盖），**对称密码完全缺失**

## 二、三层原语体系

纯原子原语会让用户拖 20 个块才能做一次 AES 加密。三层共存，按需选择粒度：

```
层3: 一键封装 ── "拖出来就能用"（快速验证、演示）
    │            ML-KEM.KeyGen, SM3.Hash, SM2.Sign
    │
层2: 便利组合 ── "一个块 = 一组原子操作"（日常使用）
    │            aes_round, sm4_round, sponge_duplex, md_iterate
    │
层1: 原子原语 ── "最小不可拆操作"（专家调试、自定义算法）
                 aes_sub_bytes, nt_mod_pow, pq_ntt, bit_xor
```

### 设计原则

| 原则 | 说明 |
|------|------|
| **无新语义** | 层2/3 块必须是层1 原子块的有序组合，生成器内联展开为原子块代码 |
| **可审计** | 右键菜单「展开为原子块」用于教学验证 |
| **不独占** | 工具箱中与原子块同区展示，标注🔧便利块 / ⚡一键块 |
| **可降级** | 用户随时可用原子块手动替代便利块 |

### 便利块展开示例

```typescript
// aes_round（层2）生成器内联展开为 4 个原子块
// SubBytes(state) → ShiftRows → MixColumns → AddRoundKey(state, rk)
// 等于用户在画布上拖 4 个块的效果，但一个块搞定
```

### 各层块数预估

| 层 | 块数 | 典型块 |
|----|------|--------|
| 层1 原子 | ~80 | sub_bytes, mod_pow, ntt, hmac |
| 层2 便利 | ~25 | aes_round, sm4_round, sponge_duplex, md_iterate |
| 层3 一键 | ~20 | ml_kem_keygen, sm3_hash, ecdsa_sign |

> 最终 ~125 块，其中 ~55 个是新增（层1+层2+层3 原子便利一键），其余 70 个是现有块

---

## 三、实施路线

### 阶段 0：清理 + 类型增强（先做）

| # | 操作 | 块变化 | 层 |
|---|------|--------|-----|
| 0a | **移除 6 个不通用复合块**：`pq_atr_intt_add_e1`、`pq_tr_intt_add_e2_mu`、`pq_vec_compress_encode`、`pq_sample_ntt_mat`、`pq_cbd_ntt_vec`、`pq_build_vec3` | **-6** | — |
| 0b | **新增 `TYPE_BITS`**：`block-types.ts` + `encoding.ts`（3 处） | 0 | — |
| 0c | **重命名海绵/Keccak 块**：`hash_sha3_*`→`sponge_*`/`keccak_*`（5 块 + migration + 2 测试 JSON） | 0 | — |
| 0d | **新增 `TYPE_MATRIX` `TYPE_VECTOR` 标签** | 0 | — |
| 0e | **S-box `updateShape` 空壳清理** `blocks/sbox/sbox.ts` | 0 | — |

> 阶段 0 后：**71 块**，类型 7 种

---

### 阶段 1：对称密码 — 原子层（层1，~3 天）

| # | 块名 | 类目 | 说明 | 类型 |
|---|------|------|------|------|
| 1.1 | `aes_sub_bytes` | `symmetric/aes/` | SubBytes：S-box 替换 16 字节 | IntList→IntList |
| 1.2 | `aes_shift_rows` | `symmetric/aes/` | ShiftRows：第 i 行左移 i 字节 | IntList→IntList |
| 1.3 | `aes_mix_columns` | `symmetric/aes/` | MixColumns：GF(2⁸) 列混合 | IntList→IntList |
| 1.4 | `aes_add_round_key` | `symmetric/aes/` | AddRoundKey：状态 ⊕ 轮密钥 | IntList×2→IntList |
| 1.5 | `sm4_round_func` | `symmetric/sm4/` | 轮函数 F(x0,x1,x2,x3,rk) | IntList×2→IntList |
| 1.6 | `sm4_linear_transform` | `symmetric/sm4/` | L(B)=B⊕(B<<<2)⊕(B<<<10)⊕(B<<<18)⊕(B<<<24) | IntList→IntList |
| 1.7 | `pad_pkcs7` | `symmetric/padding/` | PKCS#7 填充 | Bytes→Bytes |
| 1.8 | `pad_zero` | `symmetric/padding/` | 零填充 | Bytes→Bytes |
| 1.9 | `gf_mul` | `numtheory/` | GF(2⁸) 域乘法 | Number×2→Number |

> 阶段 1 后：80 块（+9 原子块）

---

### 阶段 2：对称密码 — 便利层 + 模式（层2，~3 天）

| # | 块名 | 类目 | 说明 | 底层原子展开 |
|---|------|------|------|------------|
| 2.1 | `aes_round` | `symmetric/aes/` | AES 完整轮 | SubBytes→ShiftRows→MixColumns→AddRoundKey |
| 2.2 | `aes_last_round` | `symmetric/aes/` | AES 最后一轮（跳过 MixColumns） | SubBytes→ShiftRows→AddRoundKey |
| 2.3 | `aes_key_schedule` | `symmetric/aes/` | 完整密钥扩展 128/192/256 | RotWord→SubWord→Rcon→循环 |
| 2.4 | `sm4_round` | `symmetric/sm4/` | SM4 完整轮（含密钥异或） | sm4_round_func + xor |
| 2.5 | `sm4_key_schedule` | `symmetric/sm4/` | SM4 32 轮密钥生成 | 线性变换→循环 |
| 2.6 | `mode_ecb` | `symmetric/modes/` | ECB 电子密码本 | — |
| 2.7 | `mode_cbc` | `symmetric/modes/` | CBC 密码块链接 | — |
| 2.8 | `mode_ctr` | `symmetric/modes/` | CTR 计数器模式 | — |
| 2.9 | `mode_gcm` | `symmetric/modes/` | GCM 认证加密 | — |

> 阶段 2 后：**89 块**（+9 便利块 + 模式）

---

### 阶段 3：数学 + 通用辅助（层1+层2，~3 天）

| # | 块名 | 类目 | 层 | 说明 |
|---|------|------|----|------|
| 3.1 | `nt_mod` | `numtheory/` | 1 | 通用取模 a mod n |
| 3.2 | `nt_mod_pow` | `numtheory/` | 1 | 模幂 a^b mod n |
| 3.3 | `nt_div_rem` | `numtheory/` | 1 | 整数除法+余数 |
| 3.4 | `bn_add` | `numtheory/bignum/` | 1 | 大数加法 |
| 3.5 | `bn_sub` | `numtheory/bignum/` | 1 | 大数减法 |
| 3.6 | `bn_mul` | `numtheory/bignum/` | 1 | 大数乘法 |
| 3.7 | `bn_div` | `numtheory/bignum/` | 1 | 大数除法 |
| 3.8 | `hash_hmac` | `hash/` | 1 | HMAC（可切换 SHA-256/SM3/SHA-3） |
| 3.9 | `md_iterate` | `hash/` | 2 | Merkle-Damgård 迭代框架 |
| 3.10 | `sponge_duplex` | `hash/` | 2 | 海绵双工 absorb+squeeze 一次完成 |

> 阶段 3 后：**99 块**（+10）

---

### 阶段 4：一键封装 + 协议层（层3，~4 天）

| # | 块名 | 类目 | 说明 |
|---|------|------|------|
| 4.1 | `ml_kem_keygen` | `post-quantum/` | ML-KEM 密钥生成（一键） |
| 4.2 | `ml_kem_encaps` | `post-quantum/` | ML-KEM 封装（一键） |
| 4.3 | `ml_kem_decaps` | `post-quantum/` | ML-KEM 解封（一键） |
| 4.4 | `ecdh_key_exchange` | `ecc/` | ECDH 密钥交换 |
| 4.5 | `ecdsa_sign` | `ecc/` | ECDSA 签名 |
| 4.6 | `ecdsa_verify` | `ecc/` | ECDSA 验签 |
| 4.7 | `sm2_sign` | `ecc/` | SM2 数字签名 |
| 4.8 | `sm2_encrypt` | `ecc/` | SM2 公钥加密 |
| 4.9 | `sm3_hash` | `hash/` | SM3 一键哈希 |
| 4.10 | `sm3_hmac` | `hash/` | HMAC-SM3 |
| 4.11 | `hmac_sha256` | `hash/` | HMAC-SHA-256 |
| 4.12 | `kdf_pbkdf2` | `hash/` | PBKDF2 |
| 4.13 | `kdf_hkdf` | `hash/` | HKDF |
| 4.14 | `base64_encode` | `data/` | Base64 编码 |
| 4.15 | `base64_decode` | `data/` | Base64 解码 |
| 4.16 | `hex_to_bytes` | `data/` | Hex→Bytes |
| 4.17 | `bytes_to_hex` | `data/` | Bytes→Hex |
| 4.18 | `endian_swap` | `data/` | 大端/小端 |

> 阶段 4 后：**117 块**（+18 一键块）

---

### 阶段 5：扩展生态（P2，按需）

| # | 块名 | 说明 |
|---|------|------|
| 5.1 | `sha1_pad` / `sha1_compress` | SHA-1 |
| 5.2 | `sha3_224` / `sha3_256` / `sha3_384` / `sha3_512` | SHA3 一键封装 |
| 5.3 | ML-DSA 全套 | 后量子签名（约 10+ 块） |
| 5.4 | `sbox_analyze` | S-box 非线性度分析 |
| 5.5 | ZUC 全套 | 国密序列密码（约 5-8 块） |
| 5.6 | `blake2b` / `argon2_hash` | 现代哈希 |

> 最终：**~130 块**

---

## 四、目录结构（M4 完成后）

```
src/blocks/
├── ctrl/                    # 控制流
├── data/                    # 数据转换（+base64 +hex +endian）
├── array/                   # 数组
├── logic/                   # 逻辑
├── bitwise/                 # 位运算
├── sbox/                    # S-box
├── symmetric/               # ⭐ 新建：对称密码
│   ├── aes/                 #   层1原子 + 层2便利
│   │   ├── subbytes.ts
│   │   ├── shiftrows.ts
│   │   ├── mixcolumns.ts
│   │   ├── addroundkey.ts
│   │   ├── round.ts         # 层2便利
│   │   ├── last-round.ts    # 层2便利
│   │   └── key-schedule.ts  # 层2便利
│   ├── sm4/
│   │   ├── round-func.ts    # 层1
│   │   ├── linear-transform.ts
│   │   ├── round.ts         # 层2便利
│   │   └── key-schedule.ts  # 层2便利
│   ├── modes/               # 层2便利（AES+SM4共用）
│   │   ├── ecb.ts
│   │   ├── cbc.ts
│   │   ├── ctr.ts
│   │   └── gcm.ts
│   └── padding/             # 层1
│       ├── pkcs7.ts
│       └── zero.ts
├── hash/                    # 哈希
│   ├── hmac.ts              # 层1
│   ├── md-iterate.ts        # 层2便利
│   ├── sponge-duplex.ts     # 层2便利
│   ├── sm3-hash.ts          # 层3一键
│   ├── sm3-hmac.ts          # 层3一键
│   ├── hmac-sha256.ts       # 层3一键
│   └── ...（现有 sha256/sm3/sha3/shake 不变）
├── numtheory/               # 数论
│   ├── mod.ts / mod-pow.ts / div-rem.ts / gf-mul.ts
│   └── bignum/
│       ├── add.ts / sub.ts / mul.ts / div.ts
├── ecc/                     # ECC（+ecdh +ecdsa +sm2）
├── post-quantum/            # 后量子（+ml_kem_* 一键块）
└── procedure/               # 函数封装
```

---

## 五、类型系统（完成后）

```
TYPE_BYTES   = 'Bytes'     # 字节序列
TYPE_INT_LIST = 'IntList'  # 整数列表/多项式系数
TYPE_BITS    = 'Bits'      # 比特数组 {0,1}
TYPE_NUMBER  = 'Number'    # 标量
TYPE_SBOX    = 'SBox'      # S-box 查找表
TYPE_MATRIX  = 'Matrix'    # 矩阵标签
TYPE_VECTOR  = 'Vector'    # 向量标签（可选）
```

**所有块必须声明类型约束**，生成器代码产生的运行时类型需与声明一致。

---

## 六、块设计规范

### 三层标注

| 层 | 工具箱标注 | 色号偏移 | 右键菜单 |
|----|-----------|---------|---------|
| 1 原子 | 无标注 | 默认色号 | — |
| 2 便利 | 🔧 | 默认色号 +15 | 「展开为原子块」 |
| 3 一键 | ⚡ | 默认色号 +30 | 「展开为原子块」 |

### 命名

```
原子块:   <category>_<operation>        aes_sub_bytes, nt_mod_pow
便利块:   <category>_<composite>        aes_round, sm4_key_schedule
一键块:   <algorithm>_<action>           ml_kem_keygen, sm3_hash
文件:     kebab-case.ts
常量:     UPPER_SNAKE_CASE
```

### 结构模板

```typescript
import * as Blockly from 'blockly/core';
import { TYPE_INT_LIST } from '@/constants/block-types';

export const AES_BLOCK_TYPES = ['aes_sub_bytes', 'aes_round'] as const;
export type AesBlockType = (typeof AES_BLOCK_TYPES)[number];

// 层1：原子原语
Blockly.Blocks['aes_sub_bytes'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('SubBytes(');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(180);
    this.setTooltip('AES SubBytes: S-box 替换 16 字节状态 (FIPS 197 §5.1.1)');
    this.setHelpUrl('https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf');
  },
};

// 层2：便利组合（一个块 = SubBytes+ShiftRows+MixColumns+AddRoundKey）
Blockly.Blocks['aes_round'] = {
  init: function () {
    this.appendValueInput('STATE').setCheck(TYPE_INT_LIST).appendField('🔧 AES Round(');
    this.appendValueInput('ROUND_KEY').setCheck(TYPE_INT_LIST).appendField(', rk:');
    this.appendDummyInput().appendField(')');
    this.setInputsInline(true);
    this.setOutput(true, TYPE_INT_LIST);
    this.setColour(195);  // 180 + 15
    this.setTooltip(
      'AES 完整轮: SubBytes→ShiftRows→MixColumns→AddRoundKey\n' +
      '右键可展开为 4 个原子块'
    );
  },
};
```

---

## 七、Migration 处理

| 改动 | 需加映射 | 复杂度 |
|------|---------|--------|
| 移除 6 个复合块 | 无 | ⚪ |
| `hash_sha3_*` → `sponge_*`/`keccak_*` | **5 条映射** | 🟢 |
| TYPE_BITS / TYPE_MATRIX | 无（不影响序列化） | ⚪ |
| 全部新建块 | 无 | ⚪ |

**总计：5 行映射 + 2 个测试 JSON 块名更新。**

---

## 八、里程碑

| 里程碑 | 块数 | 核心内容 | 层 |
|--------|------|---------|-----|
| **当前** | 77 | 11 类目 | — |
| **M0: 清理** | 71 | 移除 6 块 + TYPE_BITS + 重命名 + TYPE_MATRIX + S-box 清理 | — |
| **M1: 对称原子** | 80 | AES原子(4) + SM4原子(2) + 填充(2) + GF(2⁸)(1) | 层1 |
| **M2: 对称便利** | 89 | aes_round/last_round/key_schedule + sm4_round/key_schedule + 4 模式 | 层2 |
| **M3: 数学+辅助** | 99 | 取模/模幂/除余/大数(4)/HMAC/md_iterate/sponge_duplex | 层1+2 |
| **M4: 一键封装** | 117 | ML-KEM一键(3) + ECDH/ECDSA(3) + SM2(2) + KDF(2) + 哈希一键(3) + 编码(5) | 层3 |
| **M5: 扩展** | ~130 | SHA-1/SHA3/ML-DSA/ZUC/BLAKE2 | 按需 |

---

## 九、文档系统

见 `docs/README.md` 完整索引。

各里程碑文档更新：

| 里程碑 | 文档更新 |
|--------|---------|
| M0 | ARCHITECTURE.md、DEVELOPMENT.md |
| M1-M2 | ARCHITECTURE.md（symmetric 类目）、DEVELOPMENT.md、新增 `fips197-AES/` + `gmt-0002-SM4/` |
| M3 | ARCHITECTURE.md（numtheory 扩展） |
| M4 | ARCHITECTURE.md、`gmt-0003-SM2/` |
| M5 | 按需 |

建议新增：`USAGE.md`（P1 用户手册）、`BLOCK-REFERENCE.md`（P1 块参考）、`TYPE-SYSTEM.md`（P2 类型系统深度文档）
