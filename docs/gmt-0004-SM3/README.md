# SM3 — 国密密码杂凑算法参考

来源: GM/T 0004-2012 — SM3 密码杂凑算法
      http://www.gmbz.org.cn/main/viewfile/2018011002383823521.html

## 参数

| 参数 | 值 |
|------|-----|
| 输出长度 | 256 bit (32 bytes) |
| 分组长度 | 512 bit (64 bytes) |
| 轮数 | 64 |
| 初始值 IV | 0x7380166f, 0x4914b2b9, ... |
| 常数 Tj | 0x79cc4519 (j<16), 0x7a879d8a (j≥16) |

## 算法步骤

| 步骤 | 说明 | CipherCat 块 |
|------|------|------------|
| 消息填充 | 1‖0*‖64-bit长度 | `hash_sm3_pad` |
| 消息扩展 | W[0..67], W'[0..63] | (compress 内部) |
| 压缩函数 | 64轮 (FF, GG, P0, P1) | `hash_sm3_compress` |
| 一键哈希 | pad + 迭代 + digest | `sm3_hash` |
