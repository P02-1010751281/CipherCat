# Algorithm 17  ML-KEM.Encaps_internal(ek, m)

**章节**: §6.2 ML-KEM 内部  
**类别**: ML-KEM 内部封装  
**被调用**: Algorithm 20 (ML-KEM.Encaps)

### 规范

```
Input:  encapsulation key ek ∈ 𝔹^{384k+32}
        randomness m ∈ 𝔹^{32}
Output: shared secret key K ∈ 𝔹^{32}
        ciphertext c ∈ 𝔹^{32(d_u·k + d_v)}

 1: (K, r) ← G(m ‖ H(ek))
 2: c ← K-PKE.Encrypt(ek, m, r)
 3: return (K, c)
```

### 备注

H = SHA3-256 (FIPS 202, rate=1088, c=512, suffix=0x06)。
G = SHA3-512 (FIPS 202, rate=576, c=1024, suffix=0x06)。

G 输出 64 字节: K̂ = bytes[0:32], r = bytes[32:64]。

ML-KEM-768: |ek|=1184, |m|=32, |K|=32, |c|=1088。

### CipherCat

已通过 Blockly 工作区完整实现 (test/ML-KEM-768-Encaps.json)。

**Blockly 关键块映射**:
| 规范操作 | Blockly 块 | 块ID |
|----------|-----------|------|
| H(ek) | Squeeze(Absorb(Keccak Init, SHA-3 Pad(ek, 1088, 0x06), 1088), 32, 1088) | `hash_sha3_squeeze` + 嵌套 |
| G(m‖h) | Squeeze(Absorb(Keccak Init, SHA-3 Pad(BytesConcat(m,h), 576, 0x06), 576), 64, 576) | 同上 + `pq_byte_concat` |
| K̂ = [0:32] | BytesSlice(output, 0, 32) | `pq_bytes_slice` |
| r = [32:64] | BytesSlice(output, 32, 64) | `pq_bytes_slice` |
| K-PKE.Encrypt | (见 Algorithm 14 CipherCat 实现) | |

**哈希链嵌套层级**:
- SHA3-256: 4 层 (Squeeze → Absorb → Init + SHA-3 Pad)
- SHA3-512: 5 层 (Squeeze → Absorb → Init + SHA-3 Pad + BytesConcat)

**注意**: Blockly 不支持值复用，因此 SHA3-512 的 Squeeze 链需独立构建两次（K̂ 和 r 各一份）。生成的 Python/JS 代码会包含两次完整的哈希计算，非最优但功能正确。
