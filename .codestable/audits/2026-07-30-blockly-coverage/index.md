---
doc_type: audit-index
date: 2026-07-30
slug: blockly-coverage
scope:
  - area: src/blocks/
    files: ~40
    dimensions: [maintainability, correctness]
  - area: src/generators/
    files: ~54
    dimensions: [correctness]
  - area: docs/blocks/
    files: 9
    dimensions: [maintainability]
status: superseded
superseded-by: 2026-07-31-procedure-system
---

# Blockly 原语覆盖与设计一致性审计 — 2026-07-30

## 范围

| 区域 | 文件数 | 扫描维度 |
|------|--------|----------|
| `src/blocks/` | ~40 `.ts`（12 类目, 118 块） | maintainability, correctness |
| `src/generators/` | ~54 `.ts`（JS + Python 镜像） | correctness |
| `docs/blocks/` | 9 `.md` | maintainability |

4 个并行只读 scout 完成扫描。

## 关键发现总览

| # | 标题 | 严重度 | 性质 | 置信度 | 建议 |
|---|------|--------|------|--------|------|
| 1 | 5 个块在 convenience.ts 中重复定义，覆盖原文件定义 | **P0** | correctness | high | cs-issue |
| 2 | `pq_cbd_ntt_vec` 等 5 个块引用不存在的 `K` 字段 | **P0** | correctness | high | cs-issue |
| 3 | `sm3_hmac` 生成器是空壳存根 | **P1** | correctness | high | cs-issue |
| 4 | 8 个块的 `setOutput` 类型为 `null` | **P1** | maintainability | high | cs-issue |
| 5 | 非对称密码原语完全缺失 | **P1** | correctness | high | cs-feat |
| 6 | `src/blocks/symmetric/modes/blocks.ts` 未导入——死代码 | **P1** | maintainability | high | cs-issue |
| 7 | 缺少 ML-DSA (Dilithium) 后量子签名 | **P2** | correctness | high | cs-feat |
| 8 | ECC 块颜色混乱（5 个块 5 种颜色） | **P2** | maintainability | high | cs-refactor |
| 9 | ~30 个块使用硬编码字符串而非类型常量 | **P2** | maintainability | high | cs-refactor |
| 10 | `docs/blocks/INDEX.md` 缺 3 个类目，总数偏差 ~8 块 | **P2** | maintainability | high | cs-issue |

## 详细发现

### Finding 1 [P0] — 块重复定义覆盖

`src/blocks/symmetric/convenience.ts` 重新定义了 `aes_round`、`aes_last_round`、`aes_key_schedule`、`sm4_round`、`sm4_key_schedule`，这些块在 `aes/blocks.ts` 和 `sm4/blocks.ts` 中已有定义。由于 `symmetric/index.ts` 同时导入 `aes/`、`sm4/` 和 `convenience/`，import 顺序决定 `convenience.ts` 的版本覆盖前者。同时，`src/generators/javascript/symmetric/convenience.ts` 和 `aes/blocks.ts` 也对同一块注册了不同生成器——第二个注册覆盖第一个。

**影响**：对 `aes_round` 块的任何修改如果在 `aes/blocks.ts` 中做，会被 `convenience.ts` 的旧版本静默覆盖。开发者可能在两个地方看到不同代码，调试时极其困惑。

**证据**：
- `src/blocks/symmetric/aes/blocks.ts` 定义 `aes_round`、`aes_last_round`、`aes_key_schedule`
- `src/blocks/symmetric/convenience.ts` 重新定义同名块
- `src/generators/javascript/symmetric/aes/blocks.ts` 注册这些块的 JS 生成器
- `src/generators/javascript/symmetric/convenience.ts` 再次注册同名生成器

### Finding 2 [P0] — 生成器引用不存在的 K 字段

`src/blocks/remaining.ts` 中 `_pq` 辅助函数创建的 `pq_cbd_ntt_vec`、`pq_sample_ntt_mat`、`pq_ntt_vec`、`pq_intt_vec`、`pq_mat_vec_mul_ntt` 块仅有一个 `INPUT` 值输入，但 JS/Python 生成器调用 `b.getFieldValue('K')||'3'`——块上不存在 `K` 字段。`getFieldValue` 对不存在的字段返回 `null`，fallback 为 `'3'`，所以生成器似乎能工作——但用户无法控制 `K` 参数（始终为 3）。

**影响**：ML-KEM 向量维度 K 无法调整——用户无法实验 K=2（Kyber-512）、K=4（Kyber-1024）。

**证据**：
- `src/blocks/remaining.ts:7-13`：`_pq` 仅创建 `INPUT` 输入
- `src/generators/javascript/remaining.ts`：`b.getFieldValue('K')||'3'`
- `src/generators/python/remaining.ts`：同上

### Finding 3 [P1] — sm3_hmac 生成器为空壳

SM3-HMAC 块定义存在，但 JS 和 Python 生成器中对应的代码是占位存根——不产生实际的 HMAC-SM3 代码。

**影响**：用户拖出 SM3-HMAC 块后，生成的代码无法运行——国密 MAC 功能不可用。

### Finding 4 [P1] — 8 个块输出类型为 null

以下块定义了明确的加密语义输出，但 `setOutput(true, null)` 未指定类型：

| 块 | 文件 | 应为 |
|----|------|------|
| `hash_sha256_compress` | `sha256.ts` | `TYPE_INT_LIST` |
| `hash_sm3_compress` | `sm3.ts` | `TYPE_INT_LIST` |
| `keccak_f` | `sha3.ts` | `TYPE_INT_LIST` |
| `sponge_absorb` | `sha3.ts` | `TYPE_INT_LIST` |
| `keccak_state_init` | `sha3.ts` | `TYPE_INT_LIST` |
| `nt_field_add` 等 | `field.ts` | `TYPE_NUMBER` |

**影响**：Blockly 类型检查在这些块上失效——任意类型可连接，下游块收到意外类型时运行时报错。

### Finding 5 [P1] — 非对称密码完全缺失

CipherCat 有 ECC 点运算基础块（加载曲线、点加、标量乘），但缺失：
- RSA 密钥生成、加密/解密、签名/验签
- ECDSA/EdDSA 协议封装
- SM2 签名/加密/密钥交换
- DH/ECDH 密钥协商

**影响**：密码学教学平台无法覆盖公钥密码这一核心章节。

### Finding 6 [P1] — modes/blocks.ts 未被导入

`src/blocks/symmetric/modes/blocks.ts` 定义了 ECB/CBC/CTR/GCM 模式块，但 `src/blocks/symmetric/index.ts` 从未导入它——这些块定义永远不会被加载。

**影响**：虽然 convenience.ts 中有模式块（通过 `_makeModeBlock` 创建），但 `modes/blocks.ts` 是完整的死代码——浪费维护精力，且可能导致开发者误以为修改该文件有效。

### Finding 7-10 [P2]

- **ML-DSA 缺失**：后量子签名标准未实现
- **ECC 颜色混乱**：5 个 ECC 块使用 5 种不同颜色（230/180/285/45/315），无分类统一性
- **硬编码类型字符串**：~30 个块用 `'Number'`/`'SBox'` 等字符串而非 `TYPE_NUMBER`/`TYPE_SBOX` 常量
- **文档索引过期**：`docs/blocks/INDEX.md` 缺 array/procedure/sbox 三个类目，总数 110 vs 实际 118

## 总评

CipherCat 的块体系覆盖面广（118 块，12 类目），后量子密码（ML-KEM）和哈希算法是亮点。三个结构性问题：

1. **重复定义链**（P0）：convenience.ts 覆盖原子文件定义——同一个块在两个文件中有冲突版本，生成器同样重复注册。需要彻底清理。
2. **字段-生成器脱节**（P0）：PQ 便利块的 K 字段在生成器中被引用但块定义中不存在——用户参数无法调整。
3. **类型系统应用不彻底**（P1）：8 个块的输出类型为 null，~30 块用硬编码字符串而非常量——类型安全保障有盲区。

## 建议下一步

- **P0 的两条立即修**：fix convenience.ts 重复定义 + 给 PQ 块加 K 字段
- **P1 的 4 条排下迭代**：fix sm3_hmac 存根、补输出类型、清理 modes/ 死代码
- **P2 后续规划**：非对称密码/ML-DSA 新功能走 `cs-feat`，类型常量统一走 `cs-refactor`
