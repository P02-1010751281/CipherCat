# SHA-3 XOFs (§6.2–6.3)

## SHAKE128 / SHAKE256

给定消息 M 和输出长度 d, 两个 SHA-3 可扩展输出函数通过追加 4-bit 后缀定义:

```
SHAKE128(M, d) = KECCAK[256](M ‖ 1111, d)
SHAKE256(M, d) = KECCAK[512](M ‖ 1111, d)
```

### 参数

| Function  | r (bits) | c (bits) | Rate Bytes |
|-----------|:--------:|:--------:|:----------:|
| SHAKE128  | 1344     | 256      | 168        |
| SHAKE256  | 1088     | 512      | 136        |

### 域分离

后缀 `1111` (bits) 区别于 SHA-3 的 `01`。在 pad10*1 编码中表现为 suffix `0x1F`。

### 在 ML-KEM (FIPS 203) 中的用途

| 用途 | XOF/PRF | 说明 |
|------|---------|------|
| SampleNTT (`pq_sample_ntt`) | SHAKE128 | 拒绝采样生成 NTT 域多项式 (rate=168) |
| SamplePolyCBD (`pq_sample_poly_cbd`) | SHAKE256 (PRF) | CBD 噪声采样, 读 64·η 字节 (rate=136) |

### RawSHAKE (备选定义, §6.3)

```
RawSHAKE128(J, d) = KECCAK[256](J ‖ 11, d)
RawSHAKE256(J, d) = KECCAK[512](J ‖ 11, d)
SHAKE128(M, d) = RawSHAKE128(M ‖ 11, d)
SHAKE256(M, d) = RawSHAKE256(M ‖ 11, d)
```

即 `SHAKE(M) = RawSHAKE(M ‖ 11)`，追加了额外的域分离后缀扩展。

### CipherCat

- `pq_xof` — XOF(seed, outLen) 默认 SHAKE128, 可选 SHAKE256
- `pq_prf` — PRF(seed, nonce, outLen) 默认 SHAKE256, 可选 SHAKE128
