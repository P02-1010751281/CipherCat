# RFC 6979 — 确定性数字签名（DSA/ECDSA）

来源: RFC 6979 — Deterministic Usage of the DSA and ECDSA
      https://www.rfc-editor.org/rfc/rfc6979.txt
      全文: [rfc6979.txt](./rfc6979.txt)

## 相关块

| 块 | 说明 |
|----|------|
| `ecdsa_sign` / `ecdsa_verify` | 项目固定 P-256/SHA-256，签名按 RFC 6979 §3.2 的 HMAC_DRBG 派生确定性 `k` |

## 向量与验证范围

项目使用 RFC 6979 §A.2.5 的 P-256/SHA-256 “sample”/“test” 用例作为 `ecdsa_sign` 的期望值来源：
签名 `k` 由 RFC 6979 §3.2 的确定性流程派生（HMAC-SHA-256），`r`/`s` 与该附录一致。
回归覆盖非法私钥、签名长度/标量与公钥点的拒绝路径；`demos/procedures/ECDSA.json` 由 JS/Python 双语言驱动执行该向量。

边界：只覆盖 P-256 + SHA-256 与附录 A.2.5 的用例，不是 FIPS 186-5 或 RFC 6979 的完整测试集；
不提供常数时间、密钥管理、证书/身份绑定或认证结论。该 RFC 附录与 FIPS 186-5 对确定性签名的定位不同，
项目按 RFC 6979 声明这一路径，不据此声称通过 CAVP/ACVP。

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 6979 — 确定性数字签名（DSA/ECDSA）**，目前以标准来源与积木块映射为主，尚未拆出独立的条款条目页；具体覆盖范围见下方映射与覆盖矩阵。

## 实现与验证映射

本目录当前没有直接映射的积木块：它作为标准依据或索引存在，实现映射见覆盖矩阵。

示例工作区：`demos/procedures/ECDSA.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
