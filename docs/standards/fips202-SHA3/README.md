# FIPS 202 — 全算法索引

标准原文提取参考：[00-Standard-Source.md](./00-Standard-Source.md)。

来源: NIST FIPS 202 — SHA-3 Standard: Permutation-Based Hash and Extendable-Output Functions
      https://csrc.nist.gov/pubs/fips/202/final      (2015-08)
      https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.202.pdf

## KECCAK-p 参数

| b    | w  | l = log₂(b/25) | nr = 12+2l |
|------|:--:|:--------------:|:----------:|
| 25   | 1  | 0              | 12         |
| 50   | 2  | 1              | 14         |
| 100  | 4  | 2              | 16         |
| 200  | 8  | 3              | 18         |
| 400  | 16 | 4              | 20         |
| 800  | 32 | 5              | 22         |
| 1600 | 64 | 6              | 24         |

KECCAK-f[b] = KECCAK-p[b, 12+2l]  (e.g., KECCAK-f[1600] = KECCAK-p[1600, 24])

## SHA-3 / SHAKE 参数

| Function    | r (bits) | c (bits) | Output | Domain Suffix |
|------------|:--------:|:--------:|:------:|:------------:|
| SHA3-224   | 1152     | 448      | 224    | 01           |
| SHA3-256   | 1088     | 512      | 256    | 01           |
| SHA3-384   | 832      | 768      | 384    | 01           |
| SHA3-512   | 576      | 1024     | 512    | 01           |
| SHAKE128   | 1344     | 256      | arb.   | 1111         |
| SHAKE256   | 1088     | 512      | arb.   | 1111         |

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | — | **KECCAK-p 步映射** (§3.2) | | |
| 1 | `01-Theta.md` | θ(A) | 步映射 | `keccak_f` 内部 |
| 2 | `02-Rho.md` | ρ(A) | 步映射 | `keccak_f` 内部 |
| 3 | `03-Pi.md` | π(A) | 步映射 | `keccak_f` 内部 |
| 4 | `04-Chi.md` | χ(A) | 步映射 | `keccak_f` 内部 |
| 5 | `05-rc.md` | rc(t) | 轮常数 | `keccak_f` 内部 |
| 6 | `06-Iota.md` | ι(A, ir) | 步映射 | `keccak_f` 内部 |
| — | — | **KECCAK-p 置换** (§3.3) | | |
| 7 | `07-KECCAK-p.md` | KECCAK-p[b, nr](S) | 置换 | 部分：`keccak_f` 支持 KECCAK-f[200/400/800/1600]；海绵与 SHA-3/SHAKE 仍使用 [1600,24] |
| — | — | **海绵结构** (§4) | | |
| 8 | `08-SPONGE.md` | SPONGE[f, pad, r](N, d) | 海绵 | 部分：吸收/挤出阶段块，仅 KECCAK-f[1600] |
| 9 | `09-pad10star1.md` | pad10\*1(x, m) | 填充 | `hash_sha3_pad_text` · `hash_sha3_pad_hex` · `sponge_pad`（通用 rate/suffix 配置） |
| — | — | **SHA-3 定义** (§6) | | |
| — | `SHA3-functions.md` | SHA3-224/256/384/512 | 哈希 | 部分：四档有限端点回归，非完整官方测试集 |
| — | `SHAKE-functions.md` | SHAKE128/256 | XOF | 部分：`pq_xof`；rate−1 边界回归，非完整官方测试集 |
| — | — | **进制转换** (附录 B) | | |
| 10 | `10-h2b.md` | h2b(H, n) | hex→bits | — |
| 11 | `11-b2h.md` | b2h(S) | bits→hex | — |
