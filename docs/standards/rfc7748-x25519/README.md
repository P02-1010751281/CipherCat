# RFC 7748 — X25519 椭圆曲线 Diffie-Hellman 密钥交换

来源: RFC 7748 — Elliptic Curves for Security
      全文: [本地 rfc7748.txt](./rfc7748.txt)
      在线原文: https://www.rfc-editor.org/rfc/rfc7748.txt

## 关键算法

- **X25519**: Curve25519 上的 ECDH 密钥交换，128-bit 安全级别
- **X448**: Curve448 上的 ECDH 密钥交换，224-bit 安全级别

## 实现状态

已实现 `x25519` 函数并提供 JavaScript/Python 生成器。当前回归以 RFC 7748 §5.2 V1 示例核对两种语言的输出，另检查低阶坐标的全零输出、输入长度/字节范围及输出容器。Demo：[`X25519.json`](../../../demos/procedures/X25519.json)。这不是完整 RFC 测试向量集或第三方算法验证。

积木输入为 32 个 0..255 字节值；RFC 7748 要求对 X25519 的 `u` 坐标清除最高位，并接受非规范编码后按底层素域处理。低阶输入可以产生全零结果，协议可按 RFC 7748 §6.1 检查并中止；本积木只实现 X25519 标量乘法，不提供协议层策略。当前实现的 ladder 含依赖私有标量位的条件分支，并使用 JavaScript `BigInt` / Python 整数运算，不提供常数时间保证，不应保护生产密钥。

X448 未实现。
