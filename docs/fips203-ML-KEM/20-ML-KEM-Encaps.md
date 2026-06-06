# Algorithm 20  ML-KEM.Encaps(ek)

**章节**: §7.2 ML-KEM 公开接口  
**类别**: ML-KEM 封装  
**优先级**: 最高——用户直接调用的封装入口

### 规范

```
Checked input: encapsulation key ek ∈ 𝔹^{384k+32}
Output: shared secret key K ∈ 𝔹^{32}
        ciphertext c ∈ 𝔹^{32(d_u·k + d_v)}

 1: m ←$ 𝔹^{32}                              ▷ 32 random bytes
 2: if m == NULL then
 3:    return ⊥
 4: end if
 5: (K, c) ← ML-KEM.Encaps_internal(ek, m)
 6: return (K, c)

Encapsulation key check (§7.2):
  1. Type check: ek length = 384k+32
  2. Modulus check:
       test ← ByteEncode₁₂(ByteDecode₁₂(ek[0:384k]))
       Verify: test == ek[0:384k]
```

### 备注

Algorithm 20 在 Algorithm 17 外增加随机数生成 (§3.3 RBG 要求) 和输入检查。

封装密钥检查确保 ek 中的系数在合法范围 [0, q−1] 内。

**ML-KEM-768 参数**: k=3, |ek|=1184, |c|=1088, d_u=10, d_v=4。

**调用链**: Alg 20 → Alg 17 (Encaps_internal) → Alg 14 (K-PKE.Encrypt)。
Alg 14 内部调用 Alg 7 (SampleNTT)、Alg 8 (SamplePolyCBD)、Alg 9 (NTT)、Alg 10 (INTT)、Alg 11 (MultiplyNTTs)、Compress/Decompress (§4.2.1)、ByteEncode/ByteDecode (Alg 5/6)。

### CipherCat

已实现。完整搭建路径见 `test/ML-KEM-768-Encaps-build-guide.md`。

**两种搭建方式**:

| 方式 | 块数 | 耗时 | 适用 | 详见 |
|------|:---:|------|------|------|
| 高级复合块 | ~45 | ~10 min | 快速原型 | `ML-KEM-768-Encaps-build-guide.md` |
| 纯基础原语块 | ~120 | ~45 min | 教学验证 | `ML-KEM-768-Encaps-纯基础块.md` |

**涉及块清单** (高级方式):
- 哈希: Keccak Init, SHA-3 Pad, Absorb, Squeeze
- 后量子基础: BytesConcat, BytesSlice, ByteDecode(d=12), Decompress(d=1)
- 后量子高级: SampleNTTMat, CBDNTTVec, ATrINTTAddE1, TrINTTAddE2Mu, BuildVec₃, VecCompressEncode
- 数论: NTT(q=3329)

**Nonce 计算**: `SeedWithNonce(r_seed, k+i)` 可通过 Math 分类的 `math_arithmetic` 块（`+` 运算）在循环内表达。参见纯基础块指南。

**加密密钥检查**: CipherCat 当前实现基于 Alg 17，密钥检查为可选增强。
