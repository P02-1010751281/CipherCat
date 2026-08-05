# RFC 5903 (ECDH) — 全算法索引

来源: IETF RFC 5903 — Elliptic Curve Groups modulo a Prime (ECP Groups) for
      IKE and IKEv2
      https://www.rfc-editor.org/rfc/rfc5903.txt      (2010-06)

> CipherCat ECDH 块族（`src/blocks/ecdh/`）覆盖 ECDH 共享密钥计算（P-256）。
> 官方向量：RFC 5903 §8.1（IKE P-256）+ cryptography 确定性派生交叉，JS/Python 双语言。

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
  cryptography 交叉 2 组）。
- SM2 椭圆曲线原语（同 `ecc_*` 块）见 `gbt32918-SM2/`。
