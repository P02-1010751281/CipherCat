# 对称密码与工作模式

分组密码、工作模式与认证加密：先按标准轮/模式拼出链，再用接口块或模式块做组合。

## 本页覆盖的工作区

| 工作区 | 文件 |
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

### AES-Atomic-Round

- 证据类别：项目固定回归（非官方向量）
- 依据：四个原子轮原语按工作区顺序原地修改共享状态，固定值 4807…c59f；非官方附录向量
- 核对入口：`print(''.join(f'{b:02x}' for b in i))`
- 期望结果：`4807f3cfdcc929d006f1297cdb24c59f`

#### 拼装步骤

**顶层块（按工作区顺序）**

1. `variables_set`：变量=b28a4a7f346e44968c2b
    - `VALUE` ←
      - 常量 `[0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xb…`
2. `variables_set`：变量=ccd1658163e44eb6b76a
    - `VALUE` ←
      - 常量 `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`
3. `aes_sub_bytes`（S-box替换16字节）
    - `STATE` ←
      - 变量 `b28a4a7f346e44968c2b`
4. `aes_shift_rows`（行循环左移）
    - `STATE` ←
      - 变量 `b28a4a7f346e44968c2b`
5. `aes_mix_columns`（GF(2⁸)列混合）
    - `STATE` ←
      - 变量 `b28a4a7f346e44968c2b`
6. `aes_add_round_key`（⊕轮密钥）
    - `STATE` ←
      - 变量 `b28a4a7f346e44968c2b`
    - `ROUND_KEY` ←
      - 变量 `ccd1658163e44eb6b76a`

### Procedure-AES-Round

- 证据类别：项目固定回归（非官方向量）
- 依据：显式值连接轮函数的固定输入回归 4807…c59f；非官方附录向量
- 核对入口：`state = [0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff]`
- 期望结果：`4807f3cfdcc929d006f1297cdb24c59f`

#### 拼装步骤

**函数 `AES_Round(state: int_list, round_key: int_list)` 的返回值**

- `aes_add_round_key`（⊕轮密钥）
  - `STATE` ←
    - `aes_mix_columns`（GF(2⁸)列混合）
      - `STATE` ←
        - `aes_shift_rows`（行循环左移）
          - …（更深层的输入见工作区）
  - `ROUND_KEY` ←
    - 变量 `round_key`

**该函数用到的算法块**：`aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes`

### AES-Round

- 证据类别：项目固定回归（非官方向量）
- 依据：正常轮 + 末轮（去 MixColumns）固定输入回归；不声称为官方完整加密向量
- 核对入口：`state = [0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff]`
- 期望结果：`4807f3cfdcc929d006f1297cdb24c59f`

#### 拼装步骤

**函数 `AES_Round(state: int_list, round_key: int_list)` 的返回值**

- `aes_add_round_key`（⊕轮密钥）
  - `STATE` ←
    - `aes_mix_columns`（GF(2⁸)列混合）
      - `STATE` ←
        - `aes_shift_rows`（行循环左移）
          - …（更深层的输入见工作区）
  - `ROUND_KEY` ←
    - 变量 `round_key`

**该函数用到的算法块**：`aes_add_round_key` · `aes_mix_columns` · `aes_shift_rows` · `aes_sub_bytes`

### AES-LastRound

- 证据类别：项目固定回归（非官方向量）
- 依据：末轮固定输入回归；不声称为官方完整加密向量
- 核对入口：`state = [0x63,0x53,0xe0,0x8c,0x09,0x60,0xd1,0x04,0xcd,0xb7,0xd1,0x0c,0x0c,0x5c,0x4e,0x7d]`
- 期望结果：`2bc4c757c8470aed5c75ed3a488e3258`

#### 拼装步骤

**函数 `AES_LastRound(state: int_list, round_key: int_list)` 的返回值**

- `aes_add_round_key`（⊕轮密钥）
  - `STATE` ←
    - `aes_shift_rows`（行循环左移）
      - `STATE` ←
        - `aes_sub_bytes`（S-box替换16字节）
          - …（更深层的输入见工作区）
  - `ROUND_KEY` ←
    - 变量 `round_key`

**该函数用到的算法块**：`aes_add_round_key` · `aes_shift_rows` · `aes_sub_bytes`

### SM4-Atomic-Round

- 证据类别：标准/官方用例
- 参数范围：SM4-128 单轮
- 依据：GB/T 32907-2016 附录 A 首轮输出 27fad345
- 核对入口：`print(''.join(f'{b:02x}' for b in n))`
- 期望结果：`27fad345`

#### 拼装步骤

**顶层块（按工作区顺序）**

1. `variables_set`：变量=965fcadff19d47b5bc51
    - `VALUE` ←
      - 常量 `[0x01,0x23,0x45,0x67]`
2. `variables_set`：变量=a42334adadb043aa9e1c
    - `VALUE` ←
      - 常量 `[0x89,0xab,0xcd,0xef]`
3. `variables_set`：变量=ca96b6e148a546aeafff
    - `VALUE` ←
      - 常量 `[0xfe,0xdc,0xba,0x98]`
4. `variables_set`：变量=b17ec8c7bfcd419ba802
    - `VALUE` ←
      - 常量 `[0x76,0x54,0x32,0x10]`
5. `variables_set`：变量=0f6389d6271a43f58da1
    - `VALUE` ←
      - `sm4_round_func`（轮函数 F(X0,X1,X2,X3,rk)）
        - `X0` ←
          - 变量 `965fcadff19d47b5bc51`
        - `X1` ←
          - 变量 `a42334adadb043aa9e1c`
        - `X2` ←
          - 变量 `ca96b6e148a546aeafff`
        - `X3` ←
          - 变量 `b17ec8c7bfcd419ba802`
        - `RK` ←
          - 常量 `0xF12186F9`

### Procedure-SM4-Round

- 证据类别：标准/官方用例
- 参数范围：SM4-128 轮函数
- 依据：GB/T 32907-2016 附录 A 首轮输出 27FAD345
- 核对入口：`state_0 = [0x01,0x23,0x45,0x67]`
- 期望结果：`27fad345`

#### 拼装步骤

**函数 `SM4_Round(state_0: int, state_1: int, state_2: int, state_3: int, rk: int)` 的返回值**

- `sm4_round_func`（轮函数 F(X0,X1,X2,X3,rk)）
  - `X0` ←
    - 变量 `state_0`
  - `X1` ←
    - 变量 `state_1`
  - `X2` ←
    - 变量 `state_2`
  - `X3` ←
    - 变量 `state_3`
  - `RK` ←
    - 变量 `rk`

**该函数用到的算法块**：`sm4_round_func`

### SM4-Round

- 证据类别：标准/官方用例
- 参数范围：SM4-128 轮函数（首轮密钥 0xf12186f9）
- 依据：GB/T 32907-2016 附录 A 首轮输出 27FAD345（仅此轮向量）
- 核对入口：`state_0 = [0x01,0x23,0x45,0x67]`
- 期望结果：`27fad345`

#### 拼装步骤

**函数 `SM4_Round(state_0: int, state_1: int, state_2: int, state_3: int, rk: int)` 的返回值**

- `sm4_round_func`（轮函数 F(X0,X1,X2,X3,rk)）
  - `X0` ←
    - 变量 `state_0`
  - `X1` ←
    - 变量 `state_1`
  - `X2` ←
    - 变量 `state_2`
  - `X3` ←
    - 变量 `state_3`
  - `RK` ←
    - 变量 `rk`

**该函数用到的算法块**：`sm4_round_func`

### SM4-Sbox

- 证据类别：标准/官方用例
- 参数范围：SM4-128 字节代换表
- 依据：GB/T 32907-2016 附录 A（S(0x01)=0x90）
- 核对入口：`print(SM4_Sbox(1))`
- 期望结果：`144`

#### 拼装步骤

**函数 `SM4_Sbox(x: int)` 的返回值**

- `sm4_sbox`（GB/T 32907-2016 字节 S 盒查表；输入限 0–255 整数）
  - `INPUT` ←
    - 变量 `x`

**该函数用到的算法块**：`sm4_sbox`

### Mode-ECB

- 证据类别：标准/官方用例
- 参数范围：AES-128 ECB（单块；CAVP KAT 全例）
- 依据：FIPS 197 附录 C.1（AES-128 ECB）；并逐例核对 NIST CAVP AESVS KAT 的 128-bit ECB 四文件（ECBGFSbox/ECBKeySbox/ECBVarKey/ECBVarTxt）
- 核对入口：`print(bytes(ECB()).hex())`
- 期望结果：`3ad77bb40d7a3660a89ecaf32466ef97`

#### 拼装步骤

**函数 `ECB()` 的返回值**

- `mode_ecb_encrypt`（AES-ECB 加密（仅教学））
  - `DATA` ←
    - 常量 `[0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x1…`
  - `KEY` ←
    - 常量 `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`

**该函数用到的算法块**：`mode_ecb_encrypt`

### Mode-CBC

- 证据类别：标准/官方用例
- 参数范围：AES-128 CBC（16B key/IV）
- 依据：SP 800-38A F.2.1 CBC-AES128.Encrypt
- 核对入口：`print(bytes(CBC()).hex())`
- 期望结果：`7649abac8119b246cee98e9b12e9197d`

#### 拼装步骤

**函数 `CBC()` 的返回值**

- `mode_cbc_encrypt`（AES-CBC 加密(需IV)）
  - `DATA` ←
    - 常量 `[0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x1…`
  - `KEY` ←
    - 常量 `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`
  - `IV` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`

**该函数用到的算法块**：`mode_cbc_encrypt`

### Mode-CTR

- 证据类别：标准/官方用例
- 参数范围：AES-128 CTR（16B key、16B 初始计数器块）
- 依据：SP 800-38A F.5.1 CTR-AES128.Encrypt
- 核对入口：`print(bytes(CTR()).hex())`
- 期望结果：`874d6191b620e3261bef6864990db6ce`

#### 拼装步骤

**函数 `CTR()` 的返回值**

- `mode_ctr_encrypt`（AES-CTR 加密(需nonce)）
  - `DATA` ←
    - 常量 `[0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x1…`
  - `KEY` ←
    - 常量 `[0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x8…`
  - `NONCE` ←
    - 常量 `[0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9,0xfa,0xf…`

**该函数用到的算法块**：`mode_ctr_encrypt`

### GCM-Encrypt

- 证据类别：标准/官方用例
- 参数范围：AES-128 GCM；96-bit IV、tagLen=128（ACVP tgId=1 全 15 例）；项目另有 120-bit IV/AAD 变体
- 依据：算法定义见 NIST SP 800-38D；测试来源为 NIST ACVP AES-GCM 官方用例（tgId=1，encrypt、tagLen=128、96-bit IV，15 例，含 tcId；这 15 例均为空明文）。注意：SP 800-38D 正文与附录不含测试用例表，TC 编号属 GCM 规范（McGrew…
- 核对入口：`print(''.join(f'{x:02x}' for x in GCM_Encrypt()))`
- 期望结果：`42831ec2217774244b7221b784d0d49ce3aa212f2c02a4e035c17e2329aca12e21d514b25466931c7d8f6a5aa…`

#### 拼装步骤

**函数 `GCM_Encrypt()` 的返回值**

- `gcm_encrypt`
  - `KEY` ←
    - 常量 `[0xfe,0xff,0xe9,0x92,0x86,0x65,0x73,0x1c,0x6d,0x6a,0x8f,0x9…`
  - `IV` ←
    - 常量 `[0xca,0xfe,0xba,0xbe,0xfa,0xce,0xdb,0xad,0xde,0xca,0xf8,0x8…`
  - `AAD` ←
    - 常量 `[]`
  - `MSG` ←
    - 常量 `[0xd9,0x31,0x32,0x25,0xf8,0x84,0x06,0xe5,0xa5,0x59,0x09,0xc…`

**该函数用到的算法块**：`gcm_encrypt`

### CCM-Encrypt

- 证据类别：标准/官方用例
- 参数范围：AES-128 CCM：Example 1（N=7B、A=8B、P=4B、Tlen=4）、Example 2（N=8B、A=16B、P=16B、Tlen=6）、Example 3（N=12B、A=20B、P=24B、Tlen=8）
- 依据：SP 800-38C 附录 C Example 1、Example 2、Example 3
- 核对入口：`print(''.join(f'{x:02x}' for x in CCM_Encrypt()))`
- 期望结果：`e3b201a9f5b71a7a9b1ceaeccd97e70b6176aad9a4428aa5484392fbc1b09951 7162015b4dac255d d2a1f0e…`

#### 拼装步骤

**函数 `CCM_Encrypt()` 的返回值**

- `ccm_encrypt`：TAGLEN=8
  - `KEY` ←
    - 常量 `[0x40,0x41,0x42,0x43,0x44,0x45,0x46,0x47,0x48,0x49,0x4a,0x4…`
  - `NONCE` ←
    - 常量 `[0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1…`
  - `AAD` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `MSG` ←
    - 常量 `[0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2a,0x2…`

**该函数用到的算法块**：`ccm_encrypt`

### XTS-Encrypt

- 证据类别：项目固定回归（非官方向量）
- 参数范围：AES-128 XTS（32B key 拆两半、16B tweak、支持密文窃取）
- 依据：IEEE 1619-2007 XTS-AES-128 经典向量（key=00..1f、tweak=00000000000000000102030405060708、64 字节数据单元）；该标准为付费文档且未随仓库分发，仓库内无可离线核对的来源，故不登记为官方向量
- 核对入口：`print(''.join(f'{x:02x}' for x in XTS_Encrypt()))`
- 期望结果：`76cbc38d4c92206b50338462cbc8795a74f66940f3300ce2aeb061b81dd5cc7233ecdaf43dc3db2f2a8d7a6e0…`

#### 拼装步骤

**函数 `XTS_Encrypt()` 的返回值**

- `xts_encrypt`
  - `KEY` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `TWEAK` ←
    - 常量 `[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x01,0x02,0x03,0x0…`
  - `MSG` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`

**该函数用到的算法块**：`xts_encrypt`

### ASCON

- 证据类别：标准/官方用例
- 参数范围：Ascon-AEAD128（固定样例）；Hash256/XOF128/CXOF128（ACVP 字节对齐用例，outLen ≤ 4096 字节子集）
- 依据：NIST SP 800-232 Ascon AEAD128 文档示例（固定样例）；Hash256/XOF128/CXOF128 另对齐 NIST ACVP 官方用例（ACVP-Ascon-*-SP800-232，字节对齐子集，含 tgId/tcId）
- 核对入口：`print(''.join(f'{x:02x}' for x in Ascon_Encrypt()))`
- 期望结果：`96107d8a29a7529a7941bdc7df1fe3c6c7ea70d7986e7b59cd0d357239f5d25bf5 4f9c278211bec9316bf68f…`

#### 拼装步骤

**函数 `Ascon_Encrypt()` 的返回值**

- `ascon_encrypt`
  - `KEY` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `NONCE` ←
    - 常量 `[0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1…`
  - `AD` ←
    - 常量 `[0x30]`
  - `MSG` ←
    - 常量 `[0x20,0x21,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2a,0x2…`

**该函数用到的算法块**：`ascon_encrypt`

### ASCON-Extended

- 证据类别：项目固定回归（非官方向量）
- 依据：扩展固定样例与错误标签/参数拒绝；非完整 KAT
- 核对入口：`print(''.join(f'{x:02x}' for x in Ascon_Hash256_Empty()))`
- 期望结果：`0b3be5850f2f6b98caf29f8fdea89b64a1fa70aa249b8f839bd53baa304d92b2 473d5e6164f58b39dfd84aac…`

#### 拼装步骤

**函数 `Ascon_Hash256_Empty()` 的返回值**

- `ascon_hash256`
  - `MSG` ←
    - 常量 `[]`

**该函数用到的算法块**：`ascon_hash256`

**函数 `Ascon_XOF128_Empty()` 的返回值**

- `ascon_xof128`
  - `MSG` ←
    - 常量 `[]`
  - `LEN` ←
    - 常量 `32`

**该函数用到的算法块**：`ascon_xof128`

**函数 `Ascon_CXOF128_ABC()` 的返回值**

- `ascon_cxof128`
  - `MSG` ←
    - 常量 `[]`
  - `CUSTOM` ←
    - 常量 `[0x61,0x62,0x63]`
  - `LEN` ←
    - 常量 `32`

**该函数用到的算法块**：`ascon_cxof128`

**函数 `Ascon_Decrypt_Empty()` 的返回值**

- `ascon_decrypt`
  - `KEY` ←
    - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
  - `NONCE` ←
    - 常量 `[0x10,0x11,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1a,0x1…`
  - `AD` ←
    - 常量 `[]`
  - `CT` ←
    - 常量 `[0x4f,0x9c,0x27,0x82,0x11,0xbe,0xc9,0x31,0x6b,0xf6,0x8f,0x4…`

**该函数用到的算法块**：`ascon_decrypt`

