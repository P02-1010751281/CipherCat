# 标准文档函数/原语拆分索引

核对日期：2026-09-23

## 目的与粒度

`docs/standards/` 的 Markdown 分为“原文/结构化拆分输入层”和“结构化用户参照层”，按以下链路整理：

结构化流程是：先从标准 PDF 或 RFC 原件提取并定位原文，再按函数、原语族或算法阶段拆分成结构化页面，最后把条目与代码、Blockly 积木、demo 和验证边界逐项对应。

注意：这不表示删除原文输入层。每个有可读本地 PDF 的标准目录都保留
`00-Standard-Source.md`；它是结构化页面的事实来源和回链入口。本页和各目录的 `README.md`/`01-*.md`
是从 source 拆出的结构化、面向用户和 Blockly 映射的第二层。完整索引见
[SOURCE-LAYERS.md](./SOURCE-LAYERS.md)。

拆分规则：

- 一个页面至少对应一个标准定义的函数、算法阶段或紧密耦合的原语族。
- 没有独立积木的内部步骤可以成组说明，但必须标注“由上层块内部实现”。
- 标准原文、项目实现、demo 向量和认证结论分开写；有 demo 不等于完整覆盖。
- 不能从扫描 PDF 或损坏文本层可靠恢复的条款，不用猜测补写，改为缺项页。

## 已建立结构化入口

| 标准目录 | 拆分入口 | 主要原语族 |
|---|---|---|
| FIPS 180-4 | [SHA-2](./fips180-4-SHA2/README.md) | 填充、消息扩展、压缩、摘要输出 |
| FIPS 186-5 | [ECDSA](./fips186-5-ecdsa/README.md) | 曲线点运算、签名、验签 |
| GB/T 32905 | [SM3](./gbt32905-SM3/README.md) | 填充、扩展/压缩、完整哈希/HMAC |
| GB/T 32918 | [SM2](./gbt32918-SM2/README.md) | 曲线、签名、加密、密钥交换 |
| GB/T 33133 | [ZUC](./gbt33133-ZUC/README.md) | S 盒/线性变换、F/LFSR、密钥流、EEA3/EIA3 |
| GB/T 38635 | [SM9](./gbt38635-SM9/README.md) | H1/H2、密钥材料、签名、协议缺项 |
| SP 800-132 | [PBKDF2](./sp800-132-pbkdf2/README.md) | PRF、块迭代、参数边界 |
| SP 800-232 | [Ascon](./sp800-232-ascon/README.md) | 置换、Hash/XOF、AEAD |
| SP 800-38B/C/D/E | [分组模式](./sp800-38b-cmac/README.md) | 子密钥、MAC、编码、块乘法、GHASH、GCTR、GCM-AE/AD、tweak |
| SP 800-90A | [DRBG](./sp800-90a-drbg/README.md) | Update、Generate、生命周期边界 |
| GM/T 0103 | [RNG](./gmt0103-rng/README.md) | 熵源、健康检测、确定性生成 |
| GM/T 0005 | [随机性检测](./gmt0005-randomness/README.md) | 检测项目族、后端测评、报告边界 |

## 有意保留为缺项的目录

| 目录 | 原因 |
|---|---|
| `gbt36624-aead/` | 官方记录已确认现行及日期，但本地 PDF 为扫描件，无法可靠恢复条款；仅新增证据状态页 |
| `gbt15852-mac/` | 已区分 `.1-2020`、`.2-2024`、`.3-2019` 官方记录；未保存本地标准 PDF，暂只能做实现映射，不能伪造标准条款页 |
| `rfc*/` | 仓库保存 RFC Editor `.txt`；它们不是本次 PDF 统计对象，按 RFC 原文维护 |
| `papers/` | 研究材料，不冒充现行标准；按论文 README 和原件索引维护 |

## 已有细粒度条目

以下目录在本轮之前已经按标准算法阶段或原语拆分，继续沿用其现有 README 索引：

- FIPS 197 AES：SubBytes、ShiftRows、MixColumns/AddRoundKey、Key Expansion；
- FIPS 202 SHA-3：θ、ρ、π、χ、ι、Keccak-p、海绵、填充和进制转换；
- FIPS 203 ML-KEM：编码、采样、NTT、K-PKE、内部 API 和公开 API；
- FIPS 204 ML-DSA：编码、采样、舍入、NTT、签名/验签 API；
- FIPS 205 SLH-DSA：Algorithm 1–25 已逐项拆页；另有 ADRS、WOTS+、FORS 和结构概览页；
- GB/T 32907 SM4：轮函数、算法流程、密钥扩展和附录向量；
- SP 800-38A：ECB、CBC、CFB、OFB、CTR。

完整的条目—source 回链见
[SOURCE-SPLIT-INVENTORY.md](./SOURCE-SPLIT-INVENTORY.md)；原件可用性、提取质量和实现缺项见
[DOCUMENT-STATUS.md](./DOCUMENT-STATUS.md) 与 [REEXTRACTION-REPORT.md](./REEXTRACTION-REPORT.md)。

## 结构化条目验收入口

以下页面列为结构化验收入口；其中 123 个编号算法页已按统一字段保留原文算法块，组合页仍可能明确标注缺项、提取损坏或待 PDF 视觉核对：

| 领域 | 独立条目页 | 条目内容 |
|---|---|---|
| AES | [SubBytes](./fips197-AES/01-SubBytes.md)、[ShiftRows](./fips197-AES/02-ShiftRows.md)、[MixColumns/AddRoundKey](./fips197-AES/03-MixColumns-AddRoundKey.md) | S 盒、状态置换、有限域列混合、轮密钥异或 |
| SM4 | [参数结构](./gbt32907-SM4/01-Overview.md)、[算法/密钥扩展](./gbt32907-SM4/03-Algorithm.md)、[附录向量](./gbt32907-SM4/04-Appendix.md) | 轮函数输入输出、`T'`、轮密钥顺序、标准向量 |
| SM2 / ECDSA | [SM2 曲线](./gbt32918-SM2/02-Curve-Operations.md)、[SM2 签名](./gbt32918-SM2/03-Signature.md)、[ECDSA 曲线](./fips186-5-ecdsa/02-Curve-Operations.md) | 点运算、`ZA`、签名/验签公式和编码边界 |
| ZUC | [S/L](./gbt33133-ZUC/02-SBox-Linear.md)、[F/LFSR](./gbt33133-ZUC/03-F-and-LFSR.md)、[密钥流](./gbt33133-ZUC/04-Keystream.md)、[EEA3/EIA3](./gbt33133-ZUC/05-EEA3-EIA3.md) | 原子变换、状态机、流密码输出、保密/完整性构造 |
| Ascon / AEAD | [置换](./sp800-232-ascon/02-Permutation.md)、[Hash/XOF/CXOF](./sp800-232-ascon/03-Hash-XOF.md)、[CCM 编码](./sp800-38c-ccm/02-Formatting.md)、[GCM 边界](./sp800-38d-gcm/04-AEAD-Limits.md) | 轮函数、海绵、编码、标签和 nonce/IV 边界 |
| DRBG / 测评 | [DRBG Generate](./sp800-90a-drbg/03-Generate-and-Lifecycle.md)、[GM/T 0005 频数](./gmt0005-randomness/04-Frequency-and-Pattern-Tests.md)、[游程关系](./gmt0005-randomness/05-Runs-and-Relation-Tests.md)、[复杂度频谱](./gmt0005-randomness/06-Matrix-Complexity-and-Spectrum.md)、[最终判定](./gmt0005-randomness/07-Decision-and-Sample-Settings.md) | 状态更新、15 项检测统计量、1000 样本两层判定 |

其余已按算法编号拆开的 PQC、SHA-3、Ascon、GCM、SM3、分组模式和 SLH-DSA 页面沿用相同粒度；
现行覆盖由 `npm run standards:split-check` 机械核对，统一字段及新增条目要求见
[STRUCTURED-ENTRY-SCHEMA.md](./STRUCTURED-ENTRY-SCHEMA.md)。

本索引不是“所有标准条款均已逐字转录”的声明。当前已为 38 个目录、227 个结构化条目建立统一清单，GB/T 32915 的原件拆分仍待补；标准原文锚点共 220 个（185 个 source 行号、35 个精确 PDF 页码），另有 2 个 RFC 全文证据项、2 个仅回链研究书目的条目和 2 个无原件来源项。研究书目回链不计作标准原文锚点。逐条状态见
[SOURCE-SPLIT-INVENTORY.md](./SOURCE-SPLIT-INVENTORY.md)，验收口径见
[SOURCE-SPLIT-COVERAGE.md](./SOURCE-SPLIT-COVERAGE.md)。

GB/T 17964 的 4 个模式条目和 GM/T 0091 的 2 个 KDF 条目现已标注原 PDF 物理页码；
两份 source 的 C 级字体映射会损坏可检索标题或字符，因此这些条目使用经视觉核对的 PDF 页码锚点。
