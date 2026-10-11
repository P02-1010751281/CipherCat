# FIPS 203 — 全算法索引

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism Standard
      https://csrc.nist.gov/pubs/fips/203/final      (2024-08-13)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf

## NIST 潜在勘误跟踪

NIST 发布页现有一条 2025-11-17 的计划说明，指出 FIPS 203 将在未来版本中更正已发现的问题。该页链接的[潜在更新表](./fips-203-potential-updates.xlsx)（本仓库于 2026-10-04 获取）列出两项：

- Appendix A：补充说明表中数值 `1` 对应 `i=0`，使表项与 `ζ^{BitRev₇(i)}` 的索引关系更明确。当前 source 已保留该 `1`；ML-KEM NTT 生成代码按算法使用 `i=1…127`，不读取 `i=0` 表项，因此此说明未要求更改当前生成逻辑。
- §5.3 Algorithm 15：把一条注释里的 `v` 改为 `w`，属于变量名勘误；K-PKE.Decrypt 当前没有对应的完整 Blockly 实现。

NIST 表格明确说明这些是**潜在更正**，不是正式变更，也不引入新技术要求。source 与算法拆分页继续忠实记录当前发布的 2024 正式版，不把潜在修订混入原文。发布前应再次核对 [NIST FIPS 203 发布页](https://csrc.nist.gov/pubs/fips/203/final)及其更新表。

## 参数集

| Parameter | ML-KEM-512 | ML-KEM-768 | ML-KEM-1024 |
|-----------|:----------:|:----------:|:-----------:|
| n         | 256        | 256        | 256         |
| q         | 3329       | 3329       | 3329        |
| k         | 2          | 3          | 4           |
| η₁        | 3          | 2          | 2           |
| η₂        | 2          | 2          | 2           |
| d_u       | 10         | 10         | 11          |
| d_v       | 4          | 4           | 5           |

### 密钥与密文大小 (bytes)

|               | ML-KEM-512 | ML-KEM-768 | ML-KEM-1024 |
|---------------|:----------:|:----------:|:-----------:|
| encaps key    | 800        | 1184       | 1568        |
| decaps key    | 1632       | 2400       | 3168        |
| ciphertext    | 768        | 1088       | 1568        |
| shared key    | 32         | 32         | 32          |

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | — | **伪代码符号约定** (§2.4) | | |
| 1 | `01-ForExample.md` | ForExample | 示例 | — |
| 2 | `02-SHAKE128example.md` | SHAKE128example | 示例 | — |
| — | — | **编码与压缩** (§4.2.1) | | |
| — | `Compress.md` | Compress/Decompress 公式 | | ✅ |
| 3 | `03-BitsToBytes.md` | BitsToBytes | 编码 | ✅ |
| 4 | `04-BytesToBits.md` | BytesToBits | 编码 | ✅ |
| 5 | `05-ByteEncode.md` | ByteEncode_d | 编码 | ✅ |
| 6 | `06-ByteDecode.md` | ByteDecode_d | 编码 | ✅ |
| — | — | **采样** (§4.2.2) | | |
| 7 | `07-SampleNTT.md` | SampleNTT | 采样 | ✅ |
| 8 | `08-SamplePolyCBD.md` | SamplePolyCBD_η | 采样 | ✅ |
| — | — | **NTT 变换** (§4.3) | | |
| 9 | `09-NTT.md` | NTT | 变换 | ✅ |
| 10 | `10-INTT.md` | NTT⁻¹ (INTT) | 变换 | ✅ |
| 11 | `11-MultiplyNTTs.md` | MultiplyNTTs | 变换 | ✅ |
| 12 | `12-BaseCaseMultiply.md` | BaseCaseMultiply | 内嵌 | — |
| — | — | **K-PKE** (§5) | | |
| 13 | `13-K-PKE-KeyGen.md` | K-PKE.KeyGen | PKE | — |
| 14 | `14-K-PKE-Encrypt.md` | K-PKE.Encrypt | PKE | ✅ |
| 15 | `15-K-PKE-Decrypt.md` | K-PKE.Decrypt | PKE | — |
| — | — | **ML-KEM 内部** (§6) | | |
| 16 | `16-ML-KEM-KeyGen-internal.md` | ML-KEM.KeyGen_internal | KEM | — |
| 17 | `17-ML-KEM-Encaps-internal.md` | ML-KEM.Encaps_internal | KEM | ✅ |
| 18 | `18-ML-KEM-Decaps-internal.md` | ML-KEM.Decaps_internal | KEM | — |
| — | — | **ML-KEM 公开接口** (§7) | | |
| 19 | `19-ML-KEM-KeyGen.md` | ML-KEM.KeyGen | KEM | — |
| 20 | `20-ML-KEM-Encaps.md` | ML-KEM.Encaps | KEM | ✅ |
| 21 | `21-ML-KEM-Decaps.md` | ML-KEM.Decaps | KEM | — |

## 图例

- ✅ 已直接实现
- — 未实现或不属于封装路径

## 平台实现与验证范围

平台用原子块拼出 ML-KEM-512 的 Encaps 路径（`demos/procedures/ML-KEM-Encaps.json`），并以 NIST ACVP `ML-KEM-encapDecap-FIPS203` 内部投影测试组 tgId=1（ML-KEM-512 encapsulation）的 tcId 1–3 驱动该实现，两种生成语言与官方的 `c‖K` 逐字节一致。密钥生成与解封装尚无完整块链实现；上述用例是官方测试数据的子集，不是 ACVP 验证会话或认证。

<!-- standard-body:start -->

## 标准内容

本目录对应 **FIPS 203 — 全算法索引**，按标准条款拆分为 22 个结构化条目，覆盖 「§2.4 伪代码符号约定」、「§4.2.1 编码与压缩」、「§4.2.2 采样」、「§4.3 NTT 变换」 等。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [Algorithm 1  ForExample()](./01-ForExample.md) | §2.4 伪代码符号约定 | 仅参考（未映射为块实现） |
| [Algorithm 2  SHAKE128example(str₁, …, strₘ, b₁, …, bₗ)](./02-SHAKE128example.md) | §2.4 伪代码符号约定 | 仅参考（未映射为块实现） |
| [Algorithm 3  BitsToBytes(b)](./03-BitsToBytes.md) | §4.2.1 编码与压缩 | 已实现（不代表完整标准覆盖） |
| [Algorithm 4  BytesToBits(B)](./04-BytesToBits.md) | §4.2.1 编码与压缩 | 已实现（不代表完整标准覆盖） |
| [Algorithm 5  ByteEncode_d(F)](./05-ByteEncode.md) | §4.2.1 编码与压缩 | 已实现（不代表完整标准覆盖） |
| [Algorithm 6  ByteDecode_d(B)](./06-ByteDecode.md) | §4.2.1 编码与压缩 | 已实现（不代表完整标准覆盖） |
| [Algorithm 7  SampleNTT(B)](./07-SampleNTT.md) | §4.2.2 采样 | 已实现（不代表完整标准覆盖） |
| [Algorithm 8  SamplePolyCBD_η(B)](./08-SamplePolyCBD.md) | §4.2.2 采样 | 已实现（不代表完整标准覆盖） |
| [Algorithm 9  NTT(f) — 前向数论变换](./09-NTT.md) | §4.3 NTT 变换 | 已实现（不代表完整标准覆盖） |
| [Algorithm 10  NTT⁻¹(f̂) — 逆数论变换](./10-INTT.md) | §4.3 NTT 变换 | 已实现（不代表完整标准覆盖） |
| [Algorithm 11  MultiplyNTTs(f̂, ĝ)](./11-MultiplyNTTs.md) | §4.3 NTT 变换 | 已实现（不代表完整标准覆盖） |
| [Algorithm 12  BaseCaseMultiply(a₀, a₁, b₀, b₁, γ)](./12-BaseCaseMultiply.md) | §4.3 NTT 变换 | 仅参考（未映射为块实现） |
| [Algorithm 13  K-PKE.KeyGen(d)](./13-K-PKE-KeyGen.md) | §5.1 K-PKE | 部分实现（不代表完整标准覆盖） |
| [Algorithm 14  K-PKE.Encrypt(ekPKE, m, r)](./14-K-PKE-Encrypt.md) | §5.2 K-PKE | 已实现（不代表完整标准覆盖） |
| [Algorithm 15  K-PKE.Decrypt(dkPKE, c)](./15-K-PKE-Decrypt.md) | §5.3 K-PKE | 部分实现（不代表完整标准覆盖） |
| [Algorithm 16  ML-KEM.KeyGen_internal(d, z)](./16-ML-KEM-KeyGen-internal.md) | §6.1 ML-KEM 内部 | 部分实现（不代表完整标准覆盖） |
| [Algorithm 17  ML-KEM.Encaps_internal(ek, m)](./17-ML-KEM-Encaps-internal.md) | §6.2 ML-KEM 内部 | 已实现（不代表完整标准覆盖） |
| [Algorithm 18  ML-KEM.Decaps_internal(dk, c)](./18-ML-KEM-Decaps-internal.md) | §6.3 ML-KEM 内部 | 部分实现（不代表完整标准覆盖） |
| [Algorithm 19  ML-KEM.KeyGen()](./19-ML-KEM-KeyGen.md) | §7.1 ML-KEM 公开接口 | 部分实现（不代表完整标准覆盖） |
| [Algorithm 20  ML-KEM.Encaps(ek)](./20-ML-KEM-Encaps.md) | §7.2 ML-KEM 公开接口 | 已实现（不代表完整标准覆盖） |
| [Algorithm 21  ML-KEM.Decaps(dk, c)](./21-ML-KEM-Decaps.md) | §7.3 ML-KEM 公开接口 | 部分实现（不代表完整标准覆盖） |
| [Compress / Decompress (§4.2.1)](./Compress.md) | Compress / Decompress (§4.2.1) | 已实现（不代表完整标准覆盖） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `pq_sample_poly_cbd` | — | — | — |
| `pq_sample_ntt` | — | — | — |
| `pq_prf`(PRFη：SHAKE256) | FIPS 203 §4.1 式 (4.3) `PRFη(s,b)=SHAKE256(s‖b,8·64·η)`；项目 nonce 为单字节，长度字段按字节计；SHAKE128 选项是非标准扩展 | 同一 `shake-block-contract.test.ts` 执行生成块，核验两种 SHAKE 模式下 `rate−1` 拼接、nonce `0..255` 边界和输出长度契约；参考输出由 Python `hashlib` 固定，不是官方向量 | FIPS 203 全算法测试、全部 η 参数集及官方 ACVP/CAVP 测试数据或算法验证 |
| `pq_ntt` | q=3329 的 ML-KEM NTT、q=8380417 的 ML-DSA NTT；q=12289 为项目教学分支；输入安全整数系数在入口先归一到 `[0,q)` | 同一测试以真实 Blockly 双语言执行 q=3329 脉冲输入固定输出，覆盖三种 q 的 256 项 NTT/INTT 往返性质；新增 `MAX_SAFE_INTEGER` 输入与其规范剩余代表的等价性，以及布尔、分数、超安全整数拒绝，并拒绝不支持的次数/长度；`ML-DSA-NTT` Procedure Demo 另做往返与乘法性质检查 | 脉冲/往返/Procedure 性质不是官方完整测试向量集；q=12289 非标准算法；不表示 FIPS 203/204 全算法符合或认证 |
| `pq_intt` | q=3329 的 ML-KEM INTT、q=8380417 的 ML-DSA INTT；q=12289 为项目教学分支；输入安全整数系数在入口先归一到 `[0,q)` | 同一测试通过双语言 256 项往返性质，新增 `MAX_SAFE_INTEGER` 输入与其规范剩余代表的等价性，以及布尔、分数、超安全整数拒绝；并拒绝不支持次数/长度；`ML-DSA-NTT` Procedure Demo 检查生成后的往返性质 | 未覆盖完整官方向量集；q=12289 非标准算法；不表示 FIPS 203/204 全算法符合或认证 |
| `pq_ntt_mul` | NTT 域逐项乘法（q=8380417）与 ML-KEM half-NTT 基乘（q=3329）；256 安全整数系数输入，入口按 q 归一；FIPS 203/204 NTT 域逐项乘法 | Blockly 双语言测试核对 q=8380417 全 1×全 2 固定结果、q=3329/8380417 安全整数代表与规范剩余类等价、整数值浮点输入、布尔/分数/超安全整数拒绝及两种 q 下长度约束；ML-DSA-NTT/ML-KEM Encaps Demo 另触发对应 Procedure 路径 | 这些固定输入/边界断言与 Demo 结果不是完整官方测试向量集；未据此证明两个父算法完整符合性或认证 |
| `pq_ntt_butterfly` | 通用单步 CT/GS 蝶形，返回 `[out0,out1]`；只接受规范整数剩余，支持 q=3329/8380417/12289 | 同一测试真实 Blockly 双语言执行两种公式及三个 q 的固定结果，并拒绝非规范操作数；q=12289 仅为教学分支 | 不证明完整 NTT/INTT、NTT 域乘法、FIPS 203 Algorithm 9/10、FIPS 204 Algorithm 41/42 或官方完整测试集 |
| `pq_poly_add`/sub | q=3329/8380417 下两个 256 项安全整数系数列表的逐项模加；先分别约简系数再相加；FIPS 203/204 多项式环运算（逐项模加） | `generator-contracts.test.ts` 通过真实 Blockly JS/Python 执行，覆盖安全整数上界附近的精确模结果、整数值浮点归一、布尔/分数/超界值拒绝及既有负系数/长度回归 | 算术契约/性质回归，不是独立官方测试向量；不证明多项式环乘法或父算法完整符合性 |
| `pq_compress`/decompress | — | — | — |
| `pq_byte_encode`/decode | FIPS 203 Algorithm 5；将 256 个系数按 `d` 位、小端 bit 顺序打包为 `32d` 字节 | `pq-bit-encoding.test.ts` 以真实 Blockly 执行 JS/Python，对所有开放的 `d` 值与逐位参考结果比较、核对固定前缀及往返；检查最高合法系数、`d=12` 的 `3329` 拒绝、错误长度/容器/系数拒绝，以及整数值浮点的跨语言一致性 | 积木仅开放项目使用的 `d∈{1,4,5,10,11,12}`，未开放抽象算法的全部 `1..12`；不代表完整 ML-KEM 向量或认证 |
| `pq_bytes_to_bits` | FIPS 203 Algorithm 4 BytesToBits：每个字节按最低有效位优先展开为 8 个 bit | `pq-bit-encoding.test.ts` 通过真实 Blockly 生成执行 JS/Python，核对 `[1,128,165]` 的位序、空输入及整数值浮点，并拒绝越界/分数/非有限值/布尔和不可迭代输入 | 原语级向量与契约测试；不证明 ML-KEM 完整算法、全部官方测试数据或正式验证 |
| `pq_bits_to_bytes` | FIPS 203 Algorithm 3 BitsToBytes：bit 长度须为 8 的倍数且每项属于 `{0,1}`；按每字节最低有效位优先组装 | 同一 `pq-bit-encoding.test.ts` 通过真实 Blockly 生成执行 JS/Python，核对 `11010001 → 139`、`[1,128,165]` 位串往返、空输入及整数值浮点，并拒绝长度不整字节、非法 bit 值、非有限值/布尔和不可迭代输入；核对 JS `Uint8Array` 与 Python `bytes` 结果 | 原语级向量与契约测试；不证明 ML-KEM 完整算法、全部官方测试数据或正式验证 |
| `pq_byte_concat` | — | — | — |
| `pq_bytes_slice` | — | — | — |
| `pq_seed_with_nonce` | — | — | — |
| `nt_mod_pow`(q=3329) | — | — | — |

示例工作区：`demos/ML-KEM-Atomic.json`、`demos/procedures/ML-KEM-Encaps.json（ML-KEM-512 固定向量）`；Procedure 模板：`proc_mlkem_keygen（CBD→NTT 片段）`、`proc_mlkem_encaps（固定 ML-KEM-512；结构模板检查仅冒烟）`、`proc_ntt_vec`、`proc_pq_cbd`、`proc_pq_sample`、`proc_pq_vec_add`、`proc_pq_vec_sub`；搭建指南：✅ ML-KEM-768-Encaps-搭建指南（该指南为 768 参数集；+ en）。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
