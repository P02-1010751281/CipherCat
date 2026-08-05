# Algorithm 9  pad10*1(x, m)

**章节**: §5.1
**类别**: 多速率填充规则

### 规范

```
Input:  positive integer x;  non-negative integer m
Output: string P such that m + len(P) is a positive multiple of x

1: Let j = (−m − 2) mod x
2: Return P = 1 ‖ 0^j ‖ 1
```

### 备注

pad10*1 确保输出长度对齐 rate x。
上标 `*` 表示 `0^j` 长度可变 (j≥0)。

通俗理解: 消息后追加 `1`, 再追加 `0` 直到对齐前一组, 最后追加 `1`。

块实现 (标准, 对照 FIPS 202 Table 6):
  q = rate_bytes - (m_len % rate_bytes)
  # q ∈ [1, rate_bytes]；q=1 时两个 pad 位 + suffix 落在同一字节（M‖0x86，SHA-3），
  # 无需扩展——若 q == 1 则 j=(−m−2) mod x = x−1，P = 1‖0^(x−1)‖1 长度 x+1 比特，合法。
  padded = msg + (suffix ^ first_byte) + zeros + (0x80 ^ last_byte)

### 块实现

`sha3_pad` — 支持可配置 suffix (SHA-3: 0x06, SHAKE: 0x1F)
