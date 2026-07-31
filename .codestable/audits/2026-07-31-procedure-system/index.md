---
doc_type: audit-index
audit: 2026-07-31-procedure-system
scope: "src/ + src-tauri/ + configs，四维全扫 + 旧审计关闭核对"
created: 2026-07-31
status: active
total_findings: 18
---

# 全仓库快速重扫审计 — 2026-07-31

## 范围

- `src/` 全部 `.ts`/`.vue`：bug / maintainability / security / performance 四维
- `src-tauri/` + 配置文件（index.html CSP、tauri.conf.json、capabilities/default.json）：security
- **旧审计关闭核对**：2026-07-30-full-project（26 条）+ 2026-07-30-blockly-coverage（10 条）
- arch-drift 跳过（`.codestable/requirements/adrs/` 不存在）
- 5 个并行只读 scout（BugScan / SecurityScan / PerfScan / MaintainabilityScan / OldFindingClosure），每维上限 5 条

## 总评

共 18 条发现：bug 5 / security 4 / performance 4 / maintainability 5；P1 共 4 条，其余 P2。

**最值得关注（P1）**：
1. **`crypto_decrypt_func` 模板预填的是 ECB-Encrypt 链**（finding-01）——拖出解密模板得到加密代码，教学主场景必然踩中
2. **`proc_sm3_hmac` 静默生成 HMAC-SHA256**（finding-02）——国密 MAC 模板语义错误，HMAC-SM3 不可生成
3. **模板预填链加载/导入后重复注入**（finding-03）——含模板的 workspace 保存重载后累积重复块
4. **死代码 IPC `save_workspace`**（finding-06）——多余攻击面 + rx.recv() 无超时阻塞

正面：旧审计 36 条中 24 条已关闭（bug/安全类基本修完——CSP 双处启用、markdown 已 DOMPurify、INPUT-twice 修复、监听器清理齐全）；事件监听全部有清理配对；硬编码类型字符串基本改用 TYPE_* 常量。**procedure 函数系统整体功能正确**（拖拽/生成/调用链验证通过），但模板注册表手工维护导致漂移（finding-14）与语义 bug（finding-01/02）——单一数据源是当务之急。

## 发现清单

| # | 性质 | 严重度 | 置信度 | 标题 | 文件 |
|---|---|---|---|---|---|---|
| 1 | bug | P1 | high | crypto_decrypt_func 预填 ECB-Encrypt 链 ✅已修 | [finding-01.md](finding-01.md) |
| 2 | bug | P1 | high | proc_sm3_hmac 静默生成 HMAC-SHA256 ✅已修 | [finding-02.md](finding-02.md) |
| 3 | bug | P1 | medium | 模板预填链加载/导入后重复注入 ✅已修 | [finding-03.md](finding-03.md) |
| 4 | bug | P2 | medium | call 块缺原生 onchange，改名/删除后孤立 | [finding-04.md](finding-04.md) |
| 5 | bug | P2 | medium | Manager 导出物化临时块污染工作区 | [finding-05.md](finding-05.md) |
| 6 | security | P1 | high | 死代码 IPC save_workspace + rx.recv() 阻塞 ✅已修 | [finding-06.md](finding-06.md) |
| 7 | security | P2 | medium | FS 写权限过宽 + withGlobalTauri + 跳过对话框 | [finding-07.md](finding-07.md) |
| 8 | security | P2 | medium | ECB 块无安全警告（旧 #11） | [finding-08.md](finding-08.md) |
| 9 | security | P2 | low | AES/SM4 无 key/IV 长度校验（旧 #26） | [finding-09.md](finding-09.md) |
| 10 | performance | P2 | high | locale 切换双重建（旧 #25） | [finding-10.md](finding-10.md) |
| 11 | performance | P2 | medium | Panel listener 未按 visible 门控 | [finding-11.md](finding-11.md) |
| 12 | performance | P2 | low | 分割拖拽强制回流 | [finding-12.md](finding-12.md) |
| 13 | performance | P2 | low | 外层 setTimeout 孤儿定时器（旧 #18 残留） | [finding-13.md](finding-13.md) |
| 14 | maintainability | P2 | high | 模板清单三处漂移 + 生成器镜像 ✅已修 | [finding-14.md](finding-14.md) |
| 15 | maintainability | P2 | high | 工具箱死样式选择器（12.5 类名） ✅已修 | [finding-15.md](finding-15.md) |
| 16 | maintainability | P2 | high | locale ~14 对死键 + 重复键 ✅已修 | [finding-16.md](finding-16.md) |
| 17 | maintainability | P2 | high | remaining.ts 13 块未入 ALL_BLOCK_TYPES（旧 #10） ✅已修 | [finding-17.md](finding-17.md) |
| 18 | maintainability | P2 | medium | Metacrypto 品牌未迁移（旧 #14） | [finding-18.md](finding-18.md) |

## 按维度分布

| 性质 | P0 | P1 | P2 | 合计 |
|---|---|---|---|---|
| bug | 0 | 3 | 2 | 5 |
| security | 0 | 1 | 3 | 4 |
| performance | 0 | 0 | 4 | 4 |
| maintainability | 0 | 0 | 5 | 5 |
| arch-drift | — | — | — | 跳过（无 adrs/） |
| **合计** | **0** | **4** | **14** | **18** |

## 旧审计关闭核对（2026-07-30 两轮共 36 条）

**closed=24 / open=10 / partial=2**

已关闭亮点：INPUT-twice（#1）、CSP 双处启用（#2）、markdown DOMPurify（#3）、SBox listener（#4）、README 断链（#6）、sponge_duplex（#7）、bits_to_bytes（#8）、seed 长度（#9）、DevTools（#13）、toast 竞态（#18）、serialization as any（#19）、locale let（#20）、位命名（#21）、loadExtraState 守卫（#24）；blockly #1 convenience、#2 K 字段、#4 setOutput、#6 modes 导入、#8 ECC 颜色、#9 类型常量、#10 INDEX。

仍未关（映射到本审计）：#5 生成器镜像→finding-14；#10 ALL_BLOCK_TYPES→finding-17；#11 ECB 警告→finding-08；#14 品牌→finding-18；#22 expect()（标准样板，低优先）；#23 无界 String→finding-06；#25 refreshBlocks→finding-10；#26 key/IV→finding-09；blockly #3 sm3_hmac（partial）→finding-02；#12 console（partial，any 已修 console 仍 warn，低优先）。

功能缺口（cs-feat 建议，非本审计范围）：非对称密码缺失（RSA/ECDSA/SM2/DH）、ML-DSA——见 2026-07-30-blockly-coverage finding-05/07。

## 下一步建议

- **P1 立刻修（cs-issue）**：finding-01（decrypt 预填错链）、finding-02（sm3_hmac 语义错）、finding-03（预填重复注入）、finding-06（死代码 IPC）
- **P1 本迭代（cs-refactor）**：finding-14（模板清单单一数据源——先于一切模板改动，防止漂移继续）
- **P2 排期**：finding-04/05（procedure 生命周期）、finding-07（FS 权限收紧）、finding-10（locale 重建）、finding-15/16/17（死代码清理）
- **P2 低优先**：finding-08/09/12/13/18

> 建议优先修 finding-01/02/03（模板语义正确性），它们直接伤害教学主流程；三者共享修复面（TEMPLATE_PREFILL + 模板注册表），可合并为一个 cs-issue 批次或逐个开。
