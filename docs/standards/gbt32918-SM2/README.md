# GB/T 32918 — SM2 椭圆曲线公钥密码算法

来源: GB/T 32918-2016 — 信息安全技术 SM2椭圆曲线公钥密码算法
      下载: https://openstd.samr.gov.cn/ (需登录)
      PDF✅ 已下载 (5部分)

## 组成

| 部分 | 内容 | 块实现 |
|------|------|----------|
| 第1部分 | 总则 | — |
| 第2部分 | 数字签名算法 | 底层就绪 (ECC+SM3) |
| 第3部分 | 密钥交换协议 | 底层就绪 |
| 第4部分 | 公钥加密算法 | 底层就绪 |
| 第5部分 | 参数定义 | 需预设 SM2 曲线 |

## SM2 曲线参数

| 参数 | 值 |
|------|-----|
| p | 0xFFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 FFFFFFFF FFFFFFFF |
| a | 0xFFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF 00000000 FFFFFFFF FFFFFFFC |
| b | 0x28E9FA9E 9D9F5E34 4D5A9E4B CF6509A7 F39789F5 15AB8F92 DDBCBD41 4D940E93 |
| Gx | 0x32C4AE2C 1F198119 5F990446 6A39C994 8FE30BBF F2660BE1 715A4589 334C74C7 |
| Gy | 0xBC3736A2 F4F6779C 59BDCEE3 6B692153 D0A9877C C62A4740 02DF32E5 2139F0A0 |
| n | 0xFFFFFFFE FFFFFFFF FFFFFFFF FFFFFFFF 7203DF6B 21C6052B 53BBF409 39D54123 |

## 相关块

| 块 | 说明 |
|----|------|
| `ecc_load_curve_params` | 加载 SM2 曲线参数 |
| `ecc_multiply` | 标量乘法 k*P |
| `sm3_hash` | SM3 哈希 (签名/加密需要) |
| `nt_mod_inverse` | 模逆 (签名需要) |
⚠️ 未实现，PDF参考。暂不拆分。
