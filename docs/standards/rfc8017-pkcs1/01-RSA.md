# RSA 密钥生成与 PKCS#1 v1.5

## 密钥生成（FIPS 186-4 风格）

输入比特长度 `bits`（字节 k = bits/8）。流程：

1. 生成两个独立随机素数 p、q（各 bits/2 位）：
   - 小素数筛（3..1000 试除）排除合数
   - Miller-Rabin 素性检测（若干轮，错误率 < 2^-128）
   - 附加条件：|p − q| 足够大、p ≡ q ≡ 3 mod 4（强素数风格，FIPS 186-4 要求）
2. `n = p·q`；`e = 65537`（固定）
3. `λ(n) = lcm(p−1, q−1)`；`d = e⁻¹ mod λ(n)`（扩展欧几里得）
4. 输出定长大端拼接：`key = n(k) ‖ e(4) ‖ d(k) ‖ p(k/2) ‖ q(k/2)`

CipherCat 块：`rsa_keygen(bits)` → 上述拼接的 Bytes。

## PKCS#1 v1.5 加密（RFC 8017 §7.2）

```
EM = 0x00 ‖ 0x02 ‖ PS ‖ 0x00 ‖ M
```

- PS = 至少 8 字节随机非零字节（加密随机化；不满足长度则报错）
- `c = EM^e mod n`；解密 `m = c^d mod n`，检查前导 0x00‖0x02 结构并剥离 PS

CipherCat 块：`rsa_encrypt(pub, m)` / `rsa_decrypt(priv, c)`（EM-PKCS1-v1_5 语义）。

## PKCS#1 v1.5 签名（RFC 8017 §8.2，SHA-256）

```
EM = 0x00 ‖ 0x01 ‖ FF…FF(≥8) ‖ 0x00 ‖ DigestInfo(SHA-256)
```

- DigestInfo = DER 编码的算法标识符 + 摘要（`30 31 30 0d 06 09 60 86 48 01 65 03 04 02 01 05 00 04 20 ‖ H`）
- `s = EM^d mod n`；验签 `EM' = s^e mod n` 与重组 EM 比对

CipherCat 块：`rsa_sign(priv, m)` / `rsa_verify(pub, m, sig)`。
验证：cryptography 库交叉（JS/Python 双语言），见 `RSA-Sign.json`。
