# SM2：分步拼装

SM2 的点乘与密钥交换可以逐原语拼出，加密和签名由接口块承担。

## 本页覆盖的工作区

| | |
|---|---|
| `SM2-PointMul` | `demos/procedures/SM2-PointMul.json` |
| `SM2-KeyExchange` | `demos/procedures/SM2-KeyExchange.json` |
| `SM2-Encrypt` | `demos/procedures/SM2-Encrypt.json` |
| `SM2-Sign` | `demos/procedures/SM2-Sign.json` |

### `SM2-PointMul`

- 证据类别：标准/官方用例
- 参数范围：SM2 推荐曲线（256-bit）
- 依据：GB/T 32918.5-2017（k·G）
- 核对入口：`p = SM2_PointMul()`
- 期望结果：`04ebfc718e8d1798620432268e77feb6415e2ede0e073c0f4f640ecd2e149a73 e858f9d81e5430a57b36daab…`

#### 拼装步骤

**函数 `SM2_PointMul()` 的过程体（按顺序）**

1. `ecc_load_curve_params`：a=0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFF…，b=0x28E9FA9E9D9F5E344D5A9E4BCF6509A7F3978…，p=0xFFFFFFFEFFFFFFFFFFFFFFFFFFFFFFFFFFFFF…
2. `ecc_load_point`：x=0x32C4AE2C1F1981195F9904466A39C9948FE30…，y=0xBC3736A2F4F6779C59BDCEE36B692153D0A98…
    - `point` ←
      - 变量 `P`
3. `ecc_multiply`：times=0x59276E27D506861A16680F3AD9C02DCCEF3CC…
    - `value2` ←
      - 变量 `R`
    - `value1` ←
      - 变量 `P`

**函数 `SM2_PointMul()` 的返回值**

- 变量 `R`

**该函数用到的算法块**：`ecc_load_curve_params` · `ecc_load_point` · `ecc_multiply`

### `SM2-KeyExchange`

- 证据类别：标准/官方用例
- 参数范围：SM2 推荐曲线（256-bit）+ SM3
- 依据：GB/T 32918.3-2016 附录 A.2 示例 1（B 侧共享密钥；未覆盖完整协议双方/确认流程）
- 核对入口：`dB = '5e35d7d3f3c54dbac72e61819e730b019a84208ca3a35e4c2e353dfccb2a3b53'`
- 期望结果：`SM2-KEX-OK`

#### 拼装步骤

**函数 `SM2KEX(dB: string, rB: string, pax: string, pay: string, RA: string, RBP: string, ZA: string, ZB: string, wlen: int)` 的返回值**

- `sm2_key_exchange`（GB/T 32918.3-2016 §6.1 响应方 B 的 B1–B7 及 KDF；不含 B8/B9 密钥确认，也不实现发起方流程）
  - `DB` ←
    - 变量 `dB`
  - `RBVAL` ←
    - 变量 `rB`
  - `PAX` ←
    - 变量 `pax`
  - `PAY` ←
    - 变量 `pay`
  - `RA` ←
    - 变量 `RA`
  - `RBP` ←
    - 变量 `RBP`
  - `ZA` ←
    - 变量 `ZA`
  - `ZB` ←
    - 变量 `ZB`
  - `WLEN` ←
    - 变量 `wlen`

**该函数用到的算法块**：`sm2_key_exchange`

### `SM2-Encrypt`

- 证据类别：标准/官方用例
- 参数范围：SM2 推荐曲线（256-bit）+ SM3
- 依据：GB/T 32918.4-2016 附录 A 示例 2
- 核对入口：`print(sm2_encrypt([0x65,0x6e,0x63,0x72,0x79,0x70,0x74,0x69,0x6f,0x6e,0x20,0x73,0x74,0x61,…`
- 期望结果：`04245c26fb68b1ddddb12c4b6bf9f2b6d5fe60a383b0d18d1c4144abf17f6252e776cb9264c2a7e88e52b1990…`

#### 拼装步骤

**函数 `SM2_Encrypt()` 的返回值**

- `sm2_encrypt`
  - `MSG` ←
    - 常量 `[0x65,0x6e,0x63,0x72,0x79,0x70,0x74,0x69,0x6f,0x6e,0x20,0x7…`
  - `PX` ←
    - 常量 `"435b39cca8f3b508c1488afc67be491a0f7ba07e581a0e4849a5cf7062…`
  - `PY` ←
    - 常量 `"75ddba78f15feecb4c7895e2c1cdf5fe01debb2cdbadf45399ccf77bba…`
  - `K` ←
    - 常量 `"4c62eefd6ecfc2b95b92fd6c3d9575148afa17425546d49018e5388d49…`

**该函数用到的算法块**：`sm2_encrypt`

**函数 `SM2_Decrypt()` 的返回值**

- `sm2_decrypt`
  - `CT` ←
    - 常量 `"04245c26fb68b1ddddb12c4b6bf9f2b6d5fe60a383b0d18d1c4144abf1…`
  - `DA` ←
    - 常量 `"1649ab77a00637bd5e2efe283fbf353534aa7f7cb89463f208ddbc2920…`

**该函数用到的算法块**：`sm2_decrypt`

### `SM2-Sign`

- 证据类别：标准/官方用例
- 参数范围：SM2 推荐曲线（256-bit）+ SM3
- 依据：GB/T 32918.2-2016 附录 A（ZA/e/r/s）
- 核对入口：`print(''.join(f'{x:02x}' for x in SM2_Sign()))`
- 期望结果：`40f1ec59f793d9f49e09dcef49130d4194f79fb1eed2caa55bacdb49c4e755d16fc6dac32c5d5cf10c77dfb20…`

#### 拼装步骤

**函数 `SM2_Sign()` 的返回值**

- `sm2_sign`
  - `DA` ←
    - 常量 `"128b2fa8bd433c6c068c8d803dff79792a519a55171b1b650c23661d15…`
  - `IDA` ←
    - 常量 `"ALICE123@YAHOO.COM"`
  - `MSG` ←
    - 常量 `[0x6d,0x65,0x73,0x73,0x61,0x67,0x65,0x20,0x64,0x69,0x67,0x6…`
  - `K` ←
    - 常量 `"6cb28d99385c175c94f94e934817663fc176d925dd72b727260dbaae1f…`

**该函数用到的算法块**：`sm2_sign`

