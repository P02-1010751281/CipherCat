# Algorithm 18  ML-KEM.Decaps_internal(dk, c)

**章节**: §6.3 ML-KEM 内部  
**类别**: ML-KEM 内部解封装

### 规范

```
Input:  decapsulation key dk ∈ 𝔹^{768k+96}
        ciphertext c ∈ 𝔹^{32(d_u·k + d_v)}
Output: shared secret key K ∈ 𝔹^{32}

 1: dkPKE ← dk[0 : 384k]
 2: ekPKE ← dk[384k : 768k + 32]
 3: h ← dk[768k + 32 : 768k + 64]
 4: z ← dk[768k + 64 : 768k + 96]
 5: m′ ← K-PKE.Decrypt(dkPKE, c)
 6: (K′, r′) ← G(m′ ‖ h)
 7: K̄ ← J(z ‖ c)
 8: c′ ← K-PKE.Encrypt(ekPKE, m′, r′)
 9: if c ≠ c′ then
10:    K′ ← K̄                                ▷ implicit rejection
11: end if
12: return K′
```

### 备注

CipherCat 未实现。

J = SHAKE256 (XOF)。隐式拒绝标志为秘密数据，函数结束前必须销毁。

