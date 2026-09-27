## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | NIST SP 800-90A Rev.1 — DRBG 参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [§7 行 877–925](./00-Standard-Source.md#L877-L925)、[§9 行 1501–1538](./00-Standard-Source.md#L1501-L1538)、[HMAC_DRBG §10.1.2 行 2332–2468](./00-Standard-Source.md#L2332-L2468) |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-90A Rev.1 — DRBG 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页是跨章节导航页，不复制一个不存在的单一算法单元。范围和功能模型见 [§7](./00-Standard-Source.md#L877-L925)，机制函数见 [§9](./00-Standard-Source.md#L1501-L1538)，当前项目对应的 HMAC_DRBG 规范单元见 [§10.1.2](./00-Standard-Source.md#L2332-L2468)；完整公式和流程以 source/PDF 为准。

> 本页是依据同目录的 NIST SP 800-90A Rev.1 PDF 及 §7、§9、§10 重新整理的实现导航，
> 不是损坏的全文转录。标准后续版本/修订提示以 [NIST RBG publications](https://csrc.nist.gov/Projects/random-bit-generation/publications) 为准。

## 标准范围

SP 800-90A Rev.1 定义三类确定性随机比特生成器：

| 构造 | 项目状态 |
|---|---|
| Hash_DRBG | 标准有定义；项目未实现 |
| HMAC_DRBG | 项目实现 HMAC-SHA-256 子集 |
| CTR_DRBG | 标准有定义；当前 `drbg_generate` 不是 CTR_DRBG |

因此 README 中把本块笼统写成“CTR-DRBG”是不准确的，已改为 HMAC-DRBG。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### HMAC_DRBG 核心状态

以 HMAC-SHA-256 为例，状态为 `K` 和 `V`，两者长度均为 32 字节。实例化从：

```text
K = 00…00
V = 01…01
```

开始，再将 `entropy_input || nonce || personalization_string` 送入 Update。Update 的关键顺序为：

```text
K = HMAC(K, V || 00 || provided_data)
V = HMAC(K, V)
K = HMAC(K, V || 01 || provided_data)
V = HMAC(K, V)
```

Generate 反复执行 `V = HMAC(K, V)` 产生请求字节数，生成后再次更新状态。Additional input、reseed、重播保护、请求上限、健康测试和预测抗性仍需按标准逐项处理。

## CipherCat 覆盖边界

- `drbg_generate(entropy, nonce, perso, bits)`：一次性 HMAC-SHA-256 生成路径。
- Demo：`demos/procedures/DRBG.json`；现有验证使用 NIST CAVP HMAC-DRBG 向量子集。
- 当前未对外提供 `reseed`、`additional_input`、`prediction_resistance` 或 Hash/CTR 两类 DRBG。
- 代码使用教学级 JavaScript/Python 生成器，不宣称符合 CMVP/FIPS 140-3 或具备生产级侧信道防护。

标准原件：[NIST.SP.800-90A.pdf](./NIST.SP.800-90A.pdf)。
