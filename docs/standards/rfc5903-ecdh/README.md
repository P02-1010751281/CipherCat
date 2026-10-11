# RFC 5903 (ECDH) — 全算法索引

来源: IETF RFC 5903 — Elliptic Curve Groups modulo a Prime (ECP Groups) for
      IKE and IKEv2
      https://www.rfc-editor.org/rfc/rfc5903.txt      (2010-06)

> CipherCat ECDH 块族（`src/blocks/ecdh/`）覆盖 ECDH 共享密钥计算（P-256）。
> 官方向量：RFC 5903 §8.1（IKE P-256）两方向，JS/Python 双语言回归，并由独立实现复算。

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | `01-ECDH.md` | ECDH 共享密钥（P-256） | 密钥协商 | ✅ |

### 块实现明细

| 部件 | 类别 | 块 |
|------|------|----|
| ECDH 共享密钥 S = [d]Q 的 x 坐标（32B hex） | 密钥协商 | `ecdh_shared_secret` |
| 曲线原语（复用 SM2 曲线族） | 基础 | `ecc_load_curve_params` · `ecc_load_point` · `ecc_add` · `ecc_point_double` · `ecc_multiply` |

## 相关

- Demo：`demos/procedures/ECDH.json`（RFC 5903 §8.1 IKE P-256 官方向量 +
  独立实现复算 2 组）。
- SM2 椭圆曲线原语（同 `ecc_*` 块）见 `gbt32918-SM2/`。

<!-- standard-body:start -->

## 标准内容

本目录对应 **RFC 5903 (ECDH) — 全算法索引**，按标准条款拆分为 1 个结构化条目，覆盖 「RFC 5903 §3.1、§8.1」。每个条目页给出标准定位、原文出处、公式或伪代码，以及对应积木块与验证边界。

| 结构化条目 | 内容 | 项目状态 |
|---|---|---|
| [RFC 5903 §3.1、§8.1](./01-ECDH.md) | RFC 5903 §3.1、§8.1 | 已实现（RFC 5903 §8.1 官方向量 + 独立实现复算） |

## 实现与验证映射

| 积木块 | 规范语义范围 | 已登记验证入口 | 边界（本行不能证明什么） |
|---|---|---|---|
| `ecdh_shared_secret`（+ ecc_* 曲线原语） | RFC 5903 §8.1 P-256 ECDH（i→r 与 r→i 两方向） | `procedures/ECDH.json` 双语言回归两个方向；`demo-vector-crosscheck.test.ts` 用 `cryptography` 的 P-256 ECDH 独立复算一致 | 只覆盖该附录向量；不覆盖其它曲线、协议层全零共享密钥检查或侧信道 |

示例工作区：`demos/procedures/ECDH.json`。

以上是当前实现与回归范围，不代表已通过认证或完成完整标准测试；逐块证据与缺项见[标准符合性对象清单](../CONFORMANCE-INVENTORY.md)。

<!-- standard-body:end -->
