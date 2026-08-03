# RFC 8032 — EdDSA 数字签名算法

来源: RFC 8032 — Edwards-Curve Digital Signature Algorithm (EdDSA)
      全文: [rfc8032.txt](./rfc8032.txt)

## 关键算法

- **Ed25519**: Curve25519 上的 EdDSA 签名，128-bit 安全级别
- **Ed448**: Curve448 上的 EdDSA 签名，224-bit 安全级别
- 使用 SHA-512 哈希 (Ed25519) 或 SHAKE256 (Ed448)

## 实现状态

未实现。EdDSA 是现代高性能数字签名标准，广泛用于 SSH、TLS 和加密货币。
