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
