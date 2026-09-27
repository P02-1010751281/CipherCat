## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 算法阶段 / 原语 / 函数 |
| 标准定位 | NIST SP 800-38C — CCM 参考 |
| 原文证据 | [source 提取稿](./00-Standard-Source.md)（本目录 PDF 清单见 source 页） |
| 原文位置 | [提取稿 §6，行 580–715](./00-Standard-Source.md#L580-L715)；PDF 物理页需结合同目录 PDF 核对 |
| 项目状态 | 部分实现（详见本文现有实现/缺项说明） |

## 原文定位与引用

> 本页按 source 中的“NIST SP 800-38C — CCM 参考”拆分；这是定位说明，不替代标准逐字引文。完整正文、公式和表格请回看 [source 提取稿](./00-Standard-Source.md) 与同目录 PDF。

## 原文摘录

> 本页正文是按 source 的“NIST SP 800-38C — CCM 参考”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

原件：[NIST.SP.800-38C.pdf](./NIST.SP.800-38C.pdf)。CCM 是基于 AES 的认证加密构造；本页按 §5–§7 和附录示例整理。

## 标准定义

- AES 分组长度固定为 128 bit；nonce 长度为 7–13 字节，`L = 15 − nonceLen`。
- 标签长度和 AAD/明文编码必须遵守标准允许的取值域；项目路径固定使用 AES-128。
- 完整的格式化、CBC-MAC 和 CTR 规范单元分别拆在本目录的独立条目中。

## 公式或伪代码

> 本条目是 CCM 组合导航页，没有独立归属的公式或伪代码规范单元；上文参数和流程说明仅作导航，不能当作完整标准摘录。
> 完整规范单元见 [格式化](./02-Formatting.md)、[CBC-MAC](./03-CBC-MAC.md)、[CTR](./04-CTR.md) 和本页 [source](./00-Standard-Source.md)。

## CipherCat 覆盖边界

`ccm_encrypt(key, nonce, aad, msg, tagLen)` 已实现 AES-128 加密路径，demo 为 `demos/procedures/CCM-Encrypt.json`。未覆盖 CCM 解密、标签拒绝路径、所有可选标签长度和完整长度上限检查。
