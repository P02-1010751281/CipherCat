# 数论 + 大数块参考


## 域运算 + NTT

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `nt_field_add` | 1 | value(→) | null&null&null→null |
| `nt_mod_inverse` | 1 | stmt(→→) | null&null&null→— |
| `nt_mod` | 1 | value(→) | Number&Number→Number |
| `nt_mod_pow` | 1 | value(→) | Number&Number&Number→Number |
| `nt_div_rem` | 1 | value(→) | Number&Number→Number |
| `pq_poly_add` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_sub` | 1 | value(→) | IntList&IntList→IntList |
| `pq_poly_mul` | 1 | value(→) | IntList&IntList→IntList | 普通整数卷积（MODULUS 下拉 none/3329/8380417/12289）；环 R_q 教学，与 NTT 域 `pq_ntt_mul` 对比 |
| `pq_mat_vec_mul` | 1 | value(→) | IntList&IntList→IntList |
| `pq_ntt` | 1 | value(→) | IntList→IntList | NTT（MODULUS 下拉 3329/8380417/12289）：q=8380417 分支按 FIPS 204（ζ=1753、BitRev8、8 层 CT） |
| `pq_intt` | 1 | value(→) | IntList→IntList | INTT（同下拉）：q=8380417 分支 GS 8 层 + 乘 256⁻¹=8347681 |
| `pq_ntt_mul` | 1 | value(→) | IntList&IntList→IntList | NTT 域乘法（下拉 3329/8380417）：q=8380417 逐点乘，q=3329 half-NTT 基乘 |
| `pq_ntt_butterfly` | 1 | value(→) | null&null&null→null |

## 大数运算

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `bn_add` | 1 | value(→) | IntList&IntList→IntList |
| `bn_sub` | 1 | value(→) | IntList&IntList→IntList |
| `bn_mul` | 1 | value(→) | IntList&IntList→IntList |
| `bn_div` | 1 | value(→) | IntList&IntList→IntList |

## RSA 公钥密码 (FIPS 186-4 / RFC 8017)

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `rsa_keygen` | 1 | value(→) | Number→Bytes | RSA 密钥生成：BITS 下拉 512/1024/2048 → n‖e‖d‖p‖q 定长编码（512 位 → 196 字节）；Miller-Rabin 素数测试 + e=65537 |
| `rsa_encrypt` | 1 | value(→) | Bytes&Bytes→Bytes | RSAES-PKCS#1 v1.5 加密：m^e mod n（随机非零 PS 填充） |
| `rsa_decrypt` | 1 | value(→) | Bytes&Bytes→Bytes | RSAES-PKCS#1 v1.5 解密：m^d mod n 去填充 |
| `rsa_sign` | 1 | value(→) | Bytes&Bytes→Bytes | RSASSA-PKCS#1 v1.5 签名：SHA-256 + DigestInfo 编码，m^d mod n |
| `rsa_verify` | 1 | value(→) | Bytes&Bytes&Bytes→Boolean | RSASSA-PKCS#1 v1.5 验签 |

> 交叉验证：cryptography 49 库双向一致（encrypt/decrypt/sign/verify + 密钥有效性）；RSA-1024 生成代码被 cryptography 接受；教学 demo 用 512 位（勿用于真实安全）。

## GF(2⁸) 域 (FIPS 197)

| 块 | 层 | 连接 | 输入→输出 |
|----|----|------|----------|
| `gf2m_mul` | 1 | value(→) | IntList&IntList→IntList |
| `gf2m_add` | 1 | value(→) | IntList&IntList→IntList | 域加法 = 按位 XOR（AES/GCM 双域） |
| `gf2m_inv` | 1 | value(→) | IntList→IntList | 乘法逆元（多项式扩展欧几里得，Fermat 校验） |

## GF(2) 多项式与二进制矩阵（基于纠错码的数学构件）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gf2_poly_mul` | 1 | value(→) | IntList&IntList→IntList | GF(2) 多项式乘法（XOR 卷积，低位在前） |
| `gf2_poly_div` / `gf2_poly_mod` | 1 | value(→) | IntList&IntList→IntList | 长除商 / 余数 |
| `gf2_poly_gcd` | 1 | value(→) | IntList&IntList→IntList | 欧几里得 GCD |
| `bin_mat_mul` / `bin_mat_inv` | 1 | value(→) | IntList&IntList→IntList | GF(2) 矩阵乘 / 求逆（增广高斯消元，展平 n×n） |
| `ham_weight` / `ham_dist` | 1 | value(→) | IntList→Number | 汉明重量 / 距离 |

## Goppa 码（McEliece，基于纠错码的公钥密码构件）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `goppa_gen_poly` | 1 | value(→) | IntList→IntList | G(z)=∏(z−αᵢ)，αᵢ ∈ GF(2⁸)（AES 域）——McEliece 码核心构造 |
| `syndrome_calc` | 1 | value(→) | IntList&IntList&Number&Number→IntList | 线性码 syndrome s = H·y mod 2；s=0 ⟺ 合法码字 |
| `berlekamp_massey` | 1 | value(→) | IntList→IntList | GF(2) 最短 LFSR 综合（BCH/RS 译码） |
| `goppa_decode` | 1 | value(→) | IntList&IntList&IntList→IntList | **Patterson 译码**（完整黑盒）：Y + G + L → 纠正后位向量；纠 ⌊deg G/2⌋ 错；性质向量（GF(16) 子域 [14,6,5] 码往返） |

## GF(2^m) 系数多项式（Patterson 原语）

| 块 | 层 | 连接 | 输入→输出 | 说明 |
|----|----|------|----------|------|
| `gf2m_poly_add` | 1 | value(→) | IntList&IntList→IntList | 逐系数 XOR（特征 2） |
| `gf2m_poly_mul` | 1 | value(→) | IntList&IntList→IntList | 卷积（GF(2⁸) 域乘） |
| `gf2m_poly_mod` | 1 | value(→) | IntList&IntList→IntList | 长除取余（模 Goppa 多项式） |
| `gf2m_poly_xgcd` | 1 | value(→) | IntList&IntList→IntList | 扩展欧几里得 → [len_u,u…,len_v,v…,g…]（u·A⊕v·B=g）；Patterson 定位子核心 |
| `gf2m_poly_eval` | 1 | value(→) | IntList&Number→Number | Horner 求值（Chien 搜索） |
