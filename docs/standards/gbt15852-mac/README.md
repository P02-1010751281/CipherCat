# GB/T 15852.1-2020 — 消息鉴别码 (MAC)

来源: GB/T 15852.1-2020 — 信息技术 安全技术 消息鉴别码 第1部分：采用分组密码的机制
      下载: https://openstd.samr.gov.cn/ ⚠️ 需手动下载

## 内容

中国版 CMAC 标准（基于分组密码的消息认证码）。

## 对应块

✅ `cmac_mac`（CIPHER 下拉 SM4）已覆盖本部分（采用分组密码的机制 = CMAC 语义，GB/T 15852.1-2020 对齐 SP 800-38B）。
`hash_hmac`（SM3/SHA-256）覆盖基于哈希的 MAC（GB/T 15852.2 语义）。

## 状态
✅ 已覆盖（cmac_mac SM4 分支 + hash_hmac）。未覆盖：GB/T 15852.3-2019（UMAC/Badger/Poly1305/GMAC 泛杂凑 MAC）。
