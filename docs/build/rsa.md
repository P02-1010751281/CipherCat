# RSA：分步拼装

RSA 目前以接口块提供：密钥生成、加解密和签名验签各一个块，块内是教学用 PKCS#1 v1.5 流程。

## 本页覆盖的工作区

| | |
|---|---|
| `RSA-Encrypt` | `demos/procedures/RSA-Encrypt.json` |
| `RSA-Sign` | `demos/procedures/RSA-Sign.json` |

### `RSA-Encrypt`

- 证据类别：项目固定回归（非官方向量）
- 参数范围：项目教学参数：512-bit 模数（密文 64B）；`rsa_keygen` 为项目自定义，不满足 FIPS 186-5 密钥生成要求，也不代表可用密钥长度
- 依据：PKCS#1 v1.5 教学实现的加解密往返与长度固定回归（明文恢复 'hello RSA'）；仓库内无第三方实现交叉复算
- 核对入口：`print(len(RSA_Keygen()))`
- 期望结果：`196 64 68656c6c6f20525341 64 True`

#### 拼装步骤

**函数 `RSA_Keygen()` 的返回值**

- `rsa_keygen`：BITS=512

**该函数用到的算法块**：`rsa_keygen`

**函数 `RSA_Encrypt()` 的返回值**

- `rsa_encrypt`（教学实现，参照 RFC 8017 RSAES-PKCS1-v1_5：`m^e mod n`（随机非零 PS 填充））
  - `KEY` ←
    - 常量 `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - 常量 `'hello RSA'`

**该函数用到的算法块**：`rsa_encrypt`

**函数 `RSA_Decrypt()` 的返回值**

- `rsa_decrypt`（教学实现，参照 RFC 8017 RSAES-PKCS1-v1_5：`m^d mod n` 去填充）
  - `KEY` ←
    - 常量 `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `CT` ←
    - 常量 `[0xcb,0x80,0xb0,0xc0,0x43,0x08,0x62,0xa7,0xfe,0x72,0xb6,0x4…`

**该函数用到的算法块**：`rsa_decrypt`

### `RSA-Sign`

- 证据类别：项目固定回归（非官方向量）
- 参数范围：项目教学参数：512-bit 模数（签名 64B）+ SHA-256
- 依据：PKCS#1 v1.5 SHA-256 教学实现的签名固定回归与验签正/负例（True/False）；仓库内无第三方实现交叉复算
- 核对入口：`print(''.join(f'{x:02x}' for x in RSA_Sign()))`
- 期望结果：`02a5513b95f6b020d67eb552f62660401d77066d7b167fec0d0504b938374394fe7e1005bd3a4e99a6b94e187…`

#### 拼装步骤

**函数 `RSA_Sign()` 的返回值**

- `rsa_sign`（教学实现，参照 RFC 8017 RSASSA-PKCS1-v1_5：SHA-256 + DigestInfo 编码，`m^d mod n`）
  - `KEY` ←
    - 常量 `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - 常量 `'RSA signing demo'`

**该函数用到的算法块**：`rsa_sign`

**函数 `RSA_Verify()` 的返回值**

- `rsa_verify`（教学实现，参照 RFC 8017 RSASSA-PKCS1-v1_5 验签）
  - `KEY` ←
    - 常量 `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - 常量 `'RSA signing demo'`
  - `SIG` ←
    - 常量 `[0x02,0xa5,0x51,0x3b,0x95,0xf6,0xb0,0x20,0xd6,0x7e,0xb5,0x5…`

**该函数用到的算法块**：`rsa_verify`

**函数 `RSA_VerifyBad()` 的返回值**

- `rsa_verify`（教学实现，参照 RFC 8017 RSASSA-PKCS1-v1_5 验签）
  - `KEY` ←
    - 常量 `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - 常量 `'tampered message'`
  - `SIG` ←
    - 常量 `[0x02,0xa5,0x51,0x3b,0x95,0xf6,0xb0,0x20,0xd6,0x7e,0xb5,0x5…`

**该函数用到的算法块**：`rsa_verify`

