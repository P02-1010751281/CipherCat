# SM4 — 国密分组密码算法参考

来源: GM/T 0002-2012 — SM4 分组密码算法
      http://www.gmbz.org.cn/main/viewfile/2018011001400692566.html

## 参数

| 参数 | 值 |
|------|-----|
| 分组长度 | 128 bit |
| 密钥长度 | 128 bit |
| 轮数 | 32 |
| S-box | 16×16 固定置换（256 字节） |

## 算法步骤

| 步骤 | 说明 | CipherCat 块 |
|------|------|------------|
| 轮函数 F | F(x0,x1,x2,x3,rk) = x0 ⊕ T(x1⊕x2⊕x3⊕rk) | `sm4_round_func` |
| 合成置换 T | T(·) = L(τ(·)), τ = S-box 4×8→4×8 | (内嵌于 round_func) |
| 线性变换 L | L(B) = B ⊕ (B<<<2) ⊕ (B<<<10) ⊕ (B<<<18) ⊕ (B<<<24) | `sm4_linear_transform` |
| 密钥扩展 | 32 轮密钥 rk[0..31]，使用 FK/CK 常数 | `sm4_key_schedule` |
| 便利轮 | 轮函数 + 异或轮密钥 | `sm4_round` |

## 常数

- 系统参数 FK: [0xA3B1BAC6, 0x56AA3350, 0x677D9197, 0xB27022DC]
- 固定参数 CK[0..31]: CK[i][j] = (4i+j)×7 mod 256

## S-Box

256 字节替换表，详见 CipherCat 生成器中的 `SM4_SBOX` 常量。
