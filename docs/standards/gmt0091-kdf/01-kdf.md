## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | GM/T 0091 — 基于口令的密钥派生规范 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | GM/T 0091-2020 §6；[PDF 物理页 6–7（印刷页 2–3）](./GMT-0091-2020.pdf#page=6) |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“GM/T 0091 — 基于口令的密钥派生规范”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“GM/T 0091 — 基于口令的密钥派生规范”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

来源: GM/T 0091-2020 — 基于口令的密钥派生规范
      PDF: [GMT-0091-2020.pdf](./GMT-0091-2020.pdf)

> 本页按标准目录和 PBKDF2 条款重新整理为结构化教学参考。GM/T 0091 是中国版 PBKDF2 标准，与 NIST SP 800-132 /
> RFC 8018 的 PBKDF2 同构（SM3 哈希实例）。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 密钥派生函数（PBKDF2 同构）

```
DK = PBKDF2(PRF, Password, Salt, c, dkLen)
```

- PRF：伪随机函数（GM/T 0091 用 SM3-HMAC；块实现支持 SHA-256 与 SM3）
- Password：口令；Salt：盐；c：迭代次数；dkLen：派生密钥字节数

### 计算过程（SP 800-132 §5.2 / RFC 8018 §5.2 同构）

```
ℓ = ceil(dkLen / hLen)               （输出块数，向上取整）
DK = (T_1 ‖ T_2 ‖ … ‖ T_ℓ)[0:dkLen]  （截取前 dkLen 字节）

T_i = F(Password, Salt, c, i)
F(P, S, c, i) = U_1 ⊕ U_2 ⊕ … ⊕ U_c
U_1 = PRF(P, S ‖ INT(i))            # INT(i) = i 的 4 字节大端表示
U_2 = PRF(P, U_1)
…
U_c = PRF(P, U_{c−1})
```

## 与 SP 800-132 的关系

GM/T 0091（SM3 实例）与 PBKDF2 结构对应，PRF 使用 SM3-HMAC。RFC 7914 §11
发布的是 PBKDF2-HMAC-SHA-256 测试向量；它只用于项目 SHA-256 路径，不能通过替换 PRF
当作 SM3 官方标准向量。项目另以 OpenSSL 3 的独立实现对照一组固定 PBKDF2-HMAC-SM3 输入/输出，作为交叉实现回归，不标记为 GM/T 官方测试向量（见 [`kdf-parameter-contract.test.ts`](../../../tests/unit/kdf-parameter-contract.test.ts)）。RFC 8018 附录 B.2.1 实际定义 DES-CBC-Pad，不是 PBKDF2 向量。
当前 SM3 路径见 [`PBKDF2-SM3.json`](../../../demos/procedures/PBKDF2-SM3.json) Demo；该有限对照不代表完整标准验证或认证。

## CipherCat 块实现

- `pbkdf2(password, salt, iterations, dklen, prf)` — HASH 下拉 SHA-256 / SM3；
  Demo：`demos/procedures/PBKDF2-SM3.json`（SM3 同构 + hashlib 交叉）。
