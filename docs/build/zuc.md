# ZUC 序列密码：分步拼装

ZUC 状态变换、密钥流与消息认证：EEA3 与 EIA3 两条链。

## 本页覆盖的工作区

| | |
|---|---|
| `EEA3` | `demos/procedures/EEA3.json` |
| `EIA3` | `demos/procedures/EIA3.json` |

### `EEA3`

- 证据类别：标准/官方用例
- 参数范围：ZUC-128 密钥流（128-bit key/IV）
- 依据：GB/T 33133.2 附录 A.1
- 核对入口：`ksb = b''.join(w.to_bytes(4, 'big') for w in EEA3_Encrypt())[:25]`
- 期望结果：`a6c85fc66afb8533aafc2518dfe784940ee1e4b030238cc800 ca3e0c8619aed798a66b77e2b077a16a053791…`

#### 拼装步骤

**函数 `EEA3_Encrypt()` 的返回值**

- `zuc_keystream`（完整 ZUC-128 密钥流算法；输入 16-byte key、16-byte IV 和输出字数，内部管理初始化、状态更新及工作模式）
  - `KEY` ←
    - 常量 `[0x17,0x3d,0x14,0xba,0x50,0x03,0x73,0x1d,0x7a,0x60,0x04,0x9…`
  - `IV` ←
    - 常量 `[0x66,0x03,0x54,0x92,0x78,0x00,0x00,0x00,0x66,0x03,0x54,0x9…`
  - `LEN` ←
    - 常量 `7`

**该函数用到的算法块**：`zuc_keystream`

### `EIA3`

- 证据类别：标准/官方用例
- 参数范围：ZUC-128 EIA3（128-bit key/IV，1 与 577 bit 消息）
- 依据：GB/T 33133.3-2021 附录 B 示例 1、2（1/577 bit）
- 核对入口：`for vector in (EIA3_Vector_1(), EIA3_Vector_2()):`
- 期望结果：`c8a9595e fae8ff0b REJECTED REJECTED REJECTED REJECTED`

#### 拼装步骤

**函数 `EIA3_Vector_1()` 的返回值**

- `zuc_eia3`（128-EIA3 完整性码：16-byte key、32-bit COUNT、5-bit BEARER、DIRECTION、消息和 bit 长…）
  - `KEY` ←
    - 常量 `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`
  - `COUNT` ←
    - 常量 `0`
  - `BEARER` ←
    - 常量 `0`
  - `DIRECTION` ←
    - 常量 `0`
  - `MESSAGE` ←
    - 常量 `[0]`
  - `LENGTH` ←
    - 常量 `1`

**该函数用到的算法块**：`zuc_eia3`

**函数 `EIA3_Vector_2()` 的返回值**

- `zuc_eia3`（128-EIA3 完整性码：16-byte key、32-bit COUNT、5-bit BEARER、DIRECTION、消息和 bit 长…）
  - `KEY` ←
    - 常量 `[0xc9,0xe6,0xce,0xc4,0x60,0x7c,0x72,0xdb,0x00,0x0a,0xef,0xa…`
  - `COUNT` ←
    - 常量 `2839566810`
  - `BEARER` ←
    - 常量 `10`
  - `DIRECTION` ←
    - 常量 `1`
  - `MESSAGE` ←
    - 常量 `[0x98,0x3b,0x41,0xd4,0x7d,0x78,0x0c,0x9e,0x1a,0xd1,0x1d,0x7…`
  - `LENGTH` ←
    - 常量 `577`

**该函数用到的算法块**：`zuc_eia3`

