# Post-quantum cryptography (lattice-based and shared components): step-by-step assembly

The ML-KEM encapsulation chain is assembled entirely from primitives; ML-DSA signing is an interface block with separate primitive examples.

## Workspaces on this page

| | |
|---|---|
| `ML-KEM-Atomic` | `demos/ML-KEM-Atomic.json` |
| `ML-KEM-Encaps` | `demos/procedures/ML-KEM-Encaps.json` |
| `ML-DSA-NTT` | `demos/procedures/ML-DSA-NTT.json` |
| `ML-DSA-Primitives` | `demos/procedures/ML-DSA-Primitives.json` |
| `ML-DSA-Sign` | `demos/procedures/ML-DSA-Sign.json` |

### `ML-KEM-Atomic`

- Evidence class: algebraic or structural properties
- Basis: CBD 采样与 NTT 冲激响应性质；pq_mat_vec_mul 为非标准标量教学辅助（source text in Chinese）
- Check: `print(','.join(str(x) for x in sample_poly_cbd_eta2(list(range(128)), q=3329)[:4]))`
- Expected result: `0,0,1,0 NTT_IMPULSE_OK 2566,870,1565,1884 5,11`

#### Assembly steps

**Top-level blocks (workspace order)**

1. `data_value`: NUM=[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x0…
2. `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
    - `SEED` ←
      - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
3. `pq_ntt` (Fixed 256 coefficients: q=3329 is ML-KEM, q=8380417 is ML-DSA, q=12289 …): MODULUS=3329，DEGREE=256
    - `INPUT` ←
      - constant `[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,…`
4. `pq_sample_ntt` (q=3329 maps to FIPS 203 Alg 7; q=8380417 maps to FIPS 204 Alg 30. The i…): MODULUS=3329
    - `SEED` ←
      - constant `[0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0…`
5. `variables_set`: variable=scalarMatVecResult
    - `VALUE` ←
      - `pq_mat_vec_mul` (scalar modular matrix-vector teaching helper; not polynomial-ring matri…): MODULUS=3329
        - `MATRIX` ←
          - constant `[0x01,0x02,0x03,0x04]`
        - `VEC` ←
          - constant `[0x01,0x02]`

### `ML-KEM-Encaps`

- Evidence class: project fixed regression (not an official vector)
- Parameter scope: ML-KEM-512（encapsulation；输出 c‖K）（source text in Chinese）
- Basis: 本工作区登记的输入/期望值是项目固定回归，不取自 ACVP；同一实现在 tests/unit/mlkem-acvp-official-vectors.test.ts 中用 NIST ACVP ML-KEM-encapDecap-FIPS203 internalProjection testGroup tgId=1（M…（source text in Chinese）
- Check: `print(bytes(ML_KEM_Encaps(bytes.fromhex('3b7899078bb3ca44bb31d6a8f8532706ac7bb4c122ef129d…`
- Expected result: `b757c7d5a7ccb660b81cfd9684941d52c162c2b6a2370bae19fdd391d3879c224cfe70c44aaa3adc9141a4d7a…`

#### Assembly steps

**Body of `ML_KEM_Encaps(ek: bytes, m: bytes)` (in order)**

1. `variables_set`: variable=H
    - `VALUE` ←
      - `sponge_squeeze` (sponge squeeze): RATE=1088
        - `STATE` ←
          - `sponge_absorb` (Sponge absorb; input length must be a whole multiple of the selected ra…): RATE=1088
            - `STATE` ←
              - `keccak_state_init` (Creates a state of 25 zero lanes for Keccak-f)
            - `BLOCK` ←
              - `sponge_pad` (pad10*1 padding; byte values must be `0..255`, text is strict UTF-8): RATE=1088，SUFFIX=0x06
                - … (deeper inputs live in the workspace)
        - `OUTLEN` ←
          - constant `32`
2. `variables_set`: variable=G
    - `VALUE` ←
      - `sponge_squeeze` (sponge squeeze): RATE=576
        - `STATE` ←
          - `sponge_absorb` (Sponge absorb; input length must be a whole multiple of the selected ra…): RATE=576
            - `STATE` ←
              - `keccak_state_init` (Creates a state of 25 zero lanes for Keccak-f)
            - `BLOCK` ←
              - `sponge_pad` (pad10*1 padding; byte values must be `0..255`, text is strict UTF-8): RATE=576，SUFFIX=0x06
                - … (deeper inputs live in the workspace)
        - `OUTLEN` ←
          - constant `64`
3. `variables_set`: variable=Kp
    - `VALUE` ←
      - `pq_bytes_slice` (slice `[start, end)`)
        - `INPUT` ←
          - `sponge_squeeze` (sponge squeeze): RATE=576
            - `STATE` ←
              - `sponge_absorb` (Sponge absorb; input length must be a whole multiple of the selected ra…): RATE=576
                - … (deeper inputs live in the workspace)
            - `OUTLEN` ←
              - constant `64`
        - `START` ←
          - constant `0`
        - `END` ←
          - constant `32`
4. `variables_set`: variable=r
    - `VALUE` ←
      - `pq_bytes_slice` (slice `[start, end)`)
        - `INPUT` ←
          - `sponge_squeeze` (sponge squeeze): RATE=576
            - `STATE` ←
              - `sponge_absorb` (Sponge absorb; input length must be a whole multiple of the selected ra…): RATE=576
                - … (deeper inputs live in the workspace)
            - `OUTLEN` ←
              - constant `64`
        - `START` ←
          - constant `32`
        - `END` ←
          - constant `64`
5. `variables_set`: variable=rho
    - `VALUE` ←
      - `pq_bytes_slice` (slice `[start, end)`)
        - `INPUT` ←
          - variable `ek`
        - `START` ←
          - constant `768`
        - `END` ←
          - constant `800`
6. `variables_set`: variable=t0
    - `VALUE` ←
      - `pq_byte_decode` (Alg 6): BITS=12
        - `INPUT` ←
          - `pq_bytes_slice` (slice `[start, end)`)
            - `INPUT` ←
              - variable `ek`
            - `START` ←
              - constant `0`
            - `END` ←
              - constant `384`
7. `variables_set`: variable=t1
    - `VALUE` ←
      - `pq_byte_decode` (Alg 6): BITS=12
        - `INPUT` ←
          - `pq_bytes_slice` (slice `[start, end)`)
            - `INPUT` ←
              - variable `ek`
            - `START` ←
              - constant `384`
            - `END` ←
              - constant `768`
8. `variables_set`: variable=A00
    - `VALUE` ←
      - `pq_sample_ntt` (q=3329 maps to FIPS 203 Alg 7; q=8380417 maps to FIPS 204 Alg 30. The i…): MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
            - `SEED` ←
              - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `0`
9. `variables_set`: variable=A01
    - `VALUE` ←
      - `pq_sample_ntt` (q=3329 maps to FIPS 203 Alg 7; q=8380417 maps to FIPS 204 Alg 30. The i…): MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
            - `SEED` ←
              - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `0`
10. `variables_set`: variable=A10
    - `VALUE` ←
      - `pq_sample_ntt` (q=3329 maps to FIPS 203 Alg 7; q=8380417 maps to FIPS 204 Alg 30. The i…): MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
            - `SEED` ←
              - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `1`
11. `variables_set`: variable=A11
    - `VALUE` ←
      - `pq_sample_ntt` (q=3329 maps to FIPS 203 Alg 7; q=8380417 maps to FIPS 204 Alg 30. The i…): MODULUS=3329
        - `SEED` ←
          - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
            - `SEED` ←
              - `pq_seed_with_nonce` (append a one-byte nonce to the seed)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `1`
12. `variables_set`: variable=s0
    - `VALUE` ←
      - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=3，MODULUS=3329
        - `SEED` ←
          - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice` (slice `[start, end)`)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `0`
            - `OUTLEN` ←
              - constant `192`
13. `variables_set`: variable=s1
    - `VALUE` ←
      - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=3，MODULUS=3329
        - `SEED` ←
          - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice` (slice `[start, end)`)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `1`
            - `OUTLEN` ←
              - constant `192`
14. `variables_set`: variable=e1_0
    - `VALUE` ←
      - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
        - `SEED` ←
          - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice` (slice `[start, end)`)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `2`
            - `OUTLEN` ←
              - constant `128`
15. `variables_set`: variable=e1_1
    - `VALUE` ←
      - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
        - `SEED` ←
          - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice` (slice `[start, end)`)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `3`
            - `OUTLEN` ←
              - constant `128`
16. `variables_set`: variable=e2
    - `VALUE` ←
      - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
        - `SEED` ←
          - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
            - `SEED` ←
              - `pq_bytes_slice` (slice `[start, end)`)
                - … (deeper inputs live in the workspace)
            - `NONCE` ←
              - constant `4`
            - `OUTLEN` ←
              - constant `128`
17. `variables_set`: variable=sh0
    - `VALUE` ←
      - `pq_ntt` (Fixed 256 coefficients: q=3329 is ML-KEM, q=8380417 is ML-DSA, q=12289 …): MODULUS=3329，DEGREE=256
        - `INPUT` ←
          - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=3，MODULUS=3329
            - `SEED` ←
              - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
                - … (deeper inputs live in the workspace)
18. `variables_set`: variable=sh1
    - `VALUE` ←
      - `pq_ntt` (Fixed 256 coefficients: q=3329 is ML-KEM, q=8380417 is ML-DSA, q=12289 …): MODULUS=3329，DEGREE=256
        - `INPUT` ←
          - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=3，MODULUS=3329
            - `SEED` ←
              - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
                - … (deeper inputs live in the workspace)
19. `variables_set`: variable=u0
    - `VALUE` ←
      - `pq_poly_add`
        - `A` ←
          - `pq_intt` (Inverse transform; `n=256` and exactly 256 input coefficients; q=12289 …): MODULUS=3329，DEGREE=256
            - `INPUT` ←
              - `pq_poly_add`
                - … (deeper inputs live in the workspace)
        - `B` ←
          - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
            - `SEED` ←
              - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
                - … (deeper inputs live in the workspace)
20. `variables_set`: variable=u1
    - `VALUE` ←
      - `pq_poly_add`
        - `A` ←
          - `pq_intt` (Inverse transform; `n=256` and exactly 256 input coefficients; q=12289 …): MODULUS=3329，DEGREE=256
            - `INPUT` ←
              - `pq_poly_add`
                - … (deeper inputs live in the workspace)
        - `B` ←
          - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
            - `SEED` ←
              - `pq_prf` (`SHAKE(seed‖nonce-byte)`; byte-aligned seed only, nonce is `0..255`. On…): ALGO=SHAKE256
                - … (deeper inputs live in the workspace)
21. `variables_set`: variable=v
    - `VALUE` ←
      - `pq_poly_add`
        - `A` ←
          - `pq_poly_add`
            - `A` ←
              - `pq_intt` (Inverse transform; `n=256` and exactly 256 input coefficients; q=12289 …): MODULUS=3329，DEGREE=256
                - … (deeper inputs live in the workspace)
            - `B` ←
              - `pq_sample_poly_cbd` (q=3329 and η∈{2,3} map to FIPS 203 Alg 8; q=8380417 is not a standard M…): ETA=2，MODULUS=3329
                - … (deeper inputs live in the workspace)
        - `B` ←
          - `pq_decompress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=1，MODULUS=3329
            - `INPUT` ←
              - `pq_byte_decode` (Alg 6): BITS=1
                - … (deeper inputs live in the workspace)
22. `variables_set`: variable=mu
    - `VALUE` ←
      - `pq_decompress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=1，MODULUS=3329
        - `INPUT` ←
          - `pq_byte_decode` (Alg 6): BITS=1
            - `INPUT` ←
              - variable `m`
23. `variables_set`: variable=c1a
    - `VALUE` ←
      - `pq_byte_encode` (Alg 5): BITS=10
        - `INPUT` ←
          - `pq_compress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=10，MODULUS=3329
            - `INPUT` ←
              - `pq_poly_add`
                - … (deeper inputs live in the workspace)
24. `variables_set`: variable=c1b
    - `VALUE` ←
      - `pq_byte_encode` (Alg 5): BITS=10
        - `INPUT` ←
          - `pq_compress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=10，MODULUS=3329
            - `INPUT` ←
              - `pq_poly_add`
                - … (deeper inputs live in the workspace)
25. `variables_set`: variable=c1
    - `VALUE` ←
      - `pq_byte_concat`
        - `A` ←
          - `pq_byte_encode` (Alg 5): BITS=10
            - `INPUT` ←
              - `pq_compress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=10，MODULUS=3329
                - … (deeper inputs live in the workspace)
        - `B` ←
          - `pq_byte_encode` (Alg 5): BITS=10
            - `INPUT` ←
              - `pq_compress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=10，MODULUS=3329
                - … (deeper inputs live in the workspace)
26. `variables_set`: variable=c2
    - `VALUE` ←
      - `pq_byte_encode` (Alg 5): BITS=4
        - `INPUT` ←
          - `pq_compress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=4，MODULUS=3329
            - `INPUT` ←
              - `pq_poly_add`
                - … (deeper inputs live in the workspace)
27. `variables_set`: variable=c
    - `VALUE` ←
      - `pq_byte_concat`
        - `A` ←
          - `pq_byte_concat`
            - `A` ←
              - `pq_byte_encode` (Alg 5): BITS=10
                - … (deeper inputs live in the workspace)
            - `B` ←
              - `pq_byte_encode` (Alg 5): BITS=10
                - … (deeper inputs live in the workspace)
        - `B` ←
          - `pq_byte_encode` (Alg 5): BITS=4
            - `INPUT` ←
              - `pq_compress` (§4.2.1; `d=1..11` is the standard range, while `d=12` is a project exte…): BITS=4，MODULUS=3329
                - … (deeper inputs live in the workspace)
28. `variables_set`: variable=ret
    - `VALUE` ←
      - `pq_byte_concat`
        - `A` ←
          - `pq_byte_concat`
            - `A` ←
              - `pq_byte_concat`
                - … (deeper inputs live in the workspace)
            - `B` ←
              - `pq_byte_encode` (Alg 5): BITS=4
                - … (deeper inputs live in the workspace)
        - `B` ←
          - `pq_bytes_slice` (slice `[start, end)`)
            - `INPUT` ←
              - `sponge_squeeze` (sponge squeeze): RATE=576
                - … (deeper inputs live in the workspace)
            - `START` ←
              - constant `0`
            - `END` ←
              - constant `32`

**Return value of `ML_KEM_Encaps(ek: bytes, m: bytes)`**

- variable `ret`

**Algorithm blocks used by this function**: `keccak_state_init` · `pq_byte_concat` · `pq_byte_decode` · `pq_byte_encode` · `pq_bytes_slice` · `pq_compress` · `pq_decompress` · `pq_intt` · `pq_ntt` · `pq_ntt_mul` · `pq_poly_add` · `pq_prf` · `pq_sample_ntt` · `pq_sample_poly_cbd` · `pq_seed_with_nonce` · `sponge_absorb` · `sponge_pad` · `sponge_squeeze`

### `ML-DSA-NTT`

- Evidence class: algebraic or structural properties
- Basis: FIPS 204 Alg 41/42/45 定义下的往返与环乘同态性质；不是官方 NTT KAT 集（source text in Chinese）
- Check: `Q = 8380417`
- Expected result: `ML-DSA-NTT-OK`

#### Assembly steps

**Return value of `NTT1(p: int_list)`**

- `pq_ntt` (Fixed 256 coefficients: q=3329 is ML-KEM, q=8380417 is ML-DSA, q=12289 …): MODULUS=8380417，DEGREE=256
  - `INPUT` ←
    - variable `p`

**Algorithm blocks used by this function**: `pq_ntt`

**Return value of `INTT1(p: int_list)`**

- `pq_intt` (Inverse transform; `n=256` and exactly 256 input coefficients; q=12289 …): MODULUS=8380417，DEGREE=256
  - `INPUT` ←
    - variable `p`

**Algorithm blocks used by this function**: `pq_intt`

**Return value of `MUL1(a: int_list, b: int_list)`**

- `pq_ntt_mul` (Both inputs require 256 coefficients; q=3329 half-NTT, q=8380417 pointw…): MODULUS=8380417
  - `A` ←
    - variable `a`
  - `B` ←
    - variable `b`

**Algorithm blocks used by this function**: `pq_ntt_mul`

### `ML-DSA-Primitives`

- Evidence class: algebraic or structural properties
- Basis: P2R 可逆、UseHint(MakeHint) 定理、InBall 计数（FIPS 204 定义）（source text in Chinese）
- Check: `Q = 8380417`
- Expected result: `MLDSA_PRIMS_OK`

#### Assembly steps

**Return value of `P2R_High(r: int_list)`**

- `pq_power2round` (Input: 256 coefficients in `[0,q)` (q=8380417); fixed d=13; returns the…): PART=r1
  - `INPUT` ←
    - variable `r`

**Algorithm blocks used by this function**: `pq_power2round`

**Return value of `P2R_Low(r: int_list)`**

- `pq_power2round` (Input: 256 coefficients in `[0,q)` (q=8380417); fixed d=13; returns the…): PART=r0
  - `INPUT` ←
    - variable `r`

**Algorithm blocks used by this function**: `pq_power2round`

**Return value of `Dec_High(r: int_list)`**

- `pq_decompose` (Input: 256 coefficients in `[0,q)` (q=8380417); fixed γ₂=95232; returns…): PART=r1
  - `INPUT` ←
    - variable `r`

**Algorithm blocks used by this function**: `pq_decompose`

**Return value of `Dec_Low(r: int_list)`**

- `pq_decompose` (Input: 256 coefficients in `[0,q)` (q=8380417); fixed γ₂=95232; returns…): PART=r0
  - `INPUT` ←
    - variable `r`

**Algorithm blocks used by this function**: `pq_decompose`

**Return value of `Make_Hint(z: int_list, r: int_list)`**

- `pq_make_hint` (Inputs: two 256-coefficient vectors in `[0,q)` (q=8380417); returns the…)
  - `Z` ←
    - variable `z`
  - `R` ←
    - variable `r`

**Algorithm blocks used by this function**: `pq_make_hint`

**Return value of `Use_Hint(h: int_list, r: int_list)`**

- `pq_use_hint` (Inputs: a 256-entry 0/1 hint vector and a 256-coefficient vector in `[0…)
  - `H` ←
    - variable `h`
  - `R` ←
    - variable `r`

**Algorithm blocks used by this function**: `pq_use_hint`

**Return value of `In_Ball(seed: bytes)`**

- `pq_sample_in_ball` (Input: 32-byte seed; fixed ML-DSA-44 τ=39 (FIPS 204 Alg 29))
  - `SEED` ←
    - variable `seed`

**Algorithm blocks used by this function**: `pq_sample_in_ball`

### `ML-DSA-Sign`

- Evidence class: standards or official cases
- Parameter scope: ML-DSA-44（确定性签名，rnd=0，空上下文）（source text in Chinese）
- Basis: NIST ACVP ML-DSA-sigGen-FIPS204 internalProjection：ML-DSA-44、hashAlg=none 且空 context 的确定性用例，tgId=1 的 tcId 5、8（共 2 例）（source text in Chinese）
- Check: `print(''.join(f'{x:02x}' for x in MLDSA_Sign()))`
- Expected result: `dd36ebcc94cd8834e17132b10458e43557357c09a5b855592ecb412bc27480f212c4105527cd9919ab9d2bcc2…`

#### Assembly steps

**Return value of `MLDSA_Sign()`**

- `mldsa_sign`
  - `SECRET_KEY` ←
    - constant `[0x9c,0xe7,0xae,0x44,0xa9,0xa0,0xac,0xc0,0x57,0x23,0xf4,0xa…`
  - `MESSAGE` ←
    - constant `[0x66,0x18,0x80,0x71,0x9b,0x09,0x18,0x35,0x46,0x63,0x3a,0xf…`

**Algorithm blocks used by this function**: `mldsa_sign`

**Return value of `MLDSA_Verify()`**

- `mldsa_verify`
  - `PUBLIC_KEY` ←
    - constant `[0x9c,0xe7,0xae,0x44,0xa9,0xa0,0xac,0xc0,0x57,0x23,0xf4,0xa…`
  - `MESSAGE` ←
    - constant `[0x66,0x18,0x80,0x71,0x9b,0x09,0x18,0x35,0x46,0x63,0x3a,0xf…`
  - `SIGNATURE` ←
    - constant `[0xdd,0x36,0xeb,0xcc,0x94,0xcd,0x88,0x34,0xe1,0x71,0x32,0xb…`

**Algorithm blocks used by this function**: `mldsa_verify`

