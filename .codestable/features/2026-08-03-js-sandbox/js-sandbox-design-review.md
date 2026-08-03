---
doc_type: feature-design-review
feature: 2026-08-03-js-sandbox
status: passed
reviewer_id: JsSandboxDesignReview (task agent)
summary: 独立 reviewer 审查 JS 沙箱 design——无 🔴 阻断项；7 条 🟡/🔵 建议全部吸收进 design 修订
tags: [metacrypt, blockly, sandbox, javascript]
---

# JS 沙箱 design-review

## 结论

**passed**（无阻断项）。7 条发现（priority 2×5 + priority 3×2）已逐条吸收进 design 修订：

| # | 发现 | 处置 |
|---|---|---|
| 1 | **MCL 语言会被错误路由进 JS eval**（语言枚举含第三值 mcl，伪代码 DSL 非合法 JS）→ SyntaxError UX 回归 | design 改为显式三语言分支；MCL 保留 `runJsNotSupported` 提示 |
| 2 | **async 生成器**（HMAC-SHA256 WebCrypto 返回 Promise）→ 输出 `[object Promise]` | worker onmessage 改 async + `await` Promise；rejection 走 error 通道 |
| 3 | 超时错误文案双源（硬编码 + i18n 键）→ 死键隐患 | `run-code.ts` 返回 `errorCode: 'timeout'`，EditorView 用 `ui('runTimeout')` 映射 |
| 4 | 主线程消息契约缺 settle 清理（clearTimeout/settled guard/消息白名单） | 契约补齐：白名单 output/done/error + settled 标志 + clearTimeout |
| 5 | eval 完成值打印规则不稳（赋值语句意外输出） | 改为**只走 console.log 通道**，不打印 eval 完成值 |
| 6 | 输出洪泛（`while(true){console.log}` 队列积压） | 累计 1000 行上限后丢弃并提示 |
| 7 | 验收缺 async/MCL/连续运行/死键/worker error 用例 | 验收扩至 9 条（含 MCL 提示、async 块、超时后重入、`runJsNotSupported` grep） |

## 备注

- 完成值规则取舍：Python 侧现有行为也会对赋值结尾打印 'null'（既有怪癖）；JS 侧统一「仅 console.log」更可预测，与 text_print 教学语义一致。
- async 超时覆盖：10s 超时窗口含 async 等待（terminate 后 resolve 为 no-op，settled guard 兜底）。
