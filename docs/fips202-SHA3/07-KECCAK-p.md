# Algorithm 7  KECCAK-p[b, nr](S)

**章节**: §3.3  
**类别**: KECCAK-p 置换

### 规范

```
Input:  string S of length b;  number of rounds nr
Output: string S′ of length b

1: Convert S into a state array A (§3.1.2)
2: For ir from 12+2l−nr to 12+2l−1:
       A ← Rnd(A, ir)
   where Rnd(A, ir) = ι(χ(π(ρ(θ(A)))), ir)
3: Convert A into string S′ (§3.1.3)
4: Return S′
```

### 备注

5 步映射复合: θ → ρ → π → χ → ι, 共 nr 轮。
KECCAK-f[1600] = KECCAK-p[1600, 24] (nr=24, l=6)。

### CipherCat

`keccak_f1600` — KECCAK-p[1600, 24] 即 KECCAK-f[1600]

`hash_sha3_keccak_f` 块支持 b ∈ {200, 400, 800, 1600}
