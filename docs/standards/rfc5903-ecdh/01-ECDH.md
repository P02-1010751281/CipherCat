# ECDH 共享密钥（RFC 5903 §8.1）

## 协议

双方各自持私钥 d 与对方公钥 Q，计算共享点 `S = [d]Q`；共享密钥取 S 的 x 坐标
（大端，32 字节）。安全性基于 ECDLP：已知 (G, [d]G) 无法恢复 d。

RFC 5903 §8.1 定义 IKE 使用的 P-256 曲线（SEC2 标准）参数：

```
p    = FFFFFFFF 00000001 00000000 00000000 00000000 FFFFFFFF FFFFFFFF FFFFFFFF
a    = FFFFFFFF 00000001 00000000 00000000 00000000 FFFFFFFF FFFFFFFF FFFFFFFC
b    = 5AC635D8 AA3A93E7 B3EBBD55 769886BC 651D06B0 CC53B0F6 3BCE3C3E 27D2604B
Gx   = 6B17D1F2 E12C4247 F8BCE6E5 63A440F2 77037D81 2DEB33A0 F4A13945 D898C296
Gy   = 4FE342E2 FE1A7F9B 8EE7EB4A 7C0F9E16 2BCE3357 6B315ECE CBB64068 37BF51F5
n    = FFFFFFFF 00000000 FFFFFFFF FFFFFFFF BCE6FAAD A7179E84 F3B9CAC2 FC632551
h    = 1
```

## CipherCat 块实现

`ecdh_shared_secret(d, qx, qy)` → 共享点 S = [d]Q 的 x 坐标 32 字节大端 hex：

- d：私钥 hex（32B，自动模 n 截断，结果须在 [1, n−1]）
- (qx, qy)：对方公钥坐标 hex（32B，须在曲线上）
- 官方向量：RFC 5903 §8.1（IKE P-256）两方向 + cryptography 确定性派生 2 组

曲线原语块（`ecc_load_curve_params` / `ecc_load_point` / `ecc_add` /
`ecc_point_double` / `ecc_multiply`）与 SM2 族共享（见 `gbt32918-SM2/`）。
