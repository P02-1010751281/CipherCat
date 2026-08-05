# RFC 7748 — X25519 椭圆曲线 Diffie-Hellman 密钥交换

来源: RFC 7748 — Elliptic Curves for Security
      全文: [rfc7748.txt](./rfc7748.txt)

## 关键算法

- **X25519**: Curve25519 上的 ECDH 密钥交换，128-bit 安全级别
- **X448**: Curve448 上的 ECDH 密钥交换，224-bit 安全级别

## 实现状态

✅ 已实现：`x25519`（RFC 7748 §5.2 V1/V2 官方向量 + cryptography 交叉，双语言）。Demo：`demos/procedures/X25519.json`。

X448 未实现。
