# ECDSA — 签名原语
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | FIPS 186-5 §6.4.1 |
| 原文证据 | [source：fips186-5-ecdsa](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | PDF 物理第 33 页（标准印刷页 24）；[提取稿 §6.4.1 第 1341 行](./00-Standard-Source.md#L1341) |
| 项目状态 | 仅参考（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页拆出 FIPS 186-5 §6.4.1 的签名算法；实现映射与标准算法分开记录。


原件：[FIPS 186-5 PDF](./NIST.FIPS.186-5.pdf)。

## 标准定义

ECDSA 签名算法以消息、私钥、域参数和批准的哈希函数/XOF 为输入，输出 `r,s`；`k`、`k⁻¹` 及私钥必须按标准保护，`r=0` 或 `s=0` 时按随机/确定性路径的规则处理。

## 公式或伪代码

```text
Inputs: bit string M; private key d in [1,n−1]; domain parameters D;
        approved hash function or XOF with hashlen-bit output.
Output: integers (r,s), each in [1,n−1].

H = Hash(M)
E = H if len(n) >= hashlen, otherwise the leftmost ceil(log2(n)) bits of H
e = IntegerFromBits(E)
generate k with 0 < k < n according to Section 6.3
k_inv = k^(-1) mod n
R = [k]G
r1 = IntegerFromFieldElement(x-coordinate of R)
r = r1 mod n
s = k_inv * (e + r*d) mod n
destroy k and k_inv
if r = 0 or s = 0:
    if k was deterministic: output failure
    otherwise: return to generation of k
output (r,s)
```

RFC 6979 §3.2/§3.4 的候选生成会在 `k` 越界或得到 `r=0` 时继续生成候选；它并未把签名结果 `s=0` 作为该候选循环的条件。FIPS 186-5 §6.4.1 则规定：`r=0` 或 `s=0` 且 `k` 为确定性生成时输出失败；随机 `k` 路径重新生成。项目采用 RFC 6979 方法派生 `k`，但最终 `r` 或 `s` 为零时按 FIPS 规则失败，不继续候选重试。

## 输入与输出

输入为消息 `M`、私钥 `d`、域参数 `D` 和批准的哈希函数/XOF；输出为 `[1,n−1]` 中的整数对 `(r,s)`，编码格式由项目映射单独约定。

## 项目映射

`ecdsa_sign` 接受 32 字节大端私钥标量（仅 `[1,n−1]`）、消息和固定的 P-256/SHA-256 参数，以 RFC 6979 方法确定性派生 `k`，输出 64 字节大端 `r || s`。越界标量拒绝；最终 `r` 或 `s` 为零时按 FIPS 186-5 §6.4.1 失败。RFC 6979 的候选重试针对无效 `k` 或 `r=0`，不能与 FIPS 对最终 `s=0` 的处理混为一谈。这不是 DER 编码，也不包含证书或密钥存储。

## 核验与缺项

Demo：`demos/procedures/ECDSA.json`。向量通过只证明已选 P-256/SHA-256 表示的一致性，不能推出覆盖 FIPS 186-5 全部签名机制。当前生成器使用普通 JavaScript `BigInt` / Python 整数与分支式点乘，不提供常数时间保证；仅用于教学和回归，不应保护生产私钥，也不代表 FIPS 验证或认证。
## 原文摘录

```text
6.4.1 ECDSA Signature Generation Algorithm
Inputs:
   1. Bit string M to be signed
   2. Private key d in the interval [1, n−1] and domain parameters D
   3. Approved hash function or XOF with output length of hashlen bits and a security design
      strength that is the same as or greater than the security strength of the key pair
Output: A pair of integers (r, s), each in the interval [1, n−1]
Process:
   1. Compute H = Hash(M) using the established hash function or XOF where H has hashlen bits.
   2. Derive E from H: use H when len(n) ≥ hashlen; otherwise use the leftmost ceil(log2(n)) bits.
      Convert E to integer e as specified in Appendix B.2.1.
   3. Generate a per-message secret number k, 0 < k < n, following Section 6.3.
   4. Compute k−1 mod n using Appendix B.1.
   5. Compute R = [k]G.
   6. Set xR to the x-coordinate of the affine representation of R.
   7. Convert xR to integer r1 using NIST SP 800-186 Appendix F.1.
   8. Set r = r1 mod n.
   9. Compute s = k−1 · (e + r · d) mod n.
  10. Securely destroy k and k−1.
  11. If r = 0 or s = 0 and k was deterministic, output failure; otherwise return to Step 3.
  12. Output (r, s).
```
