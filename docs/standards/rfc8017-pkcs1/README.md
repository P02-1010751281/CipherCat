# RFC 8017 (PKCS#1 v2.2) — 全算法索引

来源: IETF RFC 8017 — PKCS #1: RSA Cryptography Specifications Version 2.2
      https://www.rfc-editor.org/rfc/rfc8017.txt      (2016-11，取代 RFC 3447/2437/2313)

> CipherCat RSA 块族（`src/blocks/rsa/`）覆盖 RSA 密钥生成、PKCS#1 v1.5 加解密与
> 签名验签。密钥生成为 FIPS 186-4 风格（Miller-Rabin + 小素数筛，e = 65537）。
> 官方向量：PKCS#1 v1.5 + cryptography 双向交叉（JS/Python 双语言）。

## 算法清单

| 序号 | 文件 | 名称 | 类别 | 块实现 |
|:--:|------|------|------|:--:|
| — | `01-RSA.md` | RSA 密钥生成 + PKCS#1 v1.5 加解密/签名 | 公钥密码 | ✅ |

### 块实现明细

| 部件 | 类别 | 块 |
|------|------|----|
| 密钥生成（bits → n‖e‖d‖p‖q 定长大端） | 密钥 | `rsa_keygen` |
| PKCS#1 v1.5 加密（EM = 0x00‖0x02‖PS‖0x00‖M） | 加密 | `rsa_encrypt` |
| PKCS#1 v1.5 解密 | 解密 | `rsa_decrypt` |
| PKCS#1 v1.5 SHA-256 签名 | 签名 | `rsa_sign` |
| 验签 | 验签 | `rsa_verify` |

## 相关

- PKCS#1 v1.5 填充的对称件 `pad_pkcs7` 见 `rfc2315-pkcs7/`（PKCS#7 填充语义）。
- Demo：`demos/procedures/RSA-Encrypt.json`（加解密往返 + cryptography 交叉）、
  `RSA-Sign.json`（SHA-256 签名交叉）。
