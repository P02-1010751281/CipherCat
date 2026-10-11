# 后量子密码（格基与共享构件）

ML-KEM 的封装链完全由原语拼出；ML-DSA 的签名接口是单块，底层原语另有示例。

## 本页覆盖的工作区

| 工作区 | 文件 |
|---|---|
| `ML-KEM-Atomic` | `demos/ML-KEM-Atomic.json` |
| `ML-KEM-Encaps` | `demos/procedures/ML-KEM-Encaps.json` |
| `ML-DSA-NTT` | `demos/procedures/ML-DSA-NTT.json` |
| `ML-DSA-Primitives` | `demos/procedures/ML-DSA-Primitives.json` |
| `ML-DSA-Sign` | `demos/procedures/ML-DSA-Sign.json` |

### ML-KEM-Atomic

- 证据类别：代数或结构性质
- 依据：CBD 采样与 NTT 冲激响应性质；pq_mat_vec_mul 为非标准标量教学辅助
- 核对入口：`print(','.join(str(x) for x in sample_poly_cbd_eta2(list(range(128)), q=3329)[:4]))`
- 期望结果：`0,0,1,0 NTT_IMPULSE_OK 2566,870,1565,1884 5,11`

#### 拼装步骤

**顶层块（按工作区顺序）**

1. `data_value`：NUM=[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x0…
2. `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
    - `SEED` ←
      - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
3. `pq_ntt`（固定 256 系数：q=3329 为 ML-KEM，q=8380417 为 ML-DSA，q=12289 为 256 点循环 NTT 教学分支）：MODULUS=3329，DEGREE=256
    - `INPUT` ←
      - 常量 `[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,…`
4. `pq_sample_ntt`（q=3329 对应 FIPS 203 Alg 7；q=8380417 对应 FIPS 204 Alg 30；实现固定吸收 768 字节，仍需对…）：MODULUS=3329
    - `SEED` ←
      - 常量 `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
5. `variables_set`：变量=scalarMatVecResult
    - `VALUE` ←
      - `pq_mat_vec_mul`（标量模矩阵×向量教学辅助；不是多项式环矩阵运算）：MODULUS=3329
        - `MATRIX` ←
          - 常量 `[0x01,0x02,0x03,0x04]`
        - `VEC` ←
          - 常量 `[0x01,0x02]`

### ML-KEM-Encaps

- 证据类别：项目固定回归（非官方向量）
- 参数范围：ML-KEM-512（encapsulation；输出 c‖K）
- 依据：本工作区登记的输入/期望值是项目固定回归，不取自 ACVP；同一实现在 tests/unit/mlkem-acvp-official-vectors.test.ts 中用 NIST ACVP ML-KEM-encapDecap-FIPS203 internalProjection testGroup tgId=1（M…
- 核对入口：`print(bytes(ML_KEM_Encaps(bytes.fromhex('3b7899078bb3ca44bb31d6a8f8532706ac7bb4c122ef129d…`
- 期望结果：`b757c7d5a7ccb660b81cfd9684941d52c162c2b6a2370bae19fdd391d3879c224cfe70c44aaa3adc9141a4d7a…`

#### 拼装步骤

**函数 `ML_KEM_Encaps(ek: bytes, m: bytes)` 的过程体（按顺序）**

1. `variables_set`：变量=H
    - `VALUE` ←
      - `sponge_squeeze`（海绵挤压）：RATE=1088
        - `STATE` ←
          - `sponge_absorb`（海绵吸收；输入长度须为 rate 字节整数倍，不对短尾块补零）：RATE=1088
            - `STATE` ←
              - `keccak_state_init`（为 Keccak-f 生成包含 25 个零 lane 的状态）
            - `BLOCK` ←
              - `sponge_pad`（pad10*1填充；字节值限 `0..255`，文本按严格 UTF-8 编码）：RATE=1088，SUFFIX=0x06
                - …（更深层的输入见工作区）
        - `OUTLEN` ←
          - 常量 `32`
2. `variables_set`：变量=G
    - `VALUE` ←
      - `sponge_squeeze`（海绵挤压）：RATE=576
        - `STATE` ←
          - `sponge_absorb`（海绵吸收；输入长度须为 rate 字节整数倍，不对短尾块补零）：RATE=576
            - `STATE` ←
              - `keccak_state_init`（为 Keccak-f 生成包含 25 个零 lane 的状态）
            - `BLOCK` ←
              - `sponge_pad`（pad10*1填充；字节值限 `0..255`，文本按严格 UTF-8 编码）：RATE=576，SUFFIX=0x06
                - …（更深层的输入见工作区）
        - `OUTLEN` ←
          - 常量 `64`
3. `variables_set`：变量=Kp
    - `VALUE` ←
      - `pq_bytes_slice`（取 `[start, end)` 区间）
        - `INPUT` ←
          - `sponge_squeeze`（海绵挤压）：RATE=576
            - `STATE` ←
              - `sponge_absorb`（海绵吸收；输入长度须为 rate 字节整数倍，不对短尾块补零）：RATE=576
                - …（更深层的输入见工作区）
            - `OUTLEN` ←
              - 常量 `64`
        - `START` ←
          - 常量 `0`
        - `END` ←
          - 常量 `32`
4. `variables_set`：变量=r
    - `VALUE` ←
      - `pq_bytes_slice`（取 `[start, end)` 区间）
        - `INPUT` ←
          - `sponge_squeeze`（海绵挤压）：RATE=576
            - `STATE` ←
              - `sponge_absorb`（海绵吸收；输入长度须为 rate 字节整数倍，不对短尾块补零）：RATE=576
                - …（更深层的输入见工作区）
            - `OUTLEN` ←
              - 常量 `64`
        - `START` ←
          - 常量 `32`
        - `END` ←
          - 常量 `64`
5. `variables_set`：变量=rho
    - `VALUE` ←
      - `pq_bytes_slice`（取 `[start, end)` 区间）
        - `INPUT` ←
          - 变量 `ek`
        - `START` ←
          - 常量 `768`
        - `END` ←
          - 常量 `800`
6. `variables_set`：变量=t0
    - `VALUE` ←
      - `pq_byte_decode`（Alg 6）：BITS=12
        - `INPUT` ←
          - `pq_bytes_slice`（取 `[start, end)` 区间）
            - `INPUT` ←
              - 变量 `ek`
            - `START` ←
              - 常量 `0`
            - `END` ←
              - 常量 `384`
7. `variables_set`：变量=t1
    - `VALUE` ←
      - `pq_byte_decode`（Alg 6）：BITS=12
        - `INPUT` ←
          - `pq_bytes_slice`（取 `[start, end)` 区间）
            - `INPUT` ←
              - 变量 `ek`
            - `START` ←
              - 常量 `384`
            - `END` ←
              - 常量 `768`
8. `variables_set`：变量=A00
    - `VALUE` ←
      - `pq_sample_ntt`（q=3329 对应 FIPS 203 Alg 7；q=8380417 对应 FIPS 204 Alg 30；实现固定吸收 768 字节，仍需对…）：MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
            - `SEED` ←
              - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `0`
9. `variables_set`：变量=A01
    - `VALUE` ←
      - `pq_sample_ntt`（q=3329 对应 FIPS 203 Alg 7；q=8380417 对应 FIPS 204 Alg 30；实现固定吸收 768 字节，仍需对…）：MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
            - `SEED` ←
              - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `0`
10. `variables_set`：变量=A10
    - `VALUE` ←
      - `pq_sample_ntt`（q=3329 对应 FIPS 203 Alg 7；q=8380417 对应 FIPS 204 Alg 30；实现固定吸收 768 字节，仍需对…）：MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
            - `SEED` ←
              - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `1`
11. `variables_set`：变量=A11
    - `VALUE` ←
      - `pq_sample_ntt`（q=3329 对应 FIPS 203 Alg 7；q=8380417 对应 FIPS 204 Alg 30；实现固定吸收 768 字节，仍需对…）：MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
            - `SEED` ←
              - `pq_seed_with_nonce`（把单字节 nonce 拼到 seed 之后）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `1`
12. `variables_set`：变量=s0
    - `VALUE` ←
      - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=3，MODULUS=3329
        - `SEED` ←
          - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice`（取 `[start, end)` 区间）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `0`
            - `OUTLEN` ←
              - 常量 `192`
13. `variables_set`：变量=s1
    - `VALUE` ←
      - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=3，MODULUS=3329
        - `SEED` ←
          - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice`（取 `[start, end)` 区间）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `1`
            - `OUTLEN` ←
              - 常量 `192`
14. `variables_set`：变量=e1_0
    - `VALUE` ←
      - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
        - `SEED` ←
          - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice`（取 `[start, end)` 区间）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `2`
            - `OUTLEN` ←
              - 常量 `128`
15. `variables_set`：变量=e1_1
    - `VALUE` ←
      - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
        - `SEED` ←
          - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice`（取 `[start, end)` 区间）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `3`
            - `OUTLEN` ←
              - 常量 `128`
16. `variables_set`：变量=e2
    - `VALUE` ←
      - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
        - `SEED` ←
          - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice`（取 `[start, end)` 区间）
                - …（更深层的输入见工作区）
            - `NONCE` ←
              - 常量 `4`
            - `OUTLEN` ←
              - 常量 `128`
17. `variables_set`：变量=sh0
    - `VALUE` ←
      - `pq_ntt`（固定 256 系数：q=3329 为 ML-KEM，q=8380417 为 ML-DSA，q=12289 为 256 点循环 NTT 教学分支）：MODULUS=3329，DEGREE=256
        - `INPUT` ←
          - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=3，MODULUS=3329
            - `SEED` ←
              - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
                - …（更深层的输入见工作区）
18. `variables_set`：变量=sh1
    - `VALUE` ←
      - `pq_ntt`（固定 256 系数：q=3329 为 ML-KEM，q=8380417 为 ML-DSA，q=12289 为 256 点循环 NTT 教学分支）：MODULUS=3329，DEGREE=256
        - `INPUT` ←
          - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=3，MODULUS=3329
            - `SEED` ←
              - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
                - …（更深层的输入见工作区）
19. `variables_set`：变量=u0
    - `VALUE` ←
      - `pq_poly_add`
        - `A` ←
          - `pq_intt`（逆变换；`n=256` 且输入 256 系数；q=12289 分支与教学 NTT 互逆）：MODULUS=3329，DEGREE=256
            - `INPUT` ←
              - `pq_poly_add`
                - …（更深层的输入见工作区）
        - `B` ←
          - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
            - `SEED` ←
              - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
                - …（更深层的输入见工作区）
20. `variables_set`：变量=u1
    - `VALUE` ←
      - `pq_poly_add`
        - `A` ←
          - `pq_intt`（逆变换；`n=256` 且输入 256 系数；q=12289 分支与教学 NTT 互逆）：MODULUS=3329，DEGREE=256
            - `INPUT` ←
              - `pq_poly_add`
                - …（更深层的输入见工作区）
        - `B` ←
          - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
            - `SEED` ←
              - `pq_prf`（`SHAKE(seed‖nonce-byte)`；seed 同样仅支持字节对齐数据，nonce 为 `0..255`。仅 32-byte se…）：ALGO=SHAKE256
                - …（更深层的输入见工作区）
21. `variables_set`：变量=v
    - `VALUE` ←
      - `pq_poly_add`
        - `A` ←
          - `pq_poly_add`
            - `A` ←
              - `pq_intt`（逆变换；`n=256` 且输入 256 系数；q=12289 分支与教学 NTT 互逆）：MODULUS=3329，DEGREE=256
                - …（更深层的输入见工作区）
            - `B` ←
              - `pq_sample_poly_cbd`（q=3329、η∈{2,3} 对应 FIPS 203 Alg 8；q=8380417 不是 ML-KEM 标准参数组合）：ETA=2，MODULUS=3329
                - …（更深层的输入见工作区）
        - `B` ←
          - `pq_decompress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=1，MODULUS=3329
            - `INPUT` ←
              - `pq_byte_decode`（Alg 6）：BITS=1
                - …（更深层的输入见工作区）
22. `variables_set`：变量=mu
    - `VALUE` ←
      - `pq_decompress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=1，MODULUS=3329
        - `INPUT` ←
          - `pq_byte_decode`（Alg 6）：BITS=1
            - `INPUT` ←
              - 变量 `m`
23. `variables_set`：变量=c1a
    - `VALUE` ←
      - `pq_byte_encode`（Alg 5）：BITS=10
        - `INPUT` ←
          - `pq_compress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=10，MODULUS=3329
            - `INPUT` ←
              - `pq_poly_add`
                - …（更深层的输入见工作区）
24. `variables_set`：变量=c1b
    - `VALUE` ←
      - `pq_byte_encode`（Alg 5）：BITS=10
        - `INPUT` ←
          - `pq_compress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=10，MODULUS=3329
            - `INPUT` ←
              - `pq_poly_add`
                - …（更深层的输入见工作区）
25. `variables_set`：变量=c1
    - `VALUE` ←
      - `pq_byte_concat`
        - `A` ←
          - `pq_byte_encode`（Alg 5）：BITS=10
            - `INPUT` ←
              - `pq_compress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=10，MODULUS=3329
                - …（更深层的输入见工作区）
        - `B` ←
          - `pq_byte_encode`（Alg 5）：BITS=10
            - `INPUT` ←
              - `pq_compress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=10，MODULUS=3329
                - …（更深层的输入见工作区）
26. `variables_set`：变量=c2
    - `VALUE` ←
      - `pq_byte_encode`（Alg 5）：BITS=4
        - `INPUT` ←
          - `pq_compress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=4，MODULUS=3329
            - `INPUT` ←
              - `pq_poly_add`
                - …（更深层的输入见工作区）
27. `variables_set`：变量=c
    - `VALUE` ←
      - `pq_byte_concat`
        - `A` ←
          - `pq_byte_concat`
            - `A` ←
              - `pq_byte_encode`（Alg 5）：BITS=10
                - …（更深层的输入见工作区）
            - `B` ←
              - `pq_byte_encode`（Alg 5）：BITS=10
                - …（更深层的输入见工作区）
        - `B` ←
          - `pq_byte_encode`（Alg 5）：BITS=4
            - `INPUT` ←
              - `pq_compress`（§4.2.1；`d=1..11` 为标准范围，`d=12` 是项目扩展）：BITS=4，MODULUS=3329
                - …（更深层的输入见工作区）
28. `variables_set`：变量=ret
    - `VALUE` ←
      - `pq_byte_concat`
        - `A` ←
          - `pq_byte_concat`
            - `A` ←
              - `pq_byte_concat`
                - …（更深层的输入见工作区）
            - `B` ←
              - `pq_byte_encode`（Alg 5）：BITS=4
                - …（更深层的输入见工作区）
        - `B` ←
          - `pq_bytes_slice`（取 `[start, end)` 区间）
            - `INPUT` ←
              - `sponge_squeeze`（海绵挤压）：RATE=576
                - …（更深层的输入见工作区）
            - `START` ←
              - 常量 `0`
            - `END` ←
              - 常量 `32`

**函数 `ML_KEM_Encaps(ek: bytes, m: bytes)` 的返回值**

- 变量 `ret`

**该函数用到的算法块**：`keccak_state_init` · `pq_byte_concat` · `pq_byte_decode` · `pq_byte_encode` · `pq_bytes_slice` · `pq_compress` · `pq_decompress` · `pq_intt` · `pq_ntt` · `pq_ntt_mul` · `pq_poly_add` · `pq_prf` · `pq_sample_ntt` · `pq_sample_poly_cbd` · `pq_seed_with_nonce` · `sponge_absorb` · `sponge_pad` · `sponge_squeeze`

### ML-DSA-NTT

- 证据类别：代数或结构性质
- 依据：FIPS 204 Alg 41/42/45 定义下的往返与环乘同态性质；不是官方 NTT KAT 集
- 核对入口：`Q = 8380417`
- 期望结果：`ML-DSA-NTT-OK`

#### 拼装步骤

**函数 `NTT1(p: int_list)` 的返回值**

- `pq_ntt`（固定 256 系数：q=3329 为 ML-KEM，q=8380417 为 ML-DSA，q=12289 为 256 点循环 NTT 教学分支）：MODULUS=8380417，DEGREE=256
  - `INPUT` ←
    - 变量 `p`

**该函数用到的算法块**：`pq_ntt`

**函数 `INTT1(p: int_list)` 的返回值**

- `pq_intt`（逆变换；`n=256` 且输入 256 系数；q=12289 分支与教学 NTT 互逆）：MODULUS=8380417，DEGREE=256
  - `INPUT` ←
    - 变量 `p`

**该函数用到的算法块**：`pq_intt`

**函数 `MUL1(a: int_list, b: int_list)` 的返回值**

- `pq_ntt_mul`（两输入均需 256 项；q=3329 half-NTT，q=8380417 逐点乘）：MODULUS=8380417
  - `A` ←
    - 变量 `a`
  - `B` ←
    - 变量 `b`

**该函数用到的算法块**：`pq_ntt_mul`

### ML-DSA-Primitives

- 证据类别：代数或结构性质
- 依据：P2R 可逆、UseHint(MakeHint) 定理、InBall 计数（FIPS 204 定义）
- 核对入口：`Q = 8380417`
- 期望结果：`MLDSA_PRIMS_OK`

#### 拼装步骤

**函数 `P2R_High(r: int_list)` 的返回值**

- `pq_power2round`（`Power2Round_d`，输入为 256 个 `[0,q)` 系数（q=8380417），d=13 固定；输出 r1 或 r0 向量（F…）：PART=r1
  - `INPUT` ←
    - 变量 `r`

**该函数用到的算法块**：`pq_power2round`

**函数 `P2R_Low(r: int_list)` 的返回值**

- `pq_power2round`（`Power2Round_d`，输入为 256 个 `[0,q)` 系数（q=8380417），d=13 固定；输出 r1 或 r0 向量（F…）：PART=r0
  - `INPUT` ←
    - 变量 `r`

**该函数用到的算法块**：`pq_power2round`

**函数 `Dec_High(r: int_list)` 的返回值**

- `pq_decompose`（输入为 256 个 `[0,q)` 系数（q=8380417）；`Decompose` 固定 γ₂=95232，输出 r1 或 r0 向量（A…）：PART=r1
  - `INPUT` ←
    - 变量 `r`

**该函数用到的算法块**：`pq_decompose`

**函数 `Dec_Low(r: int_list)` 的返回值**

- `pq_decompose`（输入为 256 个 `[0,q)` 系数（q=8380417）；`Decompose` 固定 γ₂=95232，输出 r1 或 r0 向量（A…）：PART=r0
  - `INPUT` ←
    - 变量 `r`

**该函数用到的算法块**：`pq_decompose`

**函数 `Make_Hint(z: int_list, r: int_list)` 的返回值**

- `pq_make_hint`（输入两个 256 项 `[0,q)` 系数向量（q=8380417）；逐项计算 0/1 hint（Algorithm 39））
  - `Z` ←
    - 变量 `z`
  - `R` ←
    - 变量 `r`

**该函数用到的算法块**：`pq_make_hint`

**函数 `Use_Hint(h: int_list, r: int_list)` 的返回值**

- `pq_use_hint`（输入 256 项 0/1 hint 向量和 256 项 `[0,q)` 系数向量（q=8380417），逐项重建高位部分（Algorithm …）
  - `H` ←
    - 变量 `h`
  - `R` ←
    - 变量 `r`

**该函数用到的算法块**：`pq_use_hint`

**函数 `In_Ball(seed: bytes)` 的返回值**

- `pq_sample_in_ball`（输入 32 字节 seed；`SampleInBall`，固定 ML-DSA-44 的 τ=39（FIPS 204 Alg 29））
  - `SEED` ←
    - 变量 `seed`

**该函数用到的算法块**：`pq_sample_in_ball`

### ML-DSA-Sign

- 证据类别：标准/官方用例
- 参数范围：ML-DSA-44（确定性签名，rnd=0，空上下文）
- 依据：NIST ACVP ML-DSA-sigGen-FIPS204 internalProjection：ML-DSA-44、hashAlg=none 且空 context 的确定性用例，tgId=1 的 tcId 5、8（共 2 例）
- 核对入口：`print(''.join(f'{x:02x}' for x in MLDSA_Sign()))`
- 期望结果：`dd36ebcc94cd8834e17132b10458e43557357c09a5b855592ecb412bc27480f212c4105527cd9919ab9d2bcc2…`

#### 拼装步骤

**函数 `MLDSA_Sign()` 的返回值**

- `mldsa_sign`
  - `SECRET_KEY` ←
    - 常量 `[0x9c,0xe7,0xae,0x44,0xa9,0xa0,0xac,0xc0,0x57,0x23,0xf4,0xa…`
  - `MESSAGE` ←
    - 常量 `[0x66,0x18,0x80,0x71,0x9b,0x09,0x18,0x35,0x46,0x63,0x3a,0xf…`

**该函数用到的算法块**：`mldsa_sign`

**函数 `MLDSA_Verify()` 的返回值**

- `mldsa_verify`
  - `PUBLIC_KEY` ←
    - 常量 `[0x9c,0xe7,0xae,0x44,0xa9,0xa0,0xac,0xc0,0x57,0x23,0xf4,0xa…`
  - `MESSAGE` ←
    - 常量 `[0x66,0x18,0x80,0x71,0x9b,0x09,0x18,0x35,0x46,0x63,0x3a,0xf…`
  - `SIGNATURE` ←
    - 常量 `[0xdd,0x36,0xeb,0xcc,0x94,0xcd,0x88,0x34,0xe1,0x71,0x32,0xb…`

**该函数用到的算法块**：`mldsa_verify`

