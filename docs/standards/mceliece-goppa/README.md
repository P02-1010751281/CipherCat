# Classic McEliece / Goppa 码 — 算法与来源索引

来源与标准化状态见 [00-Research-Source.md](./00-Research-Source.md)；其中区分算法原始论文、ISO 标准记录和 NIST 流程状态。

## 标准化状态

| 组织 | 可核实状态 | 证据边界 |
|---|---|---|
| ISO/IEC | ISO/IEC 18033-2:2006/Amd 2:2026 于 2026-06-05 发布；修正案新增 Classic McEliece KEM。 | ISO 目录确认修正案已发布；算法团队页面列出纳入的算法与参数集。标准全文受版权及付费访问限制，本仓库不保存或转录全文。 |
| NIST | NIST IR 8545 和 2025-03-11 公告记录：Classic McEliece 是第四轮候选，但未获选；HQC 获选进入 NIST 标准化。NIST 当前 PQC 项目页（2026-08-05 更新）说明 HQC 标准化正在进行。 | 额外数字签名项目页虽于 2026-09-22 更新，正文仍保留“第四轮 KEM 候选仍在考虑”的旧段落，与已发布的第四轮结果不符；按陈旧页面内容处理，不把它视作未决的现行流程结论。 |

## 实现范围

> CipherCat 基于纠错码的数学构件（`src/blocks/numtheory/codebased.ts` + `gf2mpoly.ts` +
> `src/blocks/numtheory/` 二进制矩阵/汉明）覆盖 Goppa 码构造、syndrome 计算与
> Patterson 译码——McEliece 公钥密码与 Goppa 码纠错的教学原语。它不实现 ISO
> Classic McEliece KEM 的密钥生成、封装/解封装接口或所列参数集，也不构成标准符合性声明。
> 教学参数（固定）：GF(2^8) AES 域（不可约 x⁸+x⁴+x³+x+1 = 0x11B）、t = 2、n = 14。

## 教学参数

| 参数 | 值 | 说明 |
|------|----|------|
| 域 | GF(2^8) = GF(2)[x]/(x⁸+x⁴+x³+x+1) | AES 域，与 goppa_gen_poly/gf2m 块同域 |
| 支持集 L | GF(16) 子域元素 | AES 域中 2 的阶仅 51（非本原）；阶 15 元 = 0x0d，子域 S = {0} ∪ {13^k} XOR 封闭 |
| n | 14 | 码长 = 支持集大小 |
| t | 2 | 生成多项式 G(z) 次数，纠错能力 t |
| k | n − m′·t = 6 | 信息维数（m′ = 4 为支持集子域 GF(16) 的度数；元素以 GF(2^8) 字节表示，奇偶校验秩 = m′·t = 8，实测 rank(H)=8） |

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

- Goppa 码 + Patterson 译码是 Classic McEliece 码基 KEM 的数学背景；本项目只实现小参数教学原语，不能据此宣称实现 ISO/IEC 18033-2:2006/Amd 2:2026。
- NIST IR 8545 的 NIST 流程结论与 ISO 已发布标准是两种不同状态；详见本页“标准化状态”及来源索引，不得合并成“NIST/国际均未标准化”。
- `demos/procedures/Goppa-Decode.json`：G=[176,92,1] 根判定、逆元 u·(z−α)≡1、
  syndrome 原子链==已知值、无错/单错/双错往返、篡改 G 不可纠。
- 教程：docs/demos/post-quantum.md 场景 11（Goppa/Patterson）。
