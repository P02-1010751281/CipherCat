# 密钥派生与口令处理

HKDF/PBKDF2/Argon2 目前以接口块为主，本页说明每个块的输入含义与拼装方式。

## 本页覆盖的工作区

| 工作区 | 文件 |
|---|---|
| `HKDF-SHA256` | `demos/procedures/HKDF-SHA256.json` |
| `PBKDF2` | `demos/procedures/PBKDF2.json` |
| `PBKDF2-SHA256` | `demos/procedures/PBKDF2-SHA256.json` |
| `PBKDF2-SM3` | `demos/procedures/PBKDF2-SM3.json` |
| `ARGON2` | `demos/procedures/ARGON2.json` |

### HKDF-SHA256

- 证据类别：标准/官方用例
- 参数范围：HMAC-SHA-256，L=42 bytes
- 依据：RFC 5869 A.1 Test Case 1
- 核对入口：`print(''.join(f'{x:02x}' for x in HKDF_Sha256()))`
- 期望结果：`3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865 8da4…`

#### 拼装步骤

**函数 `HKDF_Sha256()` 的返回值**

- `hkdf`
  - `SALT` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `IKM` ←
    - 常量 `[0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0b,0x0…`
  - `INFO` ←
    - 常量 `[0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9]`
  - `LEN` ←
    - 常量 `42`

**该函数用到的算法块**：`hkdf`

### PBKDF2

- 证据类别：与独立实现交叉核对
- 参数范围：PBKDF2-HMAC-SHA-256，dkLen=32
- 依据：期望值经 Python hashlib.pbkdf2_hmac 独立复算一致；非标准附录值
- 核对入口：`print(''.join(f'{x:02x}' for x in PBKDF2()))`
- 期望结果：`ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43`

#### 拼装步骤

**函数 `PBKDF2()` 的返回值**

- `pbkdf2`：HASH=sha256
  - `PASSWORD` ←
    - 常量 `[0x70,0x61,0x73,0x73,0x77,0x6f,0x72,0x64]`
  - `SALT` ←
    - 常量 `[0x73,0x61,0x6c,0x74]`
  - `ITER` ←
    - 常量 `2`
  - `KEYLEN` ←
    - 常量 `32`

**该函数用到的算法块**：`pbkdf2`

### PBKDF2-SHA256

- 证据类别：与独立实现交叉核对
- 参数范围：PBKDF2-HMAC-SHA-256，dkLen=32
- 依据：期望值取自 RFC 7914 §11 的 PBKDF2-HMAC-SHA-256 向量（含 password/salt/c/dkLen 与 33 字节尾块截断），并由 Python hashlib.pbkdf2_hmac 现场复算一致；RFC 7914 未作为标准目录随仓库跟踪，故按独立复算登记。RFC 6070 只…
- 核对入口：`print(''.join(f'{x:02x}' for x in PBKDF2_Sha256()))`
- 期望结果：`ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43 120fb6cffcf8b32c43e72252…`

#### 拼装步骤

**函数 `PBKDF2_Sha256()` 的返回值**

- `pbkdf2`：HASH=sha256
  - `PASSWORD` ←
    - 常量 `[0x70,0x61,0x73,0x73,0x77,0x6f,0x72,0x64]`
  - `SALT` ←
    - 常量 `[0x73,0x61,0x6c,0x74]`
  - `ITER` ←
    - 常量 `2`
  - `KEYLEN` ←
    - 常量 `32`

**该函数用到的算法块**：`pbkdf2`

### PBKDF2-SM3

- 证据类别：项目固定回归（非官方向量）
- 依据：SM3-HMAC/PBKDF2 组合为项目实现固定回归；未见公开官方向量登记
- 核对入口：`print(''.join(f'{x:02x}' for x in PBKDF2_Sm3()))`
- 期望结果：`fee723a2bc966e11dffb66133f4e8df577383c78ade30e3298edbd3e54ed85b7`

#### 拼装步骤

**函数 `PBKDF2_Sm3()` 的返回值**

- `pbkdf2`：HASH=sm3
  - `PASSWORD` ←
    - 常量 `[0x70,0x61,0x73,0x73,0x77,0x6f,0x72,0x64]`
  - `SALT` ←
    - 常量 `[0x73,0x61,0x6c,0x74]`
  - `ITER` ←
    - 常量 `2`
  - `KEYLEN` ←
    - 常量 `32`

**该函数用到的算法块**：`pbkdf2`

### ARGON2

- 证据类别：标准/官方用例
- 参数范围：Argon2d / Argon2i / Argon2id v1.3（RFC §5.1–5.3）
- 依据：RFC 9106 §5.1–5.3 三组向量
- 核对入口：`print(''.join(f'{x:02x}' for x in Argon2_Hash()))`
- 期望结果：`0d640df58d78766c08c037a34a8b53c9d01ef0452d75b65eb52520e96b01e659 512b391b6f1162975371d309…`

#### 拼装步骤

**函数 `Argon2_Hash()` 的返回值**

- `argon2_hash`：VARIANT=2
  - `PASSWORD` ←
    - 常量 `[0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x01,0x0…`
  - `SALT` ←
    - 常量 `[0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x02,0x0…`
  - `SECRET` ←
    - 常量 `[0x03,0x03,0x03,0x03,0x03,0x03,0x03,0x03]`
  - `AD` ←
    - 常量 `[0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x04,0x0…`
  - `M_COST` ←
    - 常量 `32`
  - `T_COST` ←
    - 常量 `3`
  - `LANES` ←
    - 常量 `4`
  - `TAGLEN` ←
    - 常量 `32`

**该函数用到的算法块**：`argon2_hash`

