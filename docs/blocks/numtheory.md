# 数论 + 大数块参考


## 域运算 + NTT

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|---|---|---|---|---|
| `nt_field_add` | 1 | value(→) | null&null&null→null |
| `nt_mod_inverse` | 1 | stmt(→→) | null&null&null→— |
| `nt_mod` | 1 | value(→) | Number&Number→Number |
| `nt_mod_pow` | 1 | value(→) | Number&Number→Number（模数为下拉） |
| `nt_div_rem` | 1 | value(→) | Number&Number→IntList |
| `pq_poly_add` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_sub` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_mul` | 1 | value(→) | IntList&IntList→IntList | 普通系数卷积（MODULUS: none/3329/8380417/12289；安全整数系数；不按 `X^256+1` 约简，不是 FIPS 203/204 的 `R_q` 乘法） |
| `pq_mat_vec_mul` | 1 | value(→) | IntList&IntList→IntList | 标量模矩阵×向量教学辅助；不是多项式环矩阵运算 |
| `pq_ntt` | 1 | value(→) | IntList→IntList | NTT（MODULUS 下拉 3329/8380417/12289）：q=8380417 分支按 FIPS 204（ζ=1753、BitRev8、8 层 CT）；q=12289 为 256 点循环 NTT 教学分支 |
| `pq_intt` | 1 | value(→) | IntList→IntList | INTT（同下拉）：q=8380417 分支 GS 8 层 + 乘 256⁻¹=8347681；q=12289 与教学 NTT 互逆 |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | NTT 域乘法（下拉 3329/8380417）：两侧各需 256 个安全整数系数；接受整数值浮点数并归一为整数，拒绝布尔、分数和超安全整数；入口先按 q 归一到 `[0,q)`；q=8380417 逐点乘，q=3329 half-NTT 基乘 |
| `pq_ntt_butterfly` | 1 | value(→) | Number&Number&Number→IntList |

> `pq_poly_add/sub` 的两侧输入都必须是 256 个系数，系数须为安全整数；接受整数值浮点数并归一为整数，拒绝布尔、分数和超安全整数。每个系数先分别按 `q` 归一，再执行加减，避免安全整数边界上的中间精度损失。`pq_ntt/intt` 对所有参数都要求 `n=256` 和 256 个输入系数；系数同样须为安全整数，整数值浮点数会归一为整数，布尔、分数和超界值会拒绝；变换入口先将每个系数归一到 `[0,q)`。`pq_ntt_mul` 两侧输入也必须各含 256 个安全整数系数，接受整数值浮点数、拒绝布尔/分数/超安全整数，并在乘法入口按 `q` 归一到 `[0,q)`。`q=3329` 对应 ML-KEM，`q=8380417` 对应 ML-DSA；`q=12289` 使用 256 点循环 NTT，仅作教学，不表示 NewHope 或标准密码实现，且没有对应的 NTT 域乘法块。

`pq_poly_mul` 计算普通多项式系数卷积；系数必须在安全整数范围内，整数值浮点数（如 `1.0`）会先归一为整数，拒绝布尔、分数和超界值。未选择模数时，若任一输出系数超过安全整数范围则拒绝；选择 `q` 时先将系数归一到模数，再逐项累积并约简。该块不限制输入次数，也不对 `X^256+1` 取商，因此它是通用 `Z[X]` / `Z_q[X]` 算术教学构件，不是 ML-KEM/ML-DSA 的 `R_q = Z_q[X]/(X^256+1)` 乘法，也不构成相关标准符合性证据。

`pq_mat_vec_mul` 虽沿用 `pq_` 积木 ID，但只对扁平行优先的标量 `k×k` 矩阵和 `k` 维标量向量计算模 `q` 乘法；矩阵必须有 `k²` 个安全整数元素，支持整数值浮点数（如 `1.0`）并归一为整数，拒绝布尔值、分数和超安全整数；`q` 仅支持 3329 或 8380417，负整数按模数归一化。它不是 FIPS 203/204 中在多项式环 `R_q` 上执行的矩阵向量运算，不应作为该标准原语或符合性证据。

`pq_ntt_butterfly` 只计算一个通用 CT 或 GS 蝶形步骤，返回 `[out0, out1]`；其模数选项为 3329、8380417 和 12289。输入 `a`、`b`、`ζ` 必须是 `[0, q)` 内的整数，`q` 必须为大于 2 的奇数。CT 计算 `(a + ζb, a − ζb) mod q`；GS 计算 `((a + b)/2, ζ(b − a)/2) mod q`。此块不执行完整 NTT/INTT，也不单独实现或证明 FIPS 203 Algorithm 9/10 或 FIPS 204 Algorithm 41/42；`q=12289` 分支仅供教学。

## 组合数与向量点积

| 块 | 输入→输出 | 契约 |
|----|----------|------|
| `comb` | Number&Number→Number | `n`、`k` 必须是安全整数；结果精确计算，超过 JavaScript 安全整数范围时两种生成语言均报错 |
| `vec_dot` | IntList&IntList→Number | 两个向量长度必须相同；维度不匹配时两种生成语言均报错 |

## 多元、格与概率分布构件（教学/研究）

| 块 | 输入→输出 | 契约与边界 |
|----|----------|------------|
| `gauss_elim` | IntList&Number→IntList | 输入按行展平的增广矩阵 `[A\|b]`（`n×(n+1)`），以浮点高斯消元求唯一解；秩不足时返回空列表。调用方须提供匹配的维度；这是通用数值线性代数，不是密码算法验证器。 |
| `mv_quad_eval` | IntList&IntList→Number | 求值 `Q(x)=Σ(i≤j)aᵢⱼxᵢxⱼ+Σbᵢxᵢ+c`；系数依次为上三角二次项（行优先）、`n` 个一次项、常数，输入长度须为 `n(n+1)/2+n+1`。通用 MQ 数学示例，不代表某一方案。 |
| `poly_scale` | IntList&Number→IntList | 每个多项式系数乘以标量 `k`，不取模；数值精度遵循运行语言的数值语义。 |
| `lll_reduce` | IntList&Number&Number→IntList | 扁平 `rows×cols` 格基矩阵的浮点 Gram–Schmidt 教学实现，固定 `δ=0.75`；不提供精确整数运算、完备输入校验或可证明的约减界。JS/Python 当前输出取整方式不同，不能用于跨语言一致性或密码学实现。 |
| `gauss_pmf` | Number&Number→Number | 中心为 0 的离散高斯概率质量函数近似，在有限区间截断并归一化；`sigma` 应为正数。它只计算概率，不抽样，也不是 Falcon/FN-DSA 的采样实现或符合性证据。 |

## 大数运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `bn_add` | 1 | value(→) | IntList&IntList→IntList |
| `bn_sub` | 1 | value(→) | IntList&IntList→IntList |
| `bn_mul` | 1 | value(→) | IntList&IntList→IntList |
| `bn_div` | 1 | value(→) | IntList&IntList→IntList |

### 运算契约

- `nt_div_rem(a, d)` 返回与 Python `divmod(a, d)` 同定义的 `[商, 余数]`：商向负无穷取整，并满足 `a = 商 × d + 余数`。两个输入都必须是安全整数（绝对值不超过 2^53−1）；其他数值和 `d = 0` 均报错。
- `nt_mod(a, n)` 要求 `a`、`n` 均为安全整数且 `n > 0`，返回 `[0, n)` 中与 `a` 同余的值。`nt_mod_pow(a, e)` 使用块内选定的模数，要求 `a`、`e` 是安全整数且 `e ≥ 0`；JS 侧以 `BigInt` 做中间运算，避免 32 位移位或浮点乘法精度损失。
- `nt_field_add` 要求 `a`、`b`、`p` 为安全整数且 `p > 0`，结果规范化到 `[0, p)`；仅在把运算解释为有限域时，调用者才需保证 `p` 为素数，块本身不做素性测试。JS 使用 `BigInt` 做中间运算。`nt_mod_inverse(e, m)` 要求安全整数输入、`m > 0` 且 `gcd(e, m)=1`，负 `e` 会先按模数规范化；结果位于 `[0, m)`，JS/Python 分别输出 `Number`/`int`。JS 的 `BigInt` 中间运算不表示输入支持任意精度。无逆元、非正模数或不符合整数范围的输入会报错。
- `bn_*` 把 `IntList` 视为低位在前的无符号 32 位 limb 数组，每个 limb 范围为 `0..2^32−1`；空列表表示零，输出也按低位在前排列并将零规范化为 `[0]`。非列表、非整数或越界 limb 会被拒绝；`bn_sub(a, b)` 在 `a < b` 时拒绝无符号下溢，`bn_div(a, b)` 在除数为零（包括空列表）时拒绝计算。
- 这些是通用数值构件，不能单独代表 RSA 或其他标准算法的符合性。

## RSA 公钥密码教学块

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `rsa_keygen` | 1 | value(→) | （位数下拉；无值输入）→Bytes | 项目自定义教学密钥生成；512/1024/2048 → `n‖e‖d‖p‖q` 定长大端格式（512 位输出 196 字节）；不是 RFC 8017 密钥生成，也未实现/验证 FIPS 186-5 附录要求 |
| `rsa_encrypt` | 1 | value(→) | Bytes&Bytes→Bytes | 教学实现，参照 RFC 8017 RSAES-PKCS1-v1_5：`m^e mod n`（随机非零 PS 填充） |
| `rsa_decrypt` | 1 | value(→) | Bytes&Bytes→Bytes | 教学实现，参照 RFC 8017 RSAES-PKCS1-v1_5：`m^d mod n` 去填充 |
| `rsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | 教学实现，参照 RFC 8017 RSASSA-PKCS1-v1_5：SHA-256 + DigestInfo 编码，`m^d mod n` |
| `rsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | 教学实现，参照 RFC 8017 RSASSA-PKCS1-v1_5 验签 |

密钥互操作测试不属于符合性测试或认证。该密钥格式含私钥材料，只用于课堂演示；RFC 8017 定义 RSA 方案，不定义此处密钥生成算法。FIPS 186-5 §5.1 规定签名模数至少 2048 位；512/1024 位不满足该参数要求，2048 位选项也不证明密钥生成符合性。参见 [FIPS 186-5 RSA 密钥生成要求](../standards/fips186-5-ecdsa/05-RSA-Key-Generation.md) 与 [RFC 8017 结构化条目](../standards/rfc8017-pkcs1/01-RSA.md)。

## GF(2^m) 域（AES：FIPS 197；GCM：NIST SP 800-38D）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|---|---|---|---|---|
| `gf2m_mul` | 1 | value(→) | IntList&IntList→IntList |
| `gf2m_add` | 1 | value(→) | IntList&IntList→IntList | 域加法 = 按位 XOR（AES/GCM 双域） |
| `gf2m_inv` | 1 | value(→) | IntList→IntList | 乘法逆元（多项式扩展欧几里得）；AES S-box 约定将 0 映射为 0，GCM 的 0 无逆元并报错 |

AES 域元素用单元素 `IntList` 表示，加法、乘法和求逆均返回单元素列表。GCM 域元素用 4 个低位 word 在前的无符号 32 位 limb 表示，每个 limb 范围为 `[0, 2^32−1]`；每个 word 内保留 NIST 128-bit block 的位序。例如 block `000102030405060708090A0B0C0D0E0F` 表示为 `[0x0C0D0E0F, 0x08090A0B, 0x04050607, 0x00010203]`。GCM 乘法按 SP 800-38D §6.3 Algorithm 1 扫描 block 位并右移约简；乘法单位元为 `[0, 0, 0, 0x80000000]`。

## GF(2) 多项式与二进制矩阵（基于纠错码的数学构件）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gf2_poly_mul` | 1 | value(→) | IntList&IntList→IntList | GF(2) 多项式乘法（XOR 卷积，低位在前）；任一输入为空时返回 `[]`，以空系数表表示零多项式；非空算例 `(1+x)(1+x+x²)=1+x³` 对应 `[1,1]×[1,1,1]=[1,0,0,1]` |
| `gf2_poly_div` / `gf2_poly_mod` | 1 | value(→) | IntList&IntList→IntList | 长除商 / 余数 |
| `gf2_poly_gcd` | 1 | value(→) | IntList&IntList→IntList | 欧几里得 GCD |
| `bin_mat_mul` | 1 | value(→) | IntList&IntList&Number→IntList | GF(2) 矩阵乘（展平 n×n，n 为阶数） |
| `bin_mat_inv` | 1 | value(→) | IntList&Number→IntList | GF(2) 矩阵求逆（增广高斯消元） |
| `ham_weight` | 1 | value(→) | IntList→Number | 汉明重量 |
| `ham_dist` | 1 | value(→) | IntList&IntList→Number | 汉明距离 |

## Goppa 码（McEliece，基于纠错码的公钥密码构件）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `goppa_gen_poly` | 1 | value(→) | IntList→IntList | G(z)=∏(z−αᵢ)，αᵢ ∈ GF(2⁸)（AES 域）——McEliece 码核心构造 |
| `syndrome_calc` | 1 | value(→) | IntList&IntList&Number&Number→IntList | 线性码 syndrome s = H·y mod 2；s=0 ⟺ 合法码字 |
| `berlekamp_massey` | 1 | value(→) | IntList→IntList | GF(2) 最短 LFSR 综合（BCH/RS 译码） |
| `goppa_decode` | 1 | value(→) | IntList&IntList&IntList→IntList | 项目教学实现中的 Patterson 风格译码块；当前性质回归使用 GF(16) 子域 `[14,6,5]` 小型示例，不是 Classic McEliece 参数集或认证证据 |

## GF(2^m) 系数多项式（Patterson 原语）

上述 Goppa、二元域和多项式块是纠错码数学教学构件。当前测试集中于小型构造、代数关系与输入边界，不证明 Classic McEliece 标准参数、互操作性、完整算法或正式认证。

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gf2m_poly_add` | 1 | value(→) | IntList&IntList→IntList | 逐系数 XOR（特征 2） |
| `gf2m_poly_mul` | 1 | value(→) | IntList&IntList→IntList | 卷积（GF(2⁸) 域乘，AES 多项式表示）；任一输入为空时返回 `[]`；双语言算例 `[1,2]×[3,4]=[3,2,8]`，标量域乘算例 `0x57×0x83=0xC1` |
| `gf2m_poly_mod` | 1 | value(→) | IntList&IntList→IntList | 长除取余（模 Goppa 多项式） |
| `gf2m_poly_xgcd` | 1 | value(→) | IntList&IntList→IntList | 扩展欧几里得 → [len_u,u…,len_v,v…,g…]（u·A⊕v·B=g）；Patterson 定位子核心 |
| `gf2m_poly_eval` | 1 | value(→) | IntList&Number→Number | Horner 求值（Chien 搜索） |
