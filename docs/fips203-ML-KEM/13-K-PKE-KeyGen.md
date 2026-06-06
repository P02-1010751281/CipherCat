# Algorithm 13  K-PKE.KeyGen(d)

**章节**: §5.1 K-PKE  
**类别**: K-PKE 密钥生成

### 规范

```
Input:  randomness d ∈ 𝔹^{32}
Output: encryption key ekPKE ∈ 𝔹^{384k+32}
        decryption key dkPKE ∈ 𝔹^{384k}

 1: (ρ, σ) ← G(d ‖ k)                       ▷ 32+1 bytes → two 32-byte seeds
 2: N ← 0
 3: for (i ← 0; i < k; i++)
 4:    for (j ← 0; j < k; j++)
 5:       Â[i,j] ← SampleNTT(ρ ‖ j ‖ i)       ▷ j,i as byte 33,34
 6:    end for
 7: end for
 8: for (i ← 0; i < k; i++)
 9:    s[i] ← SamplePolyCBD_η₁(PRF_η₁(σ, N))
10:    N ← N + 1
11: end for
12: for (i ← 0; i < k; i++)
13:    e[i] ← SamplePolyCBD_η₁(PRF_η₁(σ, N))
14:    N ← N + 1
15: end for
16: ŝ ← NTT(s)                                ▷ k times
17: ê ← NTT(e)                                ▷ k times
18: t̂ ← Â ∘ ŝ + ê                             ▷ NTT-domain noisy system
19: ekPKE ← ByteEncode₁₂(t̂) ‖ ρ
20: dkPKE ← ByteEncode₁₂(ŝ)
21: return (ekPKE, dkPKE)
```

### 备注

CipherCat 未实现 (专注封装路径)。

G = SHA3-512, byte 33 = k 实现参数集域分离。
ρ 用于生成伪随机矩阵 Â, σ 用于生成秘密向量 s 和噪声 e。

