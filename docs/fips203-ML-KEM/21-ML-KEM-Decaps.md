# Algorithm 21  ML-KEM.Decaps(dk, c)

**章节**: §7.3 ML-KEM 公开接口  
**类别**: ML-KEM 解封装

### 规范

```
Checked input: decapsulation key dk ∈ 𝔹^{768k+96}
               ciphertext c ∈ 𝔹^{32(d_u·k + d_v)}
Output: shared secret key K ∈ 𝔹^{32}

 1: K ← ML-KEM.Decaps_internal(dk, c)
 2: return K

Decapsulation key check (§7.3):
  1. Structure: dk length = 768k+96
  2. Hash check: H(dk[384k:768k+32]) == dk[768k+32:768k+64]
  3. Modulus check on ekPKE portion
```

### 备注

CipherCat 未实现。

