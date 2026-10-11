# Key derivation and password processing

HKDF, PBKDF2, and Argon2 are currently interface blocks; this page explains each block’s inputs and how it is assembled.

## Workspaces on this page

| Workspace | File |
|---|---|
| `HKDF-SHA256` | `demos/procedures/HKDF-SHA256.json` |
| `PBKDF2` | `demos/procedures/PBKDF2.json` |
| `PBKDF2-SHA256` | `demos/procedures/PBKDF2-SHA256.json` |
| `PBKDF2-SM3` | `demos/procedures/PBKDF2-SM3.json` |
| `ARGON2` | `demos/procedures/ARGON2.json` |

### HKDF-SHA256

- Evidence class: standards or official cases
- Parameter scope: HMAC-SHA-256，L=42 bytes
- Basis: RFC 5869 A.1 Test Case 1
- Check: `print(''.join(f'{x:02x}' for x in HKDF_Sha256()))`
- Expected result: `3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865 8da4…`

#### Assembly steps

**Return value of `HKDF_Sha256()`**

- `hkdf`
  - `SALT` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `IKM` ←
    - constant `[0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0…`
  - `INFO` ←
    - constant `[0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9]`
  - `LEN` ←
    - constant `42`

**Algorithm blocks used by this function**: `hkdf`

### PBKDF2

- Evidence class: cross-checked with an independent implementation
- Parameter scope: PBKDF2-HMAC-SHA-256，dkLen=32
- Basis: 期望值经 Python hashlib.pbkdf2_hmac 独立复算一致；非标准附录值（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in PBKDF2()))`
- Expected result: `ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43`

#### Assembly steps

**Return value of `PBKDF2()`**

- `pbkdf2`: HASH=sha256
  - `PASSWORD` ←
    - constant `[0x70,0x61,0x73,0x73,0x77,0x6f,0x72,0x64]`
  - `SALT` ←
    - constant `[0x73,0x61,0x6c,0x74]`
  - `ITER` ←
    - constant `2`
  - `KEYLEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `pbkdf2`

### PBKDF2-SHA256

- Evidence class: cross-checked with an independent implementation
- Parameter scope: PBKDF2-HMAC-SHA-256，dkLen=32
- Basis: 期望值取自 RFC 7914 §11 的 PBKDF2-HMAC-SHA-256 向量（含 password/salt/c/dkLen 与 33 字节尾块截断），并由 Python hashlib.pbkdf2_hmac 现场复算一致；RFC 7914 未作为标准目录随仓库跟踪，故按独立复算登记。RFC 6070 只…（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in PBKDF2_Sha256()))`
- Expected result: `ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43 120fb6cffcf8b32c43e72252…`

#### Assembly steps

**Return value of `PBKDF2_Sha256()`**

- `pbkdf2`: HASH=sha256
  - `PASSWORD` ←
    - constant `[0x70,0x61,0x73,0x73,0x77,0x6f,0x72,0x64]`
  - `SALT` ←
    - constant `[0x73,0x61,0x6c,0x74]`
  - `ITER` ←
    - constant `2`
  - `KEYLEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `pbkdf2`

### PBKDF2-SM3

- Evidence class: project fixed regression (not an official vector)
- Basis: SM3-HMAC/PBKDF2 组合为项目实现固定回归；未见公开官方向量登记（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in PBKDF2_Sm3()))`
- Expected result: `fee723a2bc966e11dffb66133f4e8df577383c78ade30e3298edbd3e54ed85b7`

#### Assembly steps

**Return value of `PBKDF2_Sm3()`**

- `pbkdf2`: HASH=sm3
  - `PASSWORD` ←
    - constant `[0x70,0x61,0x73,0x73,0x77,0x6f,0x72,0x64]`
  - `SALT` ←
    - constant `[0x73,0x61,0x6c,0x74]`
  - `ITER` ←
    - constant `2`
  - `KEYLEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `pbkdf2`

### ARGON2

- Evidence class: standards or official cases
- Parameter scope: Argon2d / Argon2i / Argon2id v1.3（RFC §5.1–5.3）
- Basis: RFC 9106 §5.1–5.3 三组向量（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in Argon2_Hash()))`
- Expected result: `0d640df58d78766c08c037a34a8b53c9d01ef0452d75b65eb52520e96b01e659 512b391b6f1162975371d309…`

#### Assembly steps

**Return value of `Argon2_Hash()`**

- `argon2_hash`: VARIANT=2
  - `PASSWORD` ←
    - constant `[0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x0…`
  - `SALT` ←
    - constant `[0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x0…`
  - `SECRET` ←
    - constant `[0x03,0x03,0x03,0x03,0x03,0x03,0x03,0x03]`
  - `AD` ←
    - constant `[0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x0…`
  - `M_COST` ←
    - constant `32`
  - `T_COST` ←
    - constant `3`
  - `LANES` ←
    - constant `4`
  - `TAGLEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `argon2_hash`

