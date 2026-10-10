# 椭圆曲线与标识密码：分步拼装

ECDH、X25519、ECDSA、EdDSA 与 SM9：曲线参数、点运算和协议链的组合方式。

## 本页覆盖的工作区

| | |
|---|---|
| `ECDH` | `demos/procedures/ECDH.json` |
| `X25519` | `demos/procedures/X25519.json` |
| `ECDSA` | `demos/procedures/ECDSA.json` |
| `EDDSA` | `demos/procedures/EDDSA.json` |
| `SM9-Sign` | `demos/procedures/SM9-Sign.json` |

### `ECDH`

- 证据类别：标准/官方用例
- 参数范围：NIST P-256 ECDH
- 依据：RFC 5903 §8.1（IKE P-256）
- 核对入口：`print(ecdh_shared_secret('6c7cf735485ec76607fb91ef9c33101cc62c3e3e2bd80483e49242b4939f619…`
- 期望结果：`9fc6f647b167c1fee49c830432fe6e7a298e274606f67d4c07f5395c82523405 d6840f6b42f6edafd13116e0…`

#### 拼装步骤

**函数 `ECDH_Shared()` 的返回值**

- `ecdh_shared_secret`
  - `D` ←
    - 常量 `"c88f01f510d9ac3f70a292daa2316de544e9aab8afe84049c62a9c5786…`
  - `QX` ←
    - 常量 `"d12dfb5289c8d4f81208b70270398c342296970a0bccb74c736fc75544…`
  - `QY` ←
    - 常量 `"56fbf3ca366cc23e8157854c13c58d6aac23f046ada30f8353e74f3303…`

**该函数用到的算法块**：`ecdh_shared_secret`

### `X25519`

- 证据类别：标准/官方用例
- 参数范围：Curve25519（32B 标量/u 坐标）
- 依据：RFC 7748 §5.2 V1/V2
- 核对入口：`print(''.join(f'{x:02x}' for x in X25519_Shared()))`
- 期望结果：`c3da55379de9c6908e94ea4df28d084f32eccf03491c71f754b4075577a28552 95cbde9476e8907d7aade45c…`

#### 拼装步骤

**函数 `X25519_Shared()` 的返回值**

- `x25519`
  - `SCALAR` ←
    - 常量 `[0xa5,0x46,0xe3,0x6b,0xf0,0x52,0x7c,0x9d,0x3b,0x16,0x15,0x4…`
  - `U` ←
    - 常量 `[0xe6,0xdb,0x68,0x67,0x58,0x30,0x30,0xdb,0x35,0x94,0xc1,0xa…`

**该函数用到的算法块**：`x25519`

### `ECDSA`

- 证据类别：标准/官方用例
- 参数范围：NIST P-256 + SHA-256 + RFC 6979 确定性 k
- 依据：RFC 6979 §A.2.5 P-256/SHA-256（"sample"/"test"）
- 核对入口：`print(''.join(f'{x:02x}' for x in ECDSA_Sign()))`
- 期望结果：`efd48b2aacb6a8fd1140dd9cd45e81d69d2c877b56aaf991c34d0ea84eaf3716f7cb1c942d657c41d436c7a1b…`

#### 拼装步骤

**函数 `ECDSA_Sign()` 的返回值**

- `ecdsa_sign`
  - `PRIV` ←
    - 常量 `[0xc9,0xaf,0xa9,0xd8,0x45,0xba,0x75,0x16,0x6b,0x5c,0x21,0x5…`
  - `MSG` ←
    - 常量 `'sample'`

**该函数用到的算法块**：`ecdsa_sign`

**函数 `ECDSA_Verify()` 的返回值**

- `ecdsa_verify`
  - `MSG` ←
    - 常量 `'sample'`
  - `PUB` ←
    - 常量 `[0x60,0xfe,0xd4,0xba,0x25,0x5a,0x9d,0x31,0xc9,0x61,0xeb,0x7…`
  - `SIG` ←
    - 常量 `[0xef,0xd4,0x8b,0x2a,0xac,0xb6,0xa8,0xfd,0x11,0x40,0xdd,0x9…`

**该函数用到的算法块**：`ecdsa_verify`

### `EDDSA`

- 证据类别：标准/官方用例
- 参数范围：Ed25519（32B 私钥/公钥、64B 签名）
- 依据：RFC 8032 TEST 1-3
- 核对入口：`print(''.join(f'{x:02x}' for x in EDDSA_Sign()))`
- 期望结果：`e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701…`

#### 拼装步骤

**函数 `EDDSA_Sign()` 的返回值**

- `eddsa_sign`
  - `SECRET` ←
    - 常量 `[0x9d,0x61,0xb1,0x9d,0xef,0xfd,0x5a,0x60,0xba,0x84,0x4a,0xf…`
  - `MSG` ←
    - 常量 `[]`

**该函数用到的算法块**：`eddsa_sign`

**函数 `EDDSA_Verify()` 的返回值**

- `eddsa_verify`
  - `PUBLIC` ←
    - 常量 `[0xd7,0x5a,0x98,0x01,0x82,0xb1,0x0a,0xb7,0xd5,0x4b,0xfe,0xd…`
  - `MSG` ←
    - 常量 `[]`
  - `SIGNATURE` ←
    - 常量 `[0xe5,0x56,0x43,0x00,0xc3,0x60,0xac,0x72,0x90,0x86,0xe2,0xc…`

**该函数用到的算法块**：`eddsa_verify`

### `SM9-Sign`

- 证据类别：标准/官方用例
- 参数范围：GB/T 38635.1-2020 系统参数（256-bit）
- 依据：GB/T 38635.2-2020 附录 A
- 核对入口：`print(''.join(f'{x:02x}' for x in SM9_Sign()))`
- 期望结果：`823c4b21e4bd2dfe1ed92c606653e996668563152fc33f55d7bfbb9bd9705adb0473bf96923ce58b6ad0e13e9…`

#### 拼装步骤

**函数 `SM9_Sign()` 的返回值**

- `sm9_sign`
  - `MSG` ←
    - 常量 `[0x43,0x68,0x69,0x6e,0x65,0x73,0x65,0x20,0x49,0x42,0x53,0x2…`
  - `DS` ←
    - `sm9_user_key`：HID=1
      - `KS` ←
        - 常量 `[0x00,0x01,0x30,0xe7,0x84,0x59,0xd7,0x85,0x45,0xcb,0x54,0xc…`
      - `ID` ←
        - 常量 `[0x41,0x6c,0x69,0x63,0x65]`
  - `PPUB` ←
    - `sm9_master_key`
      - `KS` ←
        - 常量 `[0x00,0x01,0x30,0xe7,0x84,0x59,0xd7,0x85,0x45,0xcb,0x54,0xc…`
  - `R` ←
    - 常量 `[0x00,0x03,0x3c,0x86,0x16,0xb0,0x67,0x04,0x81,0x32,0x03,0xd…`

**该函数用到的算法块**：`sm9_master_key` · `sm9_sign` · `sm9_user_key`

