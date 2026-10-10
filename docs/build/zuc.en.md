# ZUC stream cipher: step-by-step assembly

ZUC state transformation, keystream, and message authentication: the EEA3 and EIA3 chains.

## Workspaces on this page

| | |
|---|---|
| `EEA3` | `demos/procedures/EEA3.json` |
| `EIA3` | `demos/procedures/EIA3.json` |

### `EEA3`

- Evidence class: standards or official cases
- Parameter scope: ZUC-128 密钥流（128-bit key/IV）（source text in Chinese）
- Basis: GB/T 33133.2 附录 A.1（source text in Chinese）
- Check: `ksb = b''.join(w.to_bytes(4, 'big') for w in EEA3_Encrypt())[:25]`
- Expected result: `a6c85fc66afb8533aafc2518dfe784940ee1e4b030238cc800 ca3e0c8619aed798a66b77e2b077a16a053791…`

#### Assembly steps

**Return value of `EEA3_Encrypt()`**

- `zuc_keystream` (Complete ZUC-128 keystream algorithm; takes a 16-byte key, 16-byte IV, …)
  - `KEY` ←
    - constant `[0x17,0x3d,0x14,0xba,0x50,0x03,0x73,0x1d,0x7a,0x60,0x04,0x9…`
  - `IV` ←
    - constant `[0x66,0x03,0x54,0x92,0x78,0x00,0x00,0x00,0x66,0x03,0x54,0x9…`
  - `LEN` ←
    - constant `7`

**Algorithm blocks used by this function**: `zuc_keystream`

### `EIA3`

- Evidence class: standards or official cases
- Parameter scope: ZUC-128 EIA3（128-bit key/IV，1 与 577 bit 消息）（source text in Chinese）
- Basis: GB/T 33133.3-2021 附录 B 示例 1、2（1/577 bit）（source text in Chinese）
- Check: `for vector in (EIA3_Vector_1(), EIA3_Vector_2()):`
- Expected result: `c8a9595e fae8ff0b REJECTED REJECTED REJECTED REJECTED`

#### Assembly steps

**Return value of `EIA3_Vector_1()`**

- `zuc_eia3` (128-EIA3 integrity code: 16-byte key, 32-bit COUNT, 5-bit BEARER, DIREC…)
  - `KEY` ←
    - constant `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`
  - `COUNT` ←
    - constant `0`
  - `BEARER` ←
    - constant `0`
  - `DIRECTION` ←
    - constant `0`
  - `MESSAGE` ←
    - constant `[0]`
  - `LENGTH` ←
    - constant `1`

**Algorithm blocks used by this function**: `zuc_eia3`

**Return value of `EIA3_Vector_2()`**

- `zuc_eia3` (128-EIA3 integrity code: 16-byte key, 32-bit COUNT, 5-bit BEARER, DIREC…)
  - `KEY` ←
    - constant `[0xc9,0xe6,0xce,0xc4,0x60,0x7c,0x72,0xdb,0x00,0x0a,0xef,0xa…`
  - `COUNT` ←
    - constant `2839566810`
  - `BEARER` ←
    - constant `10`
  - `DIRECTION` ←
    - constant `1`
  - `MESSAGE` ←
    - constant `[0x98,0x3b,0x41,0xd4,0x7d,0x78,0x0c,0x9e,0x1a,0xd1,0x1d,0x7…`
  - `LENGTH` ←
    - constant `577`

**Algorithm blocks used by this function**: `zuc_eia3`

