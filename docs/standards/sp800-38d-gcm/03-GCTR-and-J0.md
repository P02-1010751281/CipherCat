## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | GCM — J0 与 GCTR 原语 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 Algorithm 3](./00-Standard-Source.md#L849)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 已实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“GCM — J0 与 GCTR 原语”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md#L849) 与同目录 PDF。

## 原文摘录

> 以下为 GCTR 算法的说明性定位引文；完整算法、`inc32` 和 J0 构造请回看 [source 提取稿](./00-Standard-Source.md#L849)。

    Algorithm 3: GCTR_K (ICB, X)
    Output: bit string Y of bit length len(X).

原件：[NIST SP 800-38D PDF](./NIST.SP.800-38D.pdf)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### J0

当 IV 为 96 bit 时：

```text
J0 = IV || 0^31 || 1
```

其他 IV 长度必须把 IV、零填充和 IV bit 长度送入 GHASH 形成 `J0`，不能简单截断或补零。

## GCTR

计数器递增后用 AES 加密，和明文异或得到密文；标签还要把 GHASH 结果与 `AES_K(J0)` 异或并按标签长度截断。

## 项目映射

`gcm_encrypt` 固定 AES-128、输出 `C||T` 和 128-bit 标签；当前没有解密/标签拒绝路径，也没有独立 GCTR/J0 块。
