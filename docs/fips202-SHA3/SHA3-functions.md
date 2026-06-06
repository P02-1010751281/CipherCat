# SHA-3 Hash Functions (§6.1)

给定消息 M, 四个 SHA-3 哈希函数通过追加 2-bit 后缀并指定输出长度定义:

```
SHA3-224(M) = KECCAK[448] (M ‖ 01, 224)
SHA3-256(M) = KECCAK[512] (M ‖ 01, 256)
SHA3-384(M) = KECCAK[768] (M ‖ 01, 384)
SHA3-512(M) = KECCAK[1024](M ‖ 01, 512)
```

其中 `KECCAK[c] = SPONGE[KECCAK-p[1600,24], pad10*1, 1600−c]`。

容量 c = 2d (digest 长度的两倍), 后缀 `01` 用于域分离 (区别于 SHAKE 的 `1111`)。

### 参数

| Function | r (bits) | c (bits) | Rate Bytes | Digest |
|----------|:--------:|:--------:|:----------:|:------:|
| SHA3-224 | 1152     | 448      | 144        | 28     |
| SHA3-256 | 1088     | 512      | 136        | 32     |
| SHA3-384 | 832      | 768      | 104        | 48     |
| SHA3-512 | 576      | 1024     | 72         | 64     |

### CipherCat

`hash_sha3_pad` + `hash_sha3_absorb` + `hash_sha3_squeeze`

下拉框预设 rate 1088 (SHA3-256) 和 576 (SHA3-512)。Suffix = `0x06` 对应 SHA-3 域分离后缀 `01` 的比特模式 (pad10*1 中后缀比特在首字节低位, LSB 编码)。
