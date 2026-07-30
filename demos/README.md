# 🧪 CipherCat Demo Workspaces

预构建的 Blockly 工作区示例，全部使用**原子块**（无便利封装），展示密码学底层原语。

## 原子块 Demo

| Demo | 文件 | 原子块 |
|------|------|--------|
| SM4 轮函数 | `SM4-Atomic-Round.json` | `sm4_round_func` + `sm4_linear_transform` |
| AES 单轮 | `AES-Atomic-Round.json` | `aes_sub_bytes` → `aes_shift_rows` → `aes_mix_columns` → `aes_add_round_key` |
| SHA-256 哈希 | `SHA256-Atomic-Hash.json` | `hash_sha256_pad` → `hash_sha256_compress` |
| ML-KEM 底层 | `ML-KEM-Atomic.json` | `pq_cbd_ntt_vec` + `pq_ntt_vec` + `pq_sample_ntt_mat` + `pq_mat_vec_mul_ntt` |

## Procedure 封装 Demo

| Demo | 文件 | 封装内容 |
|------|------|----------|
| SM4 函数封装 | `Procedure-SM4-Round.json` | `crypto_func_def` 封装 `sm4_round_func` → `SM4_Round(state, rk)` |
| AES 函数封装 | `Procedure-AES-Round.json` | `crypto_func_def` 封装四步 → `AES_Round(state, round_key)` |

## 使用方法

1. 打开 CipherCat → 工具栏「📂 导入」
2. 选择 `demos/` 下的 `.json` 文件
3. 观察块连接 → 「▶ 生成代码」查看 JS/Python 输出
4. 右键块 → 「展开」观察更细粒度实现
5. Procedure demo → 观察函数封装后如何在其他地方调用
