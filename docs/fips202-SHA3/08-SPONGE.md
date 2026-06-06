# Algorithm 8  SPONGE[f, pad, r](N, d)

**章节**: §4  
**类别**: 海绵构造

### 规范

```
Input:  string N;  nonnegative integer d
Output: string Z with len(Z) = d

 1: Let P = N ‖ pad(r, len(N))
 2: Let n = len(P)/r
 3: Let c = b−r
 4: Let P₀,…,P_{n−1} be r-bit blocks of P
 5: Let S = 0^b  (b-bit zero string)
 6: For i from 0 to n−1:
        S ← f(S ⊕ (Pᵢ ‖ 0^c))
 7: Let Z be the empty string
 8: Let Z = Z ‖ Trunc_r(S)
 9: If d ≤ |Z|, return Trunc_d(Z); else continue
10: Let S = f(S), continue with Step 8
```

### 备注

吸收 (absorb): 将每 r-bit 块异或到状态前 r 位后置换。
挤出 (squeeze): 从状态前 r 位读取输出，不足时再置换。

CipherCat 的 absorb 和 squeeze 块使用 bytes 而非 bits (rate_bytes = r/8)。

### CipherCat

`hash_sha3_absorb` + `hash_sha3_squeeze`
