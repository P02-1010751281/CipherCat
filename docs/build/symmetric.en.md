# Symmetric ciphers and modes: step-by-step assembly

Block ciphers, modes, and authenticated encryption: assemble round/mode chains from primitives, then compose them with interface or mode blocks.

## Workspaces on this page

| | |
|---|---|
| `AES-Atomic-Round` | `demos/AES-Atomic-Round.json` |
| `Procedure-AES-Round` | `demos/Procedure-AES-Round.json` |
| `AES-Round` | `demos/procedures/AES-Round.json` |
| `AES-LastRound` | `demos/procedures/AES-LastRound.json` |
| `SM4-Atomic-Round` | `demos/SM4-Atomic-Round.json` |
| `Procedure-SM4-Round` | `demos/Procedure-SM4-Round.json` |
| `SM4-Round` | `demos/procedures/SM4-Round.json` |
| `SM4-Sbox` | `demos/procedures/SM4-Sbox.json` |
| `Mode-ECB` | `demos/procedures/Mode-ECB.json` |
| `Mode-CBC` | `demos/procedures/Mode-CBC.json` |
| `Mode-CTR` | `demos/procedures/Mode-CTR.json` |
| `GCM-Encrypt` | `demos/procedures/GCM-Encrypt.json` |
| `CCM-Encrypt` | `demos/procedures/CCM-Encrypt.json` |
| `XTS-Encrypt` | `demos/procedures/XTS-Encrypt.json` |
| `ASCON` | `demos/procedures/ASCON.json` |
| `ASCON-Extended` | `demos/procedures/ASCON-Extended.json` |

### `AES-Atomic-Round`

- Evidence class: project fixed regression (not an official vector)
- Basis: 四个原子轮原语按工作区顺序原地修改共享状态，固定值 4807…c59f；非官方附录向量（source text in Chinese）
- Check: `print(''.join(f'{b:02x}' for b in i))`
- Expected result: `4807f3cfdcc929d006f1297cdb24c59f`

#### Assembly steps

**Top-level blocks (workspace order)**

1. `variables_set`: variable=b28a4a7f346e44968c2b
    - `VALUE` ←
      - constant `[0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xb…`
2. `variables_set`: variable=ccd1658163e44eb6b76a
    - `VALUE` ←
      - constant `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`
3. `aes_sub_bytes` (S-box substitution, 16 bytes)
    - `STATE` ←
      - variable `b28a4a7f346e44968c2b`
4. `aes_shift_rows` (row cyclic left shift)
    - `STATE` ←
      - variable `b28a4a7f346e44968c2b`
5. `aes_mix_columns` (GF(2⁸) mix columns)
    - `STATE` ←
      - variable `b28a4a7f346e44968c2b`
6. `aes_add_round_key` (⊕ round key)
    - `STATE` ←
      - variable `b28a4a7f346e44968c2b`
    - `ROUND_KEY` ←
      - variable `ccd1658163e44eb6b76a`

### `Procedure-AES-Round`

- Evidence class: project fixed regression (not an official vector)
- Basis: 显式值连接轮函数的固定输入回归 4807…c59f；非官方附录向量（source text in Chinese）
- Check: `state = [0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff]`
- Expected result: `4807f3cfdcc929d006f1297cdb24c59f`

#### Assembly steps

**Return value of `AES_Round(state: int_list, round_key: int_list)`**

- `aes_add_round_key` (⊕ round key)
  - `STATE` ←
    - `aes_mix_columns` (GF(2⁸) mix columns)
      - `STATE` ←
        - `aes_shift_rows` (row cyclic left shift)
          - … (deeper inputs live in the workspace)
  - `ROUND_KEY` ←
    - variable `round_key`

**Algorithm blocks used by this function**: `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes`

### `AES-Round`

- Evidence class: project fixed regression (not an official vector)
- Basis: 正常轮 + 末轮（去 MixColumns）固定输入回归；不声称为官方完整加密向量（source text in Chinese）
- Check: `state = [0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff]`
- Expected result: `4807f3cfdcc929d006f1297cdb24c59f`

#### Assembly steps

**Return value of `AES_Round(state: int_list, round_key: int_list)`**

- `aes_add_round_key` (⊕ round key)
  - `STATE` ←
    - `aes_mix_columns` (GF(2⁸) mix columns)
      - `STATE` ←
        - `aes_shift_rows` (row cyclic left shift)
          - … (deeper inputs live in the workspace)
  - `ROUND_KEY` ←
    - variable `round_key`

**Algorithm blocks used by this function**: `aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes`

### `AES-LastRound`

- Evidence class: project fixed regression (not an official vector)
- Basis: 末轮固定输入回归；不声称为官方完整加密向量（source text in Chinese）
- Check: `state = [0x63,0x53,0xe0,0x8c,0x09,0x60,0xd1,0x04,0xcd,0xb7,0xd1,0x0c,0x0c,0x5c,0x4e,0x7d]`
- Expected result: `2bc4c757c8470aed5c75ed3a488e3258`

#### Assembly steps

**Return value of `AES_LastRound(state: int_list, round_key: int_list)`**

- `aes_add_round_key` (⊕ round key)
  - `STATE` ←
    - `aes_shift_rows` (row cyclic left shift)
      - `STATE` ←
        - `aes_sub_bytes` (S-box substitution, 16 bytes)
          - … (deeper inputs live in the workspace)
  - `ROUND_KEY` ←
    - variable `round_key`

**Algorithm blocks used by this function**: `aes_add_round_key` · `aes_shift_rows` · `aes_sub_bytes`

### `SM4-Atomic-Round`

- Evidence class: standards or official cases
- Parameter scope: SM4-128 单轮（source text in Chinese）
- Basis: GB/T 32907-2016 附录 A 首轮输出 27fad345（source text in Chinese）
- Check: `print(''.join(f'{b:02x}' for b in n))`
- Expected result: `27fad345`

#### Assembly steps

**Top-level blocks (workspace order)**

1. `variables_set`: variable=965fcadff19d47b5bc51
    - `VALUE` ←
      - constant `[0x01,0x23,0x45,0x67]`
2. `variables_set`: variable=a42334adadb043aa9e1c
    - `VALUE` ←
      - constant `[0x89,0xab,0xcd,0xef]`
3. `variables_set`: variable=ca96b6e148a546aeafff
    - `VALUE` ←
      - constant `[0xfe,0xdc,0xba,0x98]`
4. `variables_set`: variable=b17ec8c7bfcd419ba802
    - `VALUE` ←
      - constant `[0x76,0x54,0x32,0x10]`
5. `variables_set`: variable=0f6389d6271a43f58da1
    - `VALUE` ←
      - `sm4_round_func` (round function F(X0,X1,X2,X3,rk))
        - `X0` ←
          - variable `965fcadff19d47b5bc51`
        - `X1` ←
          - variable `a42334adadb043aa9e1c`
        - `X2` ←
          - variable `ca96b6e148a546aeafff`
        - `X3` ←
          - variable `b17ec8c7bfcd419ba802`
        - `RK` ←
          - constant `0xF12186F9`

### `Procedure-SM4-Round`

- Evidence class: standards or official cases
- Parameter scope: SM4-128 轮函数（source text in Chinese）
- Basis: GB/T 32907-2016 附录 A 首轮输出 27FAD345（source text in Chinese）
- Check: `state_0 = [0x01,0x23,0x45,0x67]`
- Expected result: `27fad345`

#### Assembly steps

**Return value of `SM4_Round(state_0: int, state_1: int, state_2: int, state_3: int, rk: int)`**

- `sm4_round_func` (round function F(X0,X1,X2,X3,rk))
  - `X0` ←
    - variable `state_0`
  - `X1` ←
    - variable `state_1`
  - `X2` ←
    - variable `state_2`
  - `X3` ←
    - variable `state_3`
  - `RK` ←
    - variable `rk`

**Algorithm blocks used by this function**: `sm4_round_func`

### `SM4-Round`

- Evidence class: standards or official cases
- Parameter scope: SM4-128 轮函数（首轮密钥 0xf12186f9）（source text in Chinese）
- Basis: GB/T 32907-2016 附录 A 首轮输出 27FAD345（仅此轮向量）（source text in Chinese）
- Check: `state_0 = [0x01,0x23,0x45,0x67]`
- Expected result: `27fad345`

#### Assembly steps

**Return value of `SM4_Round(state_0: int, state_1: int, state_2: int, state_3: int, rk: int)`**

- `sm4_round_func` (round function F(X0,X1,X2,X3,rk))
  - `X0` ←
    - variable `state_0`
  - `X1` ←
    - variable `state_1`
  - `X2` ←
    - variable `state_2`
  - `X3` ←
    - variable `state_3`
  - `RK` ←
    - variable `rk`

**Algorithm blocks used by this function**: `sm4_round_func`

### `SM4-Sbox`

- Evidence class: standards or official cases
- Parameter scope: SM4-128 字节代换表（source text in Chinese）
- Basis: GB/T 32907-2016 附录 A（S(0x01)=0x90）（source text in Chinese）
- Check: `print(SM4_Sbox(1))`
- Expected result: `144`

#### Assembly steps

**Return value of `SM4_Sbox(x: int)`**

- `sm4_sbox` (GB/T 32907-2016 byte S-box lookup; input is an integer from 0 to 255)
  - `INPUT` ←
    - variable `x`

**Algorithm blocks used by this function**: `sm4_sbox`

### `Mode-ECB`

- Evidence class: standards or official cases
- Parameter scope: AES-128 ECB（单块；CAVP KAT 全例）（source text in Chinese）
- Basis: FIPS 197 附录 C.1（AES-128 ECB）；并逐例核对 NIST CAVP AESVS KAT 的 128-bit ECB 四文件（ECBGFSbox/ECBKeySbox/ECBVarKey/ECBVarTxt）（source text in Chinese）
- Check: `print(bytes(ECB()).hex())`
- Expected result: `3ad77bb40d7a3660a89ecaf32466ef97`

#### Assembly steps

**Return value of `ECB()`**

- `mode_ecb_encrypt` (AES-ECB encrypt (teaching only))
  - `DATA` ←
    - constant `[0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x1…`
  - `KEY` ←
    - constant `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`

**Algorithm blocks used by this function**: `mode_ecb_encrypt`

### `Mode-CBC`

- Evidence class: standards or official cases
- Parameter scope: AES-128 CBC（16B key/IV）
- Basis: SP 800-38A F.2.1 CBC-AES128.Encrypt
- Check: `print(bytes(CBC()).hex())`
- Expected result: `7649abac8119b246cee98e9b12e9197d`

#### Assembly steps

**Return value of `CBC()`**

- `mode_cbc_encrypt` (AES-CBC encrypt (needs IV))
  - `DATA` ←
    - constant `[0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x1…`
  - `KEY` ←
    - constant `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`
  - `IV` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`

**Algorithm blocks used by this function**: `mode_cbc_encrypt`

### `Mode-CTR`

- Evidence class: standards or official cases
- Parameter scope: AES-128 CTR（16B key、16B 初始计数器块）（source text in Chinese）
- Basis: SP 800-38A F.5.1 CTR-AES128.Encrypt
- Check: `print(bytes(CTR()).hex())`
- Expected result: `874d6191b620e3261bef6864990db6ce`

#### Assembly steps

**Return value of `CTR()`**

- `mode_ctr_encrypt` (AES-CTR encrypt (needs nonce))
  - `DATA` ←
    - constant `[0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x1…`
  - `KEY` ←
    - constant `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`
  - `NONCE` ←
    - constant `[0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa,0xf…`

**Algorithm blocks used by this function**: `mode_ctr_encrypt`

### `GCM-Encrypt`

- Evidence class: standards or official cases
- Parameter scope: AES-128 GCM；96-bit IV、tagLen=128（ACVP tgId=1 全 15 例）；项目另有 120-bit IV/AAD 变体（source text in Chinese）
- Basis: 算法定义见 NIST SP 800-38D；测试来源为 NIST ACVP AES-GCM 官方用例（tgId=1，encrypt、tagLen=128、96-bit IV，15 例，含 tcId；这 15 例均为空明文）。注意：SP 800-38D 正文与附录不含测试用例表，TC 编号属 GCM 规范（McGrew…（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in GCM_Encrypt()))`
- Expected result: `42831ec2217774244b7221b784d0d49ce3aa212f2c02a4e035c17e2329aca12e21d514b25466931c7d8f6a5aa…`

#### Assembly steps

**Return value of `GCM_Encrypt()`**

- `gcm_encrypt` (GCM encryption returns ciphertext concatenated with a 128-bit tag. GHAS…)
  - `KEY` ←
    - constant `[0xfe,0xff,0xe9,0x92,0x86,0x65,0x73,0x1c,0x6d,0x6a,0x8f,0x9…`
  - `IV` ←
    - constant `[0xca,0xfe,0xba,0xbe,0xfa,0xce,0xdb,0xad,0xde,0xca,0xf8,0x8…`
  - `AAD` ←
    - constant `[]`
  - `MSG` ←
    - constant `[0xd9,0x31,0x32,0x25,0xf8,0x84,0x06,0xe5,0xa5,0x59,0x09,0xc…`

**Algorithm blocks used by this function**: `gcm_encrypt`

### `CCM-Encrypt`

- Evidence class: standards or official cases
- Parameter scope: AES-128 CCM：Example 1（N=7B、A=8B、P=4B、Tlen=4）、Example 2（N=8B、A=16B、P=16B、Tlen=6）、Example 3（N=12B、A=20B、P=24B、Tlen=8）
- Basis: SP 800-38C 附录 C Example 1、Example 2、Example 3（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in CCM_Encrypt()))`
- Expected result: `e3b201a9f5b71a7a9b1ceaeccd97e70b6176aad9a4428aa5484392fbc1b09951 7162015b4dac255d d2a1f0e…`

#### Assembly steps

**Return value of `CCM_Encrypt()`**

- `ccm_encrypt` (CCM encryption returns ciphertext concatenated with the authentication …): TAGLEN=8
  - `KEY` ←
    - constant `[0x40,0x41,0x42,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x4…`
  - `NONCE` ←
    - constant `[0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1…`
  - `AAD` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `MSG` ←
    - constant `[0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2a,0x2…`

**Algorithm blocks used by this function**: `ccm_encrypt`

### `XTS-Encrypt`

- Evidence class: project fixed regression (not an official vector)
- Parameter scope: AES-128 XTS（32B key 拆两半、16B tweak、支持密文窃取）（source text in Chinese）
- Basis: IEEE 1619-2007 XTS-AES-128 经典向量（key=00..1f、tweak=00000000000000000102030405060708、64 字节数据单元）；该标准为付费文档且未随仓库分发，仓库内无可离线核对的来源，故不登记为官方向量（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in XTS_Encrypt()))`
- Expected result: `76cbc38d4c92206b50338462cbc8795a74f66940f3300ce2aeb061b81dd5cc7233ecdaf43dc3db2f2a8d7a6e0…`

#### Assembly steps

**Return value of `XTS_Encrypt()`**

- `xts_encrypt` (XTS encryption: `key` holds two distinct AES-128 keys (32 bytes) and `t…)
  - `KEY` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `TWEAK` ←
    - constant `[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x02,0x03,0x0…`
  - `MSG` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`

**Algorithm blocks used by this function**: `xts_encrypt`

### `ASCON`

- Evidence class: standards or official cases
- Parameter scope: Ascon-AEAD128（固定样例）；Hash256/XOF128/CXOF128（ACVP 字节对齐用例，outLen ≤ 4096 字节子集）（source text in Chinese）
- Basis: NIST SP 800-232 Ascon AEAD128 文档示例（固定样例）；Hash256/XOF128/CXOF128 另对齐 NIST ACVP 官方用例（ACVP-Ascon-*-SP800-232，字节对齐子集，含 tgId/tcId）（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in Ascon_Encrypt()))`
- Expected result: `96107d8a29a7529a7941bdc7df1fe3c6c7ea70d7986e7b59cd0d357239f5d25bf5 4f9c278211bec9316bf68f…`

#### Assembly steps

**Return value of `Ascon_Encrypt()`**

- `ascon_encrypt`
  - `KEY` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `NONCE` ←
    - constant `[0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1…`
  - `AD` ←
    - constant `[0x30]`
  - `MSG` ←
    - constant `[0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2a,0x2…`

**Algorithm blocks used by this function**: `ascon_encrypt`

### `ASCON-Extended`

- Evidence class: project fixed regression (not an official vector)
- Basis: 扩展固定样例与错误标签/参数拒绝；非完整 KAT（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in Ascon_Hash256_Empty()))`
- Expected result: `0b3be5850f2f6b98caf29f8fdea89b64a1fa70aa249b8f839bd53baa304d92b2 473d5e6164f58b39dfd84aac…`

#### Assembly steps

**Return value of `Ascon_Hash256_Empty()`**

- `ascon_hash256`
  - `MSG` ←
    - constant `[]`

**Algorithm blocks used by this function**: `ascon_hash256`

**Return value of `Ascon_XOF128_Empty()`**

- `ascon_xof128`
  - `MSG` ←
    - constant `[]`
  - `LEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `ascon_xof128`

**Return value of `Ascon_CXOF128_ABC()`**

- `ascon_cxof128`
  - `MSG` ←
    - constant `[]`
  - `CUSTOM` ←
    - constant `[0x61,0x62,0x63]`
  - `LEN` ←
    - constant `32`

**Algorithm blocks used by this function**: `ascon_cxof128`

**Return value of `Ascon_Decrypt_Empty()`**

- `ascon_decrypt`
  - `KEY` ←
    - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `NONCE` ←
    - constant `[0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1…`
  - `AD` ←
    - constant `[]`
  - `CT` ←
    - constant `[0x4f,0x9c,0x27,0x82,0x11,0xbe,0xc9,0x31,0x6b,0xf6,0x8f,0x4…`

**Algorithm blocks used by this function**: `ascon_decrypt`

