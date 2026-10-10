# SM2: step-by-step assembly

SM2 point multiplication and key exchange can be assembled from primitives; encryption and signature are interface blocks.

## Workspaces on this page

| | |
|---|---|
| `SM2-PointMul` | `demos/procedures/SM2-PointMul.json` |
| `SM2-KeyExchange` | `demos/procedures/SM2-KeyExchange.json` |
| `SM2-Encrypt` | `demos/procedures/SM2-Encrypt.json` |
| `SM2-Sign` | `demos/procedures/SM2-Sign.json` |

### `SM2-PointMul`

- Evidence class: standards or official cases
- Parameter scope: SM2 推荐曲线（256-bit）（source text in Chinese）
- Basis: GB/T 32918.5-2017（k·G）
- Check: `p = SM2_PointMul()`
- Expected result: `04ebfc718e8d1798620432268e77feb6415e2ede0e073c0f4f640ecd2e149a73 e858f9d81e5430a57b36daab…`

#### Assembly steps

**Body of `SM2_PointMul()` (in order)**

1. `ecc_load_curve_params`: a=0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFF…，b=0x28E9FA9E9D9F5E344D5A9E4BCF6509A7F3978…，p=0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFF…
2. `ecc_load_point`: x=0x32C4AE2C1F1981195F9904466A39C9948FE30…，y=0xBC3736A2F4F6779C59BDCEE36B692153D0A98…
    - `point` ←
      - variable `P`
3. `ecc_multiply`: times=0x59276E27D506861A16680F3AD9C02DCCEF3CC…
    - `value2` ←
      - variable `R`
    - `value1` ←
      - variable `P`

**Return value of `SM2_PointMul()`**

- variable `R`

**Algorithm blocks used by this function**: `ecc_load_curve_params` · `ecc_load_point` · `ecc_multiply`

### `SM2-KeyExchange`

- Evidence class: standards or official cases
- Parameter scope: SM2 推荐曲线（256-bit）+ SM3（source text in Chinese）
- Basis: GB/T 32918.3-2016 附录 A.2 示例 1（B 侧共享密钥；未覆盖完整协议双方/确认流程）（source text in Chinese）
- Check: `dB = '5e35d7d3f3c54dbac72e61819e730b019a84208ca3a35e4c2e353dfccb2a3b53'`
- Expected result: `SM2-KEX-OK`

#### Assembly steps

**Return value of `SM2KEX(dB: string, rB: string, pax: string, pay: string, RA: string, RBP: string, ZA: string, ZB: string, wlen: int)`**

- `sm2_key_exchange` (GB/T 32918.3-2016 §6.1 responder B steps B1–B7 plus KDF; excludes B8/B9…)
  - `DB` ←
    - variable `dB`
  - `RBVAL` ←
    - variable `rB`
  - `PAX` ←
    - variable `pax`
  - `PAY` ←
    - variable `pay`
  - `RA` ←
    - variable `RA`
  - `RBP` ←
    - variable `RBP`
  - `ZA` ←
    - variable `ZA`
  - `ZB` ←
    - variable `ZB`
  - `WLEN` ←
    - variable `wlen`

**Algorithm blocks used by this function**: `sm2_key_exchange`

### `SM2-Encrypt`

- Evidence class: standards or official cases
- Parameter scope: SM2 推荐曲线（256-bit）+ SM3（source text in Chinese）
- Basis: GB/T 32918.4-2016 附录 A 示例 2（source text in Chinese）
- Check: `print(sm2_encrypt([0x65,0x6e,0x63,0x72,0x79,0x70,0x74,0x69,0x6f,0x6e,0x20,0x73,0x74,0x61,…`
- Expected result: `04245c26fb68b1ddddb12c4b6bf9f2b6d5fe60a383b0d18d1c4144abf17f6252e776cb9264c2a7e88e52b1990…`

#### Assembly steps

**Return value of `SM2_Encrypt()`**

- `sm2_encrypt`
  - `MSG` ←
    - constant `[0x65,0x6e,0x63,0x72,0x79,0x70,0x74,0x69,0x6f,0x6e,0x20,0x7…`
  - `PX` ←
    - constant `"435b39cca8f3b508c1488afc67be491a0f7ba07e581a0e4849a5cf7062…`
  - `PY` ←
    - constant `"75ddba78f15feecb4c7895e2c1cdf5fe01debb2cdbadf45399ccf77bba…`
  - `K` ←
    - constant `"4c62eefd6ecfc2b95b92fd6c3d9575148afa17425546d49018e5388d49…`

**Algorithm blocks used by this function**: `sm2_encrypt`

**Return value of `SM2_Decrypt()`**

- `sm2_decrypt`
  - `CT` ←
    - constant `"04245c26fb68b1ddddb12c4b6bf9f2b6d5fe60a383b0d18d1c4144abf1…`
  - `DA` ←
    - constant `"1649ab77a00637bd5e2efe283fbf353534aa7f7cb89463f208ddbc2920…`

**Algorithm blocks used by this function**: `sm2_decrypt`

### `SM2-Sign`

- Evidence class: standards or official cases
- Parameter scope: SM2 推荐曲线（256-bit）+ SM3（source text in Chinese）
- Basis: GB/T 32918.2-2016 附录 A（ZA/e/r/s）（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in SM2_Sign()))`
- Expected result: `40f1ec59f793d9f49e09dcef49130d4194f79fb1eed2caa55bacdb49c4e755d16fc6dac32c5d5cf10c77dfb20…`

#### Assembly steps

**Return value of `SM2_Sign()`**

- `sm2_sign`
  - `DA` ←
    - constant `"128b2fa8bd433c6c068c8d803dff79792a519a55171b1b650c23661d15…`
  - `IDA` ←
    - constant `"ALICE123@YAHOO.COM"`
  - `MSG` ←
    - constant `[0x6d,0x65,0x73,0x73,0x61,0x67,0x65,0x20,0x64,0x69,0x67,0x6…`
  - `K` ←
    - constant `"6cb28d99385c175c94f94e934817663fc176d925dd72b727260dbaae1f…`

**Algorithm blocks used by this function**: `sm2_sign`

