## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | Ascon — AEAD 原语与解密边界 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 Algorithm 3/4](./00-Standard-Source.md#L781)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 加密、解密和错误标签拒绝已实现选定路径 |

## 原文定位与引用

> 本页按 source 中的“Ascon — AEAD 原语与解密边界”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L781) 与同目录 PDF。

## 原文摘录

> 以下为算法组的说明性定位引文；完整 Algorithm 3/4、公式和边界请回看 [source 提取稿](./00-Standard-Source.md#L781)。

    Algorithm 3 Ascon-AEAD128.enc(𝐾, 𝑁 , 𝐴, 𝑃 )
    Algorithm 4 Ascon-AEAD128.dec(𝐾, 𝑁 , 𝐴, 𝐶, 𝑇 )

原件：[NIST SP 800-232 PDF](./NIST.SP.800-232.pdf)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 加密阶段

Ascon-AEAD128 使用 16-byte key、16-byte nonce、16-byte rate 和 16-byte tag：

```text
初始化 p[12] → 吸收 AD（中间 p[8]）→ 吸收并输出 C → 终结 p[12] → T
输出 C || T
```

每个阶段要使用标准规定的域分离和末块 `0x01` 分隔填充。

## CipherCat 映射

`ascon_encrypt(key, nonce, ad, msg)` 和 `ascon_decrypt(key, nonce, ad, ciphertext_with_tag)` 已接入
AEAD128 路径，Demo：`demos/procedures/ASCON.json` 与 `ASCON-Extended.json`。

解密先累计标签差异再决定是否抛出认证错误，验证失败时不释放明文。当前 Demo 覆盖空消息解密和单字节
错误标签拒绝；完整官方解密 KAT、侧信道评估和流式 API 仍不在本批次范围内。
