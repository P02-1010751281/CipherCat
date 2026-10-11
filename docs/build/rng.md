# 随机数生成

确定性随机比特生成的教学链与固定回归，随机性测评本身由平台后端执行。

## 本页覆盖的工作区

| 工作区 | 文件 |
|---|---|
| `DRBG` | `demos/procedures/DRBG.json` |
| `GM-RNG` | `demos/procedures/GM-RNG.json` |

### DRBG

- 证据类别：项目固定回归（非官方向量）
- 依据：3 个固定输出（直接生成/实例化后连续生成/重播种）；非完整 CAVP 套件
- 核对入口：`print(''.join(f'{x:02x}' for x in DRBG_Generate()))`
- 期望结果：`591adfe6e6ee9ba3e7d11ed51db04b3bf9600c1733c0b0c4486eb8230bc56344b563ba9bd6858c0e4a04888c0…`

#### 拼装步骤

**函数 `DRBG_Generate()` 的返回值**

- `drbg_generate`
  - `ENTROPY` ←
    - 常量 `[0xca,0x85,0x19,0x11,0x34,0x93,0x84,0xbf,0xfe,0x89,0xde,0x1…`
  - `NONCE` ←
    - 常量 `[0x65,0x9b,0xa9,0x6c,0x60,0x1d,0xc6,0x9f,0xc9,0x02,0x94,0x0…`
  - `PERSO` ←
    - 常量 `[]`
  - `BITS` ←
    - 常量 `1024`

**该函数用到的算法块**：`drbg_generate`

### GM-RNG

- 证据类别：项目固定回归（非官方向量）
- 依据：固定输入/输出项目回归；非官方向量，也不是 RNG/熵源验证
- 核对入口：`print(''.join(f'{x:02x}' for x in GM_Rng()))`
- 期望结果：`e83283b6eeaa9c4fe07594f21369041ad8203c395400cf03136f7a18ce2a9721 e83283b6eeaa9c4fe07594f2…`

#### 拼装步骤

**函数 `GM_Rng()` 的返回值**

- `gm_rng`（借鉴 HMAC_DRBG 结构的确定性 SM3-HMAC 教学路径，长度为 0–65536 字节；不是 GM/T 0103/0105 或 SP…）
  - `ENTROPY` ←
    - 常量 `[0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xb…`
  - `NONCE` ←
    - 常量 `[0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08]`
  - `PERSO` ←
    - 常量 `[0x0f,0x0e,0x0d,0x0c,0x0b,0x0a,0x09,0x08]`
  - `LEN` ←
    - 常量 `32`

**该函数用到的算法块**：`gm_rng`

