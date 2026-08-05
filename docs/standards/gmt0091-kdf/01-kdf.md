# GM/T 0091 — 基于口令的密钥派生规范

来源: GM/T 0091-2020 — 基于口令的密钥派生规范
      PDF: [GMT-0091-2020.pdf](./GMT-0091-2020.pdf)

> 原文件为扫描版 OCR 提取（771 处 `(cid:xxx)` 嵌入字体乱码），2026-08-05 重写为
> 结构化教学参考。GM/T 0091 是中国版 PBKDF2 标准，与 NIST SP 800-132 /
> RFC 8018 的 PBKDF2 同构（SM3 哈希实例）。

## 密钥派生函数（PBKDF2 同构）

```
DK = PBKDF2(PRF, Password, Salt, c, dkLen)
```

- PRF：伪随机函数（GM/T 0091 用 SM3-HMAC；块实现支持 SHA-256 与 SM3）
- Password：口令；Salt：盐；c：迭代次数；dkLen：派生密钥字节数

### 计算过程（SP 800-132 §5.2 / RFC 8018 §5.2 同构）

```
DK = T_1 ‖ T_2 ‖ … ‖ T_dkLen/hLen  （截断到 dkLen 字节）

T_i = F(Password, Salt, c, i)
F(P, S, c, i) = U_1 ⊕ U_2 ⊕ … ⊕ U_c
U_1 = PRF(P, S ‖ INT(i))            # INT(i) = i 的 4 字节大端表示
U_2 = PRF(P, U_1)
…
U_c = PRF(P, U_{c−1})
```

## 与 SP 800-132 的关系

GM/T 0091（SM3 实例）与 NIST SP 800-132 PBKDF2 结构完全一致，仅 PRF 换为
SM3-HMAC（国密同构）。官方向量（RFC 8018 附录 B.2.1 SHA-1/PBKDF2-HMAC-SHA-256
向量经 SM3 同构替换）见 [sp800-132-pbkdf2/](../sp800-132-pbkdf2/)。

## CipherCat 块实现

- `pbkdf2(password, salt, iterations, dklen, prf)` — HASH 下拉 SHA-256 / SM3；
  Demo：`demos/procedures/PBKDF2-SM3.json`（SM3 同构 + hashlib 交叉）。
