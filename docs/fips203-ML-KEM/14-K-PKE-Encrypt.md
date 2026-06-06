# Algorithm 14  K-PKE.Encrypt(ekPKE, m, r)

**章节**: §5.2 K-PKE  
**类别**: K-PKE 加密  
**被调用**: Algorithm 17 (ML-KEM.Encaps_internal)

### 规范

```
Input:  encryption key ekPKE ∈ 𝔹^{384k+32}
        message m ∈ 𝔹^{32}
        randomness r ∈ 𝔹^{32}
Output: ciphertext c ∈ 𝔹^{32(d_u·k + d_v)}

 1: N ← 0
 2: t̂ ← ByteDecode₁₂(ekPKE[0 : 384k])       ▷ k times
 3: ρ ← ekPKE[384k : 384k + 32]
 4: for (i ← 0; i < k; i++)
 5:    for (j ← 0; j < k; j++)
 6:       Â[i,j] ← SampleNTT(ρ ‖ j ‖ i)
 7:    end for
 8: end for
 9: for (i ← 0; i < k; i++)
10:    y[i] ← SamplePolyCBD_η₁(PRF_η₁(r, N))
11:    N ← N + 1
12: end for
13: for (i ← 0; i < k; i++)
14:    e₁[i] ← SamplePolyCBD_η₂(PRF_η₂(r, N))
15:    N ← N + 1
16: end for
17: e₂ ← SamplePolyCBD_η₂(PRF_η₂(r, N))
18: ŷ ← NTT(y)                                ▷ k times
19: u ← NTT⁻¹(Âᵀ ∘ ŷ) + e₁                   ▷ k times
20: μ ← Decompress₁(ByteDecode₁(m))
21: v ← NTT⁻¹(t̂ᵀ ∘ ŷ) + e₂ + μ
22: c₁ ← ByteEncode_du(Compress_du(u))        ▷ k times
23: c₂ ← ByteEncode_dv(Compress_dv(v))
24: return c ← (c₁ ‖ c₂)
```

### 备注

CipherCat 的核心实现目标。此为 ML-KEM 封装路径中最复杂的算法，包含矩阵生成、多项式采样、NTT 域乘法、压缩编码等全部核心操作。

**ML-KEM-768**: k=3, η₁=2, η₂=2, d_u=10, d_v=4, q=3329, n=256。

**NTT 域注意**: 步骤 18 ŷ ← NTT(y) 将系数域多项式转换到 NTT 域；步骤 19 和 21 的矩阵-向量乘法 (Âᵀ∘ŷ 和 t̂ᵀ∘ŷ) 在 NTT 域完成（使用 NTTMul），结果再通过 INTT 转换回系数域。

**Nonce 分配**:
| 用途 | Nonce 范围 | 数量 |
|------|-----------|:---:|
| ŷ (步骤 9–12) | 0 .. k-1 | k |
| e₁ (步骤 13–16) | k .. 2k-1 | k |
| e₂ (步骤 17) | 2k | 1 |

ML-KEM-768: ŷ nonces 0,1,2; e₁ nonces 3,4,5; e₂ nonce 6。

### CipherCat

已实现，提供两种搭建方式。

**方式一：高级复合块** (~45 块, 见 `test/ML-KEM-768-Encaps-build-guide.md`):

| 步骤 | 复合块 | Blockly ID |
|:----:|--------|-----------|
| 4–8 | SampleNTTMat(k=3) | `pq_sample_ntt_mat` |
| 9–12 | CBDNTTVec(k=3, η=2) | `pq_cbd_ntt_vec` |
| 13–19 | ATrINTTAddE1(k=3, η=2) | `pq_atr_intt_add_e1` |
| 20 | Decompress(d=1) | `pq_decompress` |
| 21 | TrINTTAddE2Mu(k=3, η=2) | `pq_tr_intt_add_e2_mu` |
| 22–23 | VecCompressEncode(d=10/4) | `pq_vec_compress_encode` |

**方式二：纯基础原语块** (~120 块, 见 `test/ML-KEM-768-Encaps-纯基础块.md`):

每个复合块展开为基础操作：SampleNTT ×9, SamplePolyCBD ×7, NTT ×6, INTT ×4, NTTMul ×12, PolyAdd ×15, SeedWithNonce ×26。

**Nonce 计算**: e₁ 的 nonce 偏移 `k+i`（步骤 14）可通过 Math 分类的 `math_arithmetic` 块（`+` 运算）在循环内计算，无需手动展开。参见纯基础块指南。

**压缩编码**: `pq_compress` (d=10,4) + `pq_byte_encode` (d=10,4) 或等效的 `pq_vec_compress_encode`。
