# ECDSA — 验签原语
## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | FIPS 186-5 §6.4.2 |
| 原文证据 | [source：fips186-5-ecdsa](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | PDF 物理第 34 页（标准印刷页 25）；[提取稿 §6.4.2 第 1391–1393 行](./00-Standard-Source.md#L1391-L1393) |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页拆出 FIPS 186-5 §6.4.2 的验签算法；实现映射与标准算法分开记录。


原件：[FIPS 186-5 PDF](./NIST.FIPS.186-5.pdf)。

## 标准定义

开始验签前，必须确保域参数有效；公钥有效性也应按 [NIST SP 800-186 Appendix D.1](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-186.pdf) 检查。随后验证签名整数，再使用消息摘要、签名和公钥计算曲线点；无穷远点必须拒绝，最后比较曲线点横坐标归约值与 `r`。

## 公式或伪代码

```text
Inputs: message M; integers (r,s); public key Q; domain parameters D.
Output: accept or reject.

reject unless r and s are integers in [1,n−1]
H = Hash(M)
E = H if ceil(log2(n)) >= hashlen, otherwise the leftmost ceil(log2(n)) bits of H
e = IntegerFromBits(E)
s_inv = s^(-1) mod n
u = e * s_inv mod n
v = r * s_inv mod n
R1 = [u]G + [v]Q
reject if R1 is the identity element
r1 = IntegerFromFieldElement(x-coordinate of R1)
accept iff r = r1 mod n
```

当 `R1` 不是无穷远点且 `R1.x mod n = r` 时验签通过。

## 输入与输出

输入为消息、整数对 `(r,s)`、公钥 `Q` 和域参数 `D`；输出只有 `accept/reject`，不应把编码错误混同为有效签名。

## 项目映射

`ecdsa_verify` 输出 Boolean；项目约定签名为 64 字节 `r || s`、公钥为 64 字节 `Qx || Qy`。长度错误或 `r/s` 不在 `[1,n−1]` 时返回 `false`。P-256 验签会拒绝坐标超出有限域或不满足曲线方程的公钥；该检查只验证数学有效性，不建立公钥身份、私钥持有证明或证书信任。输入格式、曲线参数和消息摘要必须与签名侧一致。

## 核验与缺项

当前没有独立的 DER/SEC1 编解码块、开放式曲线选择、证书验证或完整 FIPS 186-5 密钥管理路径。
## 原文摘录

```text
6.4.2 ECDSA Signature Verification Algorithm
Inputs:
      1. Message M
      2. A pair of integers (r, s)
      3. Purported signature verification key Q and domain parameters D
Output: Accept or reject the signature over M as originating from the owner of Q.
Process:
From Section 6.2.2, the validity of the domain parameters shall be assured prior to the
verification and validation of a digital signature. The validity of the public key Q should also be
checked (see Appendix D.1 of SP 800-186 [5]).
1. Verify that r and s are integers in [1, n−1]. Output “reject” if verification fails.
      2. Compute H = Hash(M) using the established hash function or XOF.
      3. Derive E from H and convert E to integer e as specified in Appendix B.2.1.
      4. Compute s−1 mod n using Appendix B.1.
      5. Compute u = e · s−1 mod n and v = r · s−1 mod n.
      6. Compute R1 = [u]G + [v]Q. Output “reject” if R1 is the identity element.
      7. Set xR to the x-coordinate of the affine representation of R1.
      8. Convert xR to integer r1 using NIST SP 800-186 Appendix F.1.
      9. Verify r = r1 mod n. Output “reject” if it fails; output “accept” otherwise.
```
