# RSA 概率素性测试（FIPS 186-5）

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | RSA 概率素性测试原语 |
| 标准定位 | FIPS 186-5 附录 B.3、B.3.1；轮数见表 B.1 和附录 C.1 |
| 原文证据 | [完整原文提取稿](./00-Standard-Source.md)；[NIST 发布页](https://csrc.nist.gov/pubs/fips/186-5/final) |
| 原文位置 | B.3：[提取稿第 2724 行起](./00-Standard-Source.md#L2724)；B.3.1：[第 2779 行起](./00-Standard-Source.md#L2779)，PDF 物理页 66–67（印刷页 57–58） |
| 项目状态 | 标准参照；当前测试内嵌于教学用 RSA 密钥生成器，未声明符合 FIPS 186-5 |

## 标准定义

附录 B.3 要求选择并使用获批的稳健概率素性测试。B.3.1 和 B.3.2 定义两种 Miller–Rabin 测试；标准也允许迭代 Miller–Rabin 后再执行一次 Lucas 测试。对 Miller–Rabin 基底使用的 DRBG 必须获批。可选试除可在概率测试前执行，试除上限 `L` 须在 `10^3` 到 `10^5` 之间。

所需轮数取决于算法、候选素数位长、安全强度、目标错误概率及后续测试。RSA 参数对应的表 B.1 数值见 [RSA 密钥生成条目](./05-RSA-Key-Generation.md#标准定义)；不能把任意固定轮数换算成不依赖这些条件的错误概率。

本页仅拆分 B.3.1 的 Miller–Rabin 测试。B.3.2 增强型 Miller–Rabin 和 B.3.3 Lucas 测试不在此页展开。

## 原文定位与引用

B.3.1 的输入、输出和完整步骤见本文“原文摘录”。提取稿中幂次上标依原 PDF 版式校正；公式及步骤顺序未作摘要替代。PDF 原件见 [NIST.FIPS.186-5.pdf](./NIST.FIPS.186-5.pdf)。

## 公式或伪代码

```text
Input: odd integer w; iteration count iterations consistent with Table B.1.
Output: status ∈ {PROBABLY PRIME, COMPOSITE}.

1. Let a be the largest integer such that 2^a divides w−1.
2. m = (w−1) / 2^a.
3. wlen = len(w).
4. For i = 1 to iterations:
   4.1 Obtain a wlen-bit string b from the approved DRBG and convert b using B.2.1.
   4.2 If b ≤ 1 or b ≥ w−1, repeat step 4.1.
   4.3 z = b^m mod w.
   4.4 If z = 1 or z = w−1, continue at step 4.7.
   4.5 For j = 1 to a−1:
       4.5.1 z = z^2 mod w.
       4.5.2 If z = w−1, continue at step 4.7.
       4.5.3 If z = 1, continue at step 4.6.
   4.6 Return COMPOSITE.
   4.7 Continue.
5. Return PROBABLY PRIME.
```

## 输入与输出

输入为待测奇数 `w`（可为 `p`、`q` 或条件素数生成中的辅助素数）和与表 B.1 一致的轮数 `iterations`。输出状态为 `PROBABLY PRIME` 或 `COMPOSITE`；`PROBABLY PRIME` 是概率测试结果，不是数学证明。

## 项目映射

- 独立 Blockly 块：无。测试在 `rsa_keygen` 生成器内部实现。
- JavaScript 生成器：`rsaIsPrime`，使用 `crypto.getRandomValues` 产生随机基底。
- Python 生成器：`rsa_is_prime`，使用 `secrets.randbelow` 产生随机基底。
- 相关测试：`tests/unit/rsa-randomness.test.ts` 检查随机采样边界及 Python 路径的 20 次基底采样；它不是 FIPS 算法验证套件。

## 核验与缺项

- 两种生成语言都使用 20 轮随机基底 Miller–Rabin 和小素数筛；该实现与 B.3.1 的步骤相似，不构成 FIPS 186-5 验证。
- 系统随机 API 的使用不能证明采用获批 DRBG；也没有实验室测试、验证证书或经批准的模块边界证据。
- 轮数虽高于当前 RSA `p/q` 位长在表 B.1 中列示的轮数，但这不能替代候选位长、DRBG、目标错误概率、实现验证以及密钥生成其余条件的证据。
- 可选试除上限目前由代码中的小素数表固定，尚无证据表明其按 B.3 规定的 `L` 参数选择；B.3.2、B.3.3 路径也未实现为可验证流程。

## 原文摘录

以下保留 B.3.1 原文的完整输入、输出和测试步骤；幂次按 PDF 版式规范化。上下文和表 B.1 见[完整提取稿](./00-Standard-Source.md#L2724)。

```text
B.3.1 Miller-Rabin Probabilistic Primality Test
Let DRBG be an approved deterministic random bit generator.
Input:
   1. w                   The odd integer to be tested for primality. This will be either p or
                          q, or one of the auxiliary primes p1, p2, q1, or q2.
   2. iterations          The number of iterations of the test to be performed; the value
                          shall be consistent with Table B.1.
Output:
   1. status              The status returned from the validation procedure where status is
                          either PROBABLY PRIME or COMPOSITE.
Process:
   1. Let a be the largest integer such that 2^a divides w−1.
   2. m = (w−1) / 2^a.
   3. wlen = len (w).
   4. For i = 1 to iterations do
         4.1   Obtain a string b of wlen bits from a DRBG. Convert b to an integer using the
               algorithm in B.2.1.
         4.2   If ((b ≤ 1) or (b ≥ w − 1)), then go to step 4.1.
         4.3   z = b^m mod w.
         4.4   If ((z = 1) or (z = w − 1)), then go to step 4.7.
         4.5   For j = 1 to a − 1 do.
               4.5.1   z = z^2 mod w.
               4.5.2   If (z = w − 1), then go to step 4.7.
               4.5.3   If (z = 1), then go to step 4.6.
         4.6 Return COMPOSITE.
         4.7 Continue.
   5. Return PROBABLY PRIME.
```
