# CCM — CBC-MAC 认证原语

## 条目元数据

| 字段 | 内容 |
|---|---|
| 类型 | 原语 / 认证链 |
| 标准定位 | NIST SP 800-38C §6.3 |
| 原文证据 | [CCM 原文提取](./00-Standard-Source.md) · [PDF](./NIST.SP.800-38C.pdf) |
| 原文位置 | PDF 物理第 15–17 页（标准页 9–11）；[提取稿 §6.1 步骤 1–4](./00-Standard-Source.md#L592) |
| 项目状态 | 由 `ccm_encrypt` 内部实现；无独立 CBC-MAC 块 |

## 原文定位与引用

> “Apply the formatting function to (N, A, P) to produce the blocks B0, B1, …, Br.”
>
> — NIST SP 800-38C §6.1；[提取稿第 611–612 行](./00-Standard-Source.md#L611)

## 原文摘录

> 本页正文是按 source 的“NIST SP 800-38C §6.3”拆出的结构化说明；该定位是概览/组合页，未强行截取不唯一的行号。需要核对时请按 [source 提取稿](./00-Standard-Source.md) 的章节标题和同目录 PDF 查看原文。

## 标准定义

将 `B0`、编码后的 AAD 和明文块按 CBC-MAC 链处理，得到认证值 `X`；再用 `S0` 掩码并截取前 `t`
字节生成标签。CCM 的 CBC-MAC 输入编码不能替换成普通裸 CBC-MAC。

## 公式或伪代码

```text
X0 = 0^128
for B in B0 || EncodeAAD(A) || Pad(M):
    Xi = AES_K(X(i-1) xor B)
T = first_t_bytes(X_last xor AES_K(Ctr(0)))
```

## 输入与输出

| 项目 | 输入 | 输出 |
|---|---|---|
| 输入块 | `B0`、AAD 编码块、明文补齐块 | 128-bit 链状态 |
| 标签 | 链终值、`S0`、`t` | `t` 字节 `T` |
| 失败边界 | 块编码或标签长度非法 | 调用方拒绝 |

## 项目映射

`ccm_encrypt` 内部完成 CBC-MAC；没有独立 `ccm_cbc_mac` 或标签验证块。完整流程见 [01-CCM.md](./01-CCM.md)。

## 核验与缺项

使用 SP 800-38C 附录 C Example 1–3 核验 `B0`、中间链值和 `C || T`；解密标签验证/拒绝路径尚未开放。
