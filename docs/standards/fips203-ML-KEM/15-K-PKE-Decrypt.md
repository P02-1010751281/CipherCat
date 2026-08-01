# Algorithm 15  K-PKE.Decrypt(dkPKE, c)

**章节**: §5.3 K-PKE  
**类别**: K-PKE 解密

### 规范

```
Input:  decryption key dkPKE ∈ 𝔹^{384k}
        ciphertext c ∈ 𝔹^{32(d_u·k + d_v)}
Output: message m ∈ 𝔹^{32}

 1: c₁ ← c[0 : 32·d_u·k]
 2: c₂ ← c[32·d_u·k : 32(d_u·k + d_v)]
 3: u ← Decompress_du(ByteDecode_du(c₁))      ▷ k times
 4: v ← Decompress_dv(ByteDecode_dv(c₂))
 5: ŝ ← ByteDecode₁₂(dkPKE)                   ▷ k times
 6: w ← v − NTT⁻¹(ŝᵀ ∘ NTT(u)) mod q
 7: m ← ByteEncode₁(Compress₁(w))
 8: return m
```

### 备注

CipherCat 未实现 (专注封装路径)。

利用秘密 ŝ 从 u 中消除 Âᵀ∘ŷ 分量，恢复 w ≈ μ。

