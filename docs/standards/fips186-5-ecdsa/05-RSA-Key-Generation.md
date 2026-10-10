# RSA 签名密钥生成（FIPS 186-5）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | RSA 签名密钥生成算法与实现边界 |
| 标准定位 | FIPS 186-5 §5.1、§5.4(a)、附录 A.1.1、A.1.3、B.3 与表 B.1 |
| 原文证据 | [完整原文提取稿](./00-Standard-Source.md)；[NIST 发布页](https://csrc.nist.gov/pubs/fips/186-5/final) |
| 原文位置 | §5.1：[提取稿第 973 行起](./00-Standard-Source.md#L973)，A.1.1：[第 1800 行起](./00-Standard-Source.md#L1800)，A.1.3：[第 1900 行起](./00-Standard-Source.md#L1900)，B.3/表 B.1：[第 2724 行起](./00-Standard-Source.md#L2724)；相关 PDF 物理页 25–27、43–51、65–68（印刷页 16–18、34–42、56–59）。本轮人工视觉核对范围仅为物理页 27、44–51、65–68、76 |
| 项目状态 | 标准参照；当前 `rsa_keygen` 是教学实现，不声明符合 FIPS 186-5 |

## 标准定义

FIPS 186-5 的 RSA 条款适用于数字签名密钥对；该密钥对不得用于密钥建立等其他用途。RFC 8017 定义 RSA 加密与签名方案，但不定义本项目的密钥生成算法。

- 模数 `n = p × q` 的位长 `nlen` 必须为不小于 2048 的偶数；`p`、`q` 等长，各为 `nlen/2` 位。
- 公钥指数 `e` 必须在生成素数和私钥指数前选定，且为满足 `2^16 < e < 2^256` 的奇数正整数。
- `p`、`q` 必须满足附录 A.1.1 的候选范围及 `gcd(p−1,e)=gcd(q−1,e)=1`；还须满足 `|p−q| > 2^(nlen/2−100)`。
- 私钥指数须满足 `2^(nlen/2) < d < lcm(p−1,q−1)` 且 `e·d ≡ 1 (mod lcm(p−1,q−1))`；若 `d` 未达到下界，须重新生成相关参数。
- 生成过程须使用获批随机比特生成器。A.1.3 要求 DRBG 安全强度不低于按 `nlen` 确定的安全强度。
- 附录 A.1.1 定义多种素数生成路径。本页拆分 A.1.3 随机概率素数路径；A.1.2、A.1.4–A.1.6 的可证明素数或带条件素数路径不在此展开。
- 附录 B.3 要求使用获批、稳健的概率素性测试；允许多轮 Miller–Rabin，或 Miller–Rabin 后接一次 Lucas 测试。轮数须结合素数位长和表 B.1 指定的目标错误概率读取。

表 B.1 中与 RSA 有关的全部轮数如下。辅助素数列用于带条件素数构造，不表示本项目实现了这些路径。

| 辅助素数最小位长 | `p`、`q` 位长 | 目标错误概率 | 辅助素数 Miller–Rabin 轮数 | `p`、`q` Miller–Rabin 轮数 |
|---:|---:|---:|---:|---:|
| >140 | 1024 | `2^-100` | 32 | 4 |
| >140 | 1024 | `2^-112` | 38 | 5 |
| >170 | 1536 | `2^-100` | 27 | 3 |
| >170 | 1536 | `2^-128` | 41 | 4 |
| >200 | 2048 | `2^-100` | 22 | 2 |
| >200 | 2048 | `2^-144` | 44 | 4 |

这些轮数不是脱离候选生成过程、素数位长和 DRBG 的通用错误概率。附录 C.1 区分“合数通过测试的概率”和“通过测试的候选为合数的概率”。

## 原文定位与引用

公式、表格和 A.1.3 步骤均按规范单元拆分，完整算法原文列于本文“原文摘录”。原件为 [NIST FIPS 186-5 PDF](./NIST.FIPS.186-5.pdf)。本轮只对 PDF 物理页 27、44–51、65–68、76 做了人工视觉核对，并据此校正相应 RSA 公式；这不代表整份标准或本条目涉及页已逐页复核。本页供标准参照，不是实现符合性报告或认证证书。

## 公式或伪代码

A.1.1 密钥约束公式：

```text
2^16 < e < 2^256; e is odd
sqrt(2) × 2^(nlen/2 − 1) ≤ p,q ≤ 2^(nlen/2) − 1
gcd(p − 1, e) = gcd(q − 1, e) = 1
|p − q| > 2^(nlen/2 − 100)
2^(nlen/2) < d < lcm(p − 1, q − 1)
e × d ≡ 1 (mod lcm(p − 1, q − 1))
```

A.1.3 的完整原文输入、输出及步骤见[原文摘录中的完整算法](#原文摘录)。

## 输入与输出

A.1.3 输入模数位长 `nlen`、公钥指数 `e`，可选输入 `a,b ∈ {1,3,5,7}`，分别约束 `p ≡ a (mod 8)`、`q ≡ b (mod 8)`。成功时输出 `SUCCESS` 和素数 `p,q`；失败时输出 `FAILURE` 和零值 `p,q`。

## 项目映射

- Blockly 块：`rsa_keygen`，定义于 `src/blocks/rsa/blocks.ts`；生成器位于 `src/generators/javascript/rsa/blocks.ts` 和 `src/generators/python/rsa/blocks.ts`。
- 当前块固定 `e=65537`，输出项目自定义的定长大端 `n‖e‖d‖p‖q` 字节串。RFC 8017 不定义该密钥生成算法或编码。
- Miller–Rabin 在生成器内部调用，没有独立 Blockly 块；算法要求见 [RSA 概率素性测试条目](./06-RSA-Primality-Testing.md)。
- 关联教学演示：`demos/procedures/RSA-Encrypt.json`。演示把私钥用于加解密，不是 FIPS 186-5 的签名密钥用途示例。

## 核验与缺项

- 项目提供 512、1024、2048 位选项。512/1024 位低于 FIPS 186-5 §5.1 的签名模数下限；2048 位仅达到位长门槛，不证明其他要求满足。
- JavaScript 使用浏览器 `crypto.getRandomValues`，Python 使用 `os.urandom`/`secrets`；这些事实不能证明采用获批 DRBG。两端以 20 轮随机基底执行 Miller–Rabin。对于 `p,q` 各 1024 位的 2048 位模数，20 轮高于表 B.1 的列示轮数，但不能据此证明候选生成、随机源、测试实现或目标错误概率符合标准。
- 当前实现没有落实 A.1.1 的素数间距下界和 `d` 下界检查，也没有证明完整候选范围、密钥保护、验证与生命周期要求。
- 单元测试、互操作测试或 Demo 通过只说明所测样本的行为，不代表 FIPS 186-5 / RFC 8017 完整符合性，更不代表正式认证。
- 输出含 `d,p,q` 私钥材料；不得作为生产密钥格式。当前加解密演示也不能作为 FIPS 签名密钥管理流程。
- NIST 核对日期：2026-09-30。发布页提供的 [Potential Updates 表](./fips186-5-potential-updates.xlsx)列出 A.3.3、B.10 的四项潜在修正；这些记录不是已发布的正式勘误。B.10 针对可证明素数构造，本页展开的 A.1.3/B.3 路径不套用该项。正式引用前应复查 NIST 发布页。

## 原文摘录

以下摘录保留标准原文的英文表述和完整算法步骤；为恢复 PDF 文本层丢失的数学排版，仅规范化上标、根号、括号和换行。原文上下文可在[完整提取稿](./00-Standard-Source.md)和 PDF 中核对。

### A.1.1：RSA 密钥条件

```text
In addition, all IFC keys shall meet the following criteria in order to conform to this standard, FIPS 186-5:
1. The public exponent e shall be selected with the following constraints:
   (a) The public verification exponent e shall be selected prior to generating the primes, p and q, and the private signature exponent d.
   (b) The exponent e shall be an odd positive integer such that 2^16 < e < 2^256.
       Note that the value of e may be any value that meets constraint 1(b) (i.e., e may be either a fixed value or a random value).
2. The primes p and q shall be selected with the following constraints:
   (a) (p − 1) and (q − 1) shall be relatively prime to the public exponent e.
   (b) The private prime factor p shall be selected randomly and shall satisfy
       sqrt(2) × 2^(nlen/2 − 1) ≤ p ≤ 2^(nlen/2) − 1, where nlen is the appropriate length for the desired security_strength.
   (c) The private prime factor q shall be selected randomly and shall satisfy
       sqrt(2) × 2^(nlen/2 − 1) ≤ q ≤ 2^(nlen/2) − 1, where nlen is the appropriate length for the desired security_strength.
   (d) |p − q| > 2^(nlen/2 − 100).
3. The private signature exponent d shall be selected with the following constraints after the generation of p and q:
   (a) The exponent d shall be a positive integer value such that
       2^(nlen/2) < d < LCM(p − 1, q − 1), and
   (b) d = e^−1 mod LCM(p − 1, q − 1).
       That is, the inequality in (a) holds, and 1 ≡ (ed) mod LCM(p − 1, q − 1).
   In the extremely rare event that d ≤ 2^(nlen/2), then new values for p, q, and d shall be determined. A different value of e may be used, although this is not required.
Any hash function used during the generation of the key pair shall be approved.
```

### A.1.3：随机概率素数生成算法

```text
A.1.3 Generation of Random Primes that are Probably Prime

An approved method that satisfies the constraints of Appendix A.1.1 shall be used for the generation of IFC random primes p and q that are probably prime (see case A.2). In addition, the security strength of the instance of the DRBG mechanism (see Section 8.4 in SP 800-90A, Rev. 1 [16]) used in the algorithm below shall be equal to or greater than the security strength associated with nlen as specified in SP 800-57, Part 1.

The following process or its equivalent shall be used to construct the random probable primes p and q (to be used as factors of the RSA modulus n):
Input:
   nlen          The intended bit length of the modulus n.
   e             The public verification exponent.
   a, b          (Optional parameters) Numbers from the set {1, 3, 5, 7} that may be used to add the further requirements p ≡ a mod 8, q ≡ b mod 8.
Output:
   status        The status of the generation process, where status is either SUCCESS or FAILURE.
   p and q       The private prime factors of n. When FAILURE is returned, zero values shall be returned as p and q.
Process:
   1. If nlen < 2048, return (FAILURE, 0, 0).
   2. If ((e ≤ 2^16) OR (e ≥ 2^256) OR (e is not odd)), then return (FAILURE, 0, 0).
   3. Set the value of security_strength in accordance with the value of nlen as specified in SP 800-57, Part 1.
   4. Generate p:
       4.1   i = 0.
       4.2   Obtain a string p of (nlen/2) bits from a DRBG that supports the security_strength.
             4.2.1 (Optional) The two most significant bits in p may be set arbitrarily.
       4.3   If p is generated with the p ≡ a mod 8 restriction, then p = p + ((a − p) mod 8),
             Else if (p is not odd), then p = p + 1.
       4.4   If (p < sqrt(2) × 2^(nlen/2 − 1)), then go to step 4.2.
       4.5   If (GCD(p − 1, e) = 1), then
                4.5.1 Test p for primality as specified in Appendix B.3 using an appropriate
                      value from Table B-1 in Appendix B.3 as the number of iterations.
                4.5.2 If p is PROBABLY PRIME, then go to step 5.
       4.6   i = i + 1.
       4.7   If (i ≥ 5 × nlen), then return (FAILURE, 0, 0)
             Else go to step 4.2.
   5. Generate q:
       5.1   i = 0.
       5.2   Obtain a string q of (nlen/2) bits from a DRBG that supports the security_strength
             5.2.1 The two most significant bits in q may be set arbitrarily.
       5.3   If q is generated with the q ≡ b mod 8 restriction, then q = q + ((b − q) mod 8),
             Else if (q is not odd), then q = q + 1.
       5.4   If (q < sqrt(2) × 2^(nlen/2 − 1)), then go to step 5.2.
       5.5   If (|p − q| ≤ 2^(nlen/2 − 100)), then go to step 5.2.
       5.6   If (GCD(q−1, e) = 1) then
                5.6.1 Test q for primality as specified in Appendix B.3 using an appropriate
                      value from Table B-1 in Appendix B.3 as the number of iterations.
                5.6.2 If q is PROBABLY PRIME, then return (SUCCESS, p, q).
       5.7   i = i + 1.
       5.8   If (i ≥ 10 × nlen), then return (FAILURE, 0, 0)
             Else go to step 5.2.
```
