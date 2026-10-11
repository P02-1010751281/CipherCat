# Random-bit generation

Teaching chains and fixed regressions for deterministic random-bit generation; the randomness assessment itself runs on the platform backend.

## Workspaces on this page

| Workspace | File |
|---|---|
| `DRBG` | `demos/procedures/DRBG.json` |
| `GM-RNG` | `demos/procedures/GM-RNG.json` |

### DRBG

- Evidence class: project fixed regression (not an official vector)
- Basis: 3 个固定输出（直接生成/实例化后连续生成/重播种）；非完整 CAVP 套件（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in DRBG_Generate()))`
- Expected result: `591adfe6e6ee9ba3e7d11ed51db04b3bf9600c1733c0b0c4486eb8230bc56344b563ba9bd6858c0e4a04888c0…`

#### Assembly steps

**Return value of `DRBG_Generate()`**

- `drbg_generate`
  - `ENTROPY` ←
    - constant `[0xca,0x85,0x19,0x11,0x34,0x93,0x84,0xbf,0xfe,0x89,0xde,0x1…`
  - `NONCE` ←
    - constant `[0x65,0x9b,0xa9,0x6c,0x60,0x1d,0xc6,0x9f,0xc9,0x02,0x94,0x0…`
  - `PERSO` ←
    - constant `[]`
  - `BITS` ←
    - constant `1024`

**Algorithm blocks used by this function**: `drbg_generate`

### GM-RNG

- Evidence class: project fixed regression (not an official vector)
- Basis: 固定输入/输出项目回归；非官方向量，也不是 RNG/熵源验证（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in GM_Rng()))`
- Expected result: `e83283b6eeaa9c4fe07594f21369041ad8203c395400cf03136f7a18ce2a9721 e83283b6eeaa9c4fe07594f2…`

#### Assembly steps

**Return value of `GM_Rng()`**

- `gm_rng` (Deterministic SM3-HMAC teaching path borrowing the HMAC_DRBG structure;…)
  - `ENTROPY` ←
    - constant `[0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xb…`
  - `NONCE` ←
    - constant `[0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08]`
  - `PERSO` ←
    - constant `[0x0f,0x0e,0x0d,0x0c,0x0b,0x0a,0x09,0x08]`
  - `LEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `gm_rng`

