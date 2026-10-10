# 哈希、XOF 与消息认证：分步拼装

填充、压缩、海绵与 HMAC：这一族最接近“从原语拼出完整接口”，也是理解块链的最佳起点。

## 本页覆盖的工作区

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

- 证据类别：标准/官方用例
- 参数范围：SHA-256 单块（<512-bit 消息）
- 依据：NIST SHA-2 示例页（FIPS 180-4 A.2 引用）（SHA-256(abc)，pad→compress 链）
- 核对入口：`print(''.join(f'{w:08x}' for w in sha256_compress([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54…`
- 期望结果：`ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`

#### 拼装步骤

**顶层块（按工作区顺序）**

1. `hash_sha256_pad`（字节序列填充；字节值限 `0..255`，兼容严格 UTF-8 文本）
    - `INPUT` ←
      - 常量 `[0x61,0x62,0x63]`
2. `hash_sha256_compress`（输入 8 个 32-bit 链状态字和恰好 64-byte 消息块；内部扩展调度并执行 64 轮）
    - `V` ←
      - 常量 `[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9…`
    - `W` ←
      - `hash_sha256_pad`（字节序列填充；字节值限 `0..255`，兼容严格 UTF-8 文本）
        - `INPUT` ←
          - 常量 `[0x61,0x62,0x63]`

### `SHA224-Hash`

- 证据类别：标准/官方用例
- 参数范围：SHA-224（全部字节导向用例）
- 依据：FIPS 180-4 定义的 SHA-224；测试来源为 NIST CAVP shabytetestvectors 的 SHA224ShortMsg + SHA224LongMsg 全量字节导向用例（CAVS 11.0）
- 核对入口：`import hashlib`
- 期望结果：`SHA224-OK`

#### 拼装步骤

**函数 `SHA224H(m: bytes)` 的返回值**

- `hash_sha224_hash`（SHA-224 一键哈希（FIPS 180-4：sha256 核 + SHA-224 IV，28 字节输出））
  - `MSG` ←
    - 变量 `m`

**该函数用到的算法块**：`hash_sha224_hash`

### `SHA256-Hash`

- 证据类别：标准/官方用例
- 参数范围：SHA-256（单块 pad→compress 路径；Len ≤ 440 bit）
- 依据：FIPS 180-4 附录 A.2 指向的 NIST SHA-2 示例页（SHA-256(abc)）；另有 NIST CAVP SHA256ShortMsg 中单块（Len ≤ 440 bit）子集
- 核对入口：`msg = b'abc'`
- 期望结果：`ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`

#### 拼装步骤

**函数 `SHA256_Hash(msg: message)` 的返回值**

- `hash_sha256_compress`（输入 8 个 32-bit 链状态字和恰好 64-byte 消息块；内部扩展调度并执行 64 轮）
  - `V` ←
    - 常量 `[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9…`
  - `W` ←
    - `hash_sha256_pad`（字节序列填充；字节值限 `0..255`，兼容严格 UTF-8 文本）
      - `INPUT` ←
        - 变量 `msg`

**该函数用到的算法块**：`hash_sha256_compress` · `hash_sha256_pad`

### `SHA384-Hash`

- 证据类别：标准/官方用例
- 参数范围：SHA-384（全部字节导向用例）
- 依据：FIPS 180-4 定义的 SHA-384；测试来源为 NIST CAVP shabytetestvectors 的 SHA384ShortMsg 全量字节导向用例（CAVS 11.0）
- 核对入口：`print(''.join('%02x' % b for b in SHA384_Hash(b'abc')))`
- 期望结果：`cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca13…`

#### 拼装步骤

**函数 `SHA384_Hash(msg: message)` 的返回值**

- `hash_sha512_hash`（独立 SHA-384/512 封装（SIZE 下拉）：内嵌正确 IV + 截断；官方向量 FIPS 180-4（"abc"）双语言 PASS）：SIZE=384
  - `MSG` ←
    - 变量 `msg`

**该函数用到的算法块**：`hash_sha512_hash`

### `SHA512-Hash`

- 证据类别：标准/官方用例
- 参数范围：SHA-512（全部字节导向用例）
- 依据：FIPS 180-4 定义的 SHA-512；测试来源为 NIST CAVP shabytetestvectors 的 SHA512ShortMsg + SHA512LongMsg 全量字节导向用例（CAVS 11.0）
- 核对入口：`print(''.join('%02x' % b for b in SHA512_Hash(b'abc')))`
- 期望结果：`ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a…`

#### 拼装步骤

**函数 `SHA512_Hash(msg: message)` 的返回值**

- `hash_sha512_hash`（独立 SHA-384/512 封装（SIZE 下拉）：内嵌正确 IV + 截断；官方向量 FIPS 180-4（"abc"）双语言 PASS）：SIZE=512
  - `MSG` ←
    - 变量 `msg`

**该函数用到的算法块**：`hash_sha512_hash`

### `SHA3-Hash`

- 证据类别：与独立实现交叉核对
- 参数范围：SHA3-256（1600-bit 状态、rate 1088）
- 依据：FIPS 202 定义的 SHA3-256（rate=1088、capacity=512）在 "abc" 上的期望值经 Python hashlib 独立复算一致；135 字节用例是项目固定回归。FIPS 202 正文不含附录向量，官方参数化数据须走 CAVP/ACVTS
- 核对入口：`print(''.join('%02x' % b for b in SHA3_Hash(b'abc')))`
- 期望结果：`3a985da74fe225b2045c172d6bd390bd855f086e3e9d525b46bfe24511431532 fded8fd9d6551c601eeb3b7c…`

#### 拼装步骤

**函数 `SHA3_Hash(msg: message)` 的返回值**

- `sha3_hash`（SHA3-224/256/384/512（SIZE 下拉）；仅支持字节对齐输入；双语言固定结果覆盖 `abc` 和各自 rate−1 字节输入…）：SIZE=256
  - `MSG` ←
    - 变量 `msg`

**该函数用到的算法块**：`sha3_hash`

### `SM3-Hash`

- 证据类别：标准/官方用例
- 参数范围：SM3-256
- 依据：GB/T 32905-2016 A.1 SM3("abc")
- 核对入口：`print(''.join(f'{x:08x}' for x in SM3_Hash('abc')))`
- 期望结果：`66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0`

#### 拼装步骤

**函数 `SM3_Hash(msg: message)` 的返回值**

- `hash_sm3_compress`（64 轮压缩函数；输入为状态 V 和填充后的块 W）
  - `V` ←
    - 常量 `[0x7380166f,0x4914b2b9,0x172442d7,0xda8a0600,0xa96f30bc,0x1…`
  - `W` ←
    - `hash_sm3_pad`（512-bit 分组填充，长度字段为 64-bit 大端；字节值限 `0..255`，兼容严格 UTF-8 文本）
      - `INPUT` ←
        - 变量 `msg`

**该函数用到的算法块**：`hash_sm3_compress` · `hash_sm3_pad`

### `HMAC-SHA256`

- 证据类别：标准/官方用例
- 参数范围：HMAC-SHA-256（CAVP [L=32] 全量；Tlen 覆盖用例给定值）
- 依据：HMAC 规范见 FIPS 198-1；测试来源为 NIST CAVP hmactestvectors 的 [L=32] 段（HMAC-SHA-256）全部 225 例（CAVS 11.0，按 Tlen 截断比较）
- 核对入口：`key = bytes([0x0b]*20)`
- 期望结果：`b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7`

#### 拼装步骤

**函数 `HMAC_SHA256(key: bytes, msg: bytes)` 的返回值**

- `hash_hmac`（HMAC；SHA-256 对应 FIPS 198-1 的批准底层哈希范围，SM3-HMAC 是项目扩展，不是 NIST 批准选项）
  - `KEY` ←
    - 变量 `key`
  - `MSG` ←
    - 变量 `msg`

**该函数用到的算法块**：`hash_hmac`

