# FIPS 203 — 全算法索引

来源: NIST FIPS 203 — Module-Lattice-Based Key-Encapsulation Mechanism Standard
      https://csrc.nist.gov/pubs/fips/203/final      (2024-08-13)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.203.pdf

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

| 序号 | 文件 | 名称 | 类别 | CipherCat |
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

- ✅ CipherCat 已直接实现
- — 未实现或不属于封装路径
