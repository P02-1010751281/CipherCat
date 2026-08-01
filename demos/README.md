# 🧪 CipherCat Demo Workspaces

预构建的 Blockly 工作区示例，全部使用**原子块**（无便利封装），展示密码学底层原语。

## 原子块 Demo

| Demo | 文件 | 原子块 |
|------|------|--------|
| SM4 轮函数 | `SM4-Atomic-Round.json` | `sm4_round_func` + `sm4_linear_transform` |
| AES 单轮 | `AES-Atomic-Round.json` | `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key` |
| SHA-256 哈希 | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| ML-KEM 底层 | `ML-KEM-Atomic.json` | `pq_sample_poly_cbd` + `pq_ntt` + `pq_sample_ntt` + `pq_mat_vec_mul` |

## Procedure 封装 Demo（官方向量验证通过）

以下 demos 用 `procedures_defreturn`（自定义函数）封装原子块链，**不使用 `proc_*` 模板块**；生成代码（Python + JavaScript）经 `scripts/verify-demo.ts --exec` 实测通过官方测试向量（SM4 S-box 表 / GB/T 32905-2016 SM3 / GB/T 32918.5 SM2 / FIPS 203 ML-KEM-512）。

| Demo | 文件 | 封装内容 | 官方向量 |
|------|------|----------|----------|
| SM4 S-box | `procedures/SM4-Sbox.json` | `sm4_sbox` 查表 → `SM4_Sbox(x)` | GM/T 0002-2012 S-box（S(0x01)=0x90） |
| SM3 哈希 | `procedures/SM3-Hash.json` | `hash_sm3_pad` → `hash_sm3_compress`（IV 常量）→ `SM3_Hash(msg)` | GB/T 32905-2016 A.1（SM3("abc")） |
| SM2 点乘 | `procedures/SM2-PointMul.json` | `ecc_load_curve_params` + `ecc_load_point` + `ecc_multiply` → `SM2_PointMul()` | GB/T 32918.5-2017（k·G） |
| ML-KEM.Encaps | `procedures/ML-KEM-Encaps.json` | SampleNTT/CBD/NTT/INTT/ntt_mul/compress/encode 全链 → `ML_KEM_Encaps(ek, m)` | FIPS 203（ML-KEM-512 encaps，c‖K） |

> 验证方式：`npm run type-check` 后 `node dist-verify/verify-demo.js demos/procedures/<file> --exec`（需先 `npx vite build --config vite.verify.config.ts` 构建 harness）。期望值记录在 `demos/tests.json`。

## Procedure 封装 Demo（结构展示）

| Demo | 文件 | 封装内容 |
|------|------|----------|
| SM4 函数封装 | `Procedure-SM4-Round.json` | `procedures_defreturn` 封装 `sm4_round_func` → `SM4_Round(state_0..3, rk)` |
| AES 函数封装 | `Procedure-AES-Round.json` | `procedures_defreturn` 封装四步 → `AES_Round(state, round_key)` |

## 使用方法

1. 打开 CipherCat → 菜单「More → Import Workspace」→ 选择 `demos/` 下的 `.json` 文件
2. 观察块连接 → 「▶ Generate」查看 JS/Python 输出
3. Procedure demo → 观察函数封装后如何在其他地方调用
