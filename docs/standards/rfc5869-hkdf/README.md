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

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 5869 — HKDF 密钥派生函数**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `hkdf` | RFC 5869 §2；项目实现 HMAC-SHA-256，`L` 为字节数，范围 `0..255×32 = 8160` | `kdf-parameter-contract.test.ts` 通过真实 Blockly 双语言执行 RFC 5869 附录 A.1 向量，核对零长度、255 块上限、整数值浮点输入、负/普通分数/布尔/超界长度双语言拒绝及 JS `Uint8Array` / Python `bytes` 类型；另有 Python-only `fractions.Fraction` 长度拒绝测试 | 仅 HMAC-SHA-256 示例与参数边界；不覆盖完整 RFC 向量、其他 Hash 实例或正式算法验证 |

示例工作区：`demos/procedures/HKDF-SHA256.json`、`demos/procedures/HKDF.json`；Procedure 模板：`proc_hkdf（空循环占位，不含 Extract/Expand）`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
