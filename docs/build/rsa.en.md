# RSA

RSA is provided as interface blocks: one each for key generation, encryption/decryption, and sign/verify, using a teaching PKCS#1 v1.5 flow.

## Workspaces on this page

| Workspace | File |
|---|---|
| `RSA-Encrypt` | `demos/procedures/RSA-Encrypt.json` |
| `RSA-Sign` | `demos/procedures/RSA-Sign.json` |

### RSA-Encrypt

- Evidence class: project fixed regression (not an official vector)
- Parameter scope: 项目教学参数：512-bit 模数（密文 64B）；`rsa_keygen` 为项目自定义，不满足 FIPS 186-5 密钥生成要求，也不代表可用密钥长度（source text in Chinese）
- Basis: PKCS#1 v1.5 教学实现的加解密往返与长度固定回归（明文恢复 'hello RSA'）；仓库内无第三方实现交叉复算（source text in Chinese）
- Check: `print(len(RSA_Keygen()))`
- Expected result: `196 64 68656c6c6f20525341 64 True`

#### Assembly steps

**Return value of `RSA_Keygen()`**

- `rsa_keygen`: BITS=512

**Algorithm blocks used by this function**: `rsa_keygen`

**Return value of `RSA_Encrypt()`**

- `rsa_encrypt` (Teaching implementation of the RFC 8017 RSAES-PKCS1-v1_5 scheme: `m^e m…)
  - `KEY` ←
    - constant `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - constant `'hello RSA'`

**Algorithm blocks used by this function**: `rsa_encrypt`

**Return value of `RSA_Decrypt()`**

- `rsa_decrypt` (Teaching implementation of the RFC 8017 RSAES-PKCS1-v1_5 scheme: `m^d m…)
  - `KEY` ←
    - constant `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `CT` ←
    - constant `[0xcb,0x80,0xb0,0xc0,0x43,0x08,0x62,0xa7,0xfe,0x72,0xb6,0x4…`

**Algorithm blocks used by this function**: `rsa_decrypt`

### RSA-Sign

- Evidence class: project fixed regression (not an official vector)
- Parameter scope: 项目教学参数：512-bit 模数（签名 64B）+ SHA-256（source text in Chinese）
- Basis: PKCS#1 v1.5 SHA-256 教学实现的签名固定回归与验签正/负例（True/False）；仓库内无第三方实现交叉复算（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in RSA_Sign()))`
- Expected result: `02a5513b95f6b020d67eb552f62660401d77066d7b167fec0d0504b938374394fe7e1005bd3a4e99a6b94e187…`

#### Assembly steps

**Return value of `RSA_Sign()`**

- `rsa_sign` (Teaching implementation of the RFC 8017 RSASSA-PKCS1-v1_5 scheme: SHA-2…)
  - `KEY` ←
    - constant `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - constant `'RSA signing demo'`

**Algorithm blocks used by this function**: `rsa_sign`

**Return value of `RSA_Verify()`**

- `rsa_verify` (Teaching implementation of the RFC 8017 RSASSA-PKCS1-v1_5 verification …)
  - `KEY` ←
    - constant `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - constant `'RSA signing demo'`
  - `SIG` ←
    - constant `[0x02,0xa5,0x51,0x3b,0x95,0xf6,0xb0,0x20,0xd6,0x7e,0xb5,0x5…`

**Algorithm blocks used by this function**: `rsa_verify`

**Return value of `RSA_VerifyBad()`**

- `rsa_verify` (Teaching implementation of the RFC 8017 RSASSA-PKCS1-v1_5 verification …)
  - `KEY` ←
    - constant `[0xea,0xea,0x0b,0x61,0xbf,0x14,0x0b,0xa5,0x04,0xee,0xb1,0x0…`
  - `MSG` ←
    - constant `'tampered message'`
  - `SIG` ←
    - constant `[0x02,0xa5,0x51,0x3b,0x95,0xf6,0xb0,0x20,0xd6,0x7e,0xb5,0x5…`

**Algorithm blocks used by this function**: `rsa_verify`

