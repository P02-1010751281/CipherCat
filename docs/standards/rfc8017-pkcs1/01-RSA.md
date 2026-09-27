## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 公钥密码原语 / 编码与填充函数 |
| 标准定位 | RFC 8017 §7.2、§8.2 |
| 原文证据 | [本地 RFC 8017 原文](./rfc8017.txt)、[RFC Editor 在线原文](https://www.rfc-editor.org/rfc/rfc8017.txt) |
| 原文位置 | [RFC 原文 §7.2.1–§7.2.2，行 1548–1712](./rfc8017.txt#L1548-L1712)；[§8.2.1–§8.2.2，行 2004–2128](./rfc8017.txt#L2004-L2128) |
| 项目状态 | 已实现（PKCS#1 v1.5 加解密/签名交叉） |

## 原文定位与引用

> 本页按 RFC 8017 §7.2 和 §8.2 拆分；完整编码、错误语义和安全注意事项请回看本地 RFC 原文。

## 原文摘录

> RFC `.txt` 证据层条目。本文对应 RSAES-PKCS1-v1_5 与 RSASSA-PKCS1-v1_5；完整规范单元保存在本地 [RFC 8017 文本 §7.2.1–§7.2.2，行 1548–1712](./rfc8017.txt#L1548-L1712) 与 [§8.2.1–§8.2.2，行 2004–2128](./rfc8017.txt#L2004-L2128)，本页不重复复制整段 RFC。

## 公式或伪代码

> RFC `.txt` 证据层条目：下面是用户参照摘要，不是逐字算法摘录；完整规范单元和错误语义以原文链接为准。

### 密钥生成（FIPS 186-4 风格）

输入比特长度 `bits`（字节 k = bits/8）。流程：

1. 生成两个独立随机素数 p、q（各 bits/2 位）：
   - 小素数筛（3..1000 试除）排除合数
   - Miller-Rabin 素性检测（若干轮，错误率 < 2^-128）
   - 附加条件：|p − q| 足够大（FIPS 186-4 B.3 要求 |p−q| > 2^(nlen/2−100)）
2. `n = p·q`；`e = 65537`（固定）
3. `λ(n) = lcm(p−1, q−1)`；`d = e⁻¹ mod λ(n)`（扩展欧几里得）
4. 输出定长大端拼接：`key = n(k) ‖ e(4) ‖ d(k) ‖ p(k/2) ‖ q(k/2)`

CipherCat 块：`rsa_keygen(bits)` → 上述拼接的 Bytes。

### PKCS#1 v1.5 加密（RFC 8017 §7.2）

```
EM = 0x00 ‖ 0x02 ‖ PS ‖ 0x00 ‖ M
```

- PS = 至少 8 字节随机非零字节（加密随机化；不满足长度则报错）
- `c = EM^e mod n`；解密 `m = c^d mod n`，检查前导 0x00‖0x02 结构并剥离 PS

CipherCat 块：`rsa_encrypt(pub, m)` / `rsa_decrypt(priv, c)`（EM-PKCS1-v1_5 语义）。

### PKCS#1 v1.5 签名（RFC 8017 §8.2，SHA-256）

```
EM = 0x00 ‖ 0x01 ‖ FF…FF(≥8) ‖ 0x00 ‖ DigestInfo(SHA-256)
```

- DigestInfo = DER 编码的算法标识符 + 摘要（`30 31 30 0d 06 09 60 86 48 01 65 03 04 02 01 05 00 04 20 ‖ H`）
- `s = EM^d mod n`；验签 `EM' = s^e mod n` 与重组 EM 比对

CipherCat 块：`rsa_sign(priv, m)` / `rsa_verify(pub, m, sig)`。
验证：cryptography 库交叉（JS/Python 双语言），见 `RSA-Sign.json`。
