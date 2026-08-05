# McEliece / Goppa 码 — 全算法索引

来源:
- R. J. McEliece, "A Public-Key Cryptosystem Based on Algebraic Coding Theory",
  DSN Progress Report 42-44, 1978
- V. D. Goppa, "A new class of linear error-correcting codes", Problems of
  Information Transmission, 1970
- Classic McEliece — NIST PQC Round-4 submission (2023):
  https://classic.mceliece.org/
- E. R. Berlekamp, "Goppa codes", IEEE Trans. Inf. Theory, 1973
- N. J. Patterson, "The algebraic decoding of Goppa codes", IEEE Trans. Inf.
  Theory, 1975

> CipherCat 编码基块族（`src/blocks/numtheory/codebased.ts` + `gf2mpoly.ts` +
> `src/blocks/numtheory/` 二进制矩阵/汉明）覆盖 Goppa 码构造、syndrome 计算与
> Patterson 译码——McEliece 公钥密码与 Goppa 码纠错的教学原语。
> 教学参数（固定）：GF(2^8) AES 域（不可约 x⁸+x⁴+x³+x+1 = 0x11B）、t = 2、n = 14。

## 教学参数

| 参数 | 值 | 说明 |
|------|----|------|
| 域 | GF(2^8) = GF(2)[x]/(x⁸+x⁴+x³+x+1) | AES 域，与 goppa_gen_poly/gf2m 块同域 |
| 支持集 L | GF(16) 子域元素 | AES 域中 2 的阶仅 51（非本原）；阶 15 元 = 0x0d，子域 S = {0} ∪ {13^k} XOR 封闭 |
| n | 14 | 码长 = 支持集大小 |
| t | 2 | 生成多项式 G(z) 次数，纠错能力 t |
| k | n − mt = 6 | 信息维数（支持集取子域才获非零码字空间） |

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | `01-Goppa-Codes.md` | Goppa 码构造 + syndrome | 编码 | ✅ |
| — | `02-Patterson.md` | Patterson 代数译码 | 译码 | ✅ |

### 块实现明细

| 标准部件 | 类别 | 块 |
|------|------|----|
| GF(2^8) 乘法/加法/逆元（AES + GCM 双域） | 域运算 | `gf2m_mul` · `gf2m_add` · `gf2m_inv` |
| GF(2^8) 系数多项式加/乘/模/扩展欧几里得/求值 | 多项式 | `gf2m_poly_add` · `gf2m_poly_mul` · `gf2m_poly_mod` · `gf2m_poly_xgcd` · `gf2m_poly_eval` |
| 生成多项式 G(z) = ∏(z−αᵢ)（特征 2 减=加） | 码构造 | `goppa_gen_poly` |
| 校验矩阵 × 接收向量 syndrome s = H·y mod 2 | 码构造 | `syndrome_calc` |
| GF(2) 多项式乘/除/模/欧几里得 | 二进制多项式 | `gf2_poly_mul` · `gf2_poly_div` · `gf2_poly_mod` · `gf2_poly_gcd` |
| 二进制矩阵乘/逆（满秩校验） | 线性代数 | `bin_mat_mul` · `bin_mat_inv` |
| 汉明重量/距离（纠错能力 t = ⌊(d−1)/2⌋） | 度量 | `ham_weight` · `ham_dist` |
| GF(2) 最短 LFSR 综合（BCH/RS 译码侧） | 序列 | `berlekamp_massey` |
| Patterson 完整译码（黑盒） | 译码 | `goppa_decode` |
| 数组切片（定长截取，参数解包） | 工具 | `arr_slice` |

## 相关标准

- Goppa 码 + Patterson 译码是 **McEliece 公钥密码**（经典码基候选）的数学基础；
  NIST 未将其选为标准（FIPS 206 FN-DSA 为格基 Falcon，非码基）。
- `demos/procedures/Goppa-Decode.json`：G=[176,92,1] 根判定、逆元 u·(z−α)≡1、
  syndrome 原子链==已知值、无错/单错/双错往返、篡改 G 不可纠。
- 教程：docs/demos/post-quantum.md 场景 11（Goppa/Patterson）。
