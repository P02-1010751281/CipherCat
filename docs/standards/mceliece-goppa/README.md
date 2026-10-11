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
- 教程：[后量子演示](../../demos/post-quantum.md) 中的 Goppa/Patterson 一节。

<!-- standard-body:start -->

## 标准内容

本目录对应 **Classic McEliece / Goppa 码 — 算法与来源索引**，按标准条款拆分为 4 个结构化条目，覆盖 「Goppa 码定义、生成多项式与 syndrome」、「Patterson 代数译码、错误定位多项式与 Chien 搜索」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [Goppa-code definition, generator polynomial, and syndrome](./01-Goppa-Codes.en.md) | — | — |
| [Goppa 码定义、生成多项式与 syndrome](./01-Goppa-Codes.md) | Goppa 码定义、生成多项式与 syndrome | 已实现教学原语；未实现 ISO Classic McEliece KEM 参数集或符合性 |
| [Patterson algebraic decoding, error-locator polynomial, and Chien search](./02-Patterson.en.md) | — | — |
| [Patterson 代数译码、错误定位多项式与 Chien 搜索](./02-Patterson.md) | Patterson 代数译码、错误定位多项式与 Chien 搜索 | 已实现教学译码原语；未实现 ISO Classic McEliece KEM 参数集或符合性 |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `gf2_poly_mul`/div/mod/gcd | 通用 GF(2) 系数卷积，低位在前；无独立密码标准依据；空输入相乘返回 `[]` 表示零多项式 | `generator-contracts.test.ts` 通过真实 Blockly 生成并执行 JS/Python，覆盖左右空输入及非空已知结果 `[1,1]×[1,1,1]=[1,0,0,1]` | 只验证空输入约定和该卷积算例，不等同任何编码密码算法符合性 |
| `bin_mat_mul`/inv | — | — | — |
| `ham_weight` | — | — | — |
| `ham_dist` | — | — | — |
| `goppa_gen_poly` | — | — | — |
| `syndrome_calc` | — | — | — |
| `gf2m_mul`/add/inv | — | — | — |
| `gf2m_poly_add`/mul/mod/xgcd/eval | — | — | — |
| `goppa_decode` | — | — | — |
| `berlekamp_massey` | — | — | — |
| `arr_slice` | 通用数组切片构件；安全整数起始索引（负值按末尾相对索引处理）；非负安全整数长度表示元素个数，数组边界处截断 | `array-slice-contract.test.ts` 通过真实 Blockly 块生成并执行双语言代码，覆盖常规/尾端截断、负索引取足长度、起点越过数组头部、整数值浮点索引、输入只求值一次，并拒绝小数索引、负长度及超范围 start/length | 无独立密码标准算法身份；不证明父算法符合性 |

示例工作区：`demos/procedures/Code-Based-Math.json`、`demos/GF2m-Poly.json`、`demos/Goppa-Decode.json`、`demos/PQC-Gaps.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
