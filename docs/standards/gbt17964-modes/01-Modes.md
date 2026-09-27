## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 函数 |
| 标准定位 | GB/T 17964 — 分组密码操作模式 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | GB/T 17964-2021 §4.1–§9.3；[PDF 物理页 7–15（印刷页 3–11）](./GBT+17964-2021.pdf#page=7) |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“GB/T 17964 — 分组密码操作模式”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“GB/T 17964 — 分组密码操作模式”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

来源: GB/T 17964-2021 — 信息安全技术 分组密码算法的工作模式（原 GB/T 17964-2008）
      PDF: [GBT+17964-2021.pdf](./GBT+17964-2021.pdf)

> 本地 GB/T 17964-2021 PDF 的文本层存在字体映射问题；本页按其目录和模式定义重新整理为
> 结构化教学参考。模式定义与 NIST SP 800-38A 的对应关系见 [sp800-38a-modes/](../sp800-38a-modes/)。

## 公式或伪代码

> 以下是面向用户的结构化公式/伪代码摘要，不是标准原文的完整逐字摘录；完整规范单元请以本页“原文摘录”、source 提取稿和 PDF 为准。

### 模式总览

| 模式 | 名称 | 对标 | 块实现 |
|------|------|------|--------|
| ECB | 电码本 | NIST SP 800-38A §6.1 | `mode_ecb_encrypt`/`decrypt` |
| CBC | 密码分组链接 | §6.2 | `mode_cbc_encrypt` |
| CFB | 密码反馈 | §6.3 | 未实现 |
| OFB | 输出反馈 | §6.4 | 未实现 |
| CTR | 计数器 | §6.5 | `mode_ctr_encrypt` |

### 模式定义（分组长度 b，密钥 K）

### ECB（电码本）

```
加密: C_j = CIPH_K(P_j),  j = 1 … n
解密: P_j = CIPH_K⁻¹(C_j),  j = 1 … n
```

### CBC（密码分组链接）

```
加密: C_1 = CIPH_K(P_1 ⊕ IV)
      C_j = CIPH_K(P_j ⊕ C_{j−1}),  j = 2 … n
解密: P_1 = CIPH_K⁻¹(C_1) ⊕ IV
      P_j = CIPH_K⁻¹(C_j) ⊕ C_{j−1},  j = 2 … n
```

### CFB（密码反馈，s 位分段）

```
加密: I_1 = IV;  C_1 = P_1 ⊕ MSB_s(CIPH_K(I_1))
      I_j = LSB_{b−s}(I_{j−1}) ‖ C_{j−1};  C_j = P_j ⊕ MSB_s(CIPH_K(I_j))
解密: I_1 = IV;  P_1 = C_1 ⊕ MSB_s(CIPH_K(I_1))
      I_j = LSB_{b−s}(I_{j−1}) ‖ C_{j−1};  P_j = C_j ⊕ MSB_s(CIPH_K(I_j))
```

### OFB（输出反馈）

```
I_1 = IV;  O_1 = CIPH_K(I_1);  C_1 = P_1 ⊕ O_1
I_j = O_{j−1};  O_j = CIPH_K(I_j);  C_j = P_j ⊕ O_j,  j = 2 … n
```

### CTR（计数器）

```
C_j = P_j ⊕ CIPH_K(counter_j),  j = 1 … n      （counter 逐块递增）
```

## 与 SP 800-38A 的关系

GB/T 17964 与 NIST SP 800-38A 的模式定义一致；`mode_*` 块可同时用于
AES 与 SM4（CIPHER 参数）。SP 800-38A 附录 D.1 错误传播表同样适用。
