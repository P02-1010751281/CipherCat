# Hashing, XOF, and message authentication: step-by-step assembly

Padding, compression, sponge, and HMAC: this family is the closest thing to assembling a full interface from primitives and is the best place to learn block chains.

## Workspaces on this page

| | |
|---|---|
| `SHA256-Atomic-Hash` | `demos/SHA256-Atomic-Hash.json` |
| `SHA224-Hash` | `demos/procedures/SHA224-Hash.json` |
| `SHA256-Hash` | `demos/procedures/SHA256-Hash.json` |
| `SHA384-Hash` | `demos/procedures/SHA384-Hash.json` |
| `SHA512-Hash` | `demos/procedures/SHA512-Hash.json` |
| `SHA3-Hash` | `demos/procedures/SHA3-Hash.json` |
| `SM3-Hash` | `demos/procedures/SM3-Hash.json` |
| `HMAC-SHA256` | `demos/procedures/HMAC-SHA256.json` |

### `SHA256-Atomic-Hash`

- Evidence class: standards or official cases
- Parameter scope: SHA-256 单块（<512-bit 消息）（source text in Chinese）
- Basis: NIST SHA-2 示例页（FIPS 180-4 A.2 引用）（SHA-256(abc)，pad→compress 链）（source text in Chinese）
- Check: `print(''.join(f'{w:08x}' for w in sha256_compress([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54…`
- Expected result: `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`

#### Assembly steps

**Top-level blocks (workspace order)**

1. `hash_sha256_pad` (Byte-sequence padding; byte values must be `0` to `255`; strict UTF-8 t…)
    - `INPUT` ←
      - constant `[0x61,0x62,0x63]`
2. `hash_sha256_compress` (Requires 8 32-bit chaining words and exactly one 64-byte message block;…)
    - `V` ←
      - constant `[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9…`
    - `W` ←
      - `hash_sha256_pad` (Byte-sequence padding; byte values must be `0` to `255`; strict UTF-8 t…)
        - `INPUT` ←
          - constant `[0x61,0x62,0x63]`

### `SHA224-Hash`

- Evidence class: standards or official cases
- Parameter scope: SHA-224（全部字节导向用例）（source text in Chinese）
- Basis: FIPS 180-4 定义的 SHA-224；测试来源为 NIST CAVP shabytetestvectors 的 SHA224ShortMsg + SHA224LongMsg 全量字节导向用例（CAVS 11.0）（source text in Chinese）
- Check: `import hashlib`
- Expected result: `SHA224-OK`

#### Assembly steps

**Return value of `SHA224H(m: bytes)`**

- `hash_sha224_hash` (SHA-224 one-shot hash (FIPS 180-4: sha256 core + SHA-224 IV, 28-byte ou…)
  - `MSG` ←
    - variable `m`

**Algorithm blocks used by this function**: `hash_sha224_hash`

### `SHA256-Hash`

- Evidence class: standards or official cases
- Parameter scope: SHA-256（单块 pad→compress 路径；Len ≤ 440 bit）（source text in Chinese）
- Basis: FIPS 180-4 附录 A.2 指向的 NIST SHA-2 示例页（SHA-256(abc)）；另有 NIST CAVP SHA256ShortMsg 中单块（Len ≤ 440 bit）子集（source text in Chinese）
- Check: `msg = b'abc'`
- Expected result: `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`

#### Assembly steps

**Return value of `SHA256_Hash(msg: message)`**

- `hash_sha256_compress` (Requires 8 32-bit chaining words and exactly one 64-byte message block;…)
  - `V` ←
    - constant `[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9…`
  - `W` ←
    - `hash_sha256_pad` (Byte-sequence padding; byte values must be `0` to `255`; strict UTF-8 t…)
      - `INPUT` ←
        - variable `msg`

**Algorithm blocks used by this function**: `hash_sha256_compress` · `hash_sha256_pad`

### `SHA384-Hash`

- Evidence class: standards or official cases
- Parameter scope: SHA-384（全部字节导向用例）（source text in Chinese）
- Basis: FIPS 180-4 定义的 SHA-384；测试来源为 NIST CAVP shabytetestvectors 的 SHA384ShortMsg 全量字节导向用例（CAVS 11.0）（source text in Chinese）
- Check: `print(''.join('%02x' % b for b in SHA384_Hash(b'abc')))`
- Expected result: `cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca13…`

#### Assembly steps

**Return value of `SHA384_Hash(msg: message)`**

- `hash_sha512_hash` (SHA-384/512 one-shot wrapper (`SIZE` dropdown), with the standard IV an…): SIZE=384
  - `MSG` ←
    - variable `msg`

**Algorithm blocks used by this function**: `hash_sha512_hash`

### `SHA512-Hash`

- Evidence class: standards or official cases
- Parameter scope: SHA-512（全部字节导向用例）（source text in Chinese）
- Basis: FIPS 180-4 定义的 SHA-512；测试来源为 NIST CAVP shabytetestvectors 的 SHA512ShortMsg + SHA512LongMsg 全量字节导向用例（CAVS 11.0）（source text in Chinese）
- Check: `print(''.join('%02x' % b for b in SHA512_Hash(b'abc')))`
- Expected result: `ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a…`

#### Assembly steps

**Return value of `SHA512_Hash(msg: message)`**

- `hash_sha512_hash` (SHA-384/512 one-shot wrapper (`SIZE` dropdown), with the standard IV an…): SIZE=512
  - `MSG` ←
    - variable `msg`

**Algorithm blocks used by this function**: `hash_sha512_hash`

### `SHA3-Hash`

- Evidence class: cross-checked with an independent implementation
- Parameter scope: SHA3-256（1600-bit 状态、rate 1088）（source text in Chinese）
- Basis: FIPS 202 定义的 SHA3-256（rate=1088、capacity=512）在 "abc" 上的期望值经 Python hashlib 独立复算一致；135 字节用例是项目固定回归。FIPS 202 正文不含附录向量，官方参数化数据须走 CAVP/ACVTS（source text in Chinese）
- Check: `print(''.join('%02x' % b for b in SHA3_Hash(b'abc')))`
- Expected result: `3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532 fded8fd9d6551c601eeb3b7c…`

#### Assembly steps

**Return value of `SHA3_Hash(msg: message)`**

- `sha3_hash` (SHA3-224/256/384/512 (`SIZE` dropdown); byte-aligned inputs only; fixed…): SIZE=256
  - `MSG` ←
    - variable `msg`

**Algorithm blocks used by this function**: `sha3_hash`

### `SM3-Hash`

- Evidence class: standards or official cases
- Parameter scope: SM3-256
- Basis: GB/T 32905-2016 A.1 SM3("abc")
- Check: `print(''.join(f'{x:08x}' for x in SM3_Hash('abc')))`
- Expected result: `66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0`

#### Assembly steps

**Return value of `SM3_Hash(msg: message)`**

- `hash_sm3_compress` (64-round compression; inputs are the state V and the padded block W)
  - `V` ←
    - constant `[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x1…`
  - `W` ←
    - `hash_sm3_pad` (512-bit block padding with a 64-bit big-endian length; byte values must…)
      - `INPUT` ←
        - variable `msg`

**Algorithm blocks used by this function**: `hash_sm3_compress` · `hash_sm3_pad`

### `HMAC-SHA256`

- Evidence class: standards or official cases
- Parameter scope: HMAC-SHA-256（CAVP [L=32] 全量；Tlen 覆盖用例给定值）（source text in Chinese）
- Basis: HMAC 规范见 FIPS 198-1；测试来源为 NIST CAVP hmactestvectors 的 [L=32] 段（HMAC-SHA-256）全部 225 例（CAVS 11.0，按 Tlen 截断比较）（source text in Chinese）
- Check: `key = bytes([0x0b]*20)`
- Expected result: `b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7`

#### Assembly steps

**Return value of `HMAC_SHA256(key: bytes, msg: bytes)`**

- `hash_hmac` (HMAC; SHA-256 uses an approved underlying hash within the FIPS 198-1 sc…)
  - `KEY` ←
    - variable `key`
  - `MSG` ←
    - variable `msg`

**Algorithm blocks used by this function**: `hash_hmac`

