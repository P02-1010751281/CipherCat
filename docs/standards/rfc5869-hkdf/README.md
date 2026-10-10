# RFC 5869 — HKDF 密钥派生函数

来源: RFC 5869 — HMAC-based Extract-and-Expand Key Derivation Function
      https://www.rfc-editor.org/rfc/rfc5869.txt
      全文: [rfc5869.txt](./rfc5869.txt)

## 相关块

| 块 | 说明 |
|----|------|
| `hkdf` | HKDF 密钥派生 |

## 输出长度与验证范围

RFC 5869 §2.3 将 HKDF-Expand 输出长度限制为 `L ≤ 255 × HashLen`。当前块固定使用 HMAC-SHA-256，因此接受 `0..8160` 字节；负数、非整数及超限值会在 JavaScript/Python 两种生成代码中拒绝。零长度输出按 `L=0` 返回空字节串。

回归以 RFC 5869 附录 A.1 向量核对派生结果，并检查零长度、最大输出长度和运行时容器类型。该回归不是完整 RFC 测试集或正式算法验证。
